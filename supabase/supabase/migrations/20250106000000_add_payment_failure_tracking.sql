-- =====================================================
-- Add Payment Failure Tracking to Salons Table
-- =====================================================
-- This migration adds fields to track payment failures,
-- retry attempts, and grace period for access restriction

-- Add payment_failure_count
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'salons' AND column_name = 'payment_failure_count'
  ) THEN
    ALTER TABLE salons ADD COLUMN payment_failure_count INTEGER DEFAULT 0;
    
    COMMENT ON COLUMN salons.payment_failure_count IS
      'Number of consecutive payment failures. Reset to 0 when payment succeeds.';
  END IF;
END $$;

-- Add payment_failed_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'salons' AND column_name = 'payment_failed_at'
  ) THEN
    ALTER TABLE salons ADD COLUMN payment_failed_at TIMESTAMPTZ;
    
    COMMENT ON COLUMN salons.payment_failed_at IS
      'Timestamp of the first payment failure. Used to calculate grace period.';
  END IF;
END $$;

-- Add last_payment_retry_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'salons' AND column_name = 'last_payment_retry_at'
  ) THEN
    ALTER TABLE salons ADD COLUMN last_payment_retry_at TIMESTAMPTZ;
    
    COMMENT ON COLUMN salons.last_payment_retry_at IS
      'Timestamp of the last payment retry attempt.';
  END IF;
END $$;

-- Add payment_status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'salons' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE salons ADD COLUMN payment_status TEXT DEFAULT 'active';
    
    COMMENT ON COLUMN salons.payment_status IS
      'Payment status: active, failed, grace_period, restricted';
  END IF;
END $$;

-- Create index for payment status queries
CREATE INDEX IF NOT EXISTS idx_salons_payment_status 
  ON salons(payment_status) 
  WHERE payment_status != 'active';

CREATE INDEX IF NOT EXISTS idx_salons_payment_failed_at 
  ON salons(payment_failed_at) 
  WHERE payment_failed_at IS NOT NULL;
