-- =====================================================
-- Add first_name, last_name, avatar_url to profiles table
-- =====================================================
-- This migration adds personal information fields to the profiles table
-- to support the My Profile page functionality

-- Add columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add comments for documentation
COMMENT ON COLUMN profiles.first_name IS 'User first name';
COMMENT ON COLUMN profiles.last_name IS 'User last name';
COMMENT ON COLUMN profiles.avatar_url IS 'URL to user avatar image';

