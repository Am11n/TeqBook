-- Enable RLS for stripe webhook idempotency ledger.
-- Fixes Supabase security check: rls_disabled_in_public.

ALTER TABLE IF EXISTS public.stripe_webhook_events
  ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'stripe_webhook_events'
      AND policyname = 'Service role manage stripe_webhook_events'
  ) THEN
    CREATE POLICY "Service role manage stripe_webhook_events"
      ON public.stripe_webhook_events
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

