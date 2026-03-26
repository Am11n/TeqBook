-- =====================================================
-- Fix announcements RLS for admin workflow
-- =====================================================
-- Allow authenticated superadmins to manage announcements via admin API,
-- while regular authenticated users can still read only published rows.

DROP POLICY IF EXISTS "Superadmin can read all announcements" ON public.announcements;
CREATE POLICY "Superadmin can read all announcements"
  ON public.announcements
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.is_superadmin = TRUE
    )
  );

DROP POLICY IF EXISTS "Superadmin can insert announcements" ON public.announcements;
CREATE POLICY "Superadmin can insert announcements"
  ON public.announcements
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.is_superadmin = TRUE
    )
  );

DROP POLICY IF EXISTS "Superadmin can update announcements" ON public.announcements;
CREATE POLICY "Superadmin can update announcements"
  ON public.announcements
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.is_superadmin = TRUE
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.is_superadmin = TRUE
    )
  );
