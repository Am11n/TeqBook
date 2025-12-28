-- =====================================================
-- Admin Function: Get User Emails
-- =====================================================
-- This function allows superadmins to get email addresses
-- for user IDs. This is needed for the admin dashboard.
--
-- Run this in Supabase SQL Editor
-- =====================================================

-- Drop existing function first (if it exists)
DROP FUNCTION IF EXISTS get_user_emails(UUID[]);

-- Create function to get user emails and created_at by user IDs
CREATE FUNCTION get_user_emails(user_ids UUID[])
RETURNS TABLE(user_id UUID, email TEXT, created_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if current user is superadmin
  IF NOT EXISTS (
    SELECT 1 
    FROM profiles p
    WHERE p.user_id = auth.uid() 
    AND p.is_superadmin = TRUE
  ) THEN
    RAISE EXCEPTION 'Only superadmins can call this function';
  END IF;

  -- Return user emails and created_at
  RETURN QUERY
  SELECT 
    u.id::UUID as user_id,
    u.email::TEXT as email,
    u.created_at::TIMESTAMPTZ as created_at
  FROM auth.users u
  WHERE u.id = ANY(user_ids);
END;
$$;

-- Grant execute permission to authenticated users
-- (The function itself checks for superadmin)
GRANT EXECUTE ON FUNCTION get_user_emails(UUID[]) TO authenticated;

-- =====================================================
-- Usage Example:
-- =====================================================
-- SELECT * FROM get_user_emails(ARRAY['user-id-1'::UUID, 'user-id-2'::UUID]);

