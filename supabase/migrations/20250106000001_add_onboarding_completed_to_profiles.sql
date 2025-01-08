-- Add onboarding_completed column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Set existing profiles to have completed onboarding
UPDATE profiles
SET onboarding_completed = true
WHERE onboarding_completed IS NULL;

-- Add NOT NULL constraint after setting default values
ALTER TABLE profiles
ALTER COLUMN onboarding_completed SET NOT NULL;
