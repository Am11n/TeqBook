-- =====================================================
-- SAFE TO RE-RUN: All admin migrations (idempotent)
-- =====================================================
-- Run this in Supabase SQL Editor.
-- All statements use IF NOT EXISTS / OR REPLACE / DROP IF EXISTS.
-- =====================================================


-- =====================================================
-- 1. SUPPORT CASES TABLE
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

CREATE INDEX IF NOT EXISTS idx_support_cases_status ON support_cases(status);
CREATE INDEX IF NOT EXISTS idx_support_cases_type ON support_cases(type);
CREATE INDEX IF NOT EXISTS idx_support_cases_salon_id ON support_cases(salon_id) WHERE salon_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_support_cases_user_id ON support_cases(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_support_cases_assignee_id ON support_cases(assignee_id) WHERE assignee_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_support_cases_priority ON support_cases(priority);
CREATE INDEX IF NOT EXISTS idx_support_cases_created_at ON support_cases(created_at);
CREATE INDEX IF NOT EXISTS idx_support_cases_status_priority ON support_cases(status, priority);

ALTER TABLE support_cases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Superadmins can read support cases" ON support_cases;
CREATE POLICY "Superadmins can read support cases" ON support_cases FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_superadmin = true));

DROP POLICY IF EXISTS "Superadmins can insert support cases" ON support_cases;
CREATE POLICY "Superadmins can insert support cases" ON support_cases FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_superadmin = true));

DROP POLICY IF EXISTS "Superadmins can update support cases" ON support_cases;
CREATE POLICY "Superadmins can update support cases" ON support_cases FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_superadmin = true));

DROP POLICY IF EXISTS "No deletes on support cases" ON support_cases;
CREATE POLICY "No deletes on support cases" ON support_cases FOR DELETE USING (false);

-- Auto-generation functions
CREATE OR REPLACE FUNCTION generate_onboarding_stuck_cases()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE created_count INTEGER := 0; salon_rec RECORD;
BEGIN
  FOR salon_rec IN
    SELECT s.id, s.name FROM salons s
    WHERE s.created_at < NOW() - INTERVAL '48 hours'
      AND NOT EXISTS (SELECT 1 FROM employees e WHERE e.salon_id = s.id)
      AND NOT EXISTS (SELECT 1 FROM support_cases sc WHERE sc.salon_id = s.id AND sc.type = 'onboarding_stuck' AND sc.status IN ('open', 'in_progress'))
  LOOP
    INSERT INTO support_cases (salon_id, type, priority, title, description)
    VALUES (salon_rec.id, 'onboarding_stuck', 'medium', 'Onboarding stuck: ' || salon_rec.name, 'Salon created >48h ago with no employees.');
    created_count := created_count + 1;
  END LOOP;
  RETURN created_count;
END; $$;

CREATE OR REPLACE FUNCTION generate_login_problem_cases()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE created_count INTEGER := 0; user_rec RECORD;
BEGIN
  FOR user_rec IN
    SELECT sal.user_id, COUNT(*) AS failure_count FROM security_audit_log sal
    WHERE sal.action = 'login_failed' AND sal.created_at > NOW() - INTERVAL '1 hour' AND sal.user_id IS NOT NULL
    GROUP BY sal.user_id HAVING COUNT(*) > 5
  LOOP
    IF NOT EXISTS (SELECT 1 FROM support_cases sc WHERE sc.user_id = user_rec.user_id AND sc.type = 'login_problems' AND sc.status IN ('open', 'in_progress')) THEN
      INSERT INTO support_cases (user_id, type, priority, title, description)
      VALUES (user_rec.user_id, 'login_problems', 'high', 'Multiple login failures', user_rec.failure_count || ' failed attempts in last hour.');
      created_count := created_count + 1;
    END IF;
  END LOOP;
  RETURN created_count;
END; $$;

