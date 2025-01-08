import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database.types';

type PracticeSchedule = Database['public']['Tables']['practice_schedules']['Row'];

interface UpcomingSession extends PracticeSchedule {
  nextOccurrence: Date;
}

export function useUpcomingSessions(limit = 3) {
  const [sessions, setSessions] = useState<UpcomingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSessions() {
      try {
        setLoading(true);
        setError(null);

        const { data: schedules, error: fetchError } = await supabase
          .from('practice_schedules')
          .select('*')
          .eq('is_active', true)
          .order('day_of_week')
          .order('start_time');

        if (fetchError) throw fetchError;

        // Calculate next occurrence for each schedule
        const now = new Date();
        const currentDayOfWeek = now.getDay();
        const currentTime = now.toLocaleTimeString('en-US', { hour12: false });

        const upcomingSessions = schedules
          .map(schedule => {
            let daysUntilNext = schedule.day_of_week - currentDayOfWeek;
            
            // If it's the same day, check if the time has passed
            if (daysUntilNext === 0 && schedule.start_time <= currentTime) {
              daysUntilNext = 7; // Move to next week
            }
            // If it's in the past this week, move to next week
            else if (daysUntilNext < 0) {
              daysUntilNext += 7;
            }

            const nextDate = new Date();
            nextDate.setDate(now.getDate() + daysUntilNext);
            const [hours, minutes] = schedule.start_time.split(':');
            nextDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            return {
              ...schedule,
              nextOccurrence: nextDate,
            };
          })
          .sort((a, b) => a.nextOccurrence.getTime() - b.nextOccurrence.getTime())
          .slice(0, limit);

        setSessions(upcomingSessions);
      } catch (err) {
        console.error('Error fetching upcoming sessions:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch upcoming sessions');
      } finally {
        setLoading(false);
      }
    }

    fetchSessions();
    // Refresh every minute to keep times current
    const interval = setInterval(fetchSessions, 60000);

    return () => clearInterval(interval);
  }, [limit]);

  return { sessions, loading, error };
}
