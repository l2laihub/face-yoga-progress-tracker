import { vi } from 'vitest';

import type { Database } from '../../lib/database.types';

type PracticeSchedule = Database['public']['Tables']['practice_schedules']['Row'];
type ReminderPreference = Database['public']['Tables']['reminder_preferences']['Row'];

export const mockSupabase = {
  auth: {
    getUser: vi.fn().mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null
    })
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          data: [] as PracticeSchedule[],
          error: null as Error | null
        })),
        single: vi.fn(() => ({
          data: null as ReminderPreference | null,
          error: null as Error | null
        }))
      }))
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => ({
          data: null as PracticeSchedule | null,
          error: null as Error | null
        }))
      }))
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => ({
          data: null as PracticeSchedule | null,
          error: null as Error | null
        }))
      }))
      }))
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => ({
        data: null as null,
        error: null as Error | null
      }))
    })),
    upsert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => ({
          data: null as ReminderPreference | null,
          error: null as Error | null
        }))
      }))
    }))
  }))
};

vi.mock('../lib/supabase', () => ({
  supabase: mockSupabase
}));
