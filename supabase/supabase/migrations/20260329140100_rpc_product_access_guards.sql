-- =====================================================
-- RPC guards: product access for booking / availability
-- =====================================================
-- Depends on: 20260329140000_salon_product_access_trial_billing_gate.sql
-- =====================================================

-- generate_availability
CREATE OR REPLACE FUNCTION public.generate_availability(
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
  v_dow_pg INTEGER; -- 0=Sunday..6=Saturday (PG/JS)
  v_dow_oh INTEGER; -- 0=Monday..6=Sunday (opening_hours)
  v_work_start TIME;
  v_work_end TIME;
  v_slot_start TIMESTAMPTZ;
  v_slot_end TIMESTAMPTZ;
  v_block_start TIMESTAMPTZ;
  v_block_end TIMESTAMPTZ;
  v_day_start TIMESTAMPTZ;
  v_day_end TIMESTAMPTZ;
  rec RECORD;
BEGIN
  IF NOT public.salon_product_access_granted(p_salon_id) THEN
    RETURN;
  END IF;

  SELECT s.timezone, s.plan::TEXT
    INTO v_timezone, v_plan
    FROM public.salons s
   WHERE s.id = p_salon_id;

  IF v_timezone IS NULL THEN
    v_timezone := 'UTC';
  END IF;

  SELECT COALESCE(sv.duration_minutes, 30),
         COALESCE(sv.prep_minutes, 0),
         COALESCE(sv.cleanup_minutes, 0)
    INTO v_duration, v_prep, v_cleanup
    FROM public.services sv
   WHERE sv.id = p_service_id;

  IF v_duration IS NULL THEN
    v_duration := 30;
    v_prep := 0;
    v_cleanup := 0;
  END IF;

  -- Stable weekday from DATE (no timezone-shift surprises)
  v_dow_pg := EXTRACT(DOW FROM p_day);
  IF v_dow_pg = 0 THEN
    v_dow_oh := 6;
  ELSE
    v_dow_oh := v_dow_pg - 1;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.salon_closures sc
     WHERE sc.salon_id = p_salon_id AND sc.closed_date = p_day
  ) THEN
    RETURN;
  END IF;

  SELECT EXISTS (
    SELECT 1
      FROM public.plan_features pf
      JOIN public.features f ON f.id = pf.feature_id
     WHERE pf.plan_type = v_plan::plan_type
       AND f.key = 'SHIFTS'
  ) INTO v_has_shifts_feature;

  IF v_has_shifts_feature THEN
    -- STRICT mapping for shifts: 0=Sunday..6=Saturday
    FOR rec IN
      SELECT sh.start_time AS w_start, sh.end_time AS w_end
        FROM public.shifts sh
       WHERE sh.salon_id = p_salon_id
         AND sh.employee_id = p_employee_id
         AND sh.weekday = v_dow_pg
       ORDER BY sh.start_time
    LOOP
      v_day_start := (p_day::TEXT || ' ' || rec.w_start::TEXT)::TIMESTAMP AT TIME ZONE v_timezone;
      v_day_end   := (p_day::TEXT || ' ' || rec.w_end::TEXT)::TIMESTAMP AT TIME ZONE v_timezone;

      v_slot_start := v_day_start;
      WHILE v_slot_start + (v_duration || ' minutes')::INTERVAL <= v_day_end LOOP
        v_slot_end   := v_slot_start + (v_duration || ' minutes')::INTERVAL;
        v_block_start := v_slot_start - (v_prep || ' minutes')::INTERVAL;
        v_block_end   := v_slot_end + (v_cleanup || ' minutes')::INTERVAL;

        IF v_block_start >= v_day_start AND v_block_end <= v_day_end
        AND NOT EXISTS (
          SELECT 1 FROM public.bookings b
           WHERE b.salon_id = p_salon_id
             AND b.employee_id = p_employee_id
             AND b.status IN ('pending', 'confirmed', 'scheduled')
             AND b.start_time < v_block_end
             AND b.end_time > v_block_start
        )
        AND NOT EXISTS (
          SELECT 1 FROM public.time_blocks tb
           WHERE tb.salon_id = p_salon_id
             AND (tb.employee_id = p_employee_id OR tb.employee_id IS NULL)
             AND (
               (tb.is_all_day AND tb.start_time::DATE = p_day)
               OR (NOT tb.is_all_day AND tb.start_time < v_block_end AND tb.end_time > v_block_start)
             )
        )
        AND NOT EXISTS (
          SELECT 1 FROM public.opening_hours_breaks brk
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
    SELECT oh.open_time, oh.close_time
      INTO v_work_start, v_work_end
      FROM public.opening_hours oh
     WHERE oh.salon_id = p_salon_id
       AND oh.day_of_week = v_dow_oh
       AND (oh.is_closed IS NULL OR oh.is_closed = false);

    IF v_work_start IS NULL THEN
      RETURN;
    END IF;

    BEGIN
      INSERT INTO public.security_audit_log (user_id, action, resource_type, resource_id, metadata)
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

      IF v_block_start >= v_day_start AND v_block_end <= v_day_end
      AND NOT EXISTS (
        SELECT 1 FROM public.bookings b
         WHERE b.salon_id = p_salon_id
           AND b.employee_id = p_employee_id
           AND b.status IN ('pending', 'confirmed', 'scheduled')
           AND b.start_time < v_block_end
           AND b.end_time > v_block_start
      )
      AND NOT EXISTS (
        SELECT 1 FROM public.opening_hours_breaks brk
         WHERE brk.salon_id = p_salon_id
           AND brk.day_of_week = v_dow_oh
           AND (brk.employee_id = p_employee_id OR brk.employee_id IS NULL)
           AND brk.start_time < (v_block_end AT TIME ZONE v_timezone)::TIME
           AND brk.end_time   > (v_block_start AT TIME ZONE v_timezone)::TIME
      )
      AND NOT EXISTS (
        SELECT 1 FROM public.time_blocks tb
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

CREATE OR REPLACE FUNCTION public.find_first_available_slots_batch(
  p_salon_id UUID,
  p_service_id UUID,
  p_employee_ids UUID[] DEFAULT NULL,
  p_date_from DATE DEFAULT CURRENT_DATE,
  p_date_to DATE DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE(
  slot_start TIMESTAMPTZ,
  slot_end TIMESTAMPTZ,
  employee_id UUID,
  employee_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_date_to DATE;
  v_current_date DATE;
  v_found INTEGER := 0;
  emp RECORD;
  slot_rec RECORD;
BEGIN
  IF NOT public.salon_product_access_granted(p_salon_id) THEN
    RETURN;
  END IF;

  -- Default date_to: 14 days from date_from
  v_date_to := COALESCE(p_date_to, p_date_from + 14);

  -- Get employee list
  -- Loop through dates, then employees, collecting slots
  v_current_date := p_date_from;
  WHILE v_current_date <= v_date_to AND v_found < p_limit LOOP
    FOR emp IN
      SELECT e.id AS emp_id, e.full_name AS emp_name
        FROM public.employees e
       WHERE e.salon_id = p_salon_id
         AND e.is_active = true
         AND (p_employee_ids IS NULL OR e.id = ANY(p_employee_ids))
       ORDER BY e.full_name
    LOOP
      FOR slot_rec IN
        SELECT ga.slot_start, ga.slot_end
          FROM public.generate_availability(p_salon_id, emp.emp_id, p_service_id, v_current_date) ga
         ORDER BY ga.slot_start
         LIMIT (p_limit - v_found)
      LOOP
        slot_start := slot_rec.slot_start;
        slot_end := slot_rec.slot_end;
        employee_id := emp.emp_id;
        employee_name := emp.emp_name;
        RETURN NEXT;
        v_found := v_found + 1;
        IF v_found >= p_limit THEN
          RETURN;
        END IF;
      END LOOP;
    END LOOP;
    v_current_date := v_current_date + 1;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_schedule_segments(
  p_salon_id UUID,
  p_date DATE,
  p_employee_ids UUID[] DEFAULT NULL  -- NULL = all active employees
)
RETURNS TABLE(
  employee_id UUID,
  segment_type TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  metadata JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_timezone TEXT;
  v_plan TEXT;
  v_has_shifts_feature BOOLEAN;
  v_dow_pg INTEGER;
  v_dow_oh INTEGER;
  v_day_start_ts TIMESTAMP;
  v_day_end_ts TIMESTAMP;
  v_is_closed BOOLEAN;
  emp RECORD;
  shift_rec RECORD;
  oh_rec RECORD;
  brk_rec RECORD;
  tb_rec RECORD;
  bk_rec RECORD;
  v_work_start TIMESTAMPTZ;
  v_work_end TIMESTAMPTZ;
  v_has_working_window BOOLEAN;
BEGIN
  IF NOT public.salon_product_access_granted(p_salon_id) THEN
    RETURN;
  END IF;

  -- ─── Lookup salon ─────────────────────────────────────
  SELECT s.timezone, s.plan::TEXT
    INTO v_timezone, v_plan
    FROM public.salons s WHERE s.id = p_salon_id;

  IF v_timezone IS NULL THEN v_timezone := 'UTC'; END IF;

  -- ─── Weekday calculation ──────────────────────────────
  v_dow_pg := EXTRACT(DOW FROM (p_date::TIMESTAMP AT TIME ZONE v_timezone));
  IF v_dow_pg = 0 THEN v_dow_oh := 6;
  ELSE v_dow_oh := v_dow_pg - 1;
  END IF;

  -- ─── Check salon closure ──────────────────────────────
  v_is_closed := EXISTS (
    SELECT 1 FROM public.salon_closures sc WHERE sc.salon_id = p_salon_id AND sc.closed_date = p_date
  );

  -- ─── Check SHIFTS feature ────────────────────────────
  SELECT EXISTS (
    SELECT 1 FROM public.plan_features pf JOIN public.features f ON f.id = pf.feature_id
    WHERE pf.plan_type = v_plan::plan_type AND f.key = 'SHIFTS'
  ) INTO v_has_shifts_feature;

  -- ─── Loop through employees ───────────────────────────
  FOR emp IN
    SELECT e.id AS emp_id, e.full_name AS emp_name
      FROM public.employees e
     WHERE e.salon_id = p_salon_id
       AND e.is_active = true
       AND (p_employee_ids IS NULL OR e.id = ANY(p_employee_ids))
     ORDER BY e.full_name
  LOOP
    -- If salon is closed, emit a single 'closed' segment
    IF v_is_closed THEN
      employee_id := emp.emp_id;
      segment_type := 'closed';
      start_time := (p_date::TEXT || ' 00:00:00')::TIMESTAMP AT TIME ZONE v_timezone;
      end_time := (p_date::TEXT || ' 23:59:59')::TIMESTAMP AT TIME ZONE v_timezone;
      metadata := jsonb_build_object('reason_code', 'salon_closed');
      RETURN NEXT;
      CONTINUE;
    END IF;

    v_has_working_window := false;

    -- ─── Working windows ──────────────────────────────────
    IF v_has_shifts_feature THEN
      FOR shift_rec IN
        SELECT sh.start_time AS w_start, sh.end_time AS w_end
          FROM public.shifts sh
         WHERE sh.salon_id = p_salon_id
           AND sh.employee_id = emp.emp_id
           AND sh.weekday = v_dow_oh
         ORDER BY sh.start_time
      LOOP
        v_has_working_window := true;
        v_work_start := (p_date::TEXT || ' ' || shift_rec.w_start::TEXT)::TIMESTAMP AT TIME ZONE v_timezone;
        v_work_end := (p_date::TEXT || ' ' || shift_rec.w_end::TEXT)::TIMESTAMP AT TIME ZONE v_timezone;

        employee_id := emp.emp_id;
        segment_type := 'working';
        start_time := v_work_start;
        end_time := v_work_end;
        metadata := jsonb_build_object('source', 'shift');
        RETURN NEXT;
      END LOOP;

      IF NOT v_has_working_window THEN
        employee_id := emp.emp_id;
        segment_type := 'closed';
        start_time := (p_date::TEXT || ' 00:00:00')::TIMESTAMP AT TIME ZONE v_timezone;
        end_time := (p_date::TEXT || ' 23:59:59')::TIMESTAMP AT TIME ZONE v_timezone;
        metadata := jsonb_build_object('reason_code', 'no_shifts');
        RETURN NEXT;
        CONTINUE;
      END IF;
    ELSE
      -- Opening hours fallback
      SELECT oh.open_time, oh.close_time
        INTO oh_rec
        FROM public.opening_hours oh
       WHERE oh.salon_id = p_salon_id
         AND oh.day_of_week = v_dow_oh
         AND (oh.is_closed IS NULL OR oh.is_closed = false);

      IF oh_rec IS NOT NULL AND oh_rec.open_time IS NOT NULL THEN
        v_has_working_window := true;
        v_work_start := (p_date::TEXT || ' ' || oh_rec.open_time::TEXT)::TIMESTAMP AT TIME ZONE v_timezone;
        v_work_end := (p_date::TEXT || ' ' || oh_rec.close_time::TEXT)::TIMESTAMP AT TIME ZONE v_timezone;

        employee_id := emp.emp_id;
        segment_type := 'working';
        start_time := v_work_start;
        end_time := v_work_end;
        metadata := jsonb_build_object('source', 'opening_hours');
        RETURN NEXT;
      ELSE
        employee_id := emp.emp_id;
        segment_type := 'closed';
        start_time := (p_date::TEXT || ' 00:00:00')::TIMESTAMP AT TIME ZONE v_timezone;
        end_time := (p_date::TEXT || ' 23:59:59')::TIMESTAMP AT TIME ZONE v_timezone;
        metadata := jsonb_build_object('reason_code', 'no_opening_hours');
        RETURN NEXT;
        CONTINUE;
      END IF;
    END IF;

    -- ─── Breaks (salon-wide + employee-specific) ──────────
    FOR brk_rec IN
      SELECT brk.start_time AS b_start, brk.end_time AS b_end, brk.label
        FROM public.opening_hours_breaks brk
       WHERE brk.salon_id = p_salon_id
         AND brk.day_of_week = v_dow_oh
         AND (brk.employee_id IS NULL OR brk.employee_id = emp.emp_id)
       ORDER BY brk.start_time
    LOOP
      employee_id := emp.emp_id;
      segment_type := 'break';
      start_time := (p_date::TEXT || ' ' || brk_rec.b_start::TEXT)::TIMESTAMP AT TIME ZONE v_timezone;
      end_time := (p_date::TEXT || ' ' || brk_rec.b_end::TEXT)::TIMESTAMP AT TIME ZONE v_timezone;
      metadata := jsonb_build_object('break_label', COALESCE(brk_rec.label, 'Break'));
      RETURN NEXT;
    END LOOP;

    -- ─── Time blocks (salon-wide + employee-specific) ─────
    FOR tb_rec IN
      SELECT tb.id AS tb_id, tb.title, tb.block_type,
             tb.start_time AS tb_start, tb.end_time AS tb_end,
             tb.is_all_day, tb.notes AS tb_notes
        FROM public.time_blocks tb
       WHERE tb.salon_id = p_salon_id
         AND (tb.employee_id IS NULL OR tb.employee_id = emp.emp_id)
         AND (
           (tb.is_all_day AND tb.start_time::DATE = p_date)
           OR (NOT tb.is_all_day AND tb.start_time::DATE = p_date)
           OR (NOT tb.is_all_day AND tb.start_time < ((p_date + 1)::TEXT || ' 00:00:00')::TIMESTAMP AT TIME ZONE v_timezone
               AND tb.end_time > (p_date::TEXT || ' 00:00:00')::TIMESTAMP AT TIME ZONE v_timezone)
         )
       ORDER BY tb.start_time
    LOOP
      employee_id := emp.emp_id;
      segment_type := 'time_block';
      IF tb_rec.is_all_day THEN
        start_time := (p_date::TEXT || ' 00:00:00')::TIMESTAMP AT TIME ZONE v_timezone;
        end_time := (p_date::TEXT || ' 23:59:59')::TIMESTAMP AT TIME ZONE v_timezone;
      ELSE
        start_time := tb_rec.tb_start;
        end_time := tb_rec.tb_end;
      END IF;
      metadata := jsonb_build_object(
        'block_id', tb_rec.tb_id,
        'block_type', tb_rec.block_type,
        'title', tb_rec.title,
        'notes', tb_rec.tb_notes
      );
      RETURN NEXT;
    END LOOP;

    -- ─── Bookings + buffers ───────────────────────────────
    FOR bk_rec IN
      SELECT b.id AS bk_id, b.start_time AS bk_start, b.end_time AS bk_end,
             b.status AS bk_status, b.is_walk_in AS bk_walk_in, b.notes AS bk_notes,
             b.customer_id AS bk_customer_id,
             c.full_name AS customer_name, c.phone AS customer_phone,
             s.name AS service_name, s.price_cents AS service_price,
             s.duration_minutes AS service_duration,
             COALESCE(s.prep_minutes, 0) AS svc_prep,
             COALESCE(s.cleanup_minutes, 0) AS svc_cleanup
        FROM public.bookings b
        LEFT JOIN public.customers c ON b.customer_id = c.id
        LEFT JOIN public.services s ON b.service_id = s.id
       WHERE b.salon_id = p_salon_id
         AND b.employee_id = emp.emp_id
         AND b.status NOT IN ('cancelled')
         AND b.start_time < ((p_date + 1)::TEXT || ' 00:00:00')::TIMESTAMP AT TIME ZONE v_timezone
         AND b.end_time > (p_date::TEXT || ' 00:00:00')::TIMESTAMP AT TIME ZONE v_timezone
       ORDER BY b.start_time
    LOOP
      -- Emit prep buffer segment (if any)
      IF bk_rec.svc_prep > 0 THEN
        employee_id := emp.emp_id;
        segment_type := 'buffer';
        start_time := bk_rec.bk_start - (bk_rec.svc_prep || ' minutes')::INTERVAL;
        end_time := bk_rec.bk_start;
        metadata := jsonb_build_object('buffer_type', 'prep', 'booking_id', bk_rec.bk_id);
        RETURN NEXT;
      END IF;

      -- Emit booking segment
      employee_id := emp.emp_id;
      segment_type := 'booking';
      start_time := bk_rec.bk_start;
      end_time := bk_rec.bk_end;
      metadata := jsonb_build_object(
        'booking_id', bk_rec.bk_id,
        'status', bk_rec.bk_status,
        'is_walk_in', bk_rec.bk_walk_in,
        'customer_name', bk_rec.customer_name,
        'customer_phone', bk_rec.customer_phone,
        'service_name', bk_rec.service_name,
        'service_price', bk_rec.service_price,
        'service_duration', bk_rec.service_duration,
        'notes', bk_rec.bk_notes
      );
      RETURN NEXT;

      -- Emit cleanup buffer segment (if any)
      IF bk_rec.svc_cleanup > 0 THEN
        employee_id := emp.emp_id;
        segment_type := 'buffer';
        start_time := bk_rec.bk_end;
        end_time := bk_rec.bk_end + (bk_rec.svc_cleanup || ' minutes')::INTERVAL;
        metadata := jsonb_build_object('buffer_type', 'cleanup', 'booking_id', bk_rec.bk_id);
        RETURN NEXT;
      END IF;
    END LOOP;

  END LOOP; -- employees
END;
$$;

CREATE OR REPLACE FUNCTION public.create_booking_atomic(
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
  IF NOT (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND COALESCE(is_superadmin, false)
    )
    OR public.salon_product_access_granted(p_salon_id)
  ) THEN
    RAISE EXCEPTION 'SALON_BOOKING_LOCKED' USING ERRCODE = 'P0001';
  END IF;

  -- Get service duration + buffers
  SELECT services.duration_minutes,
         COALESCE(services.prep_minutes, 0),
         COALESCE(services.cleanup_minutes, 0)
    INTO v_service_duration, v_prep, v_cleanup
    FROM public.services
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
  FROM public.bookings
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
  FROM public.time_blocks tb
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
  INSERT INTO public.customers (salon_id, full_name, email, phone, notes)
  VALUES (p_salon_id, p_customer_full_name, p_customer_email, p_customer_phone, p_customer_notes)
  ON CONFLICT (salon_id, email) WHERE email IS NOT NULL
  DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(EXCLUDED.phone, customers.phone),
    notes = COALESCE(EXCLUDED.notes, customers.notes)
  RETURNING customers.id INTO v_customer_id;

  IF v_customer_id IS NULL THEN
    SELECT customers.id INTO v_customer_id
    FROM public.customers
    WHERE customers.salon_id = p_salon_id
      AND (
        (customers.email IS NOT NULL AND customers.email = p_customer_email)
        OR (customers.email IS NULL AND customers.full_name = p_customer_full_name)
      )
    LIMIT 1;
  END IF;

  -- Create booking
  INSERT INTO public.bookings (salon_id, employee_id, service_id, customer_id, start_time, end_time, status, is_walk_in, notes)
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
  FROM public.bookings b
  LEFT JOIN public.customers c ON b.customer_id = c.id
  LEFT JOIN public.employees e ON b.employee_id = e.id
  LEFT JOIN public.services s ON b.service_id = s.id
  WHERE b.id = v_booking_id;
END;
$$;
