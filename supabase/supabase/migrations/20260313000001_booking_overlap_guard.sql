-- =====================================================
-- Booking overlap hard guard + atomic booking update
-- =====================================================
-- Adds DB-level overlap protection for active bookings and
-- introduces an atomic update RPC for reschedule/employee changes.

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE bookings
  DROP CONSTRAINT IF EXISTS bookings_no_overlapping_active_slots;

ALTER TABLE bookings
  ADD CONSTRAINT bookings_no_overlapping_active_slots
  EXCLUDE USING gist (
    salon_id WITH =,
    employee_id WITH =,
    tstzrange(start_time, end_time, '[)') WITH &&
  )
  WHERE (status IN ('pending', 'confirmed', 'scheduled'));

DROP FUNCTION IF EXISTS update_booking_atomic(UUID, UUID, TIMESTAMPTZ, TIMESTAMPTZ, UUID, TEXT, TEXT);

CREATE OR REPLACE FUNCTION update_booking_atomic(
  p_salon_id UUID,
  p_booking_id UUID,
  p_start_time TIMESTAMPTZ DEFAULT NULL,
  p_end_time TIMESTAMPTZ DEFAULT NULL,
  p_employee_id UUID DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
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
  v_booking RECORD;
  v_target_start TIMESTAMPTZ;
  v_target_end TIMESTAMPTZ;
  v_target_employee UUID;
  v_target_status TEXT;
  v_target_notes TEXT;
  v_duration INTERVAL;
BEGIN
  SELECT b.*
  INTO v_booking
  FROM bookings b
  WHERE b.id = p_booking_id
    AND b.salon_id = p_salon_id
  FOR UPDATE;

  IF v_booking.id IS NULL THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  v_target_employee := COALESCE(p_employee_id, v_booking.employee_id);
  v_target_status := COALESCE(p_status, v_booking.status);
  v_target_notes := COALESCE(p_notes, v_booking.notes);

  v_duration := v_booking.end_time - v_booking.start_time;
  v_target_start := COALESCE(p_start_time, v_booking.start_time);
  v_target_end := COALESCE(p_end_time, CASE WHEN p_start_time IS NOT NULL THEN p_start_time + v_duration ELSE v_booking.end_time END);

  IF v_target_end <= v_target_start THEN
    RAISE EXCEPTION 'Invalid booking time range';
  END IF;

  -- Explicit pre-check improves error clarity for API clients.
  PERFORM 1
  FROM bookings b
  WHERE b.salon_id = p_salon_id
    AND b.employee_id = v_target_employee
    AND b.id <> p_booking_id
    AND b.status IN ('pending', 'confirmed', 'scheduled')
    AND tstzrange(b.start_time, b.end_time, '[)') && tstzrange(v_target_start, v_target_end, '[)');

  IF FOUND THEN
    RAISE EXCEPTION 'Time slot is already booked. Please select another time.';
  END IF;

  UPDATE bookings
  SET
    employee_id = v_target_employee,
    start_time = v_target_start,
    end_time = v_target_end,
    status = v_target_status,
    notes = v_target_notes,
    updated_at = NOW()
  WHERE bookings.id = p_booking_id
    AND bookings.salon_id = p_salon_id;

  RETURN QUERY
  SELECT
    b.id,
    b.start_time,
    b.end_time,
    b.status,
    b.is_walk_in,
    b.notes,
    jsonb_build_object('full_name', c.full_name) as customers,
    jsonb_build_object('id', e.id, 'full_name', e.full_name) as employees,
    jsonb_build_object('name', s.name) as services
  FROM bookings b
  LEFT JOIN customers c ON b.customer_id = c.id
  LEFT JOIN employees e ON b.employee_id = e.id
  LEFT JOIN services s ON b.service_id = s.id
  WHERE b.id = p_booking_id;
END;
$$;

REVOKE ALL ON FUNCTION update_booking_atomic(UUID, UUID, TIMESTAMPTZ, TIMESTAMPTZ, UUID, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION update_booking_atomic(UUID, UUID, TIMESTAMPTZ, TIMESTAMPTZ, UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_booking_atomic(UUID, UUID, TIMESTAMPTZ, TIMESTAMPTZ, UUID, TEXT, TEXT) TO service_role;

COMMENT ON FUNCTION update_booking_atomic IS
  'Atomically updates booking schedule/employee/state with conflict checks to prevent race-condition double booking.';

