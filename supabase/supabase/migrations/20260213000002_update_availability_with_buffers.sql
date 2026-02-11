-- =====================================================
-- Update generate_availability with buffer + time_blocks
-- =====================================================
-- Adds:
--   1. prep_minutes / cleanup_minutes from services
--   2. time_blocks overlap check (salon-wide + employee)
--   3. Extended breaks (per-employee + salon-wide)
--   4. Buffer-aware overlap in create_booking_atomic
-- =====================================================

-- ─── 1. Update generate_availability ─────────────────

CREATE OR REPLACE FUNCTION generate_availability(
  p_salon_id UUID,
  p_employee_id UUID,
  p_service_id UUID,
  p_day DATE
)
RETURNS TABLE(slot_start TIMESTAMPTZ, slot_end TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_timezone TEXT;
  v_plan TEXT;
  v_has_shifts_feature BOOLEAN;
  v_duration INTEGER;
  v_prep INTEGER;
  v_cleanup INTEGER;
  v_dow_pg INTEGER;
  v_dow_oh INTEGER;
  v_work_start TIME;
  v_work_end TIME;
  v_slot_start TIMESTAMPTZ;
  v_slot_end TIMESTAMPTZ;
  v_block_start TIMESTAMPTZ;  -- slot with prep buffer
  v_block_end TIMESTAMPTZ;    -- slot with cleanup buffer
  v_day_start TIMESTAMPTZ;
  v_day_end TIMESTAMPTZ;
  rec RECORD;
BEGIN
  -- ─── 1. Lookup salon ──────────────────────────────────
  SELECT s.timezone, s.plan::TEXT
    INTO v_timezone, v_plan
    FROM salons s
   WHERE s.id = p_salon_id;

  IF v_timezone IS NULL THEN
    v_timezone := 'UTC';
  END IF;

  -- ─── 2. Get service duration + buffers ────────────────
  SELECT COALESCE(sv.duration_minutes, 30),
         COALESCE(sv.prep_minutes, 0),
         COALESCE(sv.cleanup_minutes, 0)
    INTO v_duration, v_prep, v_cleanup
    FROM services sv
   WHERE sv.id = p_service_id;

  IF v_duration IS NULL THEN
    v_duration := 30;
    v_prep := 0;
    v_cleanup := 0;
  END IF;

  -- ─── 3. Timezone-correct weekday ─────────────────────
  v_dow_pg := EXTRACT(DOW FROM (p_day::TIMESTAMP AT TIME ZONE v_timezone));
  IF v_dow_pg = 0 THEN
    v_dow_oh := 6;
  ELSE
    v_dow_oh := v_dow_pg - 1;
  END IF;

  -- ─── 4. Check salon_closures ─────────────────────────
  IF EXISTS (
    SELECT 1 FROM salon_closures sc
     WHERE sc.salon_id = p_salon_id AND sc.closed_date = p_day
  ) THEN
    RETURN;
  END IF;

  -- ─── 5. Check SHIFTS feature ─────────────────────────
  SELECT EXISTS (
    SELECT 1
      FROM plan_features pf
      JOIN features f ON f.id = pf.feature_id
     WHERE pf.plan_type = v_plan::plan_type
       AND f.key = 'SHIFTS'
  ) INTO v_has_shifts_feature;

  -- ─── 6. Determine work window and generate slots ─────
  IF v_has_shifts_feature THEN
    -- SHIFTS enabled: use shifts table
    FOR rec IN
      SELECT sh.start_time AS w_start, sh.end_time AS w_end
        FROM shifts sh
       WHERE sh.salon_id = p_salon_id
         AND sh.employee_id = p_employee_id
         AND sh.weekday = v_dow_oh
       ORDER BY sh.start_time
    LOOP
      v_day_start := (p_day::TEXT || ' ' || rec.w_start::TEXT)::TIMESTAMP AT TIME ZONE v_timezone;
      v_day_end   := (p_day::TEXT || ' ' || rec.w_end::TEXT)::TIMESTAMP AT TIME ZONE v_timezone;

      v_slot_start := v_day_start;
      WHILE v_slot_start + (v_duration || ' minutes')::INTERVAL <= v_day_end LOOP
        v_slot_end   := v_slot_start + (v_duration || ' minutes')::INTERVAL;
        v_block_start := v_slot_start - (v_prep || ' minutes')::INTERVAL;
        v_block_end   := v_slot_end + (v_cleanup || ' minutes')::INTERVAL;

        -- Check: buffer zone must be within work window
        IF v_block_start >= v_day_start AND v_block_end <= v_day_end
        -- Check: no conflicting bookings (buffer-aware)
        AND NOT EXISTS (
          SELECT 1 FROM bookings b
           WHERE b.salon_id = p_salon_id
             AND b.employee_id = p_employee_id
             AND b.status IN ('pending', 'confirmed', 'scheduled')
             AND b.start_time < v_block_end
             AND b.end_time > v_block_start
        )
        -- Check: no time_blocks overlap
        AND NOT EXISTS (
          SELECT 1 FROM time_blocks tb
           WHERE tb.salon_id = p_salon_id
             AND (tb.employee_id = p_employee_id OR tb.employee_id IS NULL)
             AND (
               (tb.is_all_day AND tb.start_time::DATE = p_day)
               OR (NOT tb.is_all_day AND tb.start_time < v_block_end AND tb.end_time > v_block_start)
             )
        )
        -- Check: no break overlap (salon-wide + employee-specific)
        AND NOT EXISTS (
          SELECT 1 FROM opening_hours_breaks brk
           WHERE brk.salon_id = p_salon_id
             AND brk.day_of_week = v_dow_oh
             AND (brk.employee_id = p_employee_id OR brk.employee_id IS NULL)
             AND brk.start_time < (v_block_end AT TIME ZONE v_timezone)::TIME
             AND brk.end_time   > (v_block_start AT TIME ZONE v_timezone)::TIME
        )
        THEN
          slot_start := v_slot_start;
          slot_end   := v_slot_end;
          RETURN NEXT;
        END IF;

        v_slot_start := v_slot_start + (v_duration || ' minutes')::INTERVAL;
      END LOOP;
    END LOOP;

    RETURN;

  ELSE
    -- SHIFTS disabled (starter): fall back to opening_hours
    SELECT oh.open_time, oh.close_time
      INTO v_work_start, v_work_end
      FROM opening_hours oh
     WHERE oh.salon_id = p_salon_id
       AND oh.day_of_week = v_dow_oh
       AND (oh.is_closed IS NULL OR oh.is_closed = false);

    IF v_work_start IS NULL THEN
      RETURN;
    END IF;

    -- Log fallback usage
    BEGIN
      INSERT INTO security_audit_log (user_id, action, resource_type, resource_id, metadata)
      VALUES (
        auth.uid(),
        'availability_fallback_used',
        'salon',
        p_salon_id::TEXT,
        jsonb_build_object('date', p_day, 'employee_id', p_employee_id, 'reason', 'shifts_feature_disabled', 'plan', v_plan)
      );
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;

    v_day_start := (p_day::TEXT || ' ' || v_work_start::TEXT)::TIMESTAMP AT TIME ZONE v_timezone;
    v_day_end   := (p_day::TEXT || ' ' || v_work_end::TEXT)::TIMESTAMP AT TIME ZONE v_timezone;

    v_slot_start := v_day_start;
    WHILE v_slot_start + (v_duration || ' minutes')::INTERVAL <= v_day_end LOOP
      v_slot_end   := v_slot_start + (v_duration || ' minutes')::INTERVAL;
      v_block_start := v_slot_start - (v_prep || ' minutes')::INTERVAL;
      v_block_end   := v_slot_end + (v_cleanup || ' minutes')::INTERVAL;

      -- Check: buffer zone must be within work window (relaxed: only slot itself must fit)
      IF v_block_start >= v_day_start AND v_block_end <= v_day_end
      -- Check: no conflicting bookings (buffer-aware)
      AND NOT EXISTS (
        SELECT 1 FROM bookings b
         WHERE b.salon_id = p_salon_id
           AND b.employee_id = p_employee_id
           AND b.status IN ('pending', 'confirmed', 'scheduled')
           AND b.start_time < v_block_end
           AND b.end_time > v_block_start
      )
      -- Check: no break overlap (salon-wide + employee-specific)
      AND NOT EXISTS (
        SELECT 1 FROM opening_hours_breaks brk
         WHERE brk.salon_id = p_salon_id
           AND brk.day_of_week = v_dow_oh
           AND (brk.employee_id = p_employee_id OR brk.employee_id IS NULL)
           AND brk.start_time < (v_block_end AT TIME ZONE v_timezone)::TIME
           AND brk.end_time   > (v_block_start AT TIME ZONE v_timezone)::TIME
      )
      -- Check: no time_blocks overlap
      AND NOT EXISTS (
        SELECT 1 FROM time_blocks tb
         WHERE tb.salon_id = p_salon_id
           AND (tb.employee_id = p_employee_id OR tb.employee_id IS NULL)
           AND (
             (tb.is_all_day AND tb.start_time::DATE = p_day)
             OR (NOT tb.is_all_day AND tb.start_time < v_block_end AND tb.end_time > v_block_start)
           )
      )
      THEN
        slot_start := v_slot_start;
        slot_end   := v_slot_end;
        RETURN NEXT;
      END IF;

      v_slot_start := v_slot_start + (v_duration || ' minutes')::INTERVAL;
    END LOOP;

    RETURN;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION generate_availability(UUID, UUID, UUID, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_availability(UUID, UUID, UUID, DATE) TO anon;

COMMENT ON FUNCTION generate_availability(UUID, UUID, UUID, DATE)
  IS 'Generates available time slots. Buffer-aware (prep/cleanup). Checks time_blocks, breaks (salon+employee), closures. Timezone-aware.';

-- ─── 2. Update create_booking_atomic with buffer-aware overlap ───

DROP FUNCTION IF EXISTS create_booking_atomic(UUID, UUID, UUID, TIMESTAMPTZ, TEXT, TEXT, TEXT, TEXT, BOOLEAN);

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
  -- Get service duration + buffers
  SELECT services.duration_minutes,
         COALESCE(services.prep_minutes, 0),
         COALESCE(services.cleanup_minutes, 0)
    INTO v_service_duration, v_prep, v_cleanup
    FROM services
   WHERE services.id = p_service_id AND services.salon_id = p_salon_id;

  IF v_service_duration IS NULL THEN
    RAISE EXCEPTION 'Service not found or does not belong to salon';
  END IF;

  -- Calculate end time and buffer zone
  v_end_time    := p_start_time + (v_service_duration || ' minutes')::INTERVAL;
  v_block_start := p_start_time - (v_prep || ' minutes')::INTERVAL;
  v_block_end   := v_end_time + (v_cleanup || ' minutes')::INTERVAL;

  -- ATOMIC CHECK: Lock and check for overlapping bookings (buffer-aware)
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

  -- Check for time_block overlap
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

  -- Upsert customer
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

  -- Create booking
  INSERT INTO bookings (salon_id, employee_id, service_id, customer_id, start_time, end_time, status, is_walk_in, notes)
  VALUES (
    p_salon_id, p_employee_id, p_service_id, v_customer_id,
    p_start_time, v_end_time,
    CASE WHEN p_is_walk_in THEN 'pending' ELSE 'confirmed' END,
    p_is_walk_in, p_customer_notes
  )
  RETURNING bookings.id INTO v_booking_id;

  -- Return booking with related data
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
$$;

GRANT EXECUTE ON FUNCTION create_booking_atomic(UUID, UUID, UUID, TIMESTAMPTZ, TEXT, TEXT, TEXT, TEXT, BOOLEAN) TO authenticated;

COMMENT ON FUNCTION create_booking_atomic IS
  'Creates a booking atomically with buffer-aware overlap checking. Checks time_blocks. Uses SELECT ... FOR UPDATE.';
