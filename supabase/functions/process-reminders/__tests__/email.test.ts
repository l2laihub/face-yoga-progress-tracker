import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendEmail, generateReminderEmail } from '../email';

describe('Email Service', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    
    // Mock Deno.env
    (global as any).Deno = {
      env: {
        get: vi.fn((key: string) => {
          switch (key) {
            case 'RESEND_API_KEY':
              return 'test-api-key';
            case 'SENDER_EMAIL':
              return 'test@example.com';
            default:
              return undefined;
          }
        }),
      },
    };

    // Mock fetch
    global.fetch = vi.fn();
  });

  describe('sendEmail', () => {
    it('sends email successfully', async () => {
      const mockResponse = { ok: true, json: () => Promise.resolve({ id: 'test-id' }) };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const emailData = {
        to: 'user@example.com',
        subject: 'Test Subject',
        text: 'Test content',
        html: '<p>Test content</p>'
      };

      const response = await sendEmail(emailData);

      expect(global.fetch).toHaveBeenCalledWith('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'test@example.com',
          to: emailData.to,
          subject: emailData.subject,
          text: emailData.text,
          html: emailData.html,
        }),
      });

      expect(response).toBe(mockResponse);
    });

    it('throws error when Resend configuration is missing', async () => {
      (global as any).Deno.env.get.mockReturnValue(undefined);

      await expect(sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        text: 'Test',
        html: 'Test'
      })).rejects.toThrow('Resend configuration missing');
    });

    it('throws error when API request fails', async () => {
      const errorResponse = {
        ok: false,
        json: () => Promise.resolve({ error: 'API Error' })
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(errorResponse);

      await expect(sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        text: 'Test',
        html: 'Test'
      })).rejects.toThrow('Resend API error');
    });
  });

  describe('generateReminderEmail', () => {
    it('generates correct email content', () => {
      const scheduledTime = '09:00 AM';
      const durationMinutes = 30;

      const emailContent = generateReminderEmail(scheduledTime, durationMinutes);

      // Check subject
      expect(emailContent.subject).toBe('Your Face Yoga Practice Reminder');

      // Check text content
      expect(emailContent.text).toContain(`Time: ${scheduledTime}`);
      expect(emailContent.text).toContain(`Duration: ${durationMinutes} minutes`);
      expect(emailContent.text).toContain('Find a quiet, comfortable space');
      expect(emailContent.text).toContain('Have a mirror ready if needed');
      expect(emailContent.text).toContain('Keep water nearby');
      expect(emailContent.text).toContain('Take deep breaths and stay relaxed');

      // Check HTML content
      expect(emailContent.html).toContain(`<strong>Time:</strong> ${scheduledTime}`);
      expect(emailContent.html).toContain(`<strong>Duration:</strong> ${durationMinutes} minutes`);
      expect(emailContent.html).toContain('✨ Find a quiet, comfortable space');
      expect(emailContent.html).toContain('🪞 Have a mirror ready if needed');
      expect(emailContent.html).toContain('💧 Keep water nearby');
      expect(emailContent.html).toContain('🧘‍♀️ Take deep breaths and stay relaxed');
    });
  });
});
