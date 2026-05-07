-- Target-capacity billing model
-- Introduces active/pending billing targets and enforces usage <= active target at DB boundary.

ALTER TABLE public.salons
  ADD COLUMN IF NOT EXISTS active_target_staff_capacity integer,
  ADD COLUMN IF NOT EXISTS active_target_language_capacity integer,
  ADD COLUMN IF NOT EXISTS pending_target_staff_capacity integer,
  ADD COLUMN IF NOT EXISTS pending_target_language_capacity integer;

COMMENT ON COLUMN public.salons.active_target_staff_capacity IS
  'Current paid staff capacity (source-of-truth for billing now).';
COMMENT ON COLUMN public.salons.active_target_language_capacity IS
  'Current paid language capacity (source-of-truth for billing now).';
COMMENT ON COLUMN public.salons.pending_target_staff_capacity IS
  'Scheduled staff capacity for next billing boundary.';
COMMENT ON COLUMN public.salons.pending_target_language_capacity IS
  'Scheduled language capacity for next billing boundary.';

WITH usage_counts AS (
  SELECT
    s.id AS salon_id,
    COALESCE(e.active_employees, 0) AS active_employees,
    COALESCE(array_length(s.supported_languages, 1), 0) AS active_languages,
    COALESCE(public.addon_included_limit(s.plan, 'employees'), 0) AS included_staff,
    COALESCE(public.addon_included_limit(s.plan, 'languages'), 0) AS included_languages,
    COALESCE(a_staff.qty, 0) AS paid_extra_staff,
    COALESCE(a_lang.qty, 0) AS paid_extra_languages,
    COALESCE(s.pending_target_extra_staff, 0) AS pending_extra_staff,
    COALESCE(s.pending_target_extra_languages, 0) AS pending_extra_languages
  FROM public.salons s
  LEFT JOIN (
    SELECT salon_id, COUNT(*)::integer AS active_employees
    FROM public.employees
    WHERE is_active = true
    GROUP BY salon_id
  ) e ON e.salon_id = s.id
  LEFT JOIN public.addons a_staff
    ON a_staff.salon_id = s.id AND a_staff.type = 'extra_staff'
  LEFT JOIN public.addons a_lang
    ON a_lang.salon_id = s.id AND a_lang.type = 'extra_languages'
)
UPDATE public.salons s
SET
  active_target_staff_capacity = GREATEST(
    u.active_employees,
    u.included_staff + u.paid_extra_staff
  ),
  active_target_language_capacity = GREATEST(
    u.active_languages,
    u.included_languages + u.paid_extra_languages
  ),
  pending_target_staff_capacity = GREATEST(
    u.active_employees,
    u.included_staff + GREATEST(u.paid_extra_staff, u.pending_extra_staff)
  ),
  pending_target_language_capacity = GREATEST(
    u.active_languages,
    u.included_languages + GREATEST(u.paid_extra_languages, u.pending_extra_languages)
  )
FROM usage_counts u
WHERE s.id = u.salon_id
  AND (
    s.active_target_staff_capacity IS NULL
    OR s.active_target_language_capacity IS NULL
    OR s.pending_target_staff_capacity IS NULL
    OR s.pending_target_language_capacity IS NULL
  );

UPDATE public.salons s
SET
  active_target_staff_capacity = COALESCE(
    s.active_target_staff_capacity,
    COALESCE(public.addon_included_limit(s.plan, 'employees'), 0)
  ),
  active_target_language_capacity = COALESCE(
    s.active_target_language_capacity,
    COALESCE(public.addon_included_limit(s.plan, 'languages'), 0)
  ),
  pending_target_staff_capacity = COALESCE(
    s.pending_target_staff_capacity,
    COALESCE(s.active_target_staff_capacity, COALESCE(public.addon_included_limit(s.plan, 'employees'), 0))
  ),
  pending_target_language_capacity = COALESCE(
    s.pending_target_language_capacity,
    COALESCE(s.active_target_language_capacity, COALESCE(public.addon_included_limit(s.plan, 'languages'), 0))
  );

ALTER TABLE public.salons
  ALTER COLUMN active_target_staff_capacity SET NOT NULL,
  ALTER COLUMN active_target_language_capacity SET NOT NULL,
  ALTER COLUMN pending_target_staff_capacity SET NOT NULL,
  ALTER COLUMN pending_target_language_capacity SET NOT NULL;

ALTER TABLE public.salons
  ADD CONSTRAINT salons_active_target_staff_capacity_non_negative
    CHECK (active_target_staff_capacity >= 0),
  ADD CONSTRAINT salons_active_target_language_capacity_non_negative
    CHECK (active_target_language_capacity >= 0),
  ADD CONSTRAINT salons_pending_target_staff_capacity_non_negative
    CHECK (pending_target_staff_capacity >= 0),
  ADD CONSTRAINT salons_pending_target_language_capacity_non_negative
    CHECK (pending_target_language_capacity >= 0);

