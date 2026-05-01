-- Add-on invariant: plan_features-backed included limits, RPC primary writes, step-0 trim + notify, optional triggers.

-- ─── Feature: included staff seats (parallel to MULTILINGUAL limit_value for languages) ─────────
INSERT INTO public.features (key, name, description)
VALUES (
  'PLAN_INCLUDED_STAFF',
  'Included staff seats',
  'Base staff seats included in the subscription plan (before purchased add-ons).'
)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.plan_features (plan_type, feature_id, limit_value)
SELECT 'starter'::public.plan_type, f.id, 2::numeric
FROM public.features f
WHERE f.key = 'PLAN_INCLUDED_STAFF'
ON CONFLICT (plan_type, feature_id) DO NOTHING;

INSERT INTO public.plan_features (plan_type, feature_id, limit_value)
SELECT 'pro'::public.plan_type, f.id, 5::numeric
FROM public.features f
WHERE f.key = 'PLAN_INCLUDED_STAFF'
ON CONFLICT (plan_type, feature_id) DO NOTHING;

INSERT INTO public.plan_features (plan_type, feature_id, limit_value)
SELECT 'business'::public.plan_type, f.id, NULL::numeric
FROM public.features f
WHERE f.key = 'PLAN_INCLUDED_STAFF'
ON CONFLICT (plan_type, feature_id) DO NOTHING;

-- ─── Policy helpers (mirror packages/shared-core billing policy; fallback if rows missing) ────────
CREATE OR REPLACE FUNCTION public.addon_included_limit(p_plan public.plan_type, p_dim text)
RETURNS integer
LANGUAGE sql
STABLE
AS $$
  SELECT CASE
    WHEN p_plan = 'business'::public.plan_type THEN NULL::integer
    WHEN p_dim = 'employees' THEN COALESCE(
      (
        SELECT pf.limit_value::integer
        FROM public.plan_features pf
        JOIN public.features feat ON feat.id = pf.feature_id
        WHERE pf.plan_type = p_plan AND feat.key = 'PLAN_INCLUDED_STAFF'
        LIMIT 1
      ),
      CASE p_plan
        WHEN 'starter'::public.plan_type THEN 2
        WHEN 'pro'::public.plan_type THEN 5
        ELSE 2
      END
    )
    WHEN p_dim = 'languages' THEN COALESCE(
      (
        SELECT pf.limit_value::integer
        FROM public.plan_features pf
        JOIN public.features feat ON feat.id = pf.feature_id
        WHERE pf.plan_type = p_plan AND feat.key = 'MULTILINGUAL'
        LIMIT 1
      ),
      CASE p_plan
        WHEN 'starter'::public.plan_type THEN 2
        WHEN 'pro'::public.plan_type THEN 5
        ELSE 2
      END
    )
    ELSE NULL::integer
  END;
$$;

CREATE OR REPLACE FUNCTION public.salon_capped_addon_quantity(p_salon_id uuid, p_plan text, p_dim text)
RETURNS integer
LANGUAGE sql
STABLE
AS $$
  SELECT CASE
    WHEN p_plan = 'starter' AND p_dim = 'employees' THEN LEAST(
      COALESCE((SELECT a.qty FROM public.addons a WHERE a.salon_id = p_salon_id AND a.type = 'extra_staff'), 0),
      20
    )
    WHEN p_plan = 'starter' AND p_dim = 'languages' THEN LEAST(
      COALESCE((SELECT a.qty FROM public.addons a WHERE a.salon_id = p_salon_id AND a.type = 'extra_languages'), 0),
      8
    )
    WHEN p_dim = 'employees' THEN COALESCE(
      (SELECT a.qty FROM public.addons a WHERE a.salon_id = p_salon_id AND a.type = 'extra_staff'),
      0
    )
    ELSE COALESCE(
      (SELECT a.qty FROM public.addons a WHERE a.salon_id = p_salon_id AND a.type = 'extra_languages'),
      0
    )
  END;
$$;

