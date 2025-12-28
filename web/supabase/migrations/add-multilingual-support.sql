-- =====================================================
-- Add Multilingual Support to Salons and Profiles
-- =====================================================
-- This SQL script adds multilingual support fields:
-- 1. supported_languages array to salons table
-- 2. preferred_language to profiles table
--
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Add supported_languages to salons table
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'salons' AND column_name = 'supported_languages'
  ) THEN
    ALTER TABLE salons ADD COLUMN supported_languages TEXT[] DEFAULT ARRAY['en', 'nb']::TEXT[];
    
    -- Add comment to document the column
    COMMENT ON COLUMN salons.supported_languages IS 
      'Array of supported languages for this salon (matches AppLocale values: nb, en, ar, so, ti, am, tr, pl, vi, zh, tl, fa, dar, ur, hi). Used in public booking page.';
  END IF;
END $$;

-- Step 2: Add default_language to salons table (if not exists)
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'salons' AND column_name = 'default_language'
  ) THEN
    ALTER TABLE salons ADD COLUMN default_language TEXT DEFAULT 'en';
    
    -- Add comment to document the column
    COMMENT ON COLUMN salons.default_language IS 
      'Default language for public booking page. Falls back to preferred_language if not set.';
  END IF;
END $$;

-- Step 3: Add preferred_language to profiles table
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'preferred_language'
  ) THEN
    ALTER TABLE profiles ADD COLUMN preferred_language TEXT;
    
    -- Add comment to document the column
    COMMENT ON COLUMN profiles.preferred_language IS 
      'User-level preferred language for dashboard interface. Can differ from salon preferred_language.';
  END IF;
END $$;

-- Step 4: Update existing salons to have default supported_languages
-- =====================================================
-- Set supported_languages to [preferred_language, 'en'] if not already set
UPDATE salons
SET supported_languages = ARRAY[COALESCE(preferred_language, 'en'), 'en']::TEXT[]
WHERE supported_languages IS NULL OR array_length(supported_languages, 1) IS NULL;

-- Ensure 'en' is always included in supported_languages
UPDATE salons
SET supported_languages = array_append(
  array_remove(supported_languages, 'en'),
  'en'
)
WHERE NOT ('en' = ANY(supported_languages));

-- Step 5: Set default_language based on preferred_language if not set
-- =====================================================
UPDATE salons
SET default_language = COALESCE(preferred_language, 'en')
WHERE default_language IS NULL;

-- =====================================================
-- Verification
-- =====================================================
-- To verify the columns were added, run:
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name IN ('salons', 'profiles')
-- AND column_name IN ('supported_languages', 'default_language', 'preferred_language')
-- ORDER BY table_name, column_name;

