-- =====================================================
-- Fix weekday mapping in generate_availability
-- =====================================================
-- Root cause:
-- - shifts.weekday uses JS/PostgreSQL convention: 0=Sunday..6=Saturday
-- - opening_hours.day_of_week uses: 0=Monday..6=Sunday
-- - generate_availability previously used opening-hours mapping for shifts
--   and calculated DOW via AT TIME ZONE on DATE, which can shift weekday.
--
-- This migration:
-- 1) Calculates DOW directly from DATE (stable, no TZ day shift)
-- 2) Uses v_dow_pg for shifts.weekday
-- 3) Keeps v_dow_oh for opening_hours/day_of_week and breaks
-- =====================================================

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
  v_dow_pg INTEGER; -- 0=Sunday..6=Saturday (PG/JS)
  v_dow_oh INTEGER; -- 0=Monday..6=Sunday (opening_hours)
  v_work_start TIME;
  v_work_end TIME;
  v_slot_start TIMESTAMPTZ;
  v_slot_end TIMESTAMPTZ;
  v_block_start TIMESTAMPTZ; -- slot with prep buffer
  v_block_end TIMESTAMPTZ;   -- slot with cleanup buffer
  v_day_start TIMESTAMPTZ;
  v_day_end TIMESTAMPTZ;
  rec RECORD;
BEGIN
  -- Lookup salon
  SELECT s.timezone, s.plan::TEXT
    INTO v_timezone, v_plan
    FROM salons s
   WHERE s.id = p_salon_id;

  IF v_timezone IS NULL THEN
    v_timezone := 'UTC';
  END IF;

  -- Get service duration + buffers
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

  -- Weekday mapping
  -- IMPORTANT: Use DATE directly (not AT TIME ZONE) to avoid day-shift bugs.
  v_dow_pg := EXTRACT(DOW FROM p_day);
  IF v_dow_pg = 0 THEN
    v_dow_oh := 6;
  ELSE
    v_dow_oh := v_dow_pg - 1;
  END IF;

  -- Check salon closures
  IF EXISTS (
    SELECT 1 FROM salon_closures sc
     WHERE sc.salon_id = p_salon_id AND sc.closed_date = p_day
  ) THEN
    RETURN;
  END IF;

  -- Check SHIFTS feature
  SELECT EXISTS (
    SELECT 1
      FROM plan_features pf
      JOIN features f ON f.id = pf.feature_id
     WHERE pf.plan_type = v_plan::plan_type
       AND f.key = 'SHIFTS'
  ) INTO v_has_shifts_feature;

  -- Determine work window and generate slots
  IF v_has_shifts_feature THEN
    -- SHIFTS enabled: use shifts table (PG/JS weekday convention)
    FOR rec IN
      SELECT sh.start_time AS w_start, sh.end_time AS w_end
        FROM shifts sh
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
          SELECT 1 FROM bookings b
           WHERE b.salon_id = p_salon_id
             AND b.employee_id = p_employee_id
             AND b.status IN ('pending', 'confirmed', 'scheduled')
             AND b.start_time < v_block_end
             AND b.end_time > v_block_start
        )
        AND NOT EXISTS (
          SELECT 1 FROM time_blocks tb
           WHERE tb.salon_id = p_salon_id
             AND (tb.employee_id = p_employee_id OR tb.employee_id IS NULL)
             AND (
               (tb.is_all_day AND tb.start_time::DATE = p_day)
               OR (NOT tb.is_all_day AND tb.start_time < v_block_end AND tb.end_time > v_block_start)
             )
        )
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

      IF v_block_start >= v_day_start AND v_block_end <= v_day_end
      AND NOT EXISTS (
        SELECT 1 FROM bookings b
         WHERE b.salon_id = p_salon_id
           AND b.employee_id = p_employee_id
           AND b.status IN ('pending', 'confirmed', 'scheduled')
           AND b.start_time < v_block_end
           AND b.end_time > v_block_start
      )
      AND NOT EXISTS (
        SELECT 1 FROM opening_hours_breaks brk
         WHERE brk.salon_id = p_salon_id
           AND brk.day_of_week = v_dow_oh
           AND (brk.employee_id = p_employee_id OR brk.employee_id IS NULL)
           AND brk.start_time < (v_block_end AT TIME ZONE v_timezone)::TIME
           AND brk.end_time   > (v_block_start AT TIME ZONE v_timezone)::TIME
      )
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
  IS 'Generates available time slots with correct weekday mapping: shifts use PG/JS DOW (0=Sun), opening_hours use 0=Mon.';