CREATE OR REPLACE FUNCTION public.assert_salon_addon_usage(
  p_salon_id uuid,
  p_plan public.plan_type,
  p_dim text,
  p_usage_after integer
) RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_included integer;
  v_addon integer;
  v_allowed integer;
BEGIN
  IF p_dim NOT IN ('employees', 'languages') THEN
    RAISE EXCEPTION 'invalid_addon_dimension';
  END IF;

  v_included := public.addon_included_limit(p_plan, p_dim);
  IF v_included IS NULL THEN
    RETURN;
  END IF;

  v_addon := public.salon_capped_addon_quantity(p_salon_id, p_plan::text, p_dim);
  v_allowed := v_included + v_addon;

  IF p_usage_after > v_allowed THEN
    RAISE EXCEPTION 'addon_usage_requires_upgrade'
      USING ERRCODE = 'P0001',
        DETAIL = format(
          'salon=%s dim=%s usage_after=%s allowed=%s included=%s addon=%s',
          p_salon_id,
          p_dim,
          p_usage_after,
          v_allowed,
          v_included,
          v_addon
        );
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.addon_trim_language_array(
  p_langs text[],
  p_preferred text,
  p_max integer
) RETURNS text[]
LANGUAGE sql
STABLE
AS $$
  WITH first_seen AS (
    SELECT DISTINCT ON (lang)
      lang,
      ord,
      CASE
        WHEN lang = 'en' THEN 0
        WHEN p_preferred IS NOT NULL AND lang = p_preferred THEN 1
        ELSE 2
      END AS tier
    FROM unnest(COALESCE(p_langs, ARRAY[]::text[])) WITH ORDINALITY AS t(lang, ord)
    ORDER BY lang, ord
  ),
  ranked AS (
    SELECT lang, row_number() OVER (ORDER BY tier, ord) AS rn
    FROM first_seen
  )
  SELECT COALESCE(
    (SELECT array_agg(lang ORDER BY rn) FROM ranked WHERE rn <= GREATEST(p_max, 1)),
    ARRAY['en', 'nb']::text[]
  );
$$;

-- ─── Steg 0: auto-trim + in-app notification ───────────────────────────────────────────────────
-- Migration runs without end-user JWT; temporarily bypass product-lock trigger on salons so trim can write.
ALTER TABLE public.salons DISABLE TRIGGER trg_enforce_salon_update_when_product_locked;

DO $$
DECLARE
  r record;
  v_allowed_emp integer;
  v_allowed_lang integer;
  v_cnt integer;
  v_trim_emp integer;
  v_langs text[];
  v_did_trim boolean;
BEGIN
  FOR r IN
    SELECT s.id, s.plan, s.preferred_language, s.supported_languages
    FROM public.salons s
    WHERE s.plan IS DISTINCT FROM 'business'::public.plan_type
  LOOP
    v_did_trim := false;

    v_allowed_emp :=
      COALESCE(public.addon_included_limit(r.plan, 'employees'), 0)
      + public.salon_capped_addon_quantity(r.id, r.plan::text, 'employees');

    SELECT COUNT(*)::integer INTO v_cnt FROM public.employees e
    WHERE e.salon_id = r.id AND e.is_active = true;

    IF v_cnt > v_allowed_emp THEN
      v_trim_emp := v_cnt - v_allowed_emp;
      UPDATE public.employees e
      SET is_active = false
      WHERE e.id IN (
        SELECT e2.id
        FROM public.employees e2
        WHERE e2.salon_id = r.id AND e2.is_active = true
        ORDER BY e2.created_at DESC NULLS LAST, e2.id DESC
        LIMIT v_trim_emp
      );
      v_did_trim := true;
    END IF;

    v_allowed_lang :=
      COALESCE(public.addon_included_limit(r.plan, 'languages'), 0)
      + public.salon_capped_addon_quantity(r.id, r.plan::text, 'languages');

    v_langs := r.supported_languages;
    v_cnt := COALESCE(array_length(v_langs, 1), 0);

    IF v_cnt > v_allowed_lang THEN
      UPDATE public.salons s
      SET supported_languages = public.addon_trim_language_array(
        v_langs,
        r.preferred_language,
        v_allowed_lang
      )
      WHERE s.id = r.id;
      v_did_trim := true;
    END IF;

    IF v_did_trim THEN
      INSERT INTO public.notifications (user_id, salon_id, type, title, body)
      SELECT pr.user_id,
        r.id,
        'system',
        'Subscription limits applied',
        'Your active staff or supported languages were reduced to match your current plan and add-ons. Open Billing to upgrade or adjust add-ons if needed.'
      FROM public.profiles pr
      WHERE pr.salon_id = r.id;
    END IF;
  END LOOP;
