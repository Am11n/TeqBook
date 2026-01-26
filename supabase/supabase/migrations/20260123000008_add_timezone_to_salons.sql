-- =====================================================
-- Add Timezone Support to Salons
-- =====================================================
-- Adds timezone field to salons table so each salon can
-- have its own timezone setting for displaying times
-- =====================================================

-- Add timezone column to salons table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'salons' AND column_name = 'timezone'
  ) THEN
    ALTER TABLE salons ADD COLUMN timezone TEXT DEFAULT 'UTC';
    
    -- Add comment to document the column
    COMMENT ON COLUMN salons.timezone IS 
      'IANA timezone identifier (e.g., "Europe/Oslo", "America/New_York"). All times displayed in the salon will use this timezone.';
  END IF;
END $$;

-- Update existing salons to use UTC as default (they can change it in settings)
UPDATE salons SET timezone = 'UTC' WHERE timezone IS NULL;

-- Add constraint to ensure timezone is not null
ALTER TABLE salons ALTER COLUMN timezone SET NOT NULL;
ALTER TABLE salons ALTER COLUMN timezone SET DEFAULT 'UTC';
