-- Update notify_salon_staff_booking_cancelled to support timezone
-- This allows the notification to display booking times in the salon's timezone

-- First, try to drop any existing version of the function
-- We'll try both possible signatures in a DO block to handle errors gracefully
DO $$
BEGIN
  -- Drop function with 5 parameters (old version)
  DROP FUNCTION IF EXISTS notify_salon_staff_booking_cancelled(UUID, TEXT, TEXT, TIMESTAMPTZ, UUID);
EXCEPTION
  WHEN undefined_function THEN
    -- Function doesn't exist, that's fine
    NULL;
END $$;

DO $$
BEGIN
  -- Drop function with 6 parameters (if it exists)
  DROP FUNCTION IF EXISTS notify_salon_staff_booking_cancelled(UUID, TEXT, TEXT, TIMESTAMPTZ, UUID, TEXT);
EXCEPTION
  WHEN undefined_function THEN
    -- Function doesn't exist, that's fine
    NULL;
END $$;

-- Create the new function with timezone parameter (6 parameters)
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
  -- Format booking time in salon timezone
  -- Use the provided timezone, or default to UTC
  v_formatted_time := to_char(p_booking_time AT TIME ZONE COALESCE(p_timezone, 'UTC'), 'DD.MM.YYYY HH24:MI');
  
  -- Create notification title and body
  v_title := 'Booking Cancelled';
  v_body := format('%s cancelled their booking for %s on %s', 
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
      jsonb_build_object('booking_id', p_booking_id, 'event_type', 'booking_cancelled'),
      '/bookings?id=' || p_booking_id::TEXT,
      FALSE
    );
    
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

-- Update grant statement to include new timezone parameter
GRANT EXECUTE ON FUNCTION notify_salon_staff_booking_cancelled(UUID, TEXT, TEXT, TIMESTAMPTZ, UUID, TEXT) TO authenticated;

COMMENT ON FUNCTION notify_salon_staff_booking_cancelled IS 'Notify all salon owners/managers about a cancelled booking. p_timezone is the IANA timezone identifier (e.g., Europe/Oslo) for formatting the booking time.';
