-- =====================================================
-- Announcements Domain MVP
-- =====================================================
-- Separate editorial announcements from event-driven notifications.
-- MVP scope:
-- - global announcements only
-- - lifecycle: draft/published
-- - no delete workflow in UI (unpublish instead)

CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope_type TEXT NOT NULL DEFAULT 'global' CHECK (scope_type IN ('global')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ NULL,
  created_by UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT announcements_title_length CHECK (char_length(title) <= 200),
  CONSTRAINT announcements_body_length CHECK (char_length(body) <= 5000)
);

CREATE INDEX IF NOT EXISTS idx_announcements_status
  ON public.announcements(status);

CREATE INDEX IF NOT EXISTS idx_announcements_order
  ON public.announcements(is_pinned DESC, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_announcements_published_at
  ON public.announcements(published_at DESC);

CREATE OR REPLACE FUNCTION public.set_announcements_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_announcements_updated_at ON public.announcements;
CREATE TRIGGER trg_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.set_announcements_updated_at();

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read published announcements" ON public.announcements;
CREATE POLICY "Authenticated can read published announcements"
  ON public.announcements
  FOR SELECT
  TO authenticated
  USING (status = 'published');

DROP POLICY IF EXISTS "Service role manage announcements" ON public.announcements;
CREATE POLICY "Service role manage announcements"
  ON public.announcements
  FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

COMMENT ON TABLE public.announcements IS 'Admin-authored editorial announcements shown on dashboard.';
COMMENT ON COLUMN public.announcements.scope_type IS 'MVP supports only global scope.';
COMMENT ON COLUMN public.announcements.status IS 'Editorial lifecycle: draft or published.';
COMMENT ON COLUMN public.announcements.published_at IS 'Timestamp set when status transitions to published.';
