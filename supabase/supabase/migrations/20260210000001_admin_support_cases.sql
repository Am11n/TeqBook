-- =====================================================
-- Admin Support Cases Table
-- =====================================================
-- Stores support cases (tickets) for the admin operations center.
-- Cases can be auto-generated from system events or manually created.
-- =====================================================

-- Step 1: Create support_cases table
-- =====================================================
CREATE TABLE IF NOT EXISTS support_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID REFERENCES salons(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN (
    'onboarding_stuck', 'payment_issue', 'login_problems',
    'booking_errors', 'high_cancellation', 'audit_spike', 'manual'
  )),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN (
    'open', 'in_progress', 'resolved', 'closed'
  )),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN (
    'low', 'medium', 'high', 'critical'
  )),
  title TEXT NOT NULL,
  description TEXT,
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 2: Indexes
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_support_cases_status ON support_cases(status);
CREATE INDEX IF NOT EXISTS idx_support_cases_type ON support_cases(type);
CREATE INDEX IF NOT EXISTS idx_support_cases_salon_id ON support_cases(salon_id) WHERE salon_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_support_cases_user_id ON support_cases(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_support_cases_assignee_id ON support_cases(assignee_id) WHERE assignee_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_support_cases_priority ON support_cases(priority);
CREATE INDEX IF NOT EXISTS idx_support_cases_created_at ON support_cases(created_at);

-- Composite index for common dashboard queries
CREATE INDEX IF NOT EXISTS idx_support_cases_status_priority ON support_cases(status, priority);

-- Step 3: Auto-update updated_at trigger
-- =====================================================
DROP TRIGGER IF EXISTS update_support_cases_updated_at ON support_cases;
CREATE TRIGGER update_support_cases_updated_at
  BEFORE UPDATE ON support_cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 4: RLS Policies
-- =====================================================
ALTER TABLE support_cases ENABLE ROW LEVEL SECURITY;

-- Only superadmins can read support cases
CREATE POLICY "Superadmins can read support cases"
  ON support_cases
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
        AND profiles.is_superadmin = true
    )
  );

-- Only superadmins can insert support cases
CREATE POLICY "Superadmins can insert support cases"
  ON support_cases
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
        AND profiles.is_superadmin = true
    )
  );

-- Only superadmins can update support cases
CREATE POLICY "Superadmins can update support cases"
  ON support_cases
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
        AND profiles.is_superadmin = true
    )
  );

-- No deletes -- cases are resolved/closed, not deleted
CREATE POLICY "No deletes on support cases"
  ON support_cases
  FOR DELETE
  USING (false);

-- Step 5: Auto-generation function for onboarding_stuck
-- =====================================================
-- This function checks for salons created > 48h ago that have
-- no employees, no services, and no bookings, and creates a
-- support case if one doesn't already exist.
-- Should be called periodically (e.g., via pg_cron or edge function).
CREATE OR REPLACE FUNCTION generate_onboarding_stuck_cases()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  created_count INTEGER := 0;
  salon_rec RECORD;
BEGIN
  FOR salon_rec IN
    SELECT s.id, s.name
    FROM salons s
    WHERE s.created_at < NOW() - INTERVAL '48 hours'
      -- No employees
      AND NOT EXISTS (SELECT 1 FROM employees e WHERE e.salon_id = s.id)
      -- No existing open/in_progress case of this type
      AND NOT EXISTS (
        SELECT 1 FROM support_cases sc
        WHERE sc.salon_id = s.id
          AND sc.type = 'onboarding_stuck'
          AND sc.status IN ('open', 'in_progress')
      )
  LOOP
    INSERT INTO support_cases (salon_id, type, priority, title, description)
    VALUES (
      salon_rec.id,
      'onboarding_stuck',
      'medium',
      'Onboarding stuck: ' || salon_rec.name,
      'Salon "' || salon_rec.name || '" was created more than 48 hours ago but has no employees, services, or bookings.'
    );
    created_count := created_count + 1;
  END LOOP;

  RETURN created_count;
END;
$$;

