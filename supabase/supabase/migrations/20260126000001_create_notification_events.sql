-- =====================================================
-- Create Notification Events Table
-- =====================================================
-- Task: Fase A - Produksjonsstabilitet
-- Purpose: Idempotency for notification sending to prevent duplicate emails
-- Prevents double-sending when endpoint is called multiple times for same booking

-- Create notification_events table
CREATE TABLE IF NOT EXISTS notification_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('confirmation', 'reminder_24h', 'reminder_2h', 'cancellation')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint: one event per booking per type (idempotency key)
  CONSTRAINT notification_events_booking_type_unique UNIQUE (booking_id, event_type)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notification_events_booking_id 
  ON notification_events(booking_id);

CREATE INDEX IF NOT EXISTS idx_notification_events_status 
  ON notification_events(status) 
  WHERE status IN ('pending', 'processing');

CREATE INDEX IF NOT EXISTS idx_notification_events_created 
  ON notification_events(created_at DESC);

-- RLS Policies
ALTER TABLE notification_events ENABLE ROW LEVEL SECURITY;

-- Service role can manage all notification events (for edge functions/workers)
CREATE POLICY "Service role can manage notification events"
  ON notification_events FOR ALL
  USING (auth.role() = 'service_role');

-- Authenticated users can view notification events for their salon bookings
CREATE POLICY "Users can view notification events for their salon bookings"
  ON notification_events FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM bookings
      WHERE salon_id IN (
        SELECT salon_id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notification_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_notification_events_updated_at
  BEFORE UPDATE ON notification_events
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_events_updated_at();

-- Comments
COMMENT ON TABLE notification_events IS 'Idempotency tracking for notification sending. Prevents duplicate emails when endpoint is called multiple times.';
COMMENT ON COLUMN notification_events.booking_id IS 'The booking this notification is for';
COMMENT ON COLUMN notification_events.event_type IS 'Type of notification: confirmation, reminder_24h, reminder_2h, cancellation';
COMMENT ON COLUMN notification_events.status IS 'Current status: pending (queued), processing (being sent), sent (success), failed';
COMMENT ON COLUMN notification_events.attempts IS 'Number of send attempts made';
COMMENT ON COLUMN notification_events.last_error IS 'Last error message if status is failed';
COMMENT ON CONSTRAINT notification_events_booking_type_unique ON notification_events IS 'Ensures idempotency: only one event per booking per type';