END $$;

ALTER TABLE public.salons ENABLE TRIGGER trg_enforce_salon_update_when_product_locked;

-- ─── RPC: supported languages (dashboard primary path) ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.dashboard_update_salon_supported_languages(
  p_salon_id uuid,
  p_languages text[]
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_plan public.plan_type;
  v_uid uuid;
  v_usage integer;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.profiles pr
    WHERE pr.user_id = v_uid AND pr.salon_id = p_salon_id
  ) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT s.plan INTO v_plan FROM public.salons s WHERE s.id = p_salon_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'salon_not_found';
  END IF;

  v_usage := COALESCE(array_length(p_languages, 1), 0);
  PERFORM public.assert_salon_addon_usage(p_salon_id, v_plan, 'languages', v_usage);

  UPDATE public.salons
  SET supported_languages = p_languages, updated_at = now()
  WHERE id = p_salon_id;
END;
$$;

-- ─── RPC: create employee (dashboard primary path) ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.dashboard_create_salon_employee(
  p_salon_id uuid,
  p_full_name text,
  p_email text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_role text DEFAULT NULL,
  p_preferred_language text DEFAULT 'nb',
  p_public_profile_visible boolean DEFAULT true,
  p_public_title text DEFAULT NULL,
  p_bio text DEFAULT NULL,
  p_profile_image_url text DEFAULT NULL,
  p_specialties text[] DEFAULT ARRAY[]::text[],
  p_public_sort_order integer DEFAULT NULL,
  p_service_ids uuid[] DEFAULT ARRAY[]::uuid[]
) RETURNS public.employees
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_plan public.plan_type;
  v_uid uuid;
  v_active integer;
  v_after integer;
  v_row public.employees%ROWTYPE;
  v_sid uuid;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.profiles pr
    WHERE pr.user_id = v_uid AND pr.salon_id = p_salon_id
  ) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  IF p_full_name IS NULL OR btrim(p_full_name) = '' THEN
    RAISE EXCEPTION 'full_name_required';
  END IF;

  SELECT s.plan INTO v_plan FROM public.salons s WHERE s.id = p_salon_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'salon_not_found';
  END IF;

  SELECT COUNT(*)::integer INTO v_active FROM public.employees e
  WHERE e.salon_id = p_salon_id AND e.is_active = true;

  v_after := v_active + 1;
  PERFORM public.assert_salon_addon_usage(p_salon_id, v_plan, 'employees', v_after);

  INSERT INTO public.employees (
    salon_id,
    full_name,
    email,
    phone,
    role,
    preferred_language,
    public_profile_visible,
    public_title,
    bio,
    profile_image_url,
    specialties,
    public_sort_order,
    is_active
  )
  VALUES (
    p_salon_id,
    btrim(p_full_name),
    NULLIF(btrim(p_email), ''),
    NULLIF(btrim(p_phone), ''),
    COALESCE(NULLIF(btrim(p_role), ''), 'staff'),
    COALESCE(p_preferred_language, 'nb'),
    COALESCE(p_public_profile_visible, true),
    NULLIF(btrim(p_public_title), ''),
    NULLIF(btrim(p_bio), ''),
    NULLIF(btrim(p_profile_image_url), ''),
    COALESCE(p_specialties, ARRAY[]::text[]),
    p_public_sort_order,
    true
  )
  RETURNING * INTO v_row;

  IF p_service_ids IS NOT NULL AND array_length(p_service_ids, 1) > 0 THEN
    FOR v_sid IN SELECT DISTINCT x FROM unnest(p_service_ids) AS t(x)
    LOOP
      INSERT INTO public.employee_services (employee_id, service_id, salon_id)
      VALUES (v_row.id, v_sid, p_salon_id);
    END LOOP;
  END IF;

  RETURN v_row;
