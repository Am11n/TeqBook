-- Waitlist offers, cooldown lifecycle, and configurable policy defaults.

CREATE TABLE IF NOT EXISTS waitlist_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  claim_expiry_minutes INTEGER NOT NULL DEFAULT 15 CHECK (claim_expiry_minutes BETWEEN 5 AND 180),
  reminder_after_minutes INTEGER NOT NULL DEFAULT 10 CHECK (reminder_after_minutes BETWEEN 1 AND 120),
  cooldown_minutes INTEGER NOT NULL DEFAULT 60 CHECK (cooldown_minutes BETWEEN 5 AND 10080),
  passive_decline_threshold INTEGER NOT NULL DEFAULT 3 CHECK (passive_decline_threshold BETWEEN 1 AND 20),
  passive_cooldown_minutes INTEGER NOT NULL DEFAULT 10080 CHECK (passive_cooldown_minutes BETWEEN 30 AND 43200),
  auto_notify_on_reactivation BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT waitlist_policies_scope_check CHECK (
    (salon_id IS NULL AND service_id IS NULL)
    OR (salon_id IS NOT NULL AND service_id IS NULL)
    OR (salon_id IS NOT NULL AND service_id IS NOT NULL)
  ),
  UNIQUE (salon_id, service_id)
);

INSERT INTO waitlist_policies (
  salon_id,
  service_id,
  claim_expiry_minutes,
  reminder_after_minutes,
  cooldown_minutes,
  passive_decline_threshold,
  passive_cooldown_minutes,
  auto_notify_on_reactivation
)
VALUES (
  NULL,
  NULL,
  15,
  10,
  60,
  3,
  10080,
  true
)
ON CONFLICT (salon_id, service_id) DO NOTHING;

ALTER TABLE waitlist_entries
  ADD COLUMN IF NOT EXISTS preference_mode TEXT NOT NULL DEFAULT 'specific_time',
  ADD COLUMN IF NOT EXISTS flex_window_minutes INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS priority_score_snapshot INTEGER,
  ADD COLUMN IF NOT EXISTS cooldown_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cooldown_reason TEXT,
  ADD COLUMN IF NOT EXISTS decline_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL;

UPDATE waitlist_entries
SET preference_mode = CASE
  WHEN preferred_time_start IS NULL THEN 'day_flexible'
  ELSE 'specific_time'
END
WHERE preference_mode NOT IN ('specific_time', 'day_flexible');

ALTER TABLE waitlist_entries
  DROP CONSTRAINT IF EXISTS waitlist_entries_status_check,
  ADD CONSTRAINT waitlist_entries_status_check
  CHECK (status IN ('waiting', 'notified', 'booked', 'expired', 'cancelled', 'cooldown'));

ALTER TABLE waitlist_entries
  DROP CONSTRAINT IF EXISTS waitlist_entries_preference_mode_check,
  ADD CONSTRAINT waitlist_entries_preference_mode_check
  CHECK (preference_mode IN ('specific_time', 'day_flexible'));

ALTER TABLE waitlist_entries
  DROP CONSTRAINT IF EXISTS waitlist_entries_flex_window_minutes_check,
  ADD CONSTRAINT waitlist_entries_flex_window_minutes_check
  CHECK (flex_window_minutes >= 0 AND flex_window_minutes <= 2880);

CREATE INDEX IF NOT EXISTS idx_waitlist_entries_cooldown_until
  ON waitlist_entries (status, cooldown_until)
  WHERE status = 'cooldown';

CREATE INDEX IF NOT EXISTS idx_waitlist_entries_priority
  ON waitlist_entries (salon_id, service_id, preferred_date, status, priority_score_snapshot, created_at);

CREATE OR REPLACE FUNCTION resolve_waitlist_policy(
  p_salon_id UUID,
  p_service_id UUID
)
RETURNS TABLE (
  claim_expiry_minutes INTEGER,
  reminder_after_minutes INTEGER,
  cooldown_minutes INTEGER,
  passive_decline_threshold INTEGER,
  passive_cooldown_minutes INTEGER,
  auto_notify_on_reactivation BOOLEAN
)
LANGUAGE sql
STABLE
AS $wl_rp$
  SELECT
    w.claim_expiry_minutes,
    w.reminder_after_minutes,
    w.cooldown_minutes,
    w.passive_decline_threshold,
    w.passive_cooldown_minutes,
    w.auto_notify_on_reactivation
  FROM waitlist_policies w
  WHERE
    (w.salon_id IS NULL AND w.service_id IS NULL)
    OR (w.salon_id = p_salon_id AND w.service_id IS NULL)
    OR (w.salon_id = p_salon_id AND w.service_id = p_service_id)
  ORDER BY
    CASE WHEN w.salon_id IS NULL THEN 0 ELSE 1 END DESC,
    CASE WHEN w.service_id IS NULL THEN 0 ELSE 1 END DESC
  LIMIT 1;
$wl_rp$;

CREATE OR REPLACE FUNCTION set_waitlist_lifecycle_fields()
RETURNS trigger
LANGUAGE plpgsql
AS $wl_tr$
DECLARE
  policy_claim_expiry_minutes INTEGER;
BEGIN
  SELECT p.claim_expiry_minutes
  INTO policy_claim_expiry_minutes
  FROM resolve_waitlist_policy(NEW.salon_id, NEW.service_id) p;

  policy_claim_expiry_minutes := COALESCE(policy_claim_expiry_minutes, 15);

  IF NEW.status = 'notified' THEN
    NEW.notified_at := COALESCE(NEW.notified_at, now());
    NEW.expires_at := COALESCE(
      NEW.expires_at,
      NEW.notified_at + make_interval(mins => policy_claim_expiry_minutes)
    );
    NEW.cooldown_until := NULL;
    NEW.cooldown_reason := NULL;
  ELSIF NEW.status = 'waiting' THEN
    NEW.notified_at := NULL;
    NEW.expires_at := NULL;
    NEW.cooldown_until := NULL;
    NEW.cooldown_reason := NULL;
  ELSIF NEW.status = 'cooldown' THEN
    NEW.notified_at := NULL;
    NEW.expires_at := NULL;
  END IF;

  RETURN NEW;
END;
$wl_tr$;

CREATE TABLE IF NOT EXISTS waitlist_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  waitlist_entry_id UUID NOT NULL REFERENCES waitlist_entries(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  slot_date DATE NOT NULL,
  slot_start TIMESTAMPTZ NOT NULL,
  slot_end TIMESTAMPTZ,
  token_hash TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  attempt_no INTEGER NOT NULL DEFAULT 1,
  reminder_sent_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  token_expires_at TIMESTAMPTZ NOT NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  response_channel TEXT,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT waitlist_offers_status_check
    CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'cancelled', 'notification_failed')),
  CONSTRAINT waitlist_offers_channel_check
    CHECK (response_channel IS NULL OR response_channel IN ('sms_link', 'email_link', 'dashboard', 'system'))
);

CREATE INDEX IF NOT EXISTS idx_waitlist_offers_slot_status
  ON waitlist_offers (salon_id, slot_start, status);

CREATE UNIQUE INDEX IF NOT EXISTS idx_waitlist_one_active_offer_per_slot
  ON waitlist_offers (salon_id, employee_id, slot_start)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_waitlist_offers_entry_status
  ON waitlist_offers (waitlist_entry_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_waitlist_offers_pending_expiry
  ON waitlist_offers (status, token_expires_at)
  WHERE status = 'pending';

GRANT EXECUTE ON FUNCTION resolve_waitlist_policy(UUID, UUID) TO authenticated, service_role;
