-- Create reminders table for booking reminder scheduling
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('24h', '2h')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reminders_booking_id ON reminders (booking_id);
CREATE INDEX IF NOT EXISTS idx_reminders_scheduled_at ON reminders (scheduled_at);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders (status);
CREATE INDEX IF NOT EXISTS idx_reminders_status_scheduled ON reminders (status, scheduled_at) WHERE status = 'pending';

-- RLS Policies
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view reminders for bookings in their salon
CREATE POLICY "Users can view reminders for their salon bookings"
  ON reminders FOR SELECT
  USING (
    booking_id IN (
      SELECT bookings.id FROM public.bookings
      WHERE bookings.salon_id IN (
        SELECT profiles.salon_id FROM public.profiles WHERE profiles.user_id = auth.uid()
      )
    )
  );

-- Policy: Service role can manage reminders (e.g., from Edge Functions)
CREATE POLICY "Service role can manage reminders"
  ON reminders FOR ALL
  USING (auth.role() = 'service_role');

-- Policy: Authenticated users can insert reminders (e.g., from services)
CREATE POLICY "Authenticated users can insert reminders"
  ON reminders FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Users can update reminders for their salon bookings
CREATE POLICY "Users can update reminders for their salon bookings"
  ON reminders FOR UPDATE
  USING (
    booking_id IN (
      SELECT bookings.id FROM public.bookings
      WHERE bookings.salon_id IN (
        SELECT profiles.salon_id FROM public.profiles WHERE profiles.user_id = auth.uid()
      )
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_reminders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_reminders_updated_at
  BEFORE UPDATE ON reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_reminders_updated_at();

COMMENT ON TABLE reminders IS 'Scheduled reminders for bookings (24h and 2h before appointment)';
COMMENT ON COLUMN reminders.reminder_type IS 'Type of reminder: 24h (24 hours before) or 2h (2 hours before)';
COMMENT ON COLUMN reminders.status IS 'Reminder status: pending, sent, failed, cancelled';
COMMENT ON COLUMN reminders.scheduled_at IS 'When the reminder should be sent (in UTC)';

