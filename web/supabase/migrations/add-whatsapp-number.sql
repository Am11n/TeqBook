-- =====================================================
-- Add WhatsApp Number to Salons Table
-- =====================================================
-- This SQL script adds the whatsapp_number column to
-- the salons table for storing contact information
-- that will be displayed on the public booking page.
--
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Add whatsapp_number column to salons table
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'salons' AND column_name = 'whatsapp_number'
  ) THEN
    ALTER TABLE salons ADD COLUMN whatsapp_number TEXT;
    
    -- Add comment to document the column
    COMMENT ON COLUMN salons.whatsapp_number IS 
      'WhatsApp contact number for the salon. Should include country code. Displayed on public booking page.';
  END IF;
END $$;

-- =====================================================
-- Verification
-- =====================================================
-- To verify the column was added, run:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'salons' AND column_name = 'whatsapp_number';

