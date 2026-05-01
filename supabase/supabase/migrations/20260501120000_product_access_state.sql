-- =====================================================
-- Product access state (single writer: recompute_product_access_state)
-- =====================================================
-- Stripe/webhooks update projection columns only; this function derives
-- product_access_state. See docs/ops/product-access-state-machine.md

CREATE TYPE public.product_access_state AS ENUM (
  'legacy_exempt',
  'trial',
  'active',
  'grace',
  'suspended',
  'expired',
  'inconsistent_billing'
);

ALTER TABLE public.salons
  ADD COLUMN IF NOT EXISTS billing_inconsistent_reason text;

COMMENT ON COLUMN public.salons.billing_inconsistent_reason IS
  'Non-empty means projection/Stripe mismatch or binding error; clears on successful sync. Drives inconsistent_billing in recompute.';

ALTER TABLE public.salons
  ADD COLUMN IF NOT EXISTS product_access_state public.product_access_state;

ALTER TABLE public.salons
  ADD COLUMN IF NOT EXISTS product_access_state_updated_at timestamptz;

COMMENT ON COLUMN public.salons.product_access_state IS
  'Derived access state; ONLY recompute_product_access_state may change this column (see trigger).';

COMMENT ON COLUMN public.salons.product_access_state_updated_at IS
  'Last time recompute_product_access_state wrote product_access_state.';

-- ─── Single writer: recompute ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.recompute_product_access_state(p_salon_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  s RECORD;
  v_state public.product_access_state;
  v_grace constant interval := interval '7 days';
  v_stale constant interval := interval '72 hours';
BEGIN
  PERFORM set_config('teqbook.recompute_access_state', '1', true);

  SELECT s0.trial_end,
         s0.billing_subscription_id,
         s0.current_period_end,
         s0.payment_status,
         s0.payment_failed_at,
         s0.billing_inconsistent_reason
    INTO s
    FROM public.salons s0
   WHERE s0.id = p_salon_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF s.billing_inconsistent_reason IS NOT NULL AND btrim(s.billing_inconsistent_reason) <> '' THEN
    v_state := 'inconsistent_billing';
  ELSIF s.trial_end IS NULL THEN
    v_state := 'legacy_exempt';
  ELSIF now() < s.trial_end THEN
    v_state := 'trial';
  ELSIF s.billing_subscription_id IS NULL THEN
    v_state := 'expired';
  ELSIF s.payment_status IN ('requires_action', 'restricted') THEN
    v_state := 'suspended';
  ELSIF btrim(COALESCE(s.payment_status, '')) = 'incomplete' THEN
    v_state := 'suspended';
  ELSIF s.payment_status IN ('failed', 'grace_period') THEN
    IF s.payment_failed_at IS NOT NULL AND (now() - s.payment_failed_at) >= v_grace THEN
      v_state := 'suspended';
    ELSE
      v_state := 'grace';
    END IF;
  ELSIF s.payment_status IS NULL OR btrim(COALESCE(s.payment_status, '')) = '' OR s.payment_status = 'active' THEN
    IF s.billing_subscription_id IS NOT NULL
       AND s.current_period_end IS NOT NULL
       AND now() > s.current_period_end + v_stale
    THEN
      v_state := 'suspended';
    ELSE
      v_state := 'active';
    END IF;
  ELSE
    v_state := 'suspended';
  END IF;

  UPDATE public.salons
     SET product_access_state = v_state,
         product_access_state_updated_at = now()
   WHERE id = p_salon_id
     AND (
       product_access_state IS DISTINCT FROM v_state
       OR product_access_state_updated_at IS NULL
     );
END;
$$;

COMMENT ON FUNCTION public.recompute_product_access_state(uuid) IS
  'Derives and writes salons.product_access_state from projection + trial_end. Only entry point allowed to change product_access_state.';

REVOKE ALL ON FUNCTION public.recompute_product_access_state(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.recompute_product_access_state(uuid) TO service_role;

-- ─── Block direct writes to product_access_state ────────────────────────
CREATE OR REPLACE FUNCTION public.enforce_salon_product_access_state_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.product_access_state IS DISTINCT FROM OLD.product_access_state THEN
    IF current_setting('teqbook.recompute_access_state', true) IS DISTINCT FROM '1' THEN
      RAISE EXCEPTION 'product_access_state may only be updated via recompute_product_access_state';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_salon_product_access_state_column ON public.salons;
CREATE TRIGGER trg_enforce_salon_product_access_state_column
  BEFORE UPDATE ON public.salons
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_salon_product_access_state_column();

-- ─── After insert: initial state ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.trg_salons_after_insert_recompute_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.recompute_product_access_state(NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_salons_after_insert_recompute_access ON public.salons;
CREATE TRIGGER trg_salons_after_insert_recompute_access
  AFTER INSERT ON public.salons
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_salons_after_insert_recompute_access();

-- ─── Thin access check (reads persisted state only) ──────────────────────
CREATE OR REPLACE FUNCTION public.salon_product_access_granted(p_salon_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
      FROM public.salons s
     WHERE s.id = p_salon_id
       AND s.product_access_state IN (
         'legacy_exempt'::public.product_access_state,
         'trial'::public.product_access_state,
         'active'::public.product_access_state,
         'grace'::public.product_access_state
       )
  );
$$;

COMMENT ON FUNCTION public.salon_product_access_granted(uuid) IS
  'True if salon may use product features: persisted product_access_state in legacy_exempt, trial, active, or grace.';

-- ─── Backfill ───────────────────────────────────────────────────────────
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id FROM public.salons LOOP
    PERFORM public.recompute_product_access_state(r.id);
  END LOOP;
END $$;

ALTER TABLE public.salons
  ALTER COLUMN product_access_state SET NOT NULL;

ALTER TABLE public.salons
  ALTER COLUMN product_access_state SET DEFAULT 'active'::public.product_access_state;

-- ─── Observability: state transitions (Postgres server log) ────────────
CREATE OR REPLACE FUNCTION public.log_product_access_state_transition()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.product_access_state IS DISTINCT FROM OLD.product_access_state THEN
    RAISE LOG 'product_access_state_change salon_id=% old=% new=%',
      NEW.id,
      OLD.product_access_state,
      NEW.product_access_state;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_product_access_state_transition ON public.salons;
CREATE TRIGGER trg_log_product_access_state_transition
  AFTER UPDATE ON public.salons
  FOR EACH ROW
  EXECUTE FUNCTION public.log_product_access_state_transition();