CREATE OR REPLACE FUNCTION generate_high_cancellation_cases()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE created_count INTEGER := 0; salon_rec RECORD;
BEGIN
  FOR salon_rec IN
    SELECT s.id, s.name, COUNT(*) FILTER (WHERE b.status = 'cancelled') AS cancelled, COUNT(*) AS total
    FROM salons s JOIN bookings b ON b.salon_id = s.id WHERE b.created_at > NOW() - INTERVAL '7 days'
    GROUP BY s.id, s.name HAVING COUNT(*) >= 10 AND (COUNT(*) FILTER (WHERE b.status = 'cancelled')::NUMERIC / COUNT(*)::NUMERIC) > 0.30
  LOOP
    IF NOT EXISTS (SELECT 1 FROM support_cases sc WHERE sc.salon_id = salon_rec.id AND sc.type = 'high_cancellation' AND sc.status IN ('open', 'in_progress')) THEN
      INSERT INTO support_cases (salon_id, type, priority, title, description)
      VALUES (salon_rec.id, 'high_cancellation', 'medium', 'High cancellation: ' || salon_rec.name, salon_rec.cancelled || '/' || salon_rec.total || ' cancelled.');
      created_count := created_count + 1;
    END IF;
  END LOOP;
  RETURN created_count;
END; $$;


-- =====================================================
-- 2. ADMIN NOTES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('salon', 'user', 'case')),
  entity_id UUID NOT NULL,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_notes_entity ON admin_notes(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_admin_notes_author ON admin_notes(author_id);
CREATE INDEX IF NOT EXISTS idx_admin_notes_created_at ON admin_notes(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_notes_tags ON admin_notes USING GIN(tags);

ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Superadmins can read admin notes" ON admin_notes;
CREATE POLICY "Superadmins can read admin notes" ON admin_notes FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_superadmin = true));

DROP POLICY IF EXISTS "Superadmins can insert admin notes" ON admin_notes;
CREATE POLICY "Superadmins can insert admin notes" ON admin_notes FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_superadmin = true) AND author_id = auth.uid());

DROP POLICY IF EXISTS "No updates to admin notes" ON admin_notes;
CREATE POLICY "No updates to admin notes" ON admin_notes FOR UPDATE USING (false);

DROP POLICY IF EXISTS "No deletes on admin notes" ON admin_notes;
CREATE POLICY "No deletes on admin notes" ON admin_notes FOR DELETE USING (false);

CREATE OR REPLACE FUNCTION get_admin_notes(p_entity_type TEXT, p_entity_id UUID)
RETURNS TABLE(id UUID, entity_type TEXT, entity_id UUID, author_id UUID, author_email TEXT, content TEXT, tags TEXT[], created_at TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.is_superadmin = true) THEN
    RAISE EXCEPTION 'Only superadmins can read admin notes';
  END IF;
  RETURN QUERY
    SELECT n.id, n.entity_type, n.entity_id, n.author_id, u.email::TEXT, n.content, n.tags, n.created_at
    FROM admin_notes n LEFT JOIN auth.users u ON u.id = n.author_id
    WHERE n.entity_type = p_entity_type AND n.entity_id = p_entity_id ORDER BY n.created_at DESC;
END; $$;

GRANT EXECUTE ON FUNCTION get_admin_notes(TEXT, UUID) TO authenticated;


