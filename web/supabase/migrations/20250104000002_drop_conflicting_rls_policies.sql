-- =====================================================
-- Drop Conflicting RLS Policies
-- =====================================================
-- This migration drops existing RLS policies that conflict
-- with our stricter tenant isolation policies.
-- These policies allow public access which breaks multi-tenant isolation.
-- =====================================================

-- Drop conflicting policies on employees table
DROP POLICY IF EXISTS "Public can see employees for public salons" ON employees;
DROP POLICY IF EXISTS "Salon owners manage their employees" ON employees;
DROP POLICY IF EXISTS "Salon owners see their employees" ON employees;

-- Drop conflicting policies on services table
DROP POLICY IF EXISTS "Public can see services for public salons" ON services;
DROP POLICY IF EXISTS "Salon owners manage their services" ON services;
DROP POLICY IF EXISTS "Salon owners see their services" ON services;

-- Note: The policies "Users can view employees for their salon" and
-- "Users can view services for their salon" from the previous migration
-- will remain and provide proper tenant isolation.

