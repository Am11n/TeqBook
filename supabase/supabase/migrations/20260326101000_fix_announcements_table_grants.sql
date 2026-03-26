-- =====================================================
-- Fix announcements table grants
-- =====================================================
-- RLS policies alone are not enough; roles also need table privileges.
-- Keep delete restricted (no delete in MVP).

GRANT SELECT, INSERT, UPDATE ON TABLE public.announcements TO authenticated;
GRANT ALL ON TABLE public.announcements TO service_role;
REVOKE DELETE ON TABLE public.announcements FROM authenticated;
