-- =====================================================
-- Salon product access (trial + billing) + onboarding trial_end
-- =====================================================
-- Grandfather: trial_end IS NULL => full legacy access without subscription.
-- New salons: trial_end set at creation; after expiry, subscription + good payment required.
-- =====================================================

-- ─── Core access check (anon + server; no superadmin bypass here) ───
CREATE OR REPLACE FUNCTION public.salon_product_access_granted(p_salon_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  s RECORD;
BEGIN
  SELECT trial_end,
         billing_subscription_id,
         payment_status,
         payment_failed_at
    INTO s
    FROM public.salons
   WHERE id = p_salon_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Grandfathered: not on trial regime
  IF s.trial_end IS NULL THEN
    RETURN true;
  END IF;

  -- Active trial window
  IF now() < s.trial_end THEN
    RETURN true;
  END IF;

  -- Trial ended: need a linked subscription
  IF s.billing_subscription_id IS NULL THEN
    RETURN false;
  END IF;

  IF s.payment_status = 'requires_action' OR s.payment_status = 'restricted' THEN
    RETURN false;
  END IF;

  IF btrim(COALESCE(s.payment_status, '')) = 'incomplete' THEN
    RETURN false;
  END IF;

  IF s.payment_status IS NULL OR btrim(COALESCE(s.payment_status, '')) = '' OR s.payment_status = 'active' THEN
    RETURN true;
  END IF;

  IF s.payment_status IN ('failed', 'grace_period') THEN
    IF s.payment_failed_at IS NULL THEN
      RETURN true;
    END IF;
    IF (now() - s.payment_failed_at) < interval '7 days' THEN
      RETURN true;
    END IF;
    RETURN false;
  END IF;

  RETURN false;
END;
$$;

COMMENT ON FUNCTION public.salon_product_access_granted(uuid) IS
  'True if salon may use product features: grandfather (trial_end null), active trial, or paid subscription with allowed payment_status / grace.';

-- ─── Tenant mutations: superadmin bypass + product access ───
CREATE OR REPLACE FUNCTION public.salon_tenant_mutation_allowed(p_salon_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT
    EXISTS (
      SELECT 1
        FROM public.profiles p
       WHERE p.user_id = auth.uid()
         AND COALESCE(p.is_superadmin, false)
    )
    OR public.salon_product_access_granted(p_salon_id);
$$;

COMMENT ON FUNCTION public.salon_tenant_mutation_allowed(uuid) IS
  'True if authenticated user may mutate tenant data for salon: superadmin or salon_product_access_granted.';

-- ─── Public booking widget: structured status for UI / logging ───
CREATE OR REPLACE FUNCTION public.salon_public_booking_status(p_salon_id uuid)
RETURNS TABLE (available boolean, reason text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_online boolean;
BEGIN
  SELECT s.online_booking_enabled
    INTO v_online
    FROM public.salons s
   WHERE s.id = p_salon_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'salon_not_found'::text;
    RETURN;
  END IF;

  IF NOT COALESCE(v_online, false) THEN
    RETURN QUERY SELECT false, 'online_booking_disabled'::text;
    RETURN;
  END IF;

  IF NOT public.salon_product_access_granted(p_salon_id) THEN
    RETURN QUERY SELECT false, 'billing_locked'::text;
    RETURN;
  END IF;

  RETURN QUERY SELECT true, 'ok'::text;
END;
$$;

COMMENT ON FUNCTION public.salon_public_booking_status(uuid) IS
  'Returns whether public online booking should be offered; reason codes: ok, online_booking_disabled, billing_locked, salon_not_found.';

GRANT EXECUTE ON FUNCTION public.salon_product_access_granted(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.salon_tenant_mutation_allowed(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.salon_public_booking_status(uuid) TO anon, authenticated, service_role;

-- ─── Onboarding: 14-day trial for new salons ───
CREATE OR REPLACE FUNCTION public.create_salon_for_current_user(
  salon_name text,
  salon_type_param text DEFAULT 'barber',
  preferred_language_param text DEFAULT 'en',
  online_booking_enabled_param boolean DEFAULT false,
  is_public_param boolean DEFAULT true,
  whatsapp_number_param text DEFAULT NULL,
  timezone_param text DEFAULT 'Europe/Oslo'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_salon_id uuid;
  v_slug text;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  v_slug := lower(regexp_replace(regexp_replace(salon_name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));

  WHILE EXISTS (SELECT 1 FROM public.salons WHERE slug = v_slug) LOOP
    v_slug := v_slug || '-' || floor(random() * 1000)::text;
  END LOOP;

  INSERT INTO public.salons (
    name,
    slug,
    salon_type,
    preferred_language,
    online_booking_enabled,
    is_public,
    whatsapp_number,
    timezone,
    trial_end,
    created_at,
    updated_at
  )
  VALUES (
    salon_name,
    v_slug,
    COALESCE(salon_type_param, 'barber'),
    COALESCE(preferred_language_param, 'en'),
    COALESCE(online_booking_enabled_param, false),
    COALESCE(is_public_param, true),
    whatsapp_number_param,
    COALESCE(timezone_param, 'Europe/Oslo'),
    now() + interval '14 days',
    now(),
    now()
  )
  RETURNING id INTO v_salon_id;

  INSERT INTO public.profiles (user_id, salon_id, updated_at)
  VALUES (v_user_id, v_salon_id, now())
  ON CONFLICT (user_id) DO UPDATE SET
    salon_id = EXCLUDED.salon_id,
    updated_at = now();

  RETURN v_salon_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_salon_for_current_user(text, text, text, boolean, boolean, text, text) TO authenticated;

-- ─── When product locked: owner may only patch billing projection columns on salons ───
CREATE OR REPLACE FUNCTION public.enforce_salon_update_when_product_locked()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF COALESCE(auth.role(), '') = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.profiles p
     WHERE p.user_id = auth.uid() AND COALESCE(p.is_superadmin, false)
  ) THEN
    RETURN NEW;
  END IF;

  IF public.salon_product_access_granted(NEW.id) THEN
    RETURN NEW;
  END IF;

  IF (NEW.name IS DISTINCT FROM OLD.name)
     OR (NEW.slug IS DISTINCT FROM OLD.slug)
     OR (NEW.created_at IS DISTINCT FROM OLD.created_at)
     OR (NEW.is_public IS DISTINCT FROM OLD.is_public)
     OR (NEW.salon_type IS DISTINCT FROM OLD.salon_type)
     OR (NEW.preferred_language IS DISTINCT FROM OLD.preferred_language)
     OR (NEW.online_booking_enabled IS DISTINCT FROM OLD.online_booking_enabled)
     OR (NEW.whatsapp_number IS DISTINCT FROM OLD.whatsapp_number)
     OR (NEW.supported_languages IS DISTINCT FROM OLD.supported_languages)
     OR (NEW.default_language IS DISTINCT FROM OLD.default_language)
     OR (NEW.theme IS DISTINCT FROM OLD.theme)
     OR (NEW.timezone IS DISTINCT FROM OLD.timezone)
     OR (NEW.currency IS DISTINCT FROM OLD.currency)
     OR (NEW.business_address IS DISTINCT FROM OLD.business_address)
     OR (NEW.org_number IS DISTINCT FROM OLD.org_number)
     OR (NEW.cancellation_hours IS DISTINCT FROM OLD.cancellation_hours)
     OR (NEW.default_buffer_minutes IS DISTINCT FROM OLD.default_buffer_minutes)
     OR (NEW.time_format IS DISTINCT FROM OLD.time_format)
     OR (NEW.theme_pack_id IS DISTINCT FROM OLD.theme_pack_id)
     OR (NEW.theme_pack_version IS DISTINCT FROM OLD.theme_pack_version)
     OR (NEW.theme_pack_hash IS DISTINCT FROM OLD.theme_pack_hash)
     OR (NEW.theme_pack_snapshot IS DISTINCT FROM OLD.theme_pack_snapshot)
     OR (NEW.theme_overrides IS DISTINCT FROM OLD.theme_overrides)
     OR (NEW.description IS DISTINCT FROM OLD.description)
     OR (NEW.cover_image IS DISTINCT FROM OLD.cover_image)
     OR (NEW.instagram_url IS DISTINCT FROM OLD.instagram_url)
     OR (NEW.website_url IS DISTINCT FROM OLD.website_url)
     OR (NEW.facebook_url IS DISTINCT FROM OLD.facebook_url)
     OR (NEW.twitter_url IS DISTINCT FROM OLD.twitter_url)
     OR (NEW.tiktok_url IS DISTINCT FROM OLD.tiktok_url)
  THEN
    RAISE EXCEPTION 'Salon is locked: subscribe to update salon profile. Billing fields can still sync.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_salon_update_when_product_locked ON public.salons;
CREATE TRIGGER trg_enforce_salon_update_when_product_locked
  BEFORE UPDATE ON public.salons
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_salon_update_when_product_locked();
