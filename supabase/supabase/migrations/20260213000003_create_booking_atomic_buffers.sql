-- Buffer-aware create_booking_atomic (single-statement migration for Supabase CLI).
-- Depends on: time_blocks, generate_availability buffers (20260213000002).

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
AS $bookatom$
DECLARE
  v_service_duration INTEGER;
  v_prep INTEGER;
  v_cleanup INTEGER;
  v_end_time TIMESTAMPTZ;
  v_block_start TIMESTAMPTZ;
  v_block_end TIMESTAMPTZ;
  v_customer_id UUID;
  v_booking_id UUID;
  v_conflicting_booking_id UUID;
  v_conflicting_block_id UUID;
BEGIN
  SELECT services.duration_minutes,
         COALESCE(services.prep_minutes, 0),
         COALESCE(services.cleanup_minutes, 0)
    INTO v_service_duration, v_prep, v_cleanup
    FROM services
   WHERE services.id = p_service_id AND services.salon_id = p_salon_id;

  IF v_service_duration IS NULL THEN
    RAISE EXCEPTION 'Service not found or does not belong to salon';
  END IF;

  v_end_time    := p_start_time + (v_service_duration || ' minutes')::INTERVAL;
  v_block_start := p_start_time - (v_prep || ' minutes')::INTERVAL;
  v_block_end   := v_end_time + (v_cleanup || ' minutes')::INTERVAL;

  SELECT bookings.id INTO v_conflicting_booking_id
  FROM bookings
  WHERE bookings.salon_id = p_salon_id
    AND bookings.employee_id = p_employee_id
    AND bookings.start_time < v_block_end
    AND bookings.end_time > v_block_start
    AND bookings.status NOT IN ('cancelled', 'no-show')
  FOR UPDATE
  LIMIT 1;

  IF v_conflicting_booking_id IS NOT NULL THEN
    RAISE EXCEPTION 'Time slot is already booked (including buffer time). Please select another time.';
  END IF;

  SELECT tb.id INTO v_conflicting_block_id
  FROM time_blocks tb
  WHERE tb.salon_id = p_salon_id
    AND (tb.employee_id = p_employee_id OR tb.employee_id IS NULL)
    AND (
      (tb.is_all_day AND tb.start_time::DATE = p_start_time::DATE)
      OR (NOT tb.is_all_day AND tb.start_time < v_block_end AND tb.end_time > v_block_start)
    )
  LIMIT 1;

  IF v_conflicting_block_id IS NOT NULL THEN
    RAISE EXCEPTION 'Time slot overlaps with a blocked time period. Please select another time.';
  END IF;

  INSERT INTO customers (salon_id, full_name, email, phone, notes)
  VALUES (p_salon_id, p_customer_full_name, p_customer_email, p_customer_phone, p_customer_notes)
  ON CONFLICT (salon_id, email) WHERE email IS NOT NULL
  DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(EXCLUDED.phone, customers.phone),
    notes = COALESCE(EXCLUDED.notes, customers.notes)
  RETURNING customers.id INTO v_customer_id;

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

  INSERT INTO bookings (salon_id, employee_id, service_id, customer_id, start_time, end_time, status, is_walk_in, notes)
  VALUES (
    p_salon_id, p_employee_id, p_service_id, v_customer_id,
    p_start_time, v_end_time,
    CASE WHEN p_is_walk_in THEN 'pending' ELSE 'confirmed' END,
    p_is_walk_in, p_customer_notes
  )
  RETURNING bookings.id INTO v_booking_id;

  RETURN QUERY
  SELECT b.id, b.start_time, b.end_time, b.status, b.is_walk_in, b.notes,
    jsonb_build_object('full_name', c.full_name) as customers,
    jsonb_build_object('full_name', e.full_name) as employees,
    jsonb_build_object('name', s.name) as services
  FROM bookings b
  LEFT JOIN customers c ON b.customer_id = c.id
  LEFT JOIN employees e ON b.employee_id = e.id
  LEFT JOIN services s ON b.service_id = s.id
  WHERE b.id = v_booking_id;
END;
$bookatom$;
