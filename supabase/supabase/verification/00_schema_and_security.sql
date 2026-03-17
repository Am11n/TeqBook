-- WS4 verification: schema, core functions, and RLS policy presence.
-- Fails hard via exception if required objects are missing.

DO $$
DECLARE
  missing_count INTEGER := 0;
BEGIN
  -- Core tables
  IF to_regclass('public.salons') IS NULL THEN
    RAISE NOTICE 'Missing table: salons';
    missing_count := missing_count + 1;
  END IF;
  IF to_regclass('public.profiles') IS NULL THEN
    RAISE NOTICE 'Missing table: profiles';
    missing_count := missing_count + 1;
  END IF;
  IF to_regclass('public.bookings') IS NULL THEN
    RAISE NOTICE 'Missing table: bookings';
    missing_count := missing_count + 1;
  END IF;
  IF to_regclass('public.services') IS NULL THEN
    RAISE NOTICE 'Missing table: services';
    missing_count := missing_count + 1;
  END IF;
  IF to_regclass('public.employees') IS NULL THEN
    RAISE NOTICE 'Missing table: employees';
    missing_count := missing_count + 1;
  END IF;
  IF to_regclass('public.customers') IS NULL THEN
    RAISE NOTICE 'Missing table: customers';
    missing_count := missing_count + 1;
  END IF;
  IF to_regclass('public.opening_hours') IS NULL THEN
    RAISE NOTICE 'Missing table: opening_hours';
    missing_count := missing_count + 1;
  END IF;
  IF to_regclass('public.shifts') IS NULL THEN
    RAISE NOTICE 'Missing table: shifts';
    missing_count := missing_count + 1;
  END IF;

  -- RLS should be enabled on tenant tables
  IF NOT EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'bookings'
      AND c.relrowsecurity = TRUE
  ) THEN
    RAISE NOTICE 'RLS not enabled on bookings';
    missing_count := missing_count + 1;
  END IF;

  -- At least one policy on key tenant tables
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'bookings'
  ) THEN
    RAISE NOTICE 'No RLS policies found for bookings';
    missing_count := missing_count + 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'customers'
  ) THEN
    RAISE NOTICE 'No RLS policies found for customers';
    missing_count := missing_count + 1;
  END IF;

  -- Core booking function(s) must exist (accept either legacy or newer naming)
  IF NOT EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN ('create_booking_atomic', 'create_booking_with_validation')
  ) THEN
    RAISE NOTICE 'Missing core create booking function';
    missing_count := missing_count + 1;
  END IF;

  IF missing_count > 0 THEN
    RAISE EXCEPTION 'Schema/security verification failed. Missing checks: %', missing_count;
  END IF;
END $$;

SELECT 'schema_and_security_ok' AS verification_result;

