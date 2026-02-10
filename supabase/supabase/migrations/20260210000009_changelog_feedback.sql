-- =====================================================
-- Migration: Changelog + Feedback tables
-- =====================================================

-- Changelog entries
CREATE TABLE IF NOT EXISTS public.changelog_entries (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  description  TEXT,
  version      TEXT,
  type         TEXT NOT NULL DEFAULT 'feature' CHECK (type IN ('feature', 'improvement', 'bugfix', 'breaking')),
  published    BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_by   UUID REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.changelog_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "superadmins_changelog" ON public.changelog_entries
  FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_superadmin = true));

-- Feedback entries
CREATE TABLE IF NOT EXISTS public.feedback_entries (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id     UUID REFERENCES public.salons(id) ON DELETE SET NULL,
  user_id      UUID REFERENCES auth.users(id),
  type         TEXT NOT NULL DEFAULT 'feature_request' CHECK (type IN ('feature_request', 'bug_report', 'improvement', 'other')),
  status       TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'planned', 'in_progress', 'completed', 'declined')),
  title        TEXT NOT NULL,
  description  TEXT,
  votes        INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.feedback_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "superadmins_feedback" ON public.feedback_entries
  FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_superadmin = true));

CREATE INDEX idx_feedback_status ON public.feedback_entries(status);
CREATE INDEX idx_feedback_votes ON public.feedback_entries(votes DESC);
