import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '../email';
import { sendPushNotification } from '../fcm';

// Mock the external services
vi.mock('../email');
vi.mock('../fcm');
vi.mock('@supabase/supabase-js');

describe('Notification System Integration', () => {
  const mockSupabase = {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { email: 'test@example.com' },
            error: null
          }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { id: 'test-id' },
            error: null
          }))
        }))
      }))
    }))
  };

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    
    // Mock Supabase client
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    
    // Mock environment variables
    (global as any).Deno = {
      env: {
        get: vi.fn((key: string) => {
          switch (key) {
            case 'SUPABASE_URL':
              return 'https://test.supabase.co';
            case 'SUPABASE_SERVICE_ROLE_KEY':
              return 'test-key';
            case 'RESEND_API_KEY':
              return 'test-resend-key';
            case 'FIREBASE_SERVER_KEY':
              return 'test-firebase-key';
            default:
              return undefined;
          }
        }),
      },
    };

    // Mock the notification services
    (sendEmail as jest.Mock).mockResolvedValue({ ok: true });
    (sendPushNotification as jest.Mock).mockResolvedValue({ ok: true });
  });

  it('processes reminders and sends notifications correctly', async () => {
    const mockSchedule = {
      id: 'test-schedule-id',
      user_id: 'test-user-id',
      start_time: '09:00',
      duration_minutes: 30,
      is_active: true
    };

    const mockPreferences = {
      reminder_enabled: true,
      reminder_before_minutes: 15,
      notification_method: 'both',
      quiet_hours_start: null,
      quiet_hours_end: null
    };

    const mockFcmTokens = [
      { token: 'test-token-1' },
      { token: 'test-token-2' }
    ];

    // Mock Supabase queries
    mockSupabase.from.mockImplementation((table: string) => {
      switch (table) {
        case 'practice_schedules':
          return {
            select: () => ({
              eq: () => ({
                single: () => ({ data: mockSchedule, error: null })
              })
            })
          };
        case 'reminder_preferences':
          return {
            select: () => ({
              eq: () => ({
                single: () => ({ data: mockPreferences, error: null })
              })
            })
          };
        case 'fcm_tokens':
          return {
            select: () => ({
              eq: () => ({ data: mockFcmTokens, error: null })
            })
          };
        case 'reminder_history':
          return {
            insert: () => ({
              select: () => ({
                single: () => ({ data: { id: 'test-history-id' }, error: null })
              })
            })
          };
        default:
          return {
            select: () => ({
              eq: () => ({ data: null, error: null })
            })
          };
      }
    });

    // Import and call the process-reminders function
    const { processReminders } = await import('../index');
    const result = await processReminders();

    // Verify email notification was sent
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'test@example.com',
      subject: 'Your Face Yoga Practice Reminder'
    }));

    // Verify push notifications were sent to all tokens
    mockFcmTokens.forEach(({ token }) => {
      expect(sendPushNotification).toHaveBeenCalledWith(expect.objectContaining({
        token,
        notification: expect.objectContaining({
          title: 'Face Yoga Practice Reminder'
        })
      }));
    });

    // Verify reminder history was recorded
    expect(mockSupabase.from).toHaveBeenCalledWith('reminder_history');
    expect(result.message).toBe('Reminders processed successfully');
  });

  it('handles quiet hours correctly', async () => {
    const mockPreferences = {
      reminder_enabled: true,
      reminder_before_minutes: 15,
      notification_method: 'both',
      quiet_hours_start: '22:00',
      quiet_hours_end: '08:00'
    };

    mockSupabase.from.mockImplementation((table: string) => ({
      select: () => ({
        eq: () => ({
          single: () => ({ data: mockPreferences, error: null })
        })
      })
    }));

    const currentHour = new Date().getHours();
    const isQuietHours = currentHour >= 22 || currentHour < 8;

    const { processReminders } = await import('../index');
    await processReminders();

    if (isQuietHours) {
      expect(sendEmail).not.toHaveBeenCalled();
      expect(sendPushNotification).not.toHaveBeenCalled();
    }
  });

  it('handles notification failures gracefully', async () => {
    // Mock email failure
    (sendEmail as jest.Mock).mockRejectedValueOnce(new Error('Email failed'));
    
    // Mock one push notification failure
    (sendPushNotification as jest.Mock)
      .mockResolvedValueOnce({ ok: true })
      .mockRejectedValueOnce(new Error('Push notification failed'));

    const { processReminders } = await import('../index');
    const result = await processReminders();

    // Should continue processing even with failures
    expect(result.message).toBe('Reminders processed successfully');
    
    // Should have attempted all notifications
    expect(sendEmail).toHaveBeenCalled();
    expect(sendPushNotification).toHaveBeenCalled();
  });
});
