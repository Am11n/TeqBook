-- =====================================================
-- Create Notification Helper Functions
-- =====================================================
-- These functions allow creating notifications without
-- requiring the caller to be authenticated as the recipient
-- Used by the booking system to notify salon owners

-- Function to create a notification for a user
-- Uses SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION create_notification_for_user(
  p_user_id UUID,
  p_salon_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_body TEXT,
  p_metadata JSONB DEFAULT NULL,
  p_action_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  -- Validate type
  IF p_type NOT IN ('booking', 'system', 'staff', 'info') THEN
    RAISE EXCEPTION 'Invalid notification type: %', p_type;
  END IF;

  -- Insert the notification
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
    p_user_id,
    p_salon_id,
    p_type,
    p_title,
    p_body,
    p_metadata,
    p_action_url,
    FALSE
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;

-- Function to notify all owners/managers of a salon about a new booking
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
  -- Format booking time in salon timezone
  -- Use the provided timezone, or default to UTC
  v_formatted_time := to_char(p_booking_time AT TIME ZONE COALESCE(p_timezone, 'UTC'), 'DD.MM.YYYY HH24:MI');
  
  -- Create notification title and body
  v_title := 'New Booking';
  v_body := format('%s booked %s for %s', 
    p_customer_name, 
    COALESCE(p_service_name, 'a service'),
    v_formatted_time
  );

  -- Find all owners and managers for this salon
  FOR v_staff IN 
    SELECT user_id 
    FROM profiles 
    WHERE salon_id = p_salon_id 
      AND role IN ('owner', 'manager')
  LOOP
    -- Create notification for each staff member
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
      jsonb_build_object('booking_id', p_booking_id, 'event_type', 'new_booking'),
      '/bookings?id=' || p_booking_id::TEXT,
      FALSE
    );
    
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

-- Function to notify salon staff about a cancelled booking
CREATE OR REPLACE FUNCTION notify_salon_staff_booking_cancelled(
  p_salon_id UUID,
  p_customer_name TEXT,
  p_service_name TEXT,
  p_booking_time TIMESTAMPTZ,
  p_booking_id UUID
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
BEGIN
  -- Create notification title and body
  v_title := 'Booking Cancelled';
  v_body := format('%s cancelled their booking for %s on %s', 
    p_customer_name, 
    COALESCE(p_service_name, 'a service'),
    to_char(p_booking_time AT TIME ZONE 'UTC', 'DD.MM.YYYY HH24:MI')
  );

  -- Find all owners and managers for this salon
  FOR v_staff IN 
    SELECT user_id 
    FROM profiles 
    WHERE salon_id = p_salon_id 
      AND role IN ('owner', 'manager')
  LOOP
    -- Create notification for each staff member
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
      jsonb_build_object('booking_id', p_booking_id, 'event_type', 'booking_cancelled'),
      '/bookings',
      FALSE
    );
    
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION create_notification_for_user(UUID, UUID, TEXT, TEXT, TEXT, JSONB, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION notify_salon_staff_new_booking(UUID, TEXT, TEXT, TIMESTAMPTZ, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION notify_salon_staff_booking_cancelled(UUID, TEXT, TEXT, TIMESTAMPTZ, UUID) TO authenticated;

-- Function to get customer email for a booking (bypasses RLS)
CREATE OR REPLACE FUNCTION get_booking_customer_email(p_booking_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT;
BEGIN
  SELECT c.email INTO v_email
  FROM bookings b
  JOIN customers c ON b.customer_id = c.id
  WHERE b.id = p_booking_id;
  
  RETURN v_email;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_booking_customer_email(UUID) TO authenticated;

-- Comments
COMMENT ON FUNCTION create_notification_for_user IS 'Create an in-app notification for any user (bypasses RLS)';
COMMENT ON FUNCTION notify_salon_staff_new_booking IS 'Notify all salon owners/managers about a new booking. p_timezone is the IANA timezone identifier (e.g., Europe/Oslo) for formatting the booking time.';
COMMENT ON FUNCTION notify_salon_staff_booking_cancelled IS 'Notify all salon owners/managers about a cancelled booking';
COMMENT ON FUNCTION get_booking_customer_email IS 'Get customer email for a booking (bypasses RLS)';
