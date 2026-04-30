-- Prevent replay of high-risk public action tokens (cancel purpose).
-- Only service role should write/check this table through API routes.

CREATE TABLE IF NOT EXISTS public.public_booking_used_action_token_nonces (
  booking_id uuid NOT NULL REFERENCES public.bookings (id) ON DELETE CASCADE,
  purpose text NOT NULL,
  token_nonce uuid NOT NULL,
  used_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (booking_id, purpose, token_nonce)
);

CREATE INDEX IF NOT EXISTS public_booking_used_action_token_nonces_used_at_idx
  ON public.public_booking_used_action_token_nonces (used_at);

ALTER TABLE public.public_booking_used_action_token_nonces ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.public_booking_used_action_token_nonces IS
  'Consumed public action token nonces to prevent replay attacks for sensitive booking operations.';
