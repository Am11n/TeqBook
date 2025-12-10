-- =====================================================
-- Add Branding Theme to Salons Table
-- =====================================================
-- This SQL script adds the theme JSONB column to the salons table
-- for storing custom branding information (colors, fonts, logo, etc.)
--
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Add theme column to salons table
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'salons' AND column_name = 'theme'
  ) THEN
    ALTER TABLE salons ADD COLUMN theme JSONB DEFAULT '{}'::jsonb;
    
    -- Add comment to document the column
    COMMENT ON COLUMN salons.theme IS 
      'Custom branding theme for the salon. JSON structure: {
        "primary": "#hex-color",
        "secondary": "#hex-color",
        "font": "font-family-name",
        "logo_url": "https://...",
        "presets": ["preset-name"]
      }';
  END IF;
END $$;

-- Step 2: Add GIN index for faster JSONB queries
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_salons_theme 
ON salons USING GIN (theme);

-- =====================================================
-- Verification
-- =====================================================
-- To verify the column was added, run:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'salons' AND column_name = 'theme';

-- Example usage:
-- UPDATE salons 
-- SET theme = '{
--   "primary": "#3b82f6",
--   "secondary": "#8b5cf6",
--   "font": "Inter",
--   "logo_url": "https://example.com/logo.png"
-- }'::jsonb
-- WHERE id = 'your-salon-id';

