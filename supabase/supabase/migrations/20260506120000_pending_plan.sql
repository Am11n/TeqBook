-- Scheduled subscription plan change for next billing boundary (see docs/ops/model-a-addon-scheduling.md).

ALTER TABLE public.salons
  ADD COLUMN IF NOT EXISTS pending_plan public.plan_type NULL;

COMMENT ON COLUMN public.salons.pending_plan IS
  'Target plan (starter|pro|business) to apply at next subscription period boundary without mid-cycle Stripe update; cleared after apply.';
