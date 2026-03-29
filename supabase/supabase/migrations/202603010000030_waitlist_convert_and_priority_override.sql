-- Waitlist dashboard conversion + manual priority override support.

ALTER TABLE waitlist_entries
  ADD COLUMN IF NOT EXISTS priority_override_score INTEGER,
  ADD COLUMN IF NOT EXISTS priority_override_reason TEXT,
  ADD COLUMN IF NOT EXISTS priority_overridden_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS priority_overridden_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_waitlist_entries_priority_override
  ON waitlist_entries (salon_id, service_id, preferred_date, status, priority_override_score)
  WHERE priority_override_score IS NOT NULL;
