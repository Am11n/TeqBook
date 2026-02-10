-- =====================================================
-- Migration: Data requests + Admin RBAC
-- =====================================================

-- Data requests (GDPR exports, deletions, anonymization)
CREATE TABLE IF NOT EXISTS public.data_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type          TEXT NOT NULL CHECK (type IN ('export', 'deletion', 'anonymization')),
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'rejected')),
  entity_type   TEXT NOT NULL CHECK (entity_type IN ('salon', 'user')),
  entity_id     UUID NOT NULL,
  entity_name   TEXT,
  requested_by  UUID REFERENCES auth.users(id),
  approved_by   UUID REFERENCES auth.users(id),
  executed_by   UUID REFERENCES auth.users(id),
  reason        TEXT,
  metadata      JSONB DEFAULT '{}',
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.data_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "superadmins_data_requests" ON public.data_requests
  FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_superadmin = true));

CREATE INDEX idx_data_requests_status ON public.data_requests(status);
CREATE INDEX idx_data_requests_entity ON public.data_requests(entity_type, entity_id);

-- Admin roles for RBAC
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS admin_role TEXT DEFAULT NULL
    CHECK (admin_role IS NULL OR admin_role IN ('support_admin', 'billing_admin', 'security_admin', 'read_only_auditor', 'full_admin'));
