-- Add time_format column to salons table
-- Allows salon owners to choose between 24-hour and 12-hour (AM/PM) time display
ALTER TABLE salons ADD COLUMN IF NOT EXISTS time_format text DEFAULT '24h'
  CHECK (time_format IN ('24h', '12h'));
