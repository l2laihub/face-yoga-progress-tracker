import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type PracticeSchedule = Database['public']['Tables']['practice_schedules']['Row'];
type ReminderPreference = Database['public']['Tables']['reminder_preferences']['Row'];

interface ScheduleState {
  schedules: PracticeSchedule[];
  preferences: ReminderPreference | null;
  fetchSchedules: () => Promise<void>;
  addSchedule: (schedule: Omit<PracticeSchedule, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateSchedule: (id: string, updates: Partial<Omit<PracticeSchedule, 'id' | 'user_id'>>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  updatePreferences: (updates: Partial<Omit<ReminderPreference, 'user_id'>>) => Promise<void>;
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  schedules: [],
  preferences: null,

  fetchSchedules: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) throw new Error('Not authenticated');

    const [{ data: schedules, error: schedulesError }, { data: preferences, error: preferencesError }] = await Promise.all([
      supabase
        .from('practice_schedules')
        .select('*')
        .eq('user_id', user.id)
        .order('day_of_week', { ascending: true }),
      supabase
        .from('reminder_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()
    ]);

    if (schedulesError) throw schedulesError;
    if (preferencesError && preferencesError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw preferencesError;
    }

    set({ schedules: schedules || [], preferences });
  },

  addSchedule: async (schedule) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('practice_schedules')
      .insert({
        ...schedule,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    set((state) => ({
      schedules: [...state.schedules, data]
    }));
  },

  updateSchedule: async (id, updates) => {
    const { data, error } = await supabase
      .from('practice_schedules')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    set((state) => ({
      schedules: state.schedules.map((s) => (s.id === id ? data : s))
    }));
  },

  deleteSchedule: async (id) => {
    const { error } = await supabase
      .from('practice_schedules')
      .delete()
      .eq('id', id);

    if (error) throw error;

    set((state) => ({
      schedules: state.schedules.filter((s) => s.id !== id)
    }));
  },

  updatePreferences: async (updates) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) throw new Error('Not authenticated');

    const { data: existing } = await supabase
      .from('reminder_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const defaultPreferences = {
      user_id: user.id,
      reminder_enabled: false,
      reminder_before_minutes: 15,
      notification_method: 'both' as const,
      quiet_hours_start: null,
      quiet_hours_end: null,
      last_updated: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('reminder_preferences')
      .upsert({
        ...defaultPreferences,
        ...(existing || {}),
        ...updates,
        user_id: user.id // ensure user_id is always set correctly
      })
      .select()
      .single();

    if (error) throw error;

    set({ preferences: data });
  }
}));
