import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendPushNotification, generateReminderNotification } from '../fcm';

describe('FCM Service', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    
    // Mock Deno.env
    (global as any).Deno = {
      env: {
        get: vi.fn((key: string) => {
          switch (key) {
            case 'FIREBASE_SERVER_KEY':
              return 'test-server-key';
            default:
              return undefined;
          }
        }),
      },
    };

    // Mock fetch
    global.fetch = vi.fn();
  });

  describe('sendPushNotification', () => {
    it('sends push notification successfully', async () => {
      const mockResponse = { ok: true, json: () => Promise.resolve({ success: true }) };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const message = {
        token: 'test-device-token',
        notification: {
          title: 'Test Title',
          body: 'Test Body'
        },
        data: {
          type: 'practice_reminder',
          scheduledTime: '09:00',
          durationMinutes: '30'
        }
      };

      const response = await sendPushNotification(message);

      expect(global.fetch).toHaveBeenCalledWith('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Authorization': 'key=test-server-key',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: message.token,
          notification: message.notification,
          data: message.data,
        }),
      });

      expect(response).toBe(mockResponse);
    });

    it('throws error when Firebase Server Key is missing', async () => {
      (global as any).Deno.env.get.mockReturnValue(undefined);

      await expect(sendPushNotification({
        token: 'test-token',
        notification: {
          title: 'Test',
          body: 'Test'
        }
      })).rejects.toThrow('Firebase Server Key missing');
    });

    it('throws error when FCM request fails', async () => {
      const errorResponse = {
        ok: false,
        json: () => Promise.resolve({ error: 'FCM Error' })
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(errorResponse);

      await expect(sendPushNotification({
        token: 'test-token',
        notification: {
          title: 'Test',
          body: 'Test'
        }
      })).rejects.toThrow('FCM API error');
    });

    it('handles invalid token error correctly', async () => {
      const errorResponse = {
        ok: false,
        json: () => Promise.resolve({ 
          error: {
            code: 'messaging/invalid-registration-token',
            message: 'Invalid registration token'
          }
        })
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(errorResponse);

      await expect(sendPushNotification({
        token: 'invalid-token',
        notification: {
          title: 'Test',
          body: 'Test'
        }
      })).rejects.toThrow('Invalid registration token');
    });
  });

  describe('generateReminderNotification', () => {
    it('generates correct notification content', () => {
      const scheduledTime = '09:00 AM';
      const durationMinutes = 30;

      const notification = generateReminderNotification(scheduledTime, durationMinutes);

      expect(notification.notification.title).toBe('Face Yoga Practice Reminder');
      expect(notification.notification.body).toBe(`Your ${durationMinutes}-minute practice session starts at ${scheduledTime}`);
      expect(notification.data).toEqual({
        type: 'practice_reminder',
        scheduledTime,
        durationMinutes: durationMinutes.toString(),
      });
    });

    it('handles different time formats correctly', () => {
      const tests = [
        { time: '09:00 AM', duration: 30 },
        { time: '2:30 PM', duration: 45 },
        { time: '23:00', duration: 15 }
      ];

      tests.forEach(({ time, duration }) => {
        const notification = generateReminderNotification(time, duration);
        expect(notification.notification.title).toBe('Face Yoga Practice Reminder');
        expect(notification.notification.body).toContain(time);
        expect(notification.notification.body).toContain(duration.toString());
      });
    });
  });
});