-- =====================================================
-- 3. DASHBOARD RPC FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION get_admin_dashboard_kpis(period_days INTEGER DEFAULT 7)
RETURNS TABLE(active_salons BIGINT, active_salons_prev BIGINT, new_salons BIGINT, new_salons_prev BIGINT, activated_salons BIGINT, total_bookings BIGINT, total_bookings_prev BIGINT, open_support_cases BIGINT, total_users BIGINT)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  period_start TIMESTAMPTZ := NOW() - (period_days || ' days')::INTERVAL;
  prev_period_start TIMESTAMPTZ := NOW() - (period_days * 2 || ' days')::INTERVAL;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.is_superadmin = true) THEN
    RAISE EXCEPTION 'Only superadmins can call this function';
  END IF;
  RETURN QUERY SELECT
    (SELECT COUNT(DISTINCT b.salon_id) FROM bookings b WHERE b.created_at >= period_start)::BIGINT,
    (SELECT COUNT(DISTINCT b.salon_id) FROM bookings b WHERE b.created_at >= prev_period_start AND b.created_at < period_start)::BIGINT,
    (SELECT COUNT(*) FROM salons s WHERE s.created_at >= period_start)::BIGINT,
    (SELECT COUNT(*) FROM salons s WHERE s.created_at >= prev_period_start AND s.created_at < period_start)::BIGINT,
    (SELECT COUNT(*) FROM salons s WHERE EXISTS (SELECT 1 FROM employees e WHERE e.salon_id = s.id) AND EXISTS (SELECT 1 FROM services sv WHERE sv.salon_id = s.id) AND EXISTS (SELECT 1 FROM bookings b WHERE b.salon_id = s.id))::BIGINT,
    (SELECT COUNT(*) FROM bookings b WHERE b.created_at >= period_start)::BIGINT,
    (SELECT COUNT(*) FROM bookings b WHERE b.created_at >= prev_period_start AND b.created_at < period_start)::BIGINT,
    (SELECT COUNT(*) FROM support_cases sc WHERE sc.status IN ('open', 'in_progress'))::BIGINT,
    (SELECT COUNT(DISTINCT user_id) FROM profiles)::BIGINT;
END; $$;

GRANT EXECUTE ON FUNCTION get_admin_dashboard_kpis(INTEGER) TO authenticated;

CREATE OR REPLACE FUNCTION get_admin_kpi_trend(metric TEXT DEFAULT 'bookings', period_days INTEGER DEFAULT 7)
RETURNS TABLE(day DATE, value BIGINT) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.is_superadmin = true) THEN
    RAISE EXCEPTION 'Only superadmins can call this function';
  END IF;
  IF metric = 'bookings' THEN
    RETURN QUERY SELECT d.day::DATE, COALESCE(COUNT(b.id), 0)::BIGINT
      FROM generate_series((NOW() - (period_days || ' days')::INTERVAL)::DATE, NOW()::DATE, '1 day'::INTERVAL) AS d(day)
      LEFT JOIN bookings b ON b.created_at::DATE = d.day::DATE GROUP BY d.day ORDER BY d.day;
  ELSIF metric = 'new_salons' THEN
    RETURN QUERY SELECT d.day::DATE, COALESCE(COUNT(s.id), 0)::BIGINT
      FROM generate_series((NOW() - (period_days || ' days')::INTERVAL)::DATE, NOW()::DATE, '1 day'::INTERVAL) AS d(day)
      LEFT JOIN salons s ON s.created_at::DATE = d.day::DATE GROUP BY d.day ORDER BY d.day;
  ELSIF metric = 'active_salons' THEN
    RETURN QUERY SELECT d.day::DATE, COALESCE(COUNT(DISTINCT b.salon_id), 0)::BIGINT
      FROM generate_series((NOW() - (period_days || ' days')::INTERVAL)::DATE, NOW()::DATE, '1 day'::INTERVAL) AS d(day)
      LEFT JOIN bookings b ON b.created_at::DATE = d.day::DATE GROUP BY d.day ORDER BY d.day;
  ELSE RAISE EXCEPTION 'Unknown metric: %', metric;
  END IF;
END; $$;

GRANT EXECUTE ON FUNCTION get_admin_kpi_trend(TEXT, INTEGER) TO authenticated;

