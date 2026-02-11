-- =====================================================
-- Core Calendar RPCs: Schedule Segments, Validate Change,
-- Find First Available Batch
-- =====================================================
-- These RPCs make the backend the single source of truth.
-- UI renders segments; it does not compute rules.
-- =====================================================

-- ─── 1. get_schedule_segments ────────────────────────

CREATE OR REPLACE FUNCTION get_schedule_segments(
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
  -- ─── Lookup salon ─────────────────────────────────────
  SELECT s.timezone, s.plan::TEXT
    INTO v_timezone, v_plan
    FROM salons s WHERE s.id = p_salon_id;

  IF v_timezone IS NULL THEN v_timezone := 'UTC'; END IF;

  -- ─── Weekday calculation ──────────────────────────────
  v_dow_pg := EXTRACT(DOW FROM (p_date::TIMESTAMP AT TIME ZONE v_timezone));
  IF v_dow_pg = 0 THEN v_dow_oh := 6;
  ELSE v_dow_oh := v_dow_pg - 1;
  END IF;

  -- ─── Check salon closure ──────────────────────────────
  v_is_closed := EXISTS (
    SELECT 1 FROM salon_closures sc WHERE sc.salon_id = p_salon_id AND sc.closed_date = p_date
  );

  -- ─── Check SHIFTS feature ────────────────────────────
  SELECT EXISTS (
    SELECT 1 FROM plan_features pf JOIN features f ON f.id = pf.feature_id
    WHERE pf.plan_type = v_plan::plan_type AND f.key = 'SHIFTS'
  ) INTO v_has_shifts_feature;

  -- ─── Loop through employees ───────────────────────────
  FOR emp IN
    SELECT e.id AS emp_id, e.full_name AS emp_name
      FROM employees e
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
          FROM shifts sh
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
        FROM opening_hours oh
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
        FROM opening_hours_breaks brk
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
        FROM time_blocks tb
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
        FROM bookings b
        LEFT JOIN customers c ON b.customer_id = c.id
        LEFT JOIN services s ON b.service_id = s.id
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

GRANT EXECUTE ON FUNCTION get_schedule_segments(UUID, DATE, UUID[]) TO authenticated;
GRANT EXECUTE ON FUNCTION get_schedule_segments(UUID, DATE, UUID[]) TO anon;

COMMENT ON FUNCTION get_schedule_segments IS
  'Returns all schedule segments for a date: working windows, breaks, time_blocks, bookings, buffers, closed. Backend is source of truth.';

-- ─── 2. validate_booking_change ──────────────────────

CREATE OR REPLACE FUNCTION validate_booking_change(
  p_booking_id UUID,
  p_new_employee_id UUID DEFAULT NULL,
  p_new_start_time TIMESTAMPTZ DEFAULT NULL,
  p_new_service_id UUID DEFAULT NULL
)
RETURNS TABLE(
  is_valid BOOLEAN,
  conflicts JSONB,
  suggested_slots JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_salon_id UUID;
  v_employee_id UUID;
  v_service_id UUID;
  v_start_time TIMESTAMPTZ;
  v_duration INTEGER;
  v_prep INTEGER;
  v_cleanup INTEGER;
  v_end_time TIMESTAMPTZ;
  v_block_start TIMESTAMPTZ;
  v_block_end TIMESTAMPTZ;
  v_timezone TEXT;
  v_dow_pg INTEGER;
  v_dow_oh INTEGER;
  v_conflicts JSONB := '[]'::JSONB;
  v_suggestions JSONB := '[]'::JSONB;
  v_has_conflict BOOLEAN := false;
  conf_rec RECORD;
  slot_rec RECORD;
BEGIN
  -- Get current booking details
  SELECT b.salon_id, b.employee_id, b.service_id, b.start_time
    INTO v_salon_id, v_employee_id, v_service_id, v_start_time
    FROM bookings b WHERE b.id = p_booking_id;

  IF v_salon_id IS NULL THEN
    is_valid := false;
    conflicts := jsonb_build_array(jsonb_build_object('type', 'not_found', 'message_code', 'booking_not_found'));
    suggested_slots := '[]'::JSONB;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Apply changes (use new values or keep existing)
  v_employee_id := COALESCE(p_new_employee_id, v_employee_id);
  v_start_time := COALESCE(p_new_start_time, v_start_time);
  v_service_id := COALESCE(p_new_service_id, v_service_id);

  -- Get salon timezone
  SELECT s.timezone INTO v_timezone FROM salons s WHERE s.id = v_salon_id;
  IF v_timezone IS NULL THEN v_timezone := 'UTC'; END IF;

  -- Get service duration + buffers
  SELECT COALESCE(sv.duration_minutes, 30),
         COALESCE(sv.prep_minutes, 0),
         COALESCE(sv.cleanup_minutes, 0)
    INTO v_duration, v_prep, v_cleanup
    FROM services sv WHERE sv.id = v_service_id;

  IF v_duration IS NULL THEN
    v_duration := 30; v_prep := 0; v_cleanup := 0;
  END IF;

  -- Calculate new times
  v_end_time := v_start_time + (v_duration || ' minutes')::INTERVAL;
  v_block_start := v_start_time - (v_prep || ' minutes')::INTERVAL;
  v_block_end := v_end_time + (v_cleanup || ' minutes')::INTERVAL;

  -- ─── Check booking overlaps (exclude self) ─────────────
  FOR conf_rec IN
    SELECT b.id, b.start_time AS c_start, b.end_time AS c_end,
           c.full_name AS customer_name, s.name AS service_name
      FROM bookings b
      LEFT JOIN customers c ON b.customer_id = c.id
      LEFT JOIN services s ON b.service_id = s.id
     WHERE b.salon_id = v_salon_id
       AND b.employee_id = v_employee_id
       AND b.id != p_booking_id
       AND b.status NOT IN ('cancelled', 'no-show')
       AND b.start_time < v_block_end
       AND b.end_time > v_block_start
  LOOP
    v_has_conflict := true;
    v_conflicts := v_conflicts || jsonb_build_array(jsonb_build_object(
      'type', 'booking_overlap',
      'start', conf_rec.c_start,
      'end', conf_rec.c_end,
      'source_id', conf_rec.id,
      'message_code', 'overlaps_booking',
      'customer_name', conf_rec.customer_name,
      'service_name', conf_rec.service_name
    ));
  END LOOP;

  -- ─── Check time_block overlaps ─────────────────────────
  FOR conf_rec IN
    SELECT tb.id, tb.start_time AS c_start, tb.end_time AS c_end,
           tb.title, tb.block_type
      FROM time_blocks tb
     WHERE tb.salon_id = v_salon_id
       AND (tb.employee_id = v_employee_id OR tb.employee_id IS NULL)
       AND (
         (tb.is_all_day AND tb.start_time::DATE = v_start_time::DATE)
         OR (NOT tb.is_all_day AND tb.start_time < v_block_end AND tb.end_time > v_block_start)
       )
  LOOP
    v_has_conflict := true;
    v_conflicts := v_conflicts || jsonb_build_array(jsonb_build_object(
      'type', 'time_block_overlap',
      'start', conf_rec.c_start,
      'end', conf_rec.c_end,
      'source_id', conf_rec.id,
      'message_code', 'overlaps_time_block',
      'title', conf_rec.title,
      'block_type', conf_rec.block_type
    ));
  END LOOP;

  -- ─── Check break overlaps ─────────────────────────────
  v_dow_pg := EXTRACT(DOW FROM (v_start_time AT TIME ZONE v_timezone));
  IF v_dow_pg = 0 THEN v_dow_oh := 6;
  ELSE v_dow_oh := v_dow_pg - 1;
  END IF;

  FOR conf_rec IN
    SELECT brk.id, brk.start_time AS b_start, brk.end_time AS b_end, brk.label
      FROM opening_hours_breaks brk
     WHERE brk.salon_id = v_salon_id
       AND brk.day_of_week = v_dow_oh
       AND (brk.employee_id IS NULL OR brk.employee_id = v_employee_id)
       AND brk.start_time < (v_block_end AT TIME ZONE v_timezone)::TIME
       AND brk.end_time > (v_block_start AT TIME ZONE v_timezone)::TIME
  LOOP
    v_has_conflict := true;
    v_conflicts := v_conflicts || jsonb_build_array(jsonb_build_object(
      'type', 'break_overlap',
      'start', (v_start_time::DATE::TEXT || ' ' || conf_rec.b_start::TEXT)::TIMESTAMP AT TIME ZONE v_timezone,
      'end', (v_start_time::DATE::TEXT || ' ' || conf_rec.b_end::TEXT)::TIMESTAMP AT TIME ZONE v_timezone,
      'source_id', conf_rec.id,
      'message_code', 'overlaps_break',
      'break_label', COALESCE(conf_rec.label, 'Break')
    ));
  END LOOP;

  -- ─── Generate suggestions if conflicts exist ───────────
  IF v_has_conflict THEN
    FOR slot_rec IN
      SELECT ga.slot_start, ga.slot_end
        FROM generate_availability(v_salon_id, v_employee_id, v_service_id, v_start_time::DATE) ga
       LIMIT 5
    LOOP
      v_suggestions := v_suggestions || jsonb_build_array(jsonb_build_object(
        'start', slot_rec.slot_start,
        'end', slot_rec.slot_end,
        'employee_id', v_employee_id
      ));
    END LOOP;
  END IF;

  -- Return result
  is_valid := NOT v_has_conflict;
  conflicts := v_conflicts;
  suggested_slots := v_suggestions;
  RETURN NEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION validate_booking_change(UUID, UUID, TIMESTAMPTZ, UUID) TO authenticated;

COMMENT ON FUNCTION validate_booking_change IS
  'Validates a proposed booking change. Returns conflicts and suggested alternative slots.';

-- ─── 3. find_first_available_slots_batch ─────────────

CREATE OR REPLACE FUNCTION find_first_available_slots_batch(
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
  -- Default date_to: 14 days from date_from
  v_date_to := COALESCE(p_date_to, p_date_from + 14);

  -- Get employee list
  -- Loop through dates, then employees, collecting slots
  v_current_date := p_date_from;
  WHILE v_current_date <= v_date_to AND v_found < p_limit LOOP
    FOR emp IN
      SELECT e.id AS emp_id, e.full_name AS emp_name
        FROM employees e
       WHERE e.salon_id = p_salon_id
         AND e.is_active = true
         AND (p_employee_ids IS NULL OR e.id = ANY(p_employee_ids))
       ORDER BY e.full_name
    LOOP
      FOR slot_rec IN
        SELECT ga.slot_start, ga.slot_end
          FROM generate_availability(p_salon_id, emp.emp_id, p_service_id, v_current_date) ga
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

GRANT EXECUTE ON FUNCTION find_first_available_slots_batch(UUID, UUID, UUID[], DATE, DATE, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION find_first_available_slots_batch(UUID, UUID, UUID[], DATE, DATE, INTEGER) TO anon;

COMMENT ON FUNCTION find_first_available_slots_batch IS
  'Finds the first N available slots across multiple employees and dates. Uses generate_availability internally.';
