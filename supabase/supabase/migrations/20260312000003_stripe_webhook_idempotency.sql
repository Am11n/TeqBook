-- Stripe webhook idempotency ledger.
-- Ensures duplicate event deliveries do not re-apply side effects.

CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processing_status TEXT NOT NULL DEFAULT 'processing',
  error_message TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

ALTER TABLE stripe_webhook_events
  ADD CONSTRAINT stripe_webhook_events_processing_status_check
  CHECK (processing_status IN ('processing', 'processed', 'failed'));

CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_received_at
  ON stripe_webhook_events(received_at DESC);

CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_processing_status
  ON stripe_webhook_events(processing_status);

