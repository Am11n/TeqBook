-- Add business/booking policy fields to salons
ALTER TABLE salons ADD COLUMN IF NOT EXISTS business_address text;
ALTER TABLE salons ADD COLUMN IF NOT EXISTS org_number text;
ALTER TABLE salons ADD COLUMN IF NOT EXISTS cancellation_hours integer NOT NULL DEFAULT 24;
ALTER TABLE salons ADD COLUMN IF NOT EXISTS default_buffer_minutes integer NOT NULL DEFAULT 0;
