import { describe, it, expect, beforeEach } from 'vitest';
import { useScheduleStore } from '../scheduleStore';
import { mockSupabase } from '../../test/mocks/supabase';

describe('scheduleStore', () => {
  beforeEach(() => {
    // Reset store
    useScheduleStore.setState({
      schedules: [],
      preferences: null
    });
  });

  describe('fetchSchedules', () => {
    it('fetches schedules and preferences successfully', async () => {
      const mockSchedules = [
        {
          id: '1',
          user_id: 'test-user-id',
          day_of_week: 1,
          start_time: '09:00',
          duration_minutes: 30,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ];

      const mockPreferences: Database['public']['Tables']['reminder_preferences']['Row'] = {
        user_id: 'test-user-id',
        reminder_enabled: true,
        reminder_before_minutes: 15,
        notification_method: 'both' as const,
        quiet_hours_start: null,
        quiet_hours_end: null,
        last_updated: '2024-01-01T00:00:00Z'
      };

      mockSupabase.from().select().eq().order.mockResolvedValueOnce({
        data: mockSchedules,
        error: null
      });

      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: mockPreferences,
        error: null
      });

      await useScheduleStore.getState().fetchSchedules();

      expect(useScheduleStore.getState().schedules).toEqual(mockSchedules);
      expect(useScheduleStore.getState().preferences).toEqual(mockPreferences);
    });

    it('handles authentication error', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: null
      });

      await expect(useScheduleStore.getState().fetchSchedules()).rejects.toThrow('Not authenticated');
    });

    it('handles database error', async () => {
      mockSupabase.from().select().eq().order.mockResolvedValueOnce({
        data: [] as PracticeSchedule[],
        error: new Error('Database error')
      });

      await expect(useScheduleStore.getState().fetchSchedules()).rejects.toThrow('Database error');
    });
  });

  describe('addSchedule', () => {
    it('adds a schedule successfully', async () => {
      const newSchedule = {
        user_id: 'test-user-id',
        day_of_week: 1,
        start_time: '09:00',
        duration_minutes: 30,
        is_active: true
      };

      const mockResponse = {
        ...newSchedule,
        id: '1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      mockSupabase.from().insert().select().single.mockResolvedValueOnce({
        data: mockResponse,
        error: null
      });

      await useScheduleStore.getState().addSchedule(newSchedule);

      expect(useScheduleStore.getState().schedules).toContainEqual(mockResponse);
    });

    it('handles insert error', async () => {
      const newSchedule = {
        user_id: 'test-user-id',
        day_of_week: 1,
        start_time: '09:00',
        duration_minutes: 30,
        is_active: true
      };

      mockSupabase.from().insert().select().single.mockResolvedValueOnce({
        data: null,
        error: new Error('Insert failed')
      });

      await expect(useScheduleStore.getState().addSchedule(newSchedule)).rejects.toThrow('Insert failed');
    });
  });

  describe('updateSchedule', () => {
    it('updates a schedule successfully', async () => {
      const updates = {
        start_time: '10:00',
        duration_minutes: 45
      };

      const mockResponse = {
        id: '1',
        user_id: 'test-user-id',
        day_of_week: 1,
        start_time: '10:00',
        duration_minutes: 45,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      mockSupabase.from().update().eq().select().single.mockResolvedValueOnce({
        data: mockResponse,
        error: null
      });

      await useScheduleStore.getState().updateSchedule('1', updates);

      expect(useScheduleStore.getState().schedules).toContainEqual(mockResponse);
    });

    it('handles update error', async () => {
      mockSupabase.from().update().eq().select().single.mockResolvedValueOnce({
        data: null,
        error: new Error('Update failed')
      });

      await expect(useScheduleStore.getState().updateSchedule('1', { is_active: false }))
        .rejects.toThrow('Update failed');
    });
  });

  describe('deleteSchedule', () => {
    it('deletes a schedule successfully', async () => {
      const initialSchedules = [{
        id: '1',
        user_id: 'test-user-id',
        day_of_week: 1,
        start_time: '09:00',
        duration_minutes: 30,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }];

      useScheduleStore.setState({ schedules: initialSchedules });

      mockSupabase.from().delete().eq.mockResolvedValueOnce({
        data: null,
        error: null
      });

      await useScheduleStore.getState().deleteSchedule('1');

      expect(useScheduleStore.getState().schedules).toHaveLength(0);
    });

    it('handles delete error', async () => {
      mockSupabase.from().delete().eq.mockResolvedValueOnce({
        data: null,
        error: new Error('Delete failed')
      });

      await expect(useScheduleStore.getState().deleteSchedule('1'))
        .rejects.toThrow('Delete failed');
    });
  });

  describe('updatePreferences', () => {
    it('updates preferences successfully', async () => {
      const updates = {
        reminder_enabled: true,
        reminder_before_minutes: 30
      };

      const mockResponse: Database['public']['Tables']['reminder_preferences']['Row'] = {
        user_id: 'test-user-id',
        reminder_enabled: true,
        reminder_before_minutes: 30,
        notification_method: 'both' as const,
        quiet_hours_start: null,
        quiet_hours_end: null,
        last_updated: '2024-01-01T00:00:00Z'
      };

      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: null,
        error: null
      });

      mockSupabase.from().upsert().select().single.mockResolvedValueOnce({
        data: mockResponse,
        error: null
      });

      await useScheduleStore.getState().updatePreferences(updates);

      expect(useScheduleStore.getState().preferences).toEqual(mockResponse);
    });

    it('handles upsert error', async () => {
      mockSupabase.from().upsert().select().single.mockResolvedValueOnce({
        data: null,
        error: new Error('Upsert failed')
      });

      await expect(useScheduleStore.getState().updatePreferences({ reminder_enabled: true }))
        .rejects.toThrow('Upsert failed');
    });
  });
});