-- Step 6: Auto-generation function for login_problems
-- =====================================================
-- Creates a case when a user has > 5 login failures in the last hour.
CREATE OR REPLACE FUNCTION generate_login_problem_cases()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  created_count INTEGER := 0;
  user_rec RECORD;
BEGIN
  FOR user_rec IN
    SELECT sal.user_id, COUNT(*) AS failure_count
    FROM security_audit_log sal
    WHERE sal.action = 'login_failed'
      AND sal.created_at > NOW() - INTERVAL '1 hour'
      AND sal.user_id IS NOT NULL
    GROUP BY sal.user_id
    HAVING COUNT(*) > 5
  LOOP
    -- Only create if no open case exists
    IF NOT EXISTS (
      SELECT 1 FROM support_cases sc
      WHERE sc.user_id = user_rec.user_id
        AND sc.type = 'login_problems'
        AND sc.status IN ('open', 'in_progress')
    ) THEN
      INSERT INTO support_cases (user_id, type, priority, title, description)
      VALUES (
        user_rec.user_id,
        'login_problems',
        'high',
        'Multiple login failures detected',
        'User has ' || user_rec.failure_count || ' failed login attempts in the last hour.'
      );
      created_count := created_count + 1;
    END IF;
  END LOOP;

  RETURN created_count;
END;
$$;

-- Step 7: Auto-generation function for high cancellation rate
-- =====================================================
CREATE OR REPLACE FUNCTION generate_high_cancellation_cases()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  created_count INTEGER := 0;
  salon_rec RECORD;
BEGIN
  FOR salon_rec IN
    SELECT
      s.id,
      s.name,
      COUNT(*) FILTER (WHERE b.status = 'cancelled') AS cancelled,
      COUNT(*) AS total
    FROM salons s
    JOIN bookings b ON b.salon_id = s.id
    WHERE b.created_at > NOW() - INTERVAL '7 days'
    GROUP BY s.id, s.name
    HAVING COUNT(*) >= 10  -- At least 10 bookings to be meaningful
      AND (COUNT(*) FILTER (WHERE b.status = 'cancelled')::NUMERIC / COUNT(*)::NUMERIC) > 0.30
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM support_cases sc
      WHERE sc.salon_id = salon_rec.id
        AND sc.type = 'high_cancellation'
        AND sc.status IN ('open', 'in_progress')
    ) THEN
      INSERT INTO support_cases (salon_id, type, priority, title, description)
      VALUES (
        salon_rec.id,
        'high_cancellation',
        'medium',
        'High cancellation rate: ' || salon_rec.name,
        'Salon "' || salon_rec.name || '" has ' || salon_rec.cancelled || '/' || salon_rec.total || ' bookings cancelled in the last 7 days (' || ROUND((salon_rec.cancelled::NUMERIC / salon_rec.total::NUMERIC) * 100) || '%).'
      );
      created_count := created_count + 1;
    END IF;
  END LOOP;

  RETURN created_count;
END;
$$;

-- Comments
-- =====================================================
COMMENT ON TABLE support_cases IS 'Support cases (tickets) for the admin operations center. Auto-generated or manually created.';
COMMENT ON COLUMN support_cases.type IS 'Case type: onboarding_stuck, payment_issue, login_problems, booking_errors, high_cancellation, audit_spike, manual';
COMMENT ON COLUMN support_cases.status IS 'Case status: open, in_progress, resolved, closed';
COMMENT ON COLUMN support_cases.priority IS 'Case priority: low, medium, high, critical';
COMMENT ON COLUMN support_cases.metadata IS 'Additional context data as JSON';
COMMENT ON FUNCTION generate_onboarding_stuck_cases() IS 'Auto-generate support cases for salons with stalled onboarding (>48h, no employees)';
COMMENT ON FUNCTION generate_login_problem_cases() IS 'Auto-generate support cases for users with >5 login failures in 1 hour';
COMMENT ON FUNCTION generate_high_cancellation_cases() IS 'Auto-generate support cases for salons with >30% cancellation rate in 7 days';
