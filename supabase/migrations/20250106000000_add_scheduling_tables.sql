-- Create practice schedules table
CREATE TABLE practice_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0-6 (Sunday-Saturday)
    start_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reminder preferences table
CREATE TABLE reminder_preferences (
    user_id UUID REFERENCES auth.users PRIMARY KEY,
    reminder_enabled BOOLEAN DEFAULT true,
    reminder_before_minutes INTEGER DEFAULT 15 CHECK (reminder_before_minutes > 0),
    notification_method TEXT DEFAULT 'email' CHECK (notification_method IN ('email', 'push', 'both')),
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reminder history table
CREATE TABLE reminder_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users NOT NULL,
    schedule_id UUID REFERENCES practice_schedules,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    type TEXT NOT NULL CHECK (type IN ('scheduled', 'missed_practice', 'streak_at_risk')),
    delivery_status TEXT NOT NULL CHECK (delivery_status IN ('sent', 'failed', 'clicked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE practice_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_history ENABLE ROW LEVEL SECURITY;

-- Practice schedules policies
CREATE POLICY "Users can view their own schedules"
    ON practice_schedules
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own schedules"
    ON practice_schedules
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own schedules"
    ON practice_schedules
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own schedules"
    ON practice_schedules
    FOR DELETE
    USING (auth.uid() = user_id);

-- Reminder preferences policies
CREATE POLICY "Users can view their own reminder preferences"
    ON reminder_preferences
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reminder preferences"
    ON reminder_preferences
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminder preferences"
    ON reminder_preferences
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Reminder history policies
CREATE POLICY "Users can view their own reminder history"
    ON reminder_history
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for practice_schedules
CREATE TRIGGER update_practice_schedules_updated_at
    BEFORE UPDATE ON practice_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for better query performance
CREATE INDEX idx_practice_schedules_user_id ON practice_schedules(user_id);
CREATE INDEX idx_practice_schedules_day_of_week ON practice_schedules(day_of_week);
CREATE INDEX idx_reminder_history_user_id ON reminder_history(user_id);
CREATE INDEX idx_reminder_history_schedule_id ON reminder_history(schedule_id);
