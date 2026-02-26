-- =====================================================
-- Allow salon members to read audit trail entries
-- =====================================================
-- The dashboard Settings -> Audit Trail page is for salon users
-- (owner/manager/staff) and should not require superadmin access.
-- =====================================================

-- Keep existing superadmin policy, add salon-scoped SELECT access.
DROP POLICY IF EXISTS "Salon members can read audit logs" ON public.security_audit_log;

CREATE POLICY "Salon members can read audit logs"
  ON public.security_audit_log
  FOR SELECT
  USING (
    salon_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.salon_id = security_audit_log.salon_id
    )
  );

COMMENT ON POLICY "Salon members can read audit logs" ON public.security_audit_log IS
  'Allows owner/manager/staff to read audit log rows for their own salon.';
