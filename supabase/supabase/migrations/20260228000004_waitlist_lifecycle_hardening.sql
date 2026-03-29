-- Harden waitlist lifecycle semantics and make expiry processing efficient.

-- Backfill invalid or partial data before adding stricter constraints.
UPDATE waitlist_entries
SET status = 'waiting'
WHERE status NOT IN ('waiting', 'notified', 'booked', 'expired', 'cancelled');

UPDATE waitlist_entries
SET notified_at = COALESCE(notified_at, now()),
    expires_at = COALESCE(expires_at, COALESCE(notified_at, now()) + INTERVAL '2 hours')
WHERE status = 'notified';

-- Keep lifecycle timestamps consistent whenever status changes.
CREATE OR REPLACE FUNCTION set_waitlist_lifecycle_fields()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  expiry_hours integer;
BEGIN
  expiry_hours := COALESCE(NULLIF(current_setting('app.waitlist_notify_expiry_hours', true), '')::integer, 2);

  IF NEW.status = 'notified' THEN
    NEW.notified_at := COALESCE(NEW.notified_at, now());
    NEW.expires_at := COALESCE(NEW.expires_at, NEW.notified_at + make_interval(hours => expiry_hours));
  ELSIF NEW.status IN ('waiting', 'booked', 'expired', 'cancelled') THEN
    IF NEW.status = 'waiting' THEN
      NEW.notified_at := NULL;
      NEW.expires_at := NULL;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_waitlist_set_lifecycle_fields ON waitlist_entries;
CREATE TRIGGER trg_waitlist_set_lifecycle_fields
BEFORE INSERT OR UPDATE OF status, notified_at, expires_at
ON waitlist_entries
FOR EACH ROW
EXECUTE FUNCTION set_waitlist_lifecycle_fields();

ALTER TABLE waitlist_entries
  DROP CONSTRAINT IF EXISTS waitlist_entries_status_check,
  ADD CONSTRAINT waitlist_entries_status_check
  CHECK (status IN ('waiting', 'notified', 'booked', 'expired', 'cancelled'));

CREATE INDEX IF NOT EXISTS idx_waitlist_entries_status_expires_at
  ON waitlist_entries (status, expires_at)
  WHERE status = 'notified';
