-- WS4 verification: booking integrity controls and overlap protection

DO $$
DECLARE
  issue_count INTEGER := 0;
BEGIN
  -- Exclusion / overlap safety: require at least one exclusion constraint on bookings
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'bookings'
      AND c.contype = 'x'
  ) THEN
    RAISE NOTICE 'No exclusion constraint found on bookings';
    issue_count := issue_count + 1;
  END IF;

  -- Expected status column and basic check for booking lifecycle
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'status'
  ) THEN
    RAISE NOTICE 'Missing bookings.status column';
    issue_count := issue_count + 1;
  END IF;

  -- Ensure start/end timestamps exist
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'start_time'
  ) OR NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'end_time'
  ) THEN
    RAISE NOTICE 'Missing bookings.start_time or bookings.end_time';
    issue_count := issue_count + 1;
  END IF;

  -- Availability function should exist under at least one known name
  IF NOT EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN ('generate_availability', 'find_first_available_slots_batch')
  ) THEN
    RAISE NOTICE 'Missing availability function';
    issue_count := issue_count + 1;
  END IF;

  IF issue_count > 0 THEN
    RAISE EXCEPTION 'Booking integrity verification failed. Issues: %', issue_count;
  END IF;
END $$;

SELECT 'booking_integrity_ok' AS verification_result;

