import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ScheduleForm } from '../ScheduleForm';
import { useScheduleStore } from '../../../store/scheduleStore';
import type { Database } from '../../../lib/database.types';

type PracticeSchedule = Database['public']['Tables']['practice_schedules']['Row'];

// Mock the store
vi.mock('../../../store/scheduleStore', () => ({
  useScheduleStore: vi.fn()
}));

describe('ScheduleForm', () => {
  const mockOnClose = vi.fn();
  const mockAddSchedule = vi.fn();
  const mockUpdateSchedule = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useScheduleStore as any).mockImplementation(() => ({
      addSchedule: mockAddSchedule,
      updateSchedule: mockUpdateSchedule
    }));
  });

  it('renders form fields correctly', () => {
    render(<ScheduleForm onClose={mockOnClose} />);

    // Check if all form fields are present
    expect(screen.getByLabelText(/day of week/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/duration/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<ScheduleForm onClose={mockOnClose} />);

    // Try to submit without filling required fields
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    // Check for error messages
    await waitFor(() => {
      expect(screen.getByText(/day of week is required/i)).toBeInTheDocument();
      expect(screen.getByText(/start time is required/i)).toBeInTheDocument();
      expect(screen.getByText(/duration is required/i)).toBeInTheDocument();
    });

    expect(mockAddSchedule).not.toHaveBeenCalled();
  });

  it('validates duration range', async () => {
    render(<ScheduleForm onClose={mockOnClose} />);

    // Fill form with invalid duration
    await userEvent.selectOptions(screen.getByLabelText(/day of week/i), '1');
    await userEvent.type(screen.getByLabelText(/start time/i), '09:00');
    await userEvent.type(screen.getByLabelText(/duration/i), '0');

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/duration must be between 5 and 120 minutes/i)).toBeInTheDocument();
    });

    expect(mockAddSchedule).not.toHaveBeenCalled();
  });

  it('handles form submission correctly', async () => {
    render(<ScheduleForm onClose={mockOnClose} />);

    // Fill form with valid data
    await userEvent.selectOptions(screen.getByLabelText(/day of week/i), '1');
    await userEvent.type(screen.getByLabelText(/start time/i), '09:00');
    await userEvent.type(screen.getByLabelText(/duration/i), '30');

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockAddSchedule).toHaveBeenCalledWith({
        day_of_week: 1,
        start_time: '09:00',
        duration_minutes: 30,
        is_active: true,
        user_id: expect.any(String),
        created_at: expect.any(String),
        updated_at: expect.any(String)
      } as PracticeSchedule);
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('handles schedule updates correctly', async () => {
    const existingSchedule: PracticeSchedule = {
      id: '123',
      user_id: 'test-user',
      day_of_week: 2,
      start_time: '10:00',
      duration_minutes: 45,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    };

    render(<ScheduleForm schedule={existingSchedule} onClose={mockOnClose} />);

    // Check if form is pre-filled
    expect(screen.getByLabelText(/day of week/i)).toHaveValue('2');
    expect(screen.getByLabelText(/start time/i)).toHaveValue('10:00');
    expect(screen.getByLabelText(/duration/i)).toHaveValue(45);

    // Update values
    await userEvent.selectOptions(screen.getByLabelText(/day of week/i), '3');
    await userEvent.clear(screen.getByLabelText(/start time/i));
    await userEvent.type(screen.getByLabelText(/start time/i), '11:00');
    await userEvent.clear(screen.getByLabelText(/duration/i));
    await userEvent.type(screen.getByLabelText(/duration/i), '60');

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockUpdateSchedule).toHaveBeenCalledWith('123', {
        day_of_week: 3,
        start_time: '11:00',
        duration_minutes: 60,
        is_active: true
      });
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('handles cancellation correctly', () => {
    render(<ScheduleForm onClose={mockOnClose} />);

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockAddSchedule).not.toHaveBeenCalled();
    expect(mockUpdateSchedule).not.toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('displays error message on submission failure', async () => {
    mockAddSchedule.mockRejectedValueOnce(new Error('Failed to save schedule'));
    render(<ScheduleForm onClose={mockOnClose} />);

    // Fill form with valid data
    await userEvent.selectOptions(screen.getByLabelText(/day of week/i), '1');
    await userEvent.type(screen.getByLabelText(/start time/i), '09:00');
    await userEvent.type(screen.getByLabelText(/duration/i), '30');

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to save schedule/i)).toBeInTheDocument();
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
