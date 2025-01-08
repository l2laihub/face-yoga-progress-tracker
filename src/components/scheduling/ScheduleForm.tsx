import React, { useState } from 'react';
import { useScheduleStore } from '../../store/scheduleStore';
import { useAuth } from '../../hooks/useAuth';

interface ScheduleFormProps {
  schedule?: {
    id: string;
    day_of_week: number;
    start_time: string;
    duration_minutes: number;
    is_active: boolean;
  };
  onClose: () => void;
}

export const ScheduleForm: React.FC<ScheduleFormProps> = ({ schedule, onClose }) => {
  const { addSchedule, updateSchedule } = useScheduleStore();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    day_of_week: schedule?.day_of_week ?? 1,
    start_time: schedule?.start_time ?? '',
    duration_minutes: schedule?.duration_minutes ?? 30,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (schedule?.id) {
        await updateSchedule(schedule.id, {
          ...formData,
          is_active: schedule.is_active
        });
      } else {
        if (!user?.id) {
          throw new Error('User not authenticated');
        }
        await addSchedule({
          ...formData,
          user_id: user.id,
          is_active: true
        });
      }
      onClose();
    } catch (err) {
      setError('Failed to save schedule');
    }
  };

  return (
    <form onSubmit={handleSubmit} data-testid="schedule-form" className="space-y-4">
      <div>
        <label htmlFor="day_of_week" className="block text-sm font-medium">
          Day of Week
        </label>
        <select
          id="day_of_week"
          value={formData.day_of_week}
          onChange={(e) => setFormData({ ...formData, day_of_week: parseInt(e.target.value) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        >
          <option value={1}>Monday</option>
          <option value={2}>Tuesday</option>
          <option value={3}>Wednesday</option>
          <option value={4}>Thursday</option>
          <option value={5}>Friday</option>
          <option value={6}>Saturday</option>
          <option value={0}>Sunday</option>
        </select>
      </div>

      <div>
        <label htmlFor="start_time" className="block text-sm font-medium">
          Start Time
        </label>
        <input
          type="time"
          id="start_time"
          value={formData.start_time}
          onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="duration" className="block text-sm font-medium">
          Duration (minutes)
        </label>
        <input
          type="number"
          id="duration"
          min={5}
          max={120}
          value={formData.duration_minutes}
          onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-mint-600 rounded-md hover:bg-mint-700"
        >
          {schedule ? 'Update' : 'Save'}
        </button>
      </div>
    </form>
  );
};
