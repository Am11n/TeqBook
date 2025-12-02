-- =====================================================
-- Add user preferences to profiles table
-- =====================================================
-- This adds a JSONB column to store user preferences
-- including sidebar collapse state

-- Add user_preferences column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'user_preferences'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN user_preferences JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_user_preferences 
ON profiles USING GIN (user_preferences);

-- Example structure:
-- {
--   "sidebarCollapsed": false,
--   "theme": "light",
--   "notifications": { ... }
-- }

