-- Explicit Data API privileges for tables that were created without GRANT in the
-- same migration chain (Supabase: new objects in public do not inherit API role
-- access after the 2026-10-30 policy for existing projects).
-- Idempotent: safe if tables are missing in older branches.

DO $grants$
BEGIN
  IF to_regclass('public.stripe_webhook_events') IS NOT NULL THEN
    REVOKE ALL ON TABLE public.stripe_webhook_events FROM PUBLIC;
    REVOKE ALL ON TABLE public.stripe_webhook_events FROM anon;
    REVOKE ALL ON TABLE public.stripe_webhook_events FROM authenticated;
    GRANT ALL ON TABLE public.stripe_webhook_events TO service_role;
  END IF;

  IF to_regclass('public.public_booking_action_proofs') IS NOT NULL THEN
    REVOKE ALL ON TABLE public.public_booking_action_proofs FROM PUBLIC;
    REVOKE ALL ON TABLE public.public_booking_action_proofs FROM anon;
    REVOKE ALL ON TABLE public.public_booking_action_proofs FROM authenticated;
    GRANT ALL ON TABLE public.public_booking_action_proofs TO service_role;
  END IF;

  IF to_regclass('public.public_booking_used_action_token_nonces') IS NOT NULL THEN
    REVOKE ALL ON TABLE public.public_booking_used_action_token_nonces FROM PUBLIC;
    REVOKE ALL ON TABLE public.public_booking_used_action_token_nonces FROM anon;
    REVOKE ALL ON TABLE public.public_booking_used_action_token_nonces FROM authenticated;
    GRANT ALL ON TABLE public.public_booking_used_action_token_nonces TO service_role;
  END IF;
END;
$grants$;
