-- create_booking_atomic is defined in 20260122000006_fix_create_booking_atomic_updated_at.sql.
-- This migration intentionally avoids duplicate DROP/CREATE/GRANT/COMMAND blocks: the Supabase CLI
-- must execute one SQL statement per protocol round-trip for remote push (see PG prepared statement limits).
SELECT 1;
