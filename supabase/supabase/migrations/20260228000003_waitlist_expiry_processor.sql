-- Automatic expiry processor for notified waitlist entries.

CREATE TABLE IF NOT EXISTS waitlist_lifecycle_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  waitlist_entry_id UUID NOT NULL REFERENCES waitlist_entries(id) ON DELETE CASCADE,
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  from_status TEXT NOT NULL,
  to_status TEXT NOT NULL,
  reason TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_waitlist_lifecycle_events_entry_id
  ON waitlist_lifecycle_events(waitlist_entry_id);

CREATE INDEX IF NOT EXISTS idx_waitlist_lifecycle_events_created_at
  ON waitlist_lifecycle_events(created_at DESC);

CREATE OR REPLACE FUNCTION expire_waitlist_entries(max_rows integer DEFAULT 200)
RETURNS TABLE (
  entry_id UUID,
  salon_id UUID,
  expired_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH candidates AS (
    SELECT w.id, w.salon_id, w.status
    FROM waitlist_entries w
    WHERE w.status = 'notified'
      AND w.expires_at IS NOT NULL
      AND w.expires_at < now()
    ORDER BY w.expires_at ASC
    LIMIT max_rows
    FOR UPDATE SKIP LOCKED
  ),
  updated AS (
    UPDATE waitlist_entries w
    SET status = 'expired'
    FROM candidates c
    WHERE w.id = c.id
    RETURNING w.id AS entry_id, w.salon_id, now() AS expired_at
  ),
  logged AS (
    INSERT INTO waitlist_lifecycle_events (
      waitlist_entry_id,
      salon_id,
      from_status,
      to_status,
      reason,
      metadata
    )
    SELECT
      c.id,
      c.salon_id,
      c.status,
      'expired',
      'expiry_job',
      jsonb_build_object('processor', 'expire_waitlist_entries')
    FROM candidates c
    RETURNING waitlist_entry_id
  )
  SELECT u.entry_id, u.salon_id, u.expired_at
  FROM updated u;
END;
$$;

GRANT EXECUTE ON FUNCTION expire_waitlist_entries(integer) TO service_role;