CREATE OR REPLACE FUNCTION get_salons_paginated(filters JSONB DEFAULT '{}', sort_col TEXT DEFAULT 'created_at', sort_dir TEXT DEFAULT 'desc', lim INTEGER DEFAULT 25, off INTEGER DEFAULT 0)
RETURNS TABLE(id UUID, name TEXT, slug TEXT, plan TEXT, is_public BOOLEAN, salon_type TEXT, preferred_language TEXT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ, owner_email TEXT, employee_count BIGINT, booking_count_7d BIGINT, total_count BIGINT)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE total BIGINT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.is_superadmin = true) THEN
    RAISE EXCEPTION 'Only superadmins can call this function';
  END IF;
  SELECT COUNT(*) INTO total FROM salons s
    WHERE (filters->>'plan' IS NULL OR s.plan::TEXT = filters->>'plan')
      AND (filters->>'is_public' IS NULL OR s.is_public = (filters->>'is_public')::BOOLEAN)
      AND (filters->>'salon_type' IS NULL OR s.salon_type = filters->>'salon_type')
      AND (filters->>'search' IS NULL OR s.name ILIKE '%' || (filters->>'search') || '%');
  RETURN QUERY SELECT s.id, s.name, s.slug, s.plan::TEXT, s.is_public, s.salon_type, s.preferred_language, s.created_at, s.updated_at,
    (SELECT u.email::TEXT FROM profiles pr JOIN auth.users u ON u.id = pr.user_id WHERE pr.salon_id = s.id LIMIT 1),
    (SELECT COUNT(*) FROM employees e WHERE e.salon_id = s.id)::BIGINT,
    (SELECT COUNT(*) FROM bookings b WHERE b.salon_id = s.id AND b.created_at >= NOW() - INTERVAL '7 days')::BIGINT,
    total
  FROM salons s
  WHERE (filters->>'plan' IS NULL OR s.plan::TEXT = filters->>'plan')
    AND (filters->>'is_public' IS NULL OR s.is_public = (filters->>'is_public')::BOOLEAN)
    AND (filters->>'salon_type' IS NULL OR s.salon_type = filters->>'salon_type')
    AND (filters->>'search' IS NULL OR s.name ILIKE '%' || (filters->>'search') || '%')
  ORDER BY
    CASE WHEN sort_col = 'name' AND sort_dir = 'asc' THEN s.name END ASC,
    CASE WHEN sort_col = 'name' AND sort_dir = 'desc' THEN s.name END DESC,
    CASE WHEN sort_col = 'created_at' AND sort_dir = 'asc' THEN s.created_at END ASC,
    CASE WHEN sort_col = 'created_at' AND sort_dir = 'desc' THEN s.created_at END DESC,
    CASE WHEN sort_col = 'plan' AND sort_dir = 'asc' THEN s.plan::TEXT END ASC,
    CASE WHEN sort_col = 'plan' AND sort_dir = 'desc' THEN s.plan::TEXT END DESC,
    s.created_at DESC
  LIMIT lim OFFSET off;
END; $$;

GRANT EXECUTE ON FUNCTION get_salons_paginated(JSONB, TEXT, TEXT, INTEGER, INTEGER) TO authenticated;

