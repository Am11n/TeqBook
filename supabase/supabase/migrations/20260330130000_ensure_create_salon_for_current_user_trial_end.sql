-- Re-assert onboarding RPC after legacy letter-prefixed migrations (e.g. onboarding-schema-update.sql,
-- add-whatsapp-to-onboarding-rpc.sql) that run *after* timestamped files and define older overloads
-- without trial_end. The dashboard calls the 7-argument signature; this migration ensures that
-- signature always inserts trial_end = now() + 14 days and drops obsolete overloads.

-- 5-arg legacy overload (onboarding-schema-update) — not used by apps; remove to avoid ambiguity.
DROP FUNCTION IF EXISTS public.create_salon_for_current_user(text, text, text, boolean, boolean);

-- Canonical implementation (7 args, includes timezone + trial_end).
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

-- 6-arg overload used by public/admin apps (no timezone) — forwards to 7-arg with default timezone.
CREATE OR REPLACE FUNCTION public.create_salon_for_current_user(
  salon_name text,
  salon_type_param text DEFAULT 'barber',
  preferred_language_param text DEFAULT 'en',
  online_booking_enabled_param boolean DEFAULT false,
  is_public_param boolean DEFAULT true,
  whatsapp_number_param text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.create_salon_for_current_user(
    salon_name,
    salon_type_param,
    preferred_language_param,
    online_booking_enabled_param,
    is_public_param,
    whatsapp_number_param,
    'Europe/Oslo'::text
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_salon_for_current_user(text, text, text, boolean, boolean, text) TO authenticated;
