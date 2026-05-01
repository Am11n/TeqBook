-- Addon billing sync state (Stripe subscription.items vs DB-derived expected quantities)
-- See plan: billing add-ons fairness; product_access_state still derives from billing_inconsistent_reason.

CREATE TYPE public.addon_billing_sync_state AS ENUM (
  'synced',
  'syncing',
  'drift_detected',
  'failed'
);

ALTER TABLE public.salons
  ADD COLUMN IF NOT EXISTS addon_billing_sync_state public.addon_billing_sync_state NOT NULL DEFAULT 'synced'::public.addon_billing_sync_state;

ALTER TABLE public.salons
  ADD COLUMN IF NOT EXISTS addon_billing_sync_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.salons.addon_billing_sync_state IS
  'Lifecycle for addon line items vs DB usage: synced, syncing (in-flight), drift_detected, failed.';

COMMENT ON COLUMN public.salons.addon_billing_sync_snapshot IS
  'Diagnostics: expected vs Stripe addon qty, drift, retry_count, last_attempt_at, last_error_code.';

CREATE TABLE IF NOT EXISTS public.salon_billing_addon_projection (
  salon_id uuid PRIMARY KEY REFERENCES public.salons (id) ON DELETE CASCADE,
  expected_extra_staff integer NOT NULL DEFAULT 0,
  expected_extra_languages integer NOT NULL DEFAULT 0,
  stripe_extra_staff integer NOT NULL DEFAULT 0,
  stripe_extra_languages integer NOT NULL DEFAULT 0,
  drift boolean NOT NULL DEFAULT false,
  last_sync_attempt_at timestamptz,
  retry_count integer NOT NULL DEFAULT 0,
  last_error text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.salon_billing_addon_projection IS
  'Support/debug projection: last known expected vs Stripe addon quantities from sync/reconcile.';

REVOKE ALL ON TABLE public.salon_billing_addon_projection FROM PUBLIC;
REVOKE ALL ON TABLE public.salon_billing_addon_projection FROM authenticated;
GRANT ALL ON TABLE public.salon_billing_addon_projection TO service_role;
