import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ReminderPreferences } from '../ReminderPreferences';
import { useScheduleStore } from '../../../store/scheduleStore';
import type { Database } from '../../../lib/database.types';

type ReminderPreference = Database['public']['Tables']['reminder_preferences']['Row'];

// Mock the store
vi.mock('../../../store/scheduleStore', () => ({
  useScheduleStore: vi.fn()
}));

describe('ReminderPreferences', () => {
  const mockUpdatePreferences = vi.fn();
  const mockPreferences: ReminderPreference = {
    user_id: 'test-user',
    reminder_enabled: true,
    reminder_before_minutes: 15,
    notification_method: 'both',
    quiet_hours_start: null,
    quiet_hours_end: null,
    last_updated: new Date().toISOString()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useScheduleStore as any).mockImplementation(() => ({
      preferences: mockPreferences,
      updatePreferences: mockUpdatePreferences
    }));
  });

  it('renders preferences form correctly', () => {
    render(<ReminderPreferences />);

    // Check if all form elements are present
    expect(screen.getByLabelText(/enable reminders/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/reminder time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/notification method/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/quiet hours start/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/quiet hours end/i)).toBeInTheDocument();
  });

  it('loads existing preferences correctly', () => {
    render(<ReminderPreferences />);

    expect(screen.getByLabelText(/enable reminders/i)).toBeChecked();
    expect(screen.getByLabelText(/reminder time/i)).toHaveValue('15');
    expect(screen.getByLabelText(/notification method/i)).toHaveValue('both');
  });

  it('handles reminder toggle correctly', async () => {
    render(<ReminderPreferences />);

    const toggle = screen.getByLabelText(/enable reminders/i);
    await userEvent.click(toggle);

    await waitFor(() => {
      expect(mockUpdatePreferences).toHaveBeenCalledWith({
        reminder_enabled: false,
        last_updated: expect.any(String)
      });
    });
  });

  it('handles reminder time change correctly', async () => {
    render(<ReminderPreferences />);

    const timeInput = screen.getByLabelText(/reminder time/i);
    await userEvent.clear(timeInput);
    await userEvent.type(timeInput, '30');

    await waitFor(() => {
      expect(mockUpdatePreferences).toHaveBeenCalledWith({
        reminder_before_minutes: 30,
        last_updated: expect.any(String)
      });
    });
  });

  it('handles notification method change correctly', async () => {
    render(<ReminderPreferences />);

    const methodSelect = screen.getByLabelText(/notification method/i);
    await userEvent.selectOptions(methodSelect, 'email');

    await waitFor(() => {
      expect(mockUpdatePreferences).toHaveBeenCalledWith({
        notification_method: 'email',
        last_updated: expect.any(String)
      });
    });
  });

  it('handles quiet hours setup correctly', async () => {
    render(<ReminderPreferences />);

    const startTime = screen.getByLabelText(/quiet hours start/i);
    const endTime = screen.getByLabelText(/quiet hours end/i);

    await userEvent.type(startTime, '22:00');
    await userEvent.type(endTime, '08:00');

    await waitFor(() => {
      expect(mockUpdatePreferences).toHaveBeenCalledWith({
        quiet_hours_start: '22:00',
        quiet_hours_end: '08:00',
        last_updated: expect.any(String)
      });
    });
  });

  it('validates quiet hours range', async () => {
    render(<ReminderPreferences />);

    const startTime = screen.getByLabelText(/quiet hours start/i);
    const endTime = screen.getByLabelText(/quiet hours end/i);

    await userEvent.type(startTime, '10:00');
    await userEvent.type(endTime, '09:00');

    expect(screen.getByText(/end time must be after start time/i)).toBeInTheDocument();
  });

  it('handles preferences update failure', async () => {
    mockUpdatePreferences.mockRejectedValueOnce(new Error('Failed to update preferences'));
    render(<ReminderPreferences />);

    const timeInput = screen.getByLabelText(/reminder time/i);
    await userEvent.clear(timeInput);
    await userEvent.type(timeInput, '30');

    await waitFor(() => {
      expect(screen.getByText(/failed to update preferences/i)).toBeInTheDocument();
    });
  });

  it('disables inputs when reminders are disabled', async () => {
    (useScheduleStore as any).mockImplementation(() => ({
      preferences: { ...mockPreferences, reminder_enabled: false },
      updatePreferences: mockUpdatePreferences
    }));

    render(<ReminderPreferences />);

    expect(screen.getByLabelText(/reminder time/i)).toBeDisabled();
    expect(screen.getByLabelText(/notification method/i)).toBeDisabled();
    expect(screen.getByLabelText(/quiet hours start/i)).toBeDisabled();
    expect(screen.getByLabelText(/quiet hours end/i)).toBeDisabled();
  });

  it('clears quiet hours correctly', async () => {
    (useScheduleStore as any).mockImplementation(() => ({
      preferences: { 
        ...mockPreferences, 
        quiet_hours_start: '22:00',
        quiet_hours_end: '08:00'
      },
      updatePreferences: mockUpdatePreferences
    }));

    render(<ReminderPreferences />);

    const clearButton = screen.getByRole('button', { name: /clear quiet hours/i });
    await userEvent.click(clearButton);

    await waitFor(() => {
      expect(mockUpdatePreferences).toHaveBeenCalledWith({
        quiet_hours_start: null,
        quiet_hours_end: null,
        last_updated: expect.any(String)
      });
    });
  });
});
