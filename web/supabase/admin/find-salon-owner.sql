-- =====================================================
-- Find Salon Owner
-- =====================================================
-- This script finds the owner of a specific salon
-- by looking up the profile that has the salon_id.
--
-- Run this in Supabase SQL Editor
-- =====================================================

-- Find owner of Downtown Barber (replace salon_id if needed)
SELECT 
  s.id as salon_id,
  s.name as salon_name,
  p.user_id,
  u.email as owner_email,
  p.role,
  p.is_superadmin,
  p.created_at as profile_created_at
FROM salons s
LEFT JOIN profiles p ON s.id = p.salon_id
LEFT JOIN auth.users u ON p.user_id = u.id
WHERE s.id = '08277d03-a227-4a81-8e41-aff5a04f5877'
   OR s.name = 'Downtown Barber';

-- Alternative: Find all salon owners
-- =====================================================
-- SELECT 
--   s.id as salon_id,
--   s.name as salon_name,
--   p.user_id,
--   u.email as owner_email,
--   p.role,
--   p.is_superadmin
-- FROM salons s
-- LEFT JOIN profiles p ON s.id = p.salon_id
-- LEFT JOIN auth.users u ON p.user_id = u.id
-- ORDER BY s.name;

