-- =====================================================
-- Add Timezone to create_salon_for_current_user RPC
-- =====================================================
-- Adds timezone_param so onboarding explicitly sets salon timezone
-- based on the country selected by the user. Defaults to Europe/Oslo.
-- =====================================================

-- Drop the existing function (6 params)
DROP FUNCTION IF EXISTS create_salon_for_current_user(TEXT, TEXT, TEXT, BOOLEAN, BOOLEAN, TEXT);

-- Create the updated function with timezone_param
CREATE OR REPLACE FUNCTION create_salon_for_current_user(
  salon_name TEXT,
  salon_type_param TEXT DEFAULT 'barber',
  preferred_language_param TEXT DEFAULT 'en',
  online_booking_enabled_param BOOLEAN DEFAULT false,
  is_public_param BOOLEAN DEFAULT true,
  whatsapp_number_param TEXT DEFAULT NULL,
  timezone_param TEXT DEFAULT 'Europe/Oslo'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_salon_id UUID;
  v_slug TEXT;
BEGIN
  -- Get the current authenticated user
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Generate a slug from the salon name
  v_slug := lower(regexp_replace(regexp_replace(salon_name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));

  -- Ensure slug is unique by appending a number if needed
  WHILE EXISTS (SELECT 1 FROM salons WHERE slug = v_slug) LOOP
    v_slug := v_slug || '-' || floor(random() * 1000)::TEXT;
  END LOOP;

  -- Create the salon with explicit timezone
  INSERT INTO salons (
    name,
    slug,
    salon_type,
    preferred_language,
    online_booking_enabled,
    is_public,
    whatsapp_number,
    timezone,
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
    NOW(),
    NOW()
  )
  RETURNING id INTO v_salon_id;

  -- Create or update the profile to link the user to the salon
  INSERT INTO profiles (
    user_id,
    salon_id,
    updated_at
  )
  VALUES (
    v_user_id,
    v_salon_id,
    NOW()
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    salon_id = v_salon_id,
    updated_at = NOW();

  RETURN v_salon_id;
END;
$$;

-- Grant execute permission to authenticated users (new 7-param signature)
GRANT EXECUTE ON FUNCTION create_salon_for_current_user(TEXT, TEXT, TEXT, BOOLEAN, BOOLEAN, TEXT, TEXT) TO authenticated;
