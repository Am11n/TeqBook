-- =====================================================
-- Add Locking Fields to Reminders Table
-- =====================================================
-- Task: Fase A - Produksjonsstabilitet
-- Purpose: Add locking fields for concurrent processing with idempotency
-- Prevents double-sending when multiple cron jobs run simultaneously

-- Add attempts column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reminders' AND column_name = 'attempts'
  ) THEN
    ALTER TABLE reminders ADD COLUMN attempts INTEGER NOT NULL DEFAULT 0;
    COMMENT ON COLUMN reminders.attempts IS 'Number of send attempts made (for retry logic)';
  END IF;
END $$;

-- Add next_attempt_at column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reminders' AND column_name = 'next_attempt_at'
  ) THEN
    ALTER TABLE reminders ADD COLUMN next_attempt_at TIMESTAMPTZ;
    COMMENT ON COLUMN reminders.next_attempt_at IS 'When to retry if status is failed (backoff timing)';
  END IF;
END $$;

-- Add last_error column (if not exists, error_message might already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reminders' AND column_name = 'last_error'
  ) THEN
    ALTER TABLE reminders ADD COLUMN last_error TEXT;
    COMMENT ON COLUMN reminders.last_error IS 'Last error message if status is failed';
  END IF;
END $$;

-- Add locked_at column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reminders' AND column_name = 'locked_at'
  ) THEN
    ALTER TABLE reminders ADD COLUMN locked_at TIMESTAMPTZ;
    COMMENT ON COLUMN reminders.locked_at IS 'Timestamp when reminder was locked for processing (prevents concurrent processing)';
  END IF;
END $$;

-- Add locked_by column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reminders' AND column_name = 'locked_by'
  ) THEN
    ALTER TABLE reminders ADD COLUMN locked_by TEXT;
    COMMENT ON COLUMN reminders.locked_by IS 'Identifier of process/function that locked this reminder (e.g., edge function instance ID)';
  END IF;
END $$;

-- Update status check constraint to include 'sending' status
DO $$
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'reminders' 
      AND constraint_name LIKE '%status%check%'
  ) THEN
    ALTER TABLE reminders DROP CONSTRAINT IF EXISTS reminders_status_check;
  END IF;
  
  -- Add new constraint with 'sending' status
  ALTER TABLE reminders ADD CONSTRAINT reminders_status_check 
    CHECK (status IN ('pending', 'sending', 'sent', 'failed', 'cancelled'));
END $$;

-- Create index for locking queries (pending reminders that are not locked)
-- Note: We check for expired locks in the query itself, not in the index predicate
-- because NOW() is not IMMUTABLE and cannot be used in index predicates
CREATE INDEX IF NOT EXISTS idx_reminders_pending_unlocked 
  ON reminders(status, scheduled_at) 
  WHERE status = 'pending' 
    AND locked_at IS NULL;

-- Update comment on status column
COMMENT ON COLUMN reminders.status IS 'Reminder status: pending, sending (being processed), sent, failed, cancelled';
