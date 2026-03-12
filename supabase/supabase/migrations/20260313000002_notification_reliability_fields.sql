-- =====================================================
-- Notification reliability extensions
-- =====================================================
-- Adds retry scheduling, dead-letter handling and provider tracing fields.

ALTER TABLE notification_events
  DROP CONSTRAINT IF EXISTS notification_events_status_check;

ALTER TABLE notification_events
  ADD CONSTRAINT notification_events_status_check
  CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'dead_letter'));

ALTER TABLE notification_events
  ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS dead_letter_reason TEXT,
  ADD COLUMN IF NOT EXISTS provider_used TEXT;

CREATE INDEX IF NOT EXISTS idx_notification_events_next_retry
  ON notification_events(next_retry_at)
  WHERE status IN ('pending', 'failed');

CREATE INDEX IF NOT EXISTS idx_notification_events_dead_letter
  ON notification_events(created_at DESC)
  WHERE status = 'dead_letter';

COMMENT ON COLUMN notification_events.next_retry_at IS 'When failed events should be retried next.';
COMMENT ON COLUMN notification_events.dead_letter_reason IS 'Reason event moved to dead-letter state.';
COMMENT ON COLUMN notification_events.provider_used IS 'Provider used for last send attempt (email/sms).';

