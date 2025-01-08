import React, { useState } from 'react';
import { useScheduleStore } from '../../store/scheduleStore';
import type { Database } from '../../lib/database.types';

type NotificationMethod = Database['public']['Tables']['reminder_preferences']['Row']['notification_method'];

export const ReminderPreferences: React.FC = () => {
  const { preferences: rawPreferences, updatePreferences } = useScheduleStore();
  const preferences = rawPreferences ?? {
    reminder_enabled: false,
    reminder_before_minutes: 15,
    notification_method: 'both' as const,
    quiet_hours_start: null,
    quiet_hours_end: null,
    last_updated: new Date().toISOString()
  };
  const [error, setError] = useState<string | null>(null);

  const handleToggleReminders = async (enabled: boolean) => {
    try {
      await updatePreferences({
        reminder_enabled: enabled,
        last_updated: new Date().toISOString()
      });
    } catch (err) {
      setError('Failed to update preferences');
    }
  };

  const handleReminderTimeChange = async (minutes: number) => {
    try {
      await updatePreferences({
        reminder_before_minutes: minutes,
        last_updated: new Date().toISOString()
      });
    } catch (err) {
      setError('Failed to update preferences');
    }
  };

  const handleNotificationMethodChange = async (method: NotificationMethod) => {
    try {
      await updatePreferences({
        notification_method: method,
        last_updated: new Date().toISOString()
      });
    } catch (err) {
      setError('Failed to update preferences');
    }
  };

  const handleQuietHoursChange = async (start: string | null, end: string | null) => {
    try {
      if (start && end) {
        const startTime = new Date(`1970-01-01T${start}`);
        const endTime = new Date(`1970-01-01T${end}`);
        if (startTime >= endTime) {
          setError('End time must be after start time');
          return;
        }
      }

      await updatePreferences({
        quiet_hours_start: start,
        quiet_hours_end: end,
        last_updated: new Date().toISOString()
      });
    } catch (err) {
      setError('Failed to update preferences');
    }
  };

  const clearQuietHours = async () => {
    try {
      await updatePreferences({
        quiet_hours_start: null,
        quiet_hours_end: null,
        last_updated: new Date().toISOString()
      });
    } catch (err) {
      setError('Failed to update preferences');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={preferences.reminder_enabled}
            onChange={(e) => handleToggleReminders(e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="text-sm font-medium">Enable reminders</span>
        </label>
      </div>

      <div>
        <label htmlFor="reminder_time" className="block text-sm font-medium">
          Reminder time
        </label>
        <select
          id="reminder_time"
          value={preferences.reminder_before_minutes}
          onChange={(e) => handleReminderTimeChange(parseInt(e.target.value))}
          disabled={!preferences.reminder_enabled}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value={5}>5 minutes before</option>
          <option value={10}>10 minutes before</option>
          <option value={15}>15 minutes before</option>
          <option value={30}>30 minutes before</option>
          <option value={60}>1 hour before</option>
        </select>
      </div>

      <div>
        <label htmlFor="notification_method" className="block text-sm font-medium">
          Notification method
        </label>
        <select
          id="notification_method"
          value={preferences.notification_method}
          onChange={(e) => handleNotificationMethodChange(e.target.value as NotificationMethod)}
          disabled={!preferences.reminder_enabled}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="email">Email only</option>
          <option value="push">Push notification only</option>
          <option value="both">Both email and push</option>
        </select>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium">Quiet hours</label>
        <div className="flex space-x-4">
          <div>
            <label htmlFor="quiet_hours_start" className="block text-xs text-gray-500">
              Start time
            </label>
            <input
              type="time"
              id="quiet_hours_start"
              value={preferences.quiet_hours_start || ''}
              onChange={(e) => handleQuietHoursChange(e.target.value, preferences.quiet_hours_end)}
              disabled={!preferences.reminder_enabled}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="quiet_hours_end" className="block text-xs text-gray-500">
              End time
            </label>
            <input
              type="time"
              id="quiet_hours_end"
              value={preferences.quiet_hours_end || ''}
              onChange={(e) => handleQuietHoursChange(preferences.quiet_hours_start, e.target.value)}
              disabled={!preferences.reminder_enabled}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
        </div>
        {(preferences.quiet_hours_start || preferences.quiet_hours_end) && (
          <button
            onClick={clearQuietHours}
            disabled={!preferences.reminder_enabled}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear quiet hours
          </button>
        )}
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
    </div>
  );
};