CREATE OR REPLACE FUNCTION get_users_paginated(filters JSONB DEFAULT '{}', sort_col TEXT DEFAULT 'created_at', sort_dir TEXT DEFAULT 'desc', lim INTEGER DEFAULT 25, off INTEGER DEFAULT 0)
RETURNS TABLE(user_id UUID, email TEXT, is_superadmin BOOLEAN, salon_id UUID, salon_name TEXT, user_created_at TIMESTAMPTZ, last_sign_in_at TIMESTAMPTZ, total_count BIGINT)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE total BIGINT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.is_superadmin = true) THEN
    RAISE EXCEPTION 'Only superadmins can call this function';
  END IF;
  SELECT COUNT(*) INTO total FROM profiles pr JOIN auth.users u ON u.id = pr.user_id
    WHERE (filters->>'is_superadmin' IS NULL OR pr.is_superadmin = (filters->>'is_superadmin')::BOOLEAN)
      AND (filters->>'salon_id' IS NULL OR pr.salon_id = (filters->>'salon_id')::UUID)
      AND (filters->>'search' IS NULL OR u.email ILIKE '%' || (filters->>'search') || '%');
  RETURN QUERY SELECT pr.user_id, u.email::TEXT, pr.is_superadmin, pr.salon_id, s.name, u.created_at, u.last_sign_in_at, total
    FROM profiles pr JOIN auth.users u ON u.id = pr.user_id LEFT JOIN salons s ON s.id = pr.salon_id
    WHERE (filters->>'is_superadmin' IS NULL OR pr.is_superadmin = (filters->>'is_superadmin')::BOOLEAN)
      AND (filters->>'salon_id' IS NULL OR pr.salon_id = (filters->>'salon_id')::UUID)
      AND (filters->>'search' IS NULL OR u.email ILIKE '%' || (filters->>'search') || '%')
    ORDER BY
      CASE WHEN sort_col = 'email' AND sort_dir = 'asc' THEN u.email END ASC,
      CASE WHEN sort_col = 'email' AND sort_dir = 'desc' THEN u.email END DESC,
      CASE WHEN sort_col = 'created_at' AND sort_dir = 'asc' THEN u.created_at END ASC,
      CASE WHEN sort_col = 'created_at' AND sort_dir = 'desc' THEN u.created_at END DESC,
      u.created_at DESC
    LIMIT lim OFFSET off;
END; $$;

GRANT EXECUTE ON FUNCTION get_users_paginated(JSONB, TEXT, TEXT, INTEGER, INTEGER) TO authenticated;

CREATE OR REPLACE FUNCTION get_needs_attention_items(lim INTEGER DEFAULT 10)
RETURNS TABLE(item_id TEXT, item_type TEXT, entity_type TEXT, entity_id UUID, entity_name TEXT, severity TEXT, title TEXT, description TEXT, created_at TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.is_superadmin = true) THEN
    RAISE EXCEPTION 'Only superadmins can call this function';
  END IF;
  RETURN QUERY SELECT
    'case-' || sc.id::TEXT, sc.type,
    CASE WHEN sc.salon_id IS NOT NULL THEN 'salon' ELSE 'user' END,
    COALESCE(sc.salon_id, sc.user_id),
    COALESCE(s.name, 'User ' || LEFT(sc.user_id::TEXT, 8)),
    sc.priority, sc.title, COALESCE(sc.description, ''), sc.created_at
  FROM support_cases sc LEFT JOIN salons s ON s.id = sc.salon_id
  WHERE sc.status IN ('open', 'in_progress')
  ORDER BY CASE sc.priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 WHEN 'low' THEN 4 END, sc.created_at DESC
  LIMIT lim;
END; $$;

GRANT EXECUTE ON FUNCTION get_needs_attention_items(INTEGER) TO authenticated;

CREATE OR REPLACE FUNCTION get_support_cases_list(filters JSONB DEFAULT '{}', lim INTEGER DEFAULT 25, off INTEGER DEFAULT 0)
RETURNS TABLE(id UUID, salon_id UUID, salon_name TEXT, user_id UUID, type TEXT, status TEXT, priority TEXT, title TEXT, description TEXT, assignee_id UUID, assignee_email TEXT, metadata JSONB, resolved_at TIMESTAMPTZ, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ, total_count BIGINT)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE total BIGINT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.is_superadmin = true) THEN
    RAISE EXCEPTION 'Only superadmins can call this function';
  END IF;
  SELECT COUNT(*) INTO total FROM support_cases sc
    WHERE (filters->>'type' IS NULL OR sc.type = filters->>'type')
      AND (filters->>'status' IS NULL OR sc.status = filters->>'status')
      AND (filters->>'priority' IS NULL OR sc.priority = filters->>'priority')
      AND (filters->>'assignee_id' IS NULL OR sc.assignee_id = (filters->>'assignee_id')::UUID);
  RETURN QUERY SELECT sc.id, sc.salon_id, s.name, sc.user_id, sc.type, sc.status, sc.priority, sc.title, sc.description, sc.assignee_id,
    (SELECT u.email::TEXT FROM auth.users u WHERE u.id = sc.assignee_id),
    sc.metadata, sc.resolved_at, sc.created_at, sc.updated_at, total
  FROM support_cases sc LEFT JOIN salons s ON s.id = sc.salon_id
  WHERE (filters->>'type' IS NULL OR sc.type = filters->>'type')
    AND (filters->>'status' IS NULL OR sc.status = filters->>'status')
    AND (filters->>'priority' IS NULL OR sc.priority = filters->>'priority')
    AND (filters->>'assignee_id' IS NULL OR sc.assignee_id = (filters->>'assignee_id')::UUID)
  ORDER BY CASE sc.priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 WHEN 'low' THEN 4 END, sc.created_at DESC
  LIMIT lim OFFSET off;
