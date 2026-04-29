-- Hashed email OTP for issuing public booking action tokens (notify / cancel / confirmation mint).
-- Access only via Supabase service role (admin client); no RLS policies for anon/authenticated.

CREATE TABLE IF NOT EXISTS public.public_booking_action_proofs (
  booking_id uuid PRIMARY KEY REFERENCES public.bookings (id) ON DELETE CASCADE,
  code_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  failed_attempts smallint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS public_booking_action_proofs_expires_at_idx
  ON public.public_booking_action_proofs (expires_at);

ALTER TABLE public.public_booking_action_proofs ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.public_booking_action_proofs IS
  'Stores SHA-256 hashes of short-lived email OTPs for public booking action-token issuance; service_role only.';
