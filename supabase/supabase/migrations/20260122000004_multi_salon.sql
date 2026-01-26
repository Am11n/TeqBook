-- =====================================================
-- Multi-Salon Support Migration
-- =====================================================
-- Task Group 36: Multi-Salon Owner Dashboard
-- Enables users to own/manage multiple salons

-- =====================================================
-- Owner Role Type
-- =====================================================

DO $$ BEGIN
  CREATE TYPE owner_role AS ENUM ('owner', 'co_owner', 'manager');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- Salon Ownerships Table
-- =====================================================

CREATE TABLE IF NOT EXISTS salon_ownerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  role owner_role NOT NULL DEFAULT 'owner',
  permissions JSONB NOT NULL DEFAULT '{
    "canManageEmployees": true,
    "canManageServices": true,
    "canManageBookings": true,
    "canViewReports": true,
    "canManageSettings": true,
    "canManageBilling": true,
    "canInviteOwners": true
  }'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Each user can only have one role per salon
  CONSTRAINT salon_ownerships_user_salon_unique UNIQUE (user_id, salon_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_salon_ownerships_user_id ON salon_ownerships(user_id);
CREATE INDEX IF NOT EXISTS idx_salon_ownerships_salon_id ON salon_ownerships(salon_id);

-- =====================================================
-- Owner Invitations Table
-- =====================================================

CREATE TABLE IF NOT EXISTS owner_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role owner_role NOT NULL DEFAULT 'manager',
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  
  -- Prevent duplicate pending invitations
  CONSTRAINT owner_invitations_email_salon_unique 
    UNIQUE (email, salon_id) 
    DEFERRABLE INITIALLY DEFERRED
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_owner_invitations_email ON owner_invitations(email);
CREATE INDEX IF NOT EXISTS idx_owner_invitations_salon_id ON owner_invitations(salon_id);

-- =====================================================
-- Migrate Existing Owners
-- =====================================================

-- Create ownership records for existing salon owners
-- Ownership is determined by profiles.salon_id (profile links user to salon)
INSERT INTO salon_ownerships (user_id, salon_id, role, permissions)
SELECT 
  p.user_id,
  p.salon_id,
  'owner'::owner_role,
  '{
    "canManageEmployees": true,
    "canManageServices": true,
    "canManageBookings": true,
    "canViewReports": true,
    "canManageSettings": true,
    "canManageBilling": true,
    "canInviteOwners": true
  }'::jsonb
FROM profiles p
WHERE p.salon_id IS NOT NULL
  AND p.user_id IS NOT NULL
ON CONFLICT (user_id, salon_id) DO NOTHING;

-- =====================================================
-- Row Level Security
-- =====================================================

ALTER TABLE salon_ownerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE owner_invitations ENABLE ROW LEVEL SECURITY;

-- Salon ownerships: users can see their own ownerships
CREATE POLICY "Users can view their own salon ownerships"
  ON salon_ownerships FOR SELECT
  USING (auth.uid() = user_id);

-- Owners can view all ownerships for their salons
CREATE POLICY "Owners can view salon ownerships for their salons"
  ON salon_ownerships FOR SELECT
  USING (
    salon_id IN (
      SELECT salon_id FROM salon_ownerships 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Only owners can add new ownerships (via invitation)
CREATE POLICY "Owners can insert salon ownerships"
  ON salon_ownerships FOR INSERT
  WITH CHECK (
    -- Either creating for yourself as owner of a new salon
    auth.uid() = user_id
    OR
    -- Or there's a valid invitation (handled by service)
    EXISTS (
      SELECT 1 FROM salon_ownerships 
      WHERE salon_id = salon_ownerships.salon_id 
      AND user_id = auth.uid() 
      AND role = 'owner'
    )
  );

-- Only owners can delete ownerships
CREATE POLICY "Owners can delete salon ownerships"
  ON salon_ownerships FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM salon_ownerships so
      WHERE so.salon_id = salon_ownerships.salon_id 
      AND so.user_id = auth.uid() 
      AND so.role = 'owner'
    )
    AND user_id != auth.uid() -- Can't delete yourself
  );

-- Owner invitations: invitees can view their invitations
CREATE POLICY "Users can view invitations for their email"
  ON owner_invitations FOR SELECT
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Owners can view invitations for their salons
CREATE POLICY "Owners can view invitations for their salons"
  ON owner_invitations FOR SELECT
  USING (
    salon_id IN (
      SELECT salon_id FROM salon_ownerships 
      WHERE user_id = auth.uid() 
      AND (permissions->>'canInviteOwners')::boolean = true
    )
  );

-- Owners can create invitations
CREATE POLICY "Owners can create invitations"
  ON owner_invitations FOR INSERT
  WITH CHECK (
    salon_id IN (
      SELECT salon_id FROM salon_ownerships 
      WHERE user_id = auth.uid() 
      AND (permissions->>'canInviteOwners')::boolean = true
    )
    AND invited_by = auth.uid()
  );

-- Invitations can be updated (to mark accepted)
CREATE POLICY "Users can accept their invitations"
  ON owner_invitations FOR UPDATE
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Service role can access all
CREATE POLICY "Service role can access all salon ownerships"
  ON salon_ownerships FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all owner invitations"
  ON owner_invitations FOR ALL
  USING (auth.role() = 'service_role');

-- =====================================================
-- Updated At Trigger
-- =====================================================

CREATE OR REPLACE FUNCTION update_salon_ownerships_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER salon_ownerships_updated_at
  BEFORE UPDATE ON salon_ownerships
  FOR EACH ROW
  EXECUTE FUNCTION update_salon_ownerships_updated_at();

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to check if user has permission for a salon
CREATE OR REPLACE FUNCTION user_has_salon_permission(
  p_user_id UUID,
  p_salon_id UUID,
  p_permission TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM salon_ownerships
    WHERE user_id = p_user_id
    AND salon_id = p_salon_id
    AND (permissions->>p_permission)::boolean = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's salons
CREATE OR REPLACE FUNCTION get_user_salons(p_user_id UUID)
RETURNS TABLE (
  salon_id UUID,
  salon_name TEXT,
  role owner_role
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    so.salon_id,
    s.name,
    so.role
  FROM salon_ownerships so
  JOIN salons s ON so.salon_id = s.id
  WHERE so.user_id = p_user_id
  ORDER BY s.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE salon_ownerships IS 'Links users to salons with role and permissions';
COMMENT ON TABLE owner_invitations IS 'Pending invitations for new salon owners/managers';
COMMENT ON FUNCTION user_has_salon_permission IS 'Check if user has specific permission for a salon';
COMMENT ON FUNCTION get_user_salons IS 'Get all salons a user has access to';
