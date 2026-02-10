-- =====================================================
-- Migration: Feature flags per salon
-- =====================================================

CREATE TABLE IF NOT EXISTS public.feature_flags (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id     UUID REFERENCES public.salons(id) ON DELETE CASCADE,
  flag_key     TEXT NOT NULL,
  enabled      BOOLEAN NOT NULL DEFAULT false,
  description  TEXT,
  created_by   UUID REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(salon_id, flag_key)
);

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "superadmins_feature_flags" ON public.feature_flags
  FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_superadmin = true));

-- Global feature flags (salon_id = NULL) for platform-wide toggles
CREATE INDEX idx_feature_flags_salon ON public.feature_flags(salon_id);
CREATE INDEX idx_feature_flags_key ON public.feature_flags(flag_key);

-- Seeded default flags
INSERT INTO public.feature_flags (salon_id, flag_key, enabled, description)
VALUES
  (NULL, 'new_booking_flow', false, 'New booking experience (v2)'),
  (NULL, 'ai_suggestions', false, 'AI-powered service suggestions'),
  (NULL, 'multi_language', false, 'Multi-language support'),
  (NULL, 'advanced_analytics', false, 'Advanced analytics dashboard for salon owners'),
  (NULL, 'sms_notifications', false, 'SMS notification support')
ON CONFLICT DO NOTHING;
