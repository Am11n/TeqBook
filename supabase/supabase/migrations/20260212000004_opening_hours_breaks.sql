-- =====================================================
-- Opening Hours Breaks Table + generate_availability update
-- =====================================================
-- Adds a breaks table (1 break per day per salon) for
-- lunch/short breaks. Updates generate_availability to
-- exclude slots that overlap with breaks.
-- =====================================================

-- ─── 0. Add is_closed column to opening_hours ────────
-- This column was referenced in code but never added to the schema.
ALTER TABLE opening_hours ADD COLUMN IF NOT EXISTS is_closed BOOLEAN NOT NULL DEFAULT false;
COMMENT ON COLUMN opening_hours.is_closed IS 'Whether the salon is closed on this day of the week';

-- ─── 1. Create opening_hours_breaks table ─────────────

CREATE TABLE IF NOT EXISTS opening_hours_breaks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id    UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time  TIME NOT NULL,
  end_time    TIME NOT NULL,
  label       TEXT,  -- e.g. "Lunch"
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_time > start_time),
  UNIQUE(salon_id, day_of_week)  -- 1 break per day per salon
);

COMMENT ON TABLE opening_hours_breaks IS 'Breaks (e.g. lunch) per day of week per salon. Max 1 per day enforced by unique constraint.';
COMMENT ON COLUMN opening_hours_breaks.day_of_week IS 'Day of week: 0 = Monday, 1 = Tuesday, ..., 6 = Sunday';
COMMENT ON COLUMN opening_hours_breaks.label IS 'Optional label, e.g. "Lunch", "Short break"';

-- Index for fast lookup by salon + day
CREATE INDEX IF NOT EXISTS idx_ohb_salon_day ON opening_hours_breaks(salon_id, day_of_week);

-- Auto-update updated_at on UPDATE
CREATE OR REPLACE FUNCTION update_ohb_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS opening_hours_breaks_updated_at ON opening_hours_breaks;
CREATE TRIGGER opening_hours_breaks_updated_at
  BEFORE UPDATE ON opening_hours_breaks
  FOR EACH ROW
  EXECUTE FUNCTION update_ohb_updated_at();

-- ─── 2. Enable RLS ───────────────────────────────────

ALTER TABLE opening_hours_breaks ENABLE ROW LEVEL SECURITY;

-- ─── 3. RLS Policies (same pattern as opening_hours) ─

-- Drop existing policies first (idempotent re-run)
DROP POLICY IF EXISTS "Users can view breaks for their salon" ON opening_hours_breaks;
DROP POLICY IF EXISTS "Users can insert breaks for their salon" ON opening_hours_breaks;
DROP POLICY IF EXISTS "Users can update breaks for their salon" ON opening_hours_breaks;
DROP POLICY IF EXISTS "Users can delete breaks for their salon" ON opening_hours_breaks;

-- SELECT: salon owners + superadmins
CREATE POLICY "Users can view breaks for their salon"
  ON opening_hours_breaks
  FOR SELECT
  USING (
    salon_id IN (
      SELECT p.salon_id FROM profiles p WHERE p.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.is_superadmin = true
    )
  );

-- INSERT: salon owners + superadmins
CREATE POLICY "Users can insert breaks for their salon"
  ON opening_hours_breaks
  FOR INSERT
  WITH CHECK (
    salon_id IN (
      SELECT p.salon_id FROM profiles p WHERE p.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.is_superadmin = true
    )
  );

-- UPDATE: salon owners + superadmins
CREATE POLICY "Users can update breaks for their salon"
  ON opening_hours_breaks
  FOR UPDATE
  USING (
    salon_id IN (
      SELECT p.salon_id FROM profiles p WHERE p.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.is_superadmin = true
    )
  );

-- DELETE: salon owners + superadmins
CREATE POLICY "Users can delete breaks for their salon"
  ON opening_hours_breaks
  FOR DELETE
  USING (
    salon_id IN (
      SELECT p.salon_id FROM profiles p WHERE p.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.is_superadmin = true
    )
  );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON opening_hours_breaks TO authenticated;

-- ─── 4. Update generate_availability ─────────────────
-- Add break overlap check in the opening_hours fallback branch.
-- Slots that overlap a break are skipped.

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
  v_dow_pg := EXTRACT(DOW FROM (p_day::TIMESTAMP AT TIME ZONE v_timezone));
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
    FOR rec IN
      SELECT sh.start_time AS w_start, sh.end_time AS w_end
        FROM shifts sh
       WHERE sh.salon_id = p_salon_id
         AND sh.employee_id = p_employee_id
         AND sh.weekday = v_dow_oh
       ORDER BY sh.start_time
    LOOP
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
      )
      -- Check for break overlap (slot is skipped if it overlaps any break)
      AND NOT EXISTS (
        SELECT 1 FROM opening_hours_breaks brk
         WHERE brk.salon_id = p_salon_id
           AND brk.day_of_week = v_dow_oh
           AND brk.start_time < (v_slot_end AT TIME ZONE v_timezone)::TIME
           AND brk.end_time   > (v_slot_start AT TIME ZONE v_timezone)::TIME
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

-- Ensure authenticated users can call it
GRANT EXECUTE ON FUNCTION generate_availability(UUID, UUID, UUID, DATE) TO authenticated;
-- Allow anon for public booking page
GRANT EXECUTE ON FUNCTION generate_availability(UUID, UUID, UUID, DATE) TO anon;

COMMENT ON FUNCTION generate_availability(UUID, UUID, UUID, DATE)
  IS 'Generates available time slots. Pro/Business: uses shifts. Starter (no SHIFTS feature): falls back to opening_hours, excludes breaks. Checks salon_closures. Timezone-aware.';
