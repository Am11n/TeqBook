-- =====================================================
-- Role-Based Access Control (RBAC) Policies
-- =====================================================
-- Task Group 42: Add role checks to critical RLS policies
-- Restricts DELETE operations to owner/manager roles
-- =====================================================

-- =====================================================
-- Helper Function: Check User Role
-- =====================================================

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION user_has_role(p_role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND role = p_role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION user_has_role IS 
  'Checks if the current user has a specific role. Returns true if user''s profile has matching role.';

-- =====================================================
-- 1. BOOKINGS DELETE Policy (Owner/Manager only)
-- =====================================================

-- Drop existing DELETE policy
DROP POLICY IF EXISTS "Users can delete bookings for their salon" ON bookings;

-- Create new DELETE policy with role check
CREATE POLICY "Users can delete bookings for their salon"
  ON bookings FOR DELETE
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
    AND (
      user_has_role('owner')
      OR user_has_role('manager')
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE user_id = auth.uid() AND is_superadmin = TRUE
      )
    )
  );

-- =====================================================
-- 2. CUSTOMERS DELETE Policy (Owner/Manager only)
-- =====================================================

-- Drop existing DELETE policy
DROP POLICY IF EXISTS "Users can delete customers for their salon" ON customers;

-- Create new DELETE policy with role check
CREATE POLICY "Users can delete customers for their salon"
  ON customers FOR DELETE
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
    AND (
      user_has_role('owner')
      OR user_has_role('manager')
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE user_id = auth.uid() AND is_superadmin = TRUE
      )
    )
  );

-- =====================================================
-- 3. SERVICES UPDATE Policy (Owner/Manager only)
-- =====================================================

-- Drop existing UPDATE policy
DROP POLICY IF EXISTS "Users can update services for their salon" ON services;

-- Recreate with role check (keeping WITH CHECK from Task 41)
CREATE POLICY "Users can update services for their salon"
  ON services FOR UPDATE
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
    AND (
      user_has_role('owner')
      OR user_has_role('manager')
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE user_id = auth.uid() AND is_superadmin = TRUE
      )
    )
  )
  WITH CHECK (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
    AND (
      user_has_role('owner')
      OR user_has_role('manager')
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE user_id = auth.uid() AND is_superadmin = TRUE
      )
    )
  );

-- =====================================================
-- 4. SERVICES DELETE Policy (Owner/Manager only)
-- =====================================================

-- Drop existing DELETE policy
DROP POLICY IF EXISTS "Users can delete services for their salon" ON services;

-- Create new DELETE policy with role check
CREATE POLICY "Users can delete services for their salon"
  ON services FOR DELETE
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
    AND (
      user_has_role('owner')
      OR user_has_role('manager')
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE user_id = auth.uid() AND is_superadmin = TRUE
      )
    )
  );

-- =====================================================
-- Notes
-- =====================================================
-- - Staff role cannot delete bookings or customers
-- - Staff role cannot update or delete services
-- - Superadmins bypass all role checks
-- - Owner and Manager roles have full access to these operations
