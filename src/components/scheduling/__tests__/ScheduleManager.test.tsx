import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ScheduleManager } from '../ScheduleManager';
import { useScheduleStore } from '../../../store/scheduleStore';
import type { Database } from '../../../lib/database.types';

type PracticeSchedule = Database['public']['Tables']['practice_schedules']['Row'];

// Mock the store
vi.mock('../../../store/scheduleStore', () => ({
  useScheduleStore: vi.fn()
}));

describe('ScheduleManager', () => {
  const mockSchedules: PracticeSchedule[] = [
    {
      id: '1',
      user_id: 'test-user',
      day_of_week: 1,
      start_time: '09:00',
      duration_minutes: 30,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      user_id: 'test-user',
      day_of_week: 3,
      start_time: '15:00',
      duration_minutes: 45,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ];

  const mockFetchSchedules = vi.fn();
  const mockDeleteSchedule = vi.fn();
  const mockUpdateSchedule = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useScheduleStore as any).mockImplementation(() => ({
      schedules: mockSchedules,
      loading: false,
      error: null,
      fetchSchedules: mockFetchSchedules,
      deleteSchedule: mockDeleteSchedule,
      updateSchedule: mockUpdateSchedule
    }));
  });

  it('renders schedule list correctly', () => {
    render(<ScheduleManager />);

    // Check if schedules are displayed
    expect(screen.getByText('Monday')).toBeInTheDocument();
    expect(screen.getByText('9:00 AM')).toBeInTheDocument();
    expect(screen.getByText('30 minutes')).toBeInTheDocument();

    expect(screen.getByText('Wednesday')).toBeInTheDocument();
    expect(screen.getByText('3:00 PM')).toBeInTheDocument();
    expect(screen.getByText('45 minutes')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    (useScheduleStore as any).mockImplementation(() => ({
      schedules: [],
      loading: true,
      error: null,
      fetchSchedules: mockFetchSchedules
    }));

    render(<ScheduleManager />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('shows error state', () => {
    const errorMessage = 'Failed to load schedules';
    (useScheduleStore as any).mockImplementation(() => ({
      schedules: [],
      loading: false,
      error: new Error(errorMessage),
      fetchSchedules: mockFetchSchedules
    }));

    render(<ScheduleManager />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('opens add schedule form', async () => {
    render(<ScheduleManager />);

    const addButton = screen.getByRole('button', { name: /add schedule/i });
    await userEvent.click(addButton);

    expect(screen.getByTestId('schedule-form')).toBeInTheDocument();
  });

  it('handles schedule deletion', async () => {
    render(<ScheduleManager />);

    const deleteButton = screen.getAllByLabelText(/delete schedule/i)[0];
    await userEvent.click(deleteButton);

    // Check for confirmation dialog
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockDeleteSchedule).toHaveBeenCalledWith('1');
    });
  });

  it('cancels schedule deletion', async () => {
    render(<ScheduleManager />);

    const deleteButton = screen.getAllByLabelText(/delete schedule/i)[0];
    await userEvent.click(deleteButton);

    // Cancel deletion
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await userEvent.click(cancelButton);

    expect(mockDeleteSchedule).not.toHaveBeenCalled();
  });

  it('handles schedule activation toggle', async () => {
    render(<ScheduleManager />);

    const toggleButton = screen.getAllByLabelText(/toggle schedule/i)[0];
    await userEvent.click(toggleButton);

    await waitFor(() => {
      expect(mockUpdateSchedule).toHaveBeenCalledWith('1', {
        is_active: false,
        updated_at: expect.any(String)
      });
    });
  });

  it('opens edit schedule form', async () => {
    render(<ScheduleManager />);

    const editButton = screen.getAllByLabelText(/edit schedule/i)[0];
    await userEvent.click(editButton);

    const form = screen.getByTestId('schedule-form');
    expect(form).toBeInTheDocument();

    // Check if form is pre-filled with schedule data
    expect(screen.getByLabelText(/day of week/i)).toHaveValue('1');
    expect(screen.getByLabelText(/start time/i)).toHaveValue('09:00');
    expect(screen.getByLabelText(/duration/i)).toHaveValue(30);
  });

  it('groups schedules by day', () => {
    render(<ScheduleManager />);

    const mondaySection = screen.getByTestId('day-1');
    const wednesdaySection = screen.getByTestId('day-3');

    expect(mondaySection).toContainElement(screen.getByText('9:00 AM'));
    expect(wednesdaySection).toContainElement(screen.getByText('3:00 PM'));
  });

  it('shows empty state when no schedules', () => {
    (useScheduleStore as any).mockImplementation(() => ({
      schedules: [],
      loading: false,
      error: null,
      fetchSchedules: mockFetchSchedules
    }));

    render(<ScheduleManager />);
    expect(screen.getByText(/no schedules yet/i)).toBeInTheDocument();
    expect(screen.getByText(/add your first practice schedule/i)).toBeInTheDocument();
  });

  it('fetches schedules on mount', () => {
    render(<ScheduleManager />);
    expect(mockFetchSchedules).toHaveBeenCalled();
  });

  it('handles schedule update failure', async () => {
    mockUpdateSchedule.mockRejectedValueOnce(new Error('Failed to update schedule'));
    render(<ScheduleManager />);

    const toggleButton = screen.getAllByLabelText(/toggle schedule/i)[0];
    await userEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to update schedule/i)).toBeInTheDocument();
    });
  });

  it('handles schedule deletion failure', async () => {
    mockDeleteSchedule.mockRejectedValueOnce(new Error('Failed to delete schedule'));
    render(<ScheduleManager />);

    const deleteButton = screen.getAllByLabelText(/delete schedule/i)[0];
    await userEvent.click(deleteButton);

    const confirmButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to delete schedule/i)).toBeInTheDocument();
    });
  });

  it('sorts schedules by time within each day', () => {
    const schedules: PracticeSchedule[] = [
      { ...mockSchedules[0], start_time: '14:00' },
      { ...mockSchedules[0], id: '3', start_time: '09:00' }
    ];

    (useScheduleStore as any).mockImplementation(() => ({
      schedules,
      loading: false,
      error: null,
      fetchSchedules: mockFetchSchedules
    }));

    render(<ScheduleManager />);

    const times = screen.getAllByText(/:\d{2}/);
    expect(times[0]).toHaveTextContent('9:00');
    expect(times[1]).toHaveTextContent('2:00');
  });
});
