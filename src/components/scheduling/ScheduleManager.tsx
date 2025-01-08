import React, { useState, useEffect } from 'react';
import { useScheduleStore } from '../../store/scheduleStore';
import { ScheduleForm } from './ScheduleForm';
import type { Database } from '../../lib/database.types';

type PracticeSchedule = Database['public']['Tables']['practice_schedules']['Row'];

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const ScheduleManager: React.FC = () => {
  const { schedules, fetchSchedules, deleteSchedule, updateSchedule } = useScheduleStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<PracticeSchedule | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const loadSchedules = async () => {
      try {
        setLoading(true);
        await fetchSchedules();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load schedules');
      } finally {
        setLoading(false);
      }
    };
    loadSchedules();
  }, [fetchSchedules]);

  const handleDelete = async (id: string) => {
    try {
      await deleteSchedule(id);
      setShowDeleteConfirm(null);
    } catch (err) {
      setActionError('Failed to delete schedule');
    }
  };

  const handleToggleActive = async (schedule: PracticeSchedule) => {
    try {
      await updateSchedule(schedule.id, {
        is_active: !schedule.is_active,
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      setActionError('Failed to update schedule');
    }
  };

  const groupedSchedules = schedules.reduce((acc, schedule) => {
    const day = schedule.day_of_week;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(schedule);
    return acc;
  }, {} as Record<number, PracticeSchedule[]>);

  // Sort schedules within each day by start time
  Object.values(groupedSchedules).forEach(daySchedules => {
    daySchedules.sort((a, b) => a.start_time.localeCompare(b.start_time));
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32" data-testid="loading-spinner">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mint-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center py-4">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Practice Schedule</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-mint-600 rounded-md hover:bg-mint-700"
        >
          Add Schedule
        </button>
      </div>

      {actionError && (
        <div className="text-red-600 text-sm">{actionError}</div>
      )}

      {schedules.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No schedules yet</p>
          <p className="text-sm text-gray-400">Add your first practice schedule</p>
        </div>
      ) : (
        <div className="space-y-6">
          {DAYS.map((day, index) => {
            const daySchedules = groupedSchedules[index] || [];
            if (daySchedules.length === 0) return null;

            return (
              <div key={day} data-testid={`day-${index}`} className="space-y-3">
                <h3 className="font-medium text-gray-900">{day}</h3>
                <div className="space-y-2">
                  {daySchedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm"
                    >
                      <div>
                        <p className="font-medium">
                          {new Date(`1970-01-01T${schedule.start_time}`).toLocaleTimeString([], {
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </p>
                        <p className="text-sm text-gray-500">{schedule.duration_minutes} minutes</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleActive(schedule)}
                          aria-label="Toggle schedule"
                          className={`p-2 rounded-md ${
                            schedule.is_active
                              ? 'text-mint-600 hover:bg-mint-50'
                              : 'text-gray-400 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Toggle schedule</span>
                          {schedule.is_active ? '🟢' : '⚪'}
                        </button>
                        <button
                          onClick={() => {
                            setEditingSchedule(schedule);
                            setShowForm(true);
                          }}
                          aria-label="Edit schedule"
                          className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-50 rounded-md"
                        >
                          <span className="sr-only">Edit schedule</span>
                          ✏️
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(schedule.id)}
                          aria-label="Delete schedule"
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-50 rounded-md"
                        >
                          <span className="sr-only">Delete schedule</span>
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <ScheduleForm
              schedule={editingSchedule ? {
                id: editingSchedule.id,
                day_of_week: editingSchedule.day_of_week,
                start_time: editingSchedule.start_time,
                duration_minutes: editingSchedule.duration_minutes,
                is_active: editingSchedule.is_active
              } : undefined}
              onClose={() => {
                setShowForm(false);
                setEditingSchedule(null);
              }}
            />
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium mb-4">Are you sure?</h3>
            <p className="text-gray-500 mb-6">This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