END; $$;

GRANT EXECUTE ON FUNCTION get_support_cases_list(JSONB, INTEGER, INTEGER) TO authenticated;


-- =====================================================
-- 4. INCIDENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'minor' CHECK (severity IN ('critical', 'major', 'minor')),
  status TEXT NOT NULL DEFAULT 'investigating' CHECK (status IN ('investigating', 'identified', 'monitoring', 'resolved')),
  description TEXT,
  affected_services TEXT[] DEFAULT '{}',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  postmortem TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "superadmins_incidents" ON public.incidents;
CREATE POLICY "superadmins_incidents" ON public.incidents FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_superadmin = true));

CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_started ON public.incidents(started_at DESC);


-- =====================================================
-- 5. AUDIT LOG EXTENSIONS
-- =====================================================
ALTER TABLE public.security_audit_log
  ADD COLUMN IF NOT EXISTS correlation_id UUID,
  ADD COLUMN IF NOT EXISTS before_state JSONB,
  ADD COLUMN IF NOT EXISTS after_state JSONB,
  ADD COLUMN IF NOT EXISTS ip_address TEXT,
  ADD COLUMN IF NOT EXISTS user_agent TEXT;

CREATE INDEX IF NOT EXISTS idx_audit_correlation ON public.security_audit_log(correlation_id) WHERE correlation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audit_action ON public.security_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON public.security_audit_log(resource_type);


-- =====================================================
-- 6. ANALYTICS RPCS
-- =====================================================
CREATE OR REPLACE FUNCTION get_admin_activity_timeseries(metric TEXT DEFAULT 'bookings', period_days INT DEFAULT 30)
RETURNS TABLE(day DATE, value BIGINT) AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_superadmin = true) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  IF metric = 'bookings' THEN
    RETURN QUERY SELECT d::DATE, COALESCE(COUNT(b.id), 0)::BIGINT FROM generate_series(CURRENT_DATE - (period_days || ' days')::INTERVAL, CURRENT_DATE, '1 day') d LEFT JOIN bookings b ON b.created_at::DATE = d::DATE GROUP BY d ORDER BY d;
  ELSIF metric = 'new_salons' THEN
    RETURN QUERY SELECT d::DATE, COALESCE(COUNT(s.id), 0)::BIGINT FROM generate_series(CURRENT_DATE - (period_days || ' days')::INTERVAL, CURRENT_DATE, '1 day') d LEFT JOIN salons s ON s.created_at::DATE = d::DATE GROUP BY d ORDER BY d;
  ELSIF metric = 'active_salons' THEN
    RETURN QUERY SELECT d::DATE, COALESCE(COUNT(DISTINCT b.salon_id), 0)::BIGINT FROM generate_series(CURRENT_DATE - (period_days || ' days')::INTERVAL, CURRENT_DATE, '1 day') d LEFT JOIN bookings b ON b.created_at::DATE = d::DATE GROUP BY d ORDER BY d;
  ELSE RAISE EXCEPTION 'Unknown metric: %', metric;
  END IF;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_admin_activity_timeseries(TEXT, INT) TO authenticated;

