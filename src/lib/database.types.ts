export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          role: 'user' | 'admin';
          streak: number;
          lessons_completed: number;
          practice_time: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'user' | 'admin';
          streak?: number;
          lessons_completed?: number;
          practice_time?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'user' | 'admin';
          streak?: number;
          lessons_completed?: number;
          practice_time?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      lessons: {
        Row: {
          id: string;
          title: string;
          duration: string;
          description: string;
          image_url: string;
          video_url?: string;
          difficulty: string;
          instructions: string[];
          benefits: string[];
          category: string;
          target_area: string;
          is_premium: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          duration: string;
          description: string;
          image_url: string;
          video_url?: string;
          difficulty: string;
          instructions: string[];
          benefits: string[];
          category: string;
          target_area: string;
          is_premium?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          duration?: string;
          description?: string;
          image_url?: string;
          video_url?: string;
          difficulty?: string;
          instructions?: string[];
          benefits?: string[];
          category?: string;
          target_area?: string;
          is_premium?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      course_lessons: {
        Row: {
          id: string;
          course_id: string;
          lesson_id: string;
          order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          lesson_id: string;
          order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          lesson_id?: string;
          order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      course_purchases: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          amount: number;
          currency: string;
          status: 'pending' | 'completed' | 'failed' | 'refunded';
          payment_intent_id: string;
          payment_method: string;
          receipt_url: string | null;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          amount: number;
          currency: string;
          status?: 'pending' | 'completed' | 'failed' | 'refunded';
          payment_intent_id: string;
          payment_method: string;
          receipt_url?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          amount?: number;
          currency?: string;
          status?: 'pending' | 'completed' | 'failed' | 'refunded';
          payment_intent_id?: string;
          payment_method?: string;
          receipt_url?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      course_access: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          purchase_id: string;
          access_type: 'lifetime' | 'subscription' | 'trial';
          starts_at: string;
          expires_at: string | null;
          last_accessed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          purchase_id: string;
          access_type?: 'lifetime' | 'subscription' | 'trial';
          starts_at?: string;
          expires_at?: string | null;
          last_accessed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          purchase_id?: string;
          access_type?: 'lifetime' | 'subscription' | 'trial';
          starts_at?: string;
          expires_at?: string | null;
          last_accessed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      early_access_signups: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          status: 'pending' | 'notified';
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
          status?: 'pending' | 'notified';
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          status?: 'pending' | 'notified';
        };
      };
      site_settings: {
        Row: {
          id: string;
          business_name: string;
          logo_url: string | null;
          primary_color: string | null;
          secondary_color: string | null;
          description: string | null;
          contact_email: string | null;
          social_links: Record<string, string> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_name?: string;
          logo_url?: string | null;
          primary_color?: string | null;
          secondary_color?: string | null;
          description?: string | null;
          contact_email?: string | null;
          social_links?: Record<string, string> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_name?: string;
          logo_url?: string | null;
          primary_color?: string | null;
          secondary_color?: string | null;
          description?: string | null;
          contact_email?: string | null;
          social_links?: Record<string, string> | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      app_settings: {
        Row: {
          id: string;
          business_name: string;
          logo_url: string | null;
          description: string;
          primary_color: string;
          secondary_color: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_name?: string;
          logo_url?: string | null;
          description?: string;
          primary_color?: string;
          secondary_color?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_name?: string;
          logo_url?: string | null;
          description?: string;
          primary_color?: string;
          secondary_color?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: []
      };
      goals: {
        Row: {
          id: string;
          label: string;
          icon: string;
          description: string;
          category: string | null;
          difficulty: string | null;
          estimated_duration: string | null;
          points_reward: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          label: string;
          icon: string;
          description: string;
          category?: string | null;
          difficulty?: string | null;
          estimated_duration?: string | null;
          points_reward?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          label?: string;
          icon?: string;
          description?: string;
          category?: string | null;
          difficulty?: string | null;
          estimated_duration?: string | null;
          points_reward?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_goals: {
        Row: {
          id: string;
          user_id: string;
          goals: string[];
          priority: number;
          start_date: string;
          target_date: string | null;
          reminder_frequency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          goals: string[];
          priority?: number;
          start_date?: string;
          target_date?: string | null;
          reminder_frequency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          goals?: string[];
          priority?: number;
          start_date?: string;
          target_date?: string | null;
          reminder_frequency?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      goal_progress: {
        Row: {
          id: string;
          user_id: string;
          goal_id: string;
          progress_value: number;
          milestone_reached: number;
          last_updated: string;
          created_at: string;
          notes: string | null;
          status: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          goal_id: string;
          progress_value?: number;
          milestone_reached?: number;
          last_updated?: string;
          created_at?: string;
          notes?: string | null;
          status?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          goal_id?: string;
          progress_value?: number;
          milestone_reached?: number;
          last_updated?: string;
          created_at?: string;
          notes?: string | null;
          status?: string;
        };
      };
      lesson_goal_mapping: {
        Row: {
          id: string;
          lesson_id: string;
          goal_id: string;
          contribution_weight: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          goal_id: string;
          contribution_weight?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          lesson_id?: string;
          goal_id?: string;
          contribution_weight?: number;
          created_at?: string;
        };
      };
      practice_schedules: {
        Row: {
          id: string;
          user_id: string;
          day_of_week: number;
          start_time: string;
          duration_minutes: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          day_of_week: number;
          start_time: string;
          duration_minutes: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          day_of_week?: number;
          start_time?: string;
          duration_minutes?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      reminder_preferences: {
        Row: {
          user_id: string;
          reminder_enabled: boolean;
          reminder_before_minutes: number;
          notification_method: 'email' | 'push' | 'both';
          quiet_hours_start: string | null;
          quiet_hours_end: string | null;
          last_updated: string;
        };
        Insert: {
          user_id: string;
          reminder_enabled?: boolean;
          reminder_before_minutes?: number;
          notification_method?: 'email' | 'push' | 'both';
          quiet_hours_start?: string | null;
          quiet_hours_end?: string | null;
          last_updated?: string;
        };
        Update: {
          user_id?: string;
          reminder_enabled?: boolean;
          reminder_before_minutes?: number;
          notification_method?: 'email' | 'push' | 'both';
          quiet_hours_start?: string | null;
          quiet_hours_end?: string | null;
          last_updated?: string;
        };
      };
      reminder_history: {
        Row: {
          id: string;
          user_id: string;
          schedule_id: string | null;
          sent_at: string;
          type: 'scheduled' | 'missed_practice' | 'streak_at_risk';
          delivery_status: 'sent' | 'failed' | 'clicked';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          schedule_id?: string | null;
          sent_at?: string;
          type: 'scheduled' | 'missed_practice' | 'streak_at_risk';
          delivery_status: 'sent' | 'failed' | 'clicked';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          schedule_id?: string | null;
          sent_at?: string;
          type?: 'scheduled' | 'missed_practice' | 'streak_at_risk';
          delivery_status?: 'sent' | 'failed' | 'clicked';
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never
    };
    Functions: {
      [_ in never]: never
    };
    Enums: {
      [_ in never]: never
    };
    CompositeTypes: {
      [_ in never]: never
    };
  };
}
