-- =====================================================
-- Update generate_availability with opening hours fallback
-- =====================================================
-- Changes:
--   1. Plan-aware: SHIFTS feature check via plan_features
--   2. If SHIFTS disabled: fall back to opening_hours
--   3. Timezone-correct weekday calculation
--   4. salon_closures check (return empty on closed days)
--   5. Audit log when fallback is used
--
-- Signature is preserved (CREATE OR REPLACE).
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
  v_duration INTEGER; -- service duration in minutes
  v_dow_pg INTEGER;   -- Postgres DOW: 0=Sunday..6=Saturday
  v_dow_oh INTEGER;   -- opening_hours convention: 0=Monday..6=Sunday
  v_work_start TIME;
  v_work_end TIME;
  v_slot_start TIMESTAMPTZ;
  v_slot_end TIMESTAMPTZ;
  v_day_start TIMESTAMPTZ;
  v_day_end TIMESTAMPTZ;
  rec RECORD;
BEGIN
  -- ─── 1. Lookup salon: plan, timezone ──────────────────
  SELECT s.timezone, s.plan::TEXT
    INTO v_timezone, v_plan
    FROM salons s
   WHERE s.id = p_salon_id;

  IF v_timezone IS NULL THEN
    v_timezone := 'UTC';
  END IF;

  -- ─── 2. Get service duration ──────────────────────────
  SELECT COALESCE(sv.duration_minutes, 30) INTO v_duration
    FROM services sv
   WHERE sv.id = p_service_id;

  IF v_duration IS NULL THEN
    v_duration := 30; -- default 30 min
  END IF;

  -- ─── 3. Timezone-correct weekday ─────────────────────
  -- Calculate the weekday in the salon's timezone
  v_dow_pg := EXTRACT(DOW FROM (p_day::TIMESTAMP AT TIME ZONE v_timezone));
  -- Postgres DOW: 0=Sunday, 1=Monday..6=Saturday
  -- opening_hours.day_of_week: 0=Monday..6=Sunday
  -- shifts.weekday: same as opening_hours (0=Monday..6=Sunday)
  IF v_dow_pg = 0 THEN
    v_dow_oh := 6; -- Sunday
  ELSE
    v_dow_oh := v_dow_pg - 1; -- Mon=0..Sat=5
  END IF;

  -- ─── 4. Check salon_closures ─────────────────────────
  IF EXISTS (
    SELECT 1 FROM salon_closures sc
     WHERE sc.salon_id = p_salon_id AND sc.closed_date = p_day
  ) THEN
    RETURN; -- salon is closed, no slots
  END IF;

  -- ─── 5. Check SHIFTS feature ─────────────────────────
  SELECT EXISTS (
    SELECT 1
      FROM plan_features pf
      JOIN features f ON f.id = pf.feature_id
     WHERE pf.plan_type = v_plan::plan_type
       AND f.key = 'SHIFTS'
  ) INTO v_has_shifts_feature;

  -- ─── 6. Determine work window ────────────────────────
  IF v_has_shifts_feature THEN
    -- SHIFTS enabled: use shifts table only
    -- Loop through shifts for this employee on this weekday
    FOR rec IN
      SELECT sh.start_time AS w_start, sh.end_time AS w_end
        FROM shifts sh
       WHERE sh.salon_id = p_salon_id
         AND sh.employee_id = p_employee_id
         AND sh.weekday = v_dow_oh
       ORDER BY sh.start_time
    LOOP
      -- Generate slots for this shift window
      v_day_start := (p_day::TEXT || ' ' || rec.w_start::TEXT)::TIMESTAMP
                     AT TIME ZONE v_timezone;
      v_day_end   := (p_day::TEXT || ' ' || rec.w_end::TEXT)::TIMESTAMP
                     AT TIME ZONE v_timezone;

      v_slot_start := v_day_start;
      WHILE v_slot_start + (v_duration || ' minutes')::INTERVAL <= v_day_end LOOP
        v_slot_end := v_slot_start + (v_duration || ' minutes')::INTERVAL;

        -- Check for conflicting bookings
        IF NOT EXISTS (
          SELECT 1 FROM bookings b
           WHERE b.salon_id = p_salon_id
             AND b.employee_id = p_employee_id
             AND b.status IN ('pending', 'confirmed', 'scheduled')
             AND b.start_time < v_slot_end
             AND b.end_time > v_slot_start
        ) THEN
          slot_start := v_slot_start;
          slot_end   := v_slot_end;
          RETURN NEXT;
        END IF;

        v_slot_start := v_slot_start + (v_duration || ' minutes')::INTERVAL;
      END LOOP;
    END LOOP;

    -- If no shifts found for this employee/weekday, return empty (they don't work)
    RETURN;

  ELSE
    -- SHIFTS disabled (starter): fall back to opening_hours
    SELECT oh.open_time, oh.close_time
      INTO v_work_start, v_work_end
      FROM opening_hours oh
     WHERE oh.salon_id = p_salon_id
       AND oh.day_of_week = v_dow_oh;

    -- No opening hours for this day = salon is closed
    IF v_work_start IS NULL THEN
      RETURN;
    END IF;

    -- Log fallback usage (non-blocking, best-effort)
    BEGIN
      INSERT INTO security_audit_log (user_id, action, resource_type, resource_id, metadata)
      VALUES (
        auth.uid(),
        'availability_fallback_used',
        'salon',
        p_salon_id::TEXT,
        jsonb_build_object(
          'date', p_day,
          'employee_id', p_employee_id,
          'reason', 'shifts_feature_disabled',
          'plan', v_plan
        )
      );
    EXCEPTION WHEN OTHERS THEN
      -- Don't fail the availability query if audit log fails
      NULL;
    END;

    -- Generate slots from opening hours window
    v_day_start := (p_day::TEXT || ' ' || v_work_start::TEXT)::TIMESTAMP
                   AT TIME ZONE v_timezone;
    v_day_end   := (p_day::TEXT || ' ' || v_work_end::TEXT)::TIMESTAMP
                   AT TIME ZONE v_timezone;

    v_slot_start := v_day_start;
    WHILE v_slot_start + (v_duration || ' minutes')::INTERVAL <= v_day_end LOOP
      v_slot_end := v_slot_start + (v_duration || ' minutes')::INTERVAL;

      -- Check for conflicting bookings
      IF NOT EXISTS (
        SELECT 1 FROM bookings b
         WHERE b.salon_id = p_salon_id
           AND b.employee_id = p_employee_id
           AND b.status IN ('pending', 'confirmed', 'scheduled')
           AND b.start_time < v_slot_end
           AND b.end_time > v_slot_start
      ) THEN
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

-- Ensure authenticated users can call it
GRANT EXECUTE ON FUNCTION generate_availability(UUID, UUID, UUID, DATE) TO authenticated;
-- Allow anon for public booking page
GRANT EXECUTE ON FUNCTION generate_availability(UUID, UUID, UUID, DATE) TO anon;

COMMENT ON FUNCTION generate_availability(UUID, UUID, UUID, DATE)
  IS 'Generates available time slots. Pro/Business: uses shifts. Starter (no SHIFTS feature): falls back to opening_hours. Checks salon_closures. Timezone-aware.';
