-- =====================================================
-- Public profile schema extensions (Phase 1)
-- =====================================================

-- Salons: profile metadata for /salon/[slug]
ALTER TABLE public.salons
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS cover_image TEXT,
  ADD COLUMN IF NOT EXISTS instagram_url TEXT,
  ADD COLUMN IF NOT EXISTS website_url TEXT;

COMMENT ON COLUMN public.salons.description IS 'Public description shown on salon profile page.';
COMMENT ON COLUMN public.salons.cover_image IS 'Public hero cover image URL for salon profile page.';
COMMENT ON COLUMN public.salons.instagram_url IS 'Public Instagram URL for salon profile page.';
COMMENT ON COLUMN public.salons.website_url IS 'Public website URL for salon profile page.';

-- Employees: public profile fields for team preview + modal
ALTER TABLE public.employees
  ADD COLUMN IF NOT EXISTS public_profile_visible BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS public_title TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
  ADD COLUMN IF NOT EXISTS specialties TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  ADD COLUMN IF NOT EXISTS public_sort_order INTEGER;

COMMENT ON COLUMN public.employees.public_profile_visible IS 'Controls whether employee is visible on public salon profile page.';
COMMENT ON COLUMN public.employees.public_title IS 'Public-facing employee title shown on team cards.';
COMMENT ON COLUMN public.employees.bio IS 'Public-facing employee bio shown in team modal.';
COMMENT ON COLUMN public.employees.profile_image_url IS 'Public-facing employee profile image URL.';
COMMENT ON COLUMN public.employees.specialties IS 'Public-facing specialty tags shown on team cards/modal.';
COMMENT ON COLUMN public.employees.public_sort_order IS 'Optional sort order for public team display.';

CREATE INDEX IF NOT EXISTS idx_employees_public_profile_visible
  ON public.employees (salon_id, public_profile_visible)
  WHERE deleted_at IS NULL;

