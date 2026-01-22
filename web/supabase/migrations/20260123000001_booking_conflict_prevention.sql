-- =====================================================
-- Booking Conflict Prevention
-- =====================================================
-- Task Group 40: Atomic booking creation to prevent race conditions
-- Creates an atomic RPC function that uses SELECT ... FOR UPDATE
-- to lock rows and prevent double-booking
-- =====================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS create_booking_atomic(UUID, UUID, UUID, TIMESTAMPTZ, TEXT, TEXT, TEXT, TEXT, BOOLEAN);

-- Create atomic booking function with row-level locking
CREATE OR REPLACE FUNCTION create_booking_atomic(
  p_salon_id UUID,
  p_employee_id UUID,
  p_service_id UUID,
  p_start_time TIMESTAMPTZ,
  p_customer_full_name TEXT,
  p_customer_email TEXT DEFAULT NULL,
  p_customer_phone TEXT DEFAULT NULL,
  p_customer_notes TEXT DEFAULT NULL,
  p_is_walk_in BOOLEAN DEFAULT false
)
RETURNS TABLE (
  id UUID,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  status TEXT,
  is_walk_in BOOLEAN,
  notes TEXT,
  customers JSONB,
  employees JSONB,
  services JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_service_duration INTEGER;
  v_end_time TIMESTAMPTZ;
  v_customer_id UUID;
  v_booking_id UUID;
  v_conflicting_booking_id UUID;
BEGIN
  -- Get service duration (using explicit table prefix)
  SELECT services.duration_minutes INTO v_service_duration
  FROM services
  WHERE services.id = p_service_id AND services.salon_id = p_salon_id;

  IF v_service_duration IS NULL THEN
    RAISE EXCEPTION 'Service not found or does not belong to salon';
  END IF;

  -- Calculate end time
  v_end_time := p_start_time + (v_service_duration || ' minutes')::INTERVAL;

  -- ATOMIC CHECK: Lock and check for overlapping bookings
  -- This prevents race conditions by locking rows during the check
  SELECT bookings.id INTO v_conflicting_booking_id
  FROM bookings
  WHERE bookings.salon_id = p_salon_id
    AND bookings.employee_id = p_employee_id
    AND (
      (bookings.start_time < v_end_time AND bookings.end_time > p_start_time)
      OR (bookings.start_time = p_start_time)
    )
    AND bookings.status NOT IN ('cancelled', 'no-show')
  FOR UPDATE  -- Lock rows to prevent concurrent modifications
  LIMIT 1;

  -- If conflict found, raise exception
  IF v_conflicting_booking_id IS NOT NULL THEN
    RAISE EXCEPTION 'Time slot is already booked. Please select another time.';
  END IF;

  -- Upsert customer
  INSERT INTO customers (salon_id, full_name, email, phone, notes)
  VALUES (p_salon_id, p_customer_full_name, p_customer_email, p_customer_phone, p_customer_notes)
  ON CONFLICT (salon_id, email) WHERE email IS NOT NULL
  DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(EXCLUDED.phone, customers.phone),
    notes = COALESCE(EXCLUDED.notes, customers.notes),
    updated_at = NOW()
  RETURNING customers.id INTO v_customer_id;

  -- If no email conflict, get the customer_id from the insert
  IF v_customer_id IS NULL THEN
    SELECT customers.id INTO v_customer_id
    FROM customers
    WHERE customers.salon_id = p_salon_id
      AND (
        (customers.email IS NOT NULL AND customers.email = p_customer_email)
        OR (customers.email IS NULL AND customers.full_name = p_customer_full_name)
      )
    LIMIT 1;
  END IF;

  -- Create booking with default status 'pending' for walk-ins, 'confirmed' for online
  INSERT INTO bookings (
    salon_id,
    employee_id,
    service_id,
    customer_id,
    start_time,
    end_time,
    status,
    is_walk_in,
    notes
  )
  VALUES (
    p_salon_id,
    p_employee_id,
    p_service_id,
    v_customer_id,
    p_start_time,
    v_end_time,
    CASE WHEN p_is_walk_in THEN 'pending' ELSE 'confirmed' END,
    p_is_walk_in,
    p_customer_notes
  )
  RETURNING bookings.id INTO v_booking_id;

  -- Return booking with related data (using explicit table prefixes)
  RETURN QUERY
  SELECT
    b.id,
    b.start_time,
    b.end_time,
    b.status,
    b.is_walk_in,
    b.notes,
    jsonb_build_object('full_name', c.full_name) as customers,
    jsonb_build_object('full_name', e.full_name) as employees,
    jsonb_build_object('name', s.name) as services
  FROM bookings b
  LEFT JOIN customers c ON b.customer_id = c.id
  LEFT JOIN employees e ON b.employee_id = e.id
  LEFT JOIN services s ON b.service_id = s.id
  WHERE b.id = v_booking_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_booking_atomic(UUID, UUID, UUID, TIMESTAMPTZ, TEXT, TEXT, TEXT, TEXT, BOOLEAN) TO authenticated;

COMMENT ON FUNCTION create_booking_atomic IS 
  'Creates a booking atomically with row-level locking to prevent race conditions. Uses SELECT ... FOR UPDATE to lock conflicting bookings during the check.';
