-- Waitlist system: auto-fill cancelled slots from waitlist entries

CREATE TABLE IF NOT EXISTS waitlist_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  preferred_date DATE NOT NULL,
  preferred_time_start TIME,
  preferred_time_end TIME,
  status TEXT NOT NULL DEFAULT 'waiting', -- 'waiting' | 'notified' | 'booked' | 'expired' | 'cancelled'
  notified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE waitlist_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view waitlist for their salon"
  ON waitlist_entries FOR SELECT
  USING (salon_id IN (SELECT salon_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert waitlist entries for their salon"
  ON waitlist_entries FOR INSERT
  WITH CHECK (salon_id IN (SELECT salon_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update waitlist entries for their salon"
  ON waitlist_entries FOR UPDATE
  USING (salon_id IN (SELECT salon_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete waitlist entries for their salon"
  ON waitlist_entries FOR DELETE
  USING (salon_id IN (SELECT salon_id FROM profiles WHERE user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_waitlist_entries_salon_id ON waitlist_entries(salon_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_entries_lookup ON waitlist_entries(salon_id, status, preferred_date, service_id);