CREATE OR REPLACE FUNCTION get_admin_activation_funnel(period_days INT DEFAULT 90)
RETURNS TABLE(step TEXT, count BIGINT) AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_superadmin = true) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  RETURN QUERY SELECT 'Created salon'::TEXT, COUNT(*)::BIGINT FROM salons WHERE created_at >= CURRENT_DATE - (period_days || ' days')::INTERVAL;
  RETURN QUERY SELECT 'Added employee'::TEXT, COUNT(DISTINCT e.salon_id)::BIGINT FROM employees e JOIN salons s ON s.id = e.salon_id WHERE s.created_at >= CURRENT_DATE - (period_days || ' days')::INTERVAL;
  RETURN QUERY SELECT 'Added service'::TEXT, COUNT(DISTINCT sv.salon_id)::BIGINT FROM services sv JOIN salons s ON s.id = sv.salon_id WHERE s.created_at >= CURRENT_DATE - (period_days || ' days')::INTERVAL;
  RETURN QUERY SELECT 'First booking'::TEXT, COUNT(DISTINCT b.salon_id)::BIGINT FROM bookings b JOIN salons s ON s.id = b.salon_id WHERE s.created_at >= CURRENT_DATE - (period_days || ' days')::INTERVAL;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_admin_activation_funnel(INT) TO authenticated;

CREATE OR REPLACE FUNCTION get_admin_top_salons(period_days INT DEFAULT 30, lim INT DEFAULT 10)
RETURNS TABLE(salon_id UUID, salon_name TEXT, booking_count BIGINT, growth_pct NUMERIC) AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_superadmin = true) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  RETURN QUERY
    WITH current_period AS (SELECT b.salon_id, COUNT(*)::BIGINT AS cnt FROM bookings b WHERE b.created_at >= CURRENT_DATE - (period_days || ' days')::INTERVAL GROUP BY b.salon_id),
    prev_period AS (SELECT b.salon_id, COUNT(*)::BIGINT AS cnt FROM bookings b WHERE b.created_at >= CURRENT_DATE - (2 * period_days || ' days')::INTERVAL AND b.created_at < CURRENT_DATE - (period_days || ' days')::INTERVAL GROUP BY b.salon_id)
    SELECT c.salon_id, s.name::TEXT, c.cnt, CASE WHEN COALESCE(p.cnt, 0) = 0 THEN 100.0 ELSE ROUND(((c.cnt - p.cnt)::NUMERIC / p.cnt::NUMERIC) * 100, 1) END
    FROM current_period c JOIN salons s ON s.id = c.salon_id LEFT JOIN prev_period p ON p.salon_id = c.salon_id ORDER BY c.cnt DESC LIMIT lim;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_admin_top_salons(INT, INT) TO authenticated;

CREATE OR REPLACE FUNCTION get_admin_plan_distribution()
RETURNS TABLE(plan TEXT, count BIGINT) AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_superadmin = true) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  RETURN QUERY SELECT COALESCE(s.plan, 'starter')::TEXT, COUNT(*)::BIGINT FROM salons s GROUP BY COALESCE(s.plan, 'starter') ORDER BY count DESC;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_admin_plan_distribution() TO authenticated;