CREATE OR REPLACE FUNCTION public.assert_salon_addon_usage(
  p_salon_id uuid,
  p_plan public.plan_type,
  p_dim text,
  p_usage_after integer
) RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_target integer;
BEGIN
  IF p_dim = 'employees' THEN
    SELECT s.active_target_staff_capacity INTO v_target
    FROM public.salons s
    WHERE s.id = p_salon_id;
  ELSIF p_dim = 'languages' THEN
    SELECT s.active_target_language_capacity INTO v_target
    FROM public.salons s
    WHERE s.id = p_salon_id;
  ELSE
    RAISE EXCEPTION 'invalid_addon_dimension';
  END IF;

  v_target := COALESCE(v_target, 0);
  IF p_usage_after > v_target THEN
    RAISE EXCEPTION 'addon_usage_requires_upgrade'
      USING ERRCODE = 'P0001',
        DETAIL = format(
          'salon=%s dim=%s usage_after=%s active_target=%s',
          p_salon_id,
          p_dim,
          p_usage_after,
          v_target
        );
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_salon_target_capacity_fn()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_active_employees integer;
  v_active_languages integer;
  v_included_staff integer;
  v_included_languages integer;
  v_staff_cap integer;
  v_lang_cap integer;
BEGIN
  SELECT COUNT(*)::integer INTO v_active_employees
  FROM public.employees e
  WHERE e.salon_id = NEW.id AND e.is_active = true;

  v_active_languages := COALESCE(array_length(NEW.supported_languages, 1), 0);

  IF NEW.active_target_staff_capacity < v_active_employees THEN
    RAISE EXCEPTION 'target_below_usage_staff'
      USING ERRCODE = 'P0001',
        DETAIL = format('usage=%s required_min_target=%s', v_active_employees, v_active_employees);
  END IF;

  IF NEW.active_target_language_capacity < v_active_languages THEN
    RAISE EXCEPTION 'target_below_usage_languages'
      USING ERRCODE = 'P0001',
        DETAIL = format('usage=%s required_min_target=%s', v_active_languages, v_active_languages);
  END IF;

  IF NEW.plan = 'starter'::public.plan_type THEN
    v_included_staff := COALESCE(public.addon_included_limit(NEW.plan, 'employees'), 0);
    v_included_languages := COALESCE(public.addon_included_limit(NEW.plan, 'languages'), 0);
    v_staff_cap := v_included_staff + 20;
    v_lang_cap := v_included_languages + 8;

    IF NEW.active_target_staff_capacity > v_staff_cap OR NEW.pending_target_staff_capacity > v_staff_cap THEN
      RAISE EXCEPTION 'target_exceeds_plan_cap_staff'
        USING ERRCODE = 'P0001',
          DETAIL = format('max_target=%s', v_staff_cap);
    END IF;

    IF NEW.active_target_language_capacity > v_lang_cap OR NEW.pending_target_language_capacity > v_lang_cap THEN
      RAISE EXCEPTION 'target_exceeds_plan_cap_languages'
        USING ERRCODE = 'P0001',
          DETAIL = format('max_target=%s', v_lang_cap);
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_salon_target_capacity ON public.salons;
CREATE TRIGGER enforce_salon_target_capacity
  BEFORE UPDATE OF
    active_target_staff_capacity,
    active_target_language_capacity,
    pending_target_staff_capacity,
    pending_target_language_capacity,
    supported_languages,
    plan
  ON public.salons
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_salon_target_capacity_fn();

CREATE OR REPLACE FUNCTION public.initialize_salon_target_capacity_fn()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_inc_staff integer;
  v_inc_lang integer;
BEGIN
  v_inc_staff := COALESCE(public.addon_included_limit(NEW.plan, 'employees'), 0);
  v_inc_lang := COALESCE(public.addon_included_limit(NEW.plan, 'languages'), 0);

  IF NEW.active_target_staff_capacity IS NULL THEN
    NEW.active_target_staff_capacity := v_inc_staff;
  END IF;
  IF NEW.active_target_language_capacity IS NULL THEN
    NEW.active_target_language_capacity := v_inc_lang;
  END IF;
  IF NEW.pending_target_staff_capacity IS NULL THEN
    NEW.pending_target_staff_capacity := NEW.active_target_staff_capacity;
  END IF;
  IF NEW.pending_target_language_capacity IS NULL THEN
    NEW.pending_target_language_capacity := NEW.active_target_language_capacity;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS initialize_salon_target_capacity ON public.salons;
CREATE TRIGGER initialize_salon_target_capacity
  BEFORE INSERT ON public.salons
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_salon_target_capacity_fn();
