-- Fix weekday mapping regression in get_schedule_segments.
-- Symptom: Monday can be treated as Sunday for salons in positive-offset timezones.
-- Root cause:
--   1) DOW was computed from (p_date::timestamp AT TIME ZONE v_timezone), which can shift date back one day.
--   2) shifts.weekday comparison used opening-hours mapping (v_dow_oh) instead of PG/JS mapping (v_dow_pg).

CREATE OR REPLACE FUNCTION public.get_schedule_segments(
  p_salon_id UUID,
  p_date DATE,
  p_employee_ids UUID[] DEFAULT NULL
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

  SELECT s.timezone, s.plan::TEXT
    INTO v_timezone, v_plan
    FROM public.salons s
   WHERE s.id = p_salon_id;

  IF v_timezone IS NULL THEN
    v_timezone := 'UTC';
  END IF;

  -- p_date is already the salon-local date selected in UI; do not timezone-shift before DOW.
  v_dow_pg := EXTRACT(DOW FROM p_date);
  IF v_dow_pg = 0 THEN
    v_dow_oh := 6;
  ELSE
    v_dow_oh := v_dow_pg - 1;
  END IF;

  v_is_closed := EXISTS (
    SELECT 1
      FROM public.salon_closures sc
     WHERE sc.salon_id = p_salon_id
       AND sc.closed_date = p_date
  );

  SELECT EXISTS (
    SELECT 1
      FROM public.plan_features pf
      JOIN public.features f ON f.id = pf.feature_id
     WHERE pf.plan_type = v_plan::plan_type
       AND f.key = 'SHIFTS'
  ) INTO v_has_shifts_feature;

  FOR emp IN
    SELECT e.id AS emp_id, e.full_name AS emp_name
      FROM public.employees e
     WHERE e.salon_id = p_salon_id
       AND e.is_active = true
       AND (p_employee_ids IS NULL OR e.id = ANY(p_employee_ids))
     ORDER BY e.full_name
  LOOP
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

    IF v_has_shifts_feature THEN
      FOR shift_rec IN
        SELECT sh.start_time AS w_start, sh.end_time AS w_end
          FROM public.shifts sh
         WHERE sh.salon_id = p_salon_id
           AND sh.employee_id = emp.emp_id
           AND sh.weekday = v_dow_pg
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

    FOR bk_rec IN
      SELECT b.id AS bk_id, b.start_time AS bk_start, b.end_time AS bk_end,
             b.status AS bk_status, b.is_walk_in AS bk_walk_in, b.notes AS bk_notes,
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
      IF bk_rec.svc_prep > 0 THEN
        employee_id := emp.emp_id;
        segment_type := 'buffer';
        start_time := bk_rec.bk_start - (bk_rec.svc_prep || ' minutes')::INTERVAL;
        end_time := bk_rec.bk_start;
        metadata := jsonb_build_object('buffer_type', 'prep', 'booking_id', bk_rec.bk_id);
        RETURN NEXT;
      END IF;

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

      IF bk_rec.svc_cleanup > 0 THEN
        employee_id := emp.emp_id;
        segment_type := 'buffer';
        start_time := bk_rec.bk_end;
        end_time := bk_rec.bk_end + (bk_rec.svc_cleanup || ' minutes')::INTERVAL;
        metadata := jsonb_build_object('buffer_type', 'cleanup', 'booking_id', bk_rec.bk_id);
        RETURN NEXT;
      END IF;
    END LOOP;
  END LOOP;
END;
$$;

COMMENT ON FUNCTION public.get_schedule_segments(UUID, DATE, UUID[])
IS 'Returns schedule segments with correct weekday mapping: p_date is treated as local date (no timezone date-shift), shifts use PG/JS weekday (0=Sun), opening_hours use 0=Mon.';