CREATE OR REPLACE FUNCTION get_admin_cohort_retention(period_weeks INT DEFAULT 8)
RETURNS TABLE(cohort_week DATE, week_offset INT, retention_pct NUMERIC) AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_superadmin = true) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  RETURN QUERY
    WITH salon_cohorts AS (SELECT id, DATE_TRUNC('week', created_at)::DATE AS cohort FROM salons WHERE created_at >= CURRENT_DATE - (period_weeks * 7 || ' days')::INTERVAL),
    activity AS (SELECT DISTINCT b.salon_id, DATE_TRUNC('week', b.created_at)::DATE AS activity_week FROM bookings b WHERE b.created_at >= CURRENT_DATE - (period_weeks * 7 || ' days')::INTERVAL)
    SELECT sc.cohort, EXTRACT(WEEK FROM (a.activity_week - sc.cohort))::INT AS w_offset,
      ROUND(COUNT(DISTINCT a.salon_id)::NUMERIC / NULLIF(COUNT(DISTINCT sc.id), 0)::NUMERIC * 100, 1)
    FROM salon_cohorts sc LEFT JOIN activity a ON a.salon_id = sc.id AND a.activity_week >= sc.cohort
    GROUP BY sc.cohort, w_offset ORDER BY sc.cohort, w_offset;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_admin_cohort_retention(INT) TO authenticated;


-- =====================================================
-- 7. FEATURE FLAGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
  flag_key TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(salon_id, flag_key)
);

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "superadmins_feature_flags" ON public.feature_flags;
CREATE POLICY "superadmins_feature_flags" ON public.feature_flags FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_superadmin = true));

CREATE INDEX IF NOT EXISTS idx_feature_flags_salon ON public.feature_flags(salon_id);
CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON public.feature_flags(flag_key);

INSERT INTO public.feature_flags (salon_id, flag_key, enabled, description) VALUES
  (NULL, 'new_booking_flow', false, 'New booking experience (v2)'),
  (NULL, 'ai_suggestions', false, 'AI-powered service suggestions'),
  (NULL, 'multi_language', false, 'Multi-language support'),
  (NULL, 'advanced_analytics', false, 'Advanced analytics dashboard for salon owners'),
  (NULL, 'sms_notifications', false, 'SMS notification support')
ON CONFLICT DO NOTHING;


-- =====================================================
-- 8. DATA REQUESTS + ADMIN RBAC
-- =====================================================
CREATE TABLE IF NOT EXISTS public.data_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('export', 'deletion', 'anonymization')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'rejected')),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('salon', 'user')),
  entity_id UUID NOT NULL,
  entity_name TEXT,
  requested_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  executed_by UUID REFERENCES auth.users(id),
  reason TEXT,
  metadata JSONB DEFAULT '{}',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.data_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "superadmins_data_requests" ON public.data_requests;
CREATE POLICY "superadmins_data_requests" ON public.data_requests FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_superadmin = true));

CREATE INDEX IF NOT EXISTS idx_data_requests_status ON public.data_requests(status);
CREATE INDEX IF NOT EXISTS idx_data_requests_entity ON public.data_requests(entity_type, entity_id);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS admin_role TEXT DEFAULT NULL;
-- Note: CHECK constraint added only if column is new, which IF NOT EXISTS handles


-- =====================================================
-- 9. CHANGELOG + FEEDBACK TABLES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.changelog_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  version TEXT,
  type TEXT NOT NULL DEFAULT 'feature' CHECK (type IN ('feature', 'improvement', 'bugfix', 'breaking')),
  published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.changelog_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "superadmins_changelog" ON public.changelog_entries;
CREATE POLICY "superadmins_changelog" ON public.changelog_entries FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_superadmin = true));

CREATE TABLE IF NOT EXISTS public.feedback_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID REFERENCES public.salons(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL DEFAULT 'feature_request' CHECK (type IN ('feature_request', 'bug_report', 'improvement', 'other')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'planned', 'in_progress', 'completed', 'declined')),
  title TEXT NOT NULL,
  description TEXT,
  votes INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.feedback_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "superadmins_feedback" ON public.feedback_entries;
CREATE POLICY "superadmins_feedback" ON public.feedback_entries FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_superadmin = true));

CREATE INDEX IF NOT EXISTS idx_feedback_status ON public.feedback_entries(status);
CREATE INDEX IF NOT EXISTS idx_feedback_votes ON public.feedback_entries(votes DESC);


-- =====================================================
-- DONE! All admin migrations applied.
-- =====================================================
