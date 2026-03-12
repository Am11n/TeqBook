-- =====================================================
-- Notification jobs and attempts model
-- =====================================================

CREATE TABLE IF NOT EXISTS notification_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('confirmation', 'reminder_24h', 'reminder_2h', 'cancellation')),
  delivery_status TEXT NOT NULL DEFAULT 'queued' CHECK (delivery_status IN ('queued', 'processing', 'sent', 'failed', 'dead_letter')),
  provider_used TEXT,
  dead_letter_reason TEXT,
  next_retry_at TIMESTAMPTZ,
  attempts_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_jobs_booking_event
  ON notification_jobs(booking_id, event_type);

CREATE INDEX IF NOT EXISTS idx_notification_jobs_delivery_status
  ON notification_jobs(delivery_status);

CREATE INDEX IF NOT EXISTS idx_notification_jobs_next_retry_at
  ON notification_jobs(next_retry_at)
  WHERE delivery_status IN ('queued', 'failed');

CREATE TABLE IF NOT EXISTS notification_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_job_id UUID NOT NULL REFERENCES notification_jobs(id) ON DELETE CASCADE,
  attempt_no INTEGER NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'in_app')),
  provider_used TEXT,
  result TEXT NOT NULL CHECK (result IN ('success', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_attempts_job
  ON notification_attempts(notification_job_id, attempt_no DESC);

CREATE OR REPLACE FUNCTION update_notification_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notification_jobs_updated_at ON notification_jobs;
CREATE TRIGGER trg_notification_jobs_updated_at
  BEFORE UPDATE ON notification_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_jobs_updated_at();

ALTER TABLE notification_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manage notification_jobs" ON notification_jobs;
CREATE POLICY "Service role manage notification_jobs"
  ON notification_jobs FOR ALL
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role manage notification_attempts" ON notification_attempts;
CREATE POLICY "Service role manage notification_attempts"
  ON notification_attempts FOR ALL
  USING (auth.role() = 'service_role');

