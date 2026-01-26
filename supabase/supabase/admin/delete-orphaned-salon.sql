-- =====================================================
-- Delete Orphaned Salon (No Owner)
-- =====================================================
-- This script deletes the salon that has no owner.
-- Salon ID: 9d9e551f-3c43-42e1-bbfd-392af4bc8f82
--
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Verify the salon has no owner
-- =====================================================
SELECT 
  s.id as salon_id,
  s.name as salon_name,
  p.user_id,
  u.email as owner_email
FROM salons s
LEFT JOIN profiles p ON s.id = p.salon_id
LEFT JOIN auth.users u ON p.user_id = u.id
WHERE s.id = '9d9e551f-3c43-42e1-bbfd-392af4bc8f82';

-- Step 2: Delete related data first (if any)
-- =====================================================
-- Delete opening hours
DELETE FROM opening_hours 
WHERE salon_id = '9d9e551f-3c43-42e1-bbfd-392af4bc8f82';

-- Delete employees (if any)
DELETE FROM employees 
WHERE salon_id = '9d9e551f-3c43-42e1-bbfd-392af4bc8f82';

-- Delete services (if any)
DELETE FROM services 
WHERE salon_id = '9d9e551f-3c43-42e1-bbfd-392af4bc8f82';

-- Delete customers (if any)
DELETE FROM customers 
WHERE salon_id = '9d9e551f-3c43-42e1-bbfd-392af4bc8f82';

-- Delete bookings (if any)
DELETE FROM bookings 
WHERE salon_id = '9d9e551f-3c43-42e1-bbfd-392af4bc8f82';

-- Delete shifts (if any)
DELETE FROM shifts 
WHERE salon_id = '9d9e551f-3c43-42e1-bbfd-392af4bc8f82';

-- Step 3: Delete the salon
-- =====================================================
DELETE FROM salons 
WHERE id = '9d9e551f-3c43-42e1-bbfd-392af4bc8f82';

-- Step 4: Verify deletion
-- =====================================================
SELECT 
  id,
  name
FROM salons
WHERE id = '9d9e551f-3c43-42e1-bbfd-392af4bc8f82';
-- Should return no rows