END;
$$;

-- ─── Triggers: safety net for non-RPC writes ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.enforce_employee_addon_limit_fn()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_plan public.plan_type;
  v_salon uuid;
  v_active integer;
  v_after integer;
BEGIN
  v_salon := COALESCE(NEW.salon_id, OLD.salon_id);
  SELECT s.plan INTO v_plan FROM public.salons s WHERE s.id = v_salon;
  IF NOT FOUND THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF TG_OP = 'INSERT' THEN
    SELECT COUNT(*)::integer INTO v_active FROM public.employees e
    WHERE e.salon_id = NEW.salon_id AND e.is_active = true;
    v_after := v_active + (CASE WHEN NEW.is_active THEN 1 ELSE 0 END);
    PERFORM public.assert_salon_addon_usage(v_salon, v_plan, 'employees', v_after);
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.is_active IS DISTINCT FROM OLD.is_active OR NEW.salon_id IS DISTINCT FROM OLD.salon_id THEN
      SELECT COUNT(*)::integer INTO v_active FROM public.employees e
      WHERE e.salon_id = NEW.salon_id AND e.is_active = true AND e.id <> NEW.id;
      v_after := v_active + (CASE WHEN NEW.is_active THEN 1 ELSE 0 END);
      PERFORM public.assert_salon_addon_usage(NEW.salon_id, v_plan, 'employees', v_after);
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS enforce_employee_addon_limit ON public.employees;
CREATE TRIGGER enforce_employee_addon_limit
  BEFORE INSERT OR UPDATE OF is_active, salon_id ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_employee_addon_limit_fn();

CREATE OR REPLACE FUNCTION public.enforce_salon_languages_addon_limit_fn()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_usage integer;
BEGIN
  IF NEW.supported_languages IS DISTINCT FROM OLD.supported_languages THEN
    v_usage := COALESCE(array_length(NEW.supported_languages, 1), 0);
    PERFORM public.assert_salon_addon_usage(NEW.id, NEW.plan, 'languages', v_usage);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_salon_languages_addon_limit ON public.salons;
CREATE TRIGGER enforce_salon_languages_addon_limit
  BEFORE UPDATE OF supported_languages ON public.salons
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_salon_languages_addon_limit_fn();

REVOKE ALL ON FUNCTION public.addon_included_limit(public.plan_type, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.salon_capped_addon_quantity(uuid, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.assert_salon_addon_usage(uuid, public.plan_type, text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.addon_trim_language_array(text[], text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.dashboard_update_salon_supported_languages(uuid, text[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.dashboard_create_salon_employee(
  uuid, text, text, text, text, text, boolean, text, text, text, text[], integer, uuid[]
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.dashboard_update_salon_supported_languages(uuid, text[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.dashboard_create_salon_employee(
  uuid, text, text, text, text, text, boolean, text, text, text, text[], integer, uuid[]
) TO authenticated;

COMMENT ON FUNCTION public.assert_salon_addon_usage IS
  'Hard gate: usage_after must not exceed included (plan_features) + capped purchased add-on qty. Code P0001 / addon_usage_requires_upgrade.';

COMMENT ON FUNCTION public.dashboard_update_salon_supported_languages IS
  'Atomically validates add-on invariant and updates supported_languages; dashboard should prefer this over direct table updates.';

COMMENT ON FUNCTION public.dashboard_create_salon_employee IS
  'Atomically validates staff seat invariant, inserts employee and optional employee_services rows.';
