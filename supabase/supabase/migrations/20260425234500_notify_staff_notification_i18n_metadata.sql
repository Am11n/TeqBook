-- Staff notify RPCs: add structured metadata so the dashboard can re-render title/body in the user's locale.

CREATE OR REPLACE FUNCTION notify_salon_staff_new_booking(
  p_salon_id UUID,
  p_customer_name TEXT,
  p_service_name TEXT,
  p_booking_time TIMESTAMPTZ,
  p_booking_id UUID,
  p_timezone TEXT DEFAULT 'UTC'
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_staff RECORD;
  v_count INTEGER := 0;
  v_title TEXT;
  v_body TEXT;
  v_formatted_time TEXT;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.bookings b
    WHERE b.id = p_booking_id
      AND b.salon_id = p_salon_id
  ) THEN
    RAISE EXCEPTION 'notify_salon_staff_new_booking: booking not found or salon mismatch'
      USING ERRCODE = 'check_violation';
  END IF;

  IF auth.role() = 'service_role' THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.salon_id = p_salon_id
      AND p.role IN ('owner', 'manager', 'staff')
  ) THEN
    NULL;
  ELSE
    RAISE EXCEPTION 'notify_salon_staff_new_booking: not authorized'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  v_formatted_time := to_char(
    p_booking_time AT TIME ZONE COALESCE(p_timezone, 'UTC'),
    'DD.MM.YYYY HH24:MI'
  );

  v_title := 'New Booking';
  v_body := format(
    '%s booked %s for %s',
    p_customer_name,
    COALESCE(p_service_name, 'a service'),
    v_formatted_time
  );

  FOR v_staff IN
    SELECT user_id
    FROM profiles
    WHERE salon_id = p_salon_id
      AND role IN ('owner', 'manager')
  LOOP
    INSERT INTO notifications (
      user_id,
      salon_id,
      type,
      title,
      body,
      metadata,
      action_url,
      read
    ) VALUES (
      v_staff.user_id,
      p_salon_id,
      'booking',
      v_title,
      v_body,
      jsonb_build_object(
        'booking_id', p_booking_id,
        'event_type', 'new_booking',
        'customer_name', p_customer_name,
        'service_name', COALESCE(p_service_name, 'a service'),
        'start_time', p_booking_time::text,
        'timezone', COALESCE(p_timezone, 'UTC')
      ),
      '/bookings?id=' || p_booking_id::TEXT,
      FALSE
    );

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

CREATE OR REPLACE FUNCTION notify_salon_staff_booking_cancelled(
  p_salon_id UUID,
  p_customer_name TEXT,
  p_service_name TEXT,
  p_booking_time TIMESTAMPTZ,
  p_booking_id UUID,
  p_timezone TEXT DEFAULT 'UTC'
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_staff RECORD;
  v_count INTEGER := 0;
  v_title TEXT;
  v_body TEXT;
  v_formatted_time TEXT;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.bookings b
    WHERE b.id = p_booking_id
      AND b.salon_id = p_salon_id
  ) THEN
    RAISE EXCEPTION 'notify_salon_staff_booking_cancelled: booking not found or salon mismatch'
      USING ERRCODE = 'check_violation';
  END IF;

  IF auth.role() = 'service_role' THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.salon_id = p_salon_id
      AND p.role IN ('owner', 'manager', 'staff')
  ) THEN
    NULL;
  ELSE
    RAISE EXCEPTION 'notify_salon_staff_booking_cancelled: not authorized'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  v_formatted_time := to_char(
    p_booking_time AT TIME ZONE COALESCE(p_timezone, 'UTC'),
    'DD.MM.YYYY HH24:MI'
  );

  v_title := 'Booking Cancelled';
  v_body := format(
    '%s cancelled their booking for %s on %s',
    p_customer_name,
    COALESCE(p_service_name, 'a service'),
    v_formatted_time
  );

  FOR v_staff IN
    SELECT user_id
    FROM profiles
    WHERE salon_id = p_salon_id
      AND role IN ('owner', 'manager')
  LOOP
    INSERT INTO notifications (
      user_id,
      salon_id,
      type,
      title,
      body,
      metadata,
      action_url,
      read
    ) VALUES (
      v_staff.user_id,
      p_salon_id,
      'booking',
      v_title,
      v_body,
      jsonb_build_object(
        'booking_id', p_booking_id,
        'event_type', 'booking_cancelled',
        'customer_name', p_customer_name,
        'service_name', COALESCE(p_service_name, 'a service'),
        'start_time', p_booking_time::text,
        'timezone', COALESCE(p_timezone, 'UTC')
      ),
      '/bookings?id=' || p_booking_id::TEXT,
      FALSE
    );

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION notify_salon_staff_new_booking(UUID, TEXT, TEXT, TIMESTAMPTZ, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION notify_salon_staff_booking_cancelled(UUID, TEXT, TEXT, TIMESTAMPTZ, UUID, TEXT) TO authenticated;

COMMENT ON FUNCTION notify_salon_staff_new_booking(UUID, TEXT, TEXT, TIMESTAMPTZ, UUID, TEXT) IS
  'Notify salon owners/managers about a new booking. Requires booking id to belong to p_salon_id; caller must be service_role or staff profile for that salon. Metadata includes fields for client-side i18n.';

COMMENT ON FUNCTION notify_salon_staff_booking_cancelled(UUID, TEXT, TEXT, TIMESTAMPTZ, UUID, TEXT) IS
  'Notify salon owners/managers about a cancelled booking. Same authorization and booking/salon binding as new_booking. Metadata includes fields for client-side i18n.';
