-- Model A: schedule extra staff/language add-on units for next billing boundary (see docs/ops/model-a-addon-scheduling.md).

ALTER TABLE public.salons
  ADD COLUMN IF NOT EXISTS pending_extra_staff integer NOT NULL DEFAULT 0;

ALTER TABLE public.salons
  ADD COLUMN IF NOT EXISTS pending_extra_languages integer NOT NULL DEFAULT 0;

ALTER TABLE public.salons
  ADD COLUMN IF NOT EXISTS billing_subscription_period_start bigint NULL;

COMMENT ON COLUMN public.salons.pending_extra_staff IS
  'Extra staff add-on units to merge into Stripe at next period boundary (Model A); not billed until applied.';

COMMENT ON COLUMN public.salons.pending_extra_languages IS
  'Extra language add-on units to merge into Stripe at next period boundary (Model A); not billed until applied.';

COMMENT ON COLUMN public.salons.billing_subscription_period_start IS
  'Last known Stripe subscription.current_period_start (unix seconds); rollover detection for pending add-on apply.';
