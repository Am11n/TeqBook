-- Prevent overlapping waitlist lifecycle processors across distributed runners.
-- Uses transaction-level advisory locks.

CREATE OR REPLACE FUNCTION acquire_waitlist_lifecycle_lock()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT pg_try_advisory_lock(9223372000001);
$$;

CREATE OR REPLACE FUNCTION release_waitlist_lifecycle_lock()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT pg_advisory_unlock(9223372000001);
$$;

REVOKE ALL ON FUNCTION acquire_waitlist_lifecycle_lock() FROM PUBLIC;
REVOKE ALL ON FUNCTION release_waitlist_lifecycle_lock() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION acquire_waitlist_lifecycle_lock() TO service_role;
GRANT EXECUTE ON FUNCTION release_waitlist_lifecycle_lock() TO service_role;

