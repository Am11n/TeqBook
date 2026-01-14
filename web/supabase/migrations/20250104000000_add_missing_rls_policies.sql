-- =====================================================
-- Add Missing RLS Policies for Tenant Tables
-- =====================================================
-- This migration adds RLS policies for tables that were missing them:
-- - bookings
-- - customers
-- - employees
-- - services
-- - shifts
-- - salons
--
-- All policies follow the standard pattern:
-- 1. Users can only access data for their own salon
-- 2. Superadmins can view all data
-- =====================================================

-- =====================================================
-- 1. BOOKINGS TABLE
-- =====================================================

-- Enable RLS if not already enabled
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Users can view bookings for their salon" ON bookings;
DROP POLICY IF EXISTS "Users can insert bookings for their salon" ON bookings;
DROP POLICY IF EXISTS "Users can update bookings for their salon" ON bookings;
DROP POLICY IF EXISTS "Users can delete bookings for their salon" ON bookings;
DROP POLICY IF EXISTS "Superadmins can view all bookings" ON bookings;

-- Users can view bookings for their salon
CREATE POLICY "Users can view bookings for their salon"
  ON bookings FOR SELECT
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Users can insert bookings for their salon
CREATE POLICY "Users can insert bookings for their salon"
  ON bookings FOR INSERT
  WITH CHECK (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Users can update bookings for their salon
CREATE POLICY "Users can update bookings for their salon"
  ON bookings FOR UPDATE
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Users can delete bookings for their salon
CREATE POLICY "Users can delete bookings for their salon"
  ON bookings FOR DELETE
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Superadmins can view all bookings
CREATE POLICY "Superadmins can view all bookings"
  ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_superadmin = TRUE
    )
  );

-- =====================================================
-- 2. CUSTOMERS TABLE
-- =====================================================

-- Enable RLS if not already enabled
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Users can view customers for their salon" ON customers;
DROP POLICY IF EXISTS "Users can insert customers for their salon" ON customers;
DROP POLICY IF EXISTS "Users can update customers for their salon" ON customers;
DROP POLICY IF EXISTS "Users can delete customers for their salon" ON customers;
DROP POLICY IF EXISTS "Superadmins can view all customers" ON customers;

-- Users can view customers for their salon
CREATE POLICY "Users can view customers for their salon"
  ON customers FOR SELECT
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Users can insert customers for their salon
CREATE POLICY "Users can insert customers for their salon"
  ON customers FOR INSERT
  WITH CHECK (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Users can update customers for their salon
CREATE POLICY "Users can update customers for their salon"
  ON customers FOR UPDATE
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Users can delete customers for their salon
CREATE POLICY "Users can delete customers for their salon"
  ON customers FOR DELETE
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Superadmins can view all customers
CREATE POLICY "Superadmins can view all customers"
  ON customers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_superadmin = TRUE
    )
  );

-- =====================================================
-- 3. EMPLOYEES TABLE
-- =====================================================

-- Enable RLS if not already enabled
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent)
-- Drop our new policies
DROP POLICY IF EXISTS "Users can view employees for their salon" ON employees;
DROP POLICY IF EXISTS "Users can insert employees for their salon" ON employees;
DROP POLICY IF EXISTS "Users can update employees for their salon" ON employees;
DROP POLICY IF EXISTS "Users can delete employees for their salon" ON employees;
DROP POLICY IF EXISTS "Superadmins can view all employees" ON employees;
-- Drop existing policies that may conflict
DROP POLICY IF EXISTS "Public can see employees for public salons" ON employees;
DROP POLICY IF EXISTS "Salon owners manage their employees" ON employees;
DROP POLICY IF EXISTS "Salon owners see their employees" ON employees;

-- Users can view employees for their salon
CREATE POLICY "Users can view employees for their salon"
  ON employees FOR SELECT
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Users can insert employees for their salon
CREATE POLICY "Users can insert employees for their salon"
  ON employees FOR INSERT
  WITH CHECK (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Users can update employees for their salon
CREATE POLICY "Users can update employees for their salon"
  ON employees FOR UPDATE
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Users can delete employees for their salon
CREATE POLICY "Users can delete employees for their salon"
  ON employees FOR DELETE
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Superadmins can view all employees
CREATE POLICY "Superadmins can view all employees"
  ON employees FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_superadmin = TRUE
    )
  );

-- =====================================================
-- 4. SERVICES TABLE
-- =====================================================

-- Enable RLS if not already enabled
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent)
-- Drop our new policies
DROP POLICY IF EXISTS "Users can view services for their salon" ON services;
DROP POLICY IF EXISTS "Users can insert services for their salon" ON services;
DROP POLICY IF EXISTS "Users can update services for their salon" ON services;
DROP POLICY IF EXISTS "Users can delete services for their salon" ON services;
DROP POLICY IF EXISTS "Superadmins can view all services" ON services;
-- Drop existing policies that may conflict
DROP POLICY IF EXISTS "Public can see services for public salons" ON services;
DROP POLICY IF EXISTS "Salon owners manage their services" ON services;
DROP POLICY IF EXISTS "Salon owners see their services" ON services;

-- Users can view services for their salon
CREATE POLICY "Users can view services for their salon"
  ON services FOR SELECT
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Users can insert services for their salon
CREATE POLICY "Users can insert services for their salon"
  ON services FOR INSERT
  WITH CHECK (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Users can update services for their salon
CREATE POLICY "Users can update services for their salon"
  ON services FOR UPDATE
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Users can delete services for their salon
CREATE POLICY "Users can delete services for their salon"
  ON services FOR DELETE
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Superadmins can view all services
CREATE POLICY "Superadmins can view all services"
  ON services FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_superadmin = TRUE
    )
  );

-- =====================================================
-- 5. SHIFTS TABLE
-- =====================================================

-- Enable RLS if not already enabled
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Users can view shifts for their salon" ON shifts;
DROP POLICY IF EXISTS "Users can insert shifts for their salon" ON shifts;
DROP POLICY IF EXISTS "Users can update shifts for their salon" ON shifts;
DROP POLICY IF EXISTS "Users can delete shifts for their salon" ON shifts;
DROP POLICY IF EXISTS "Superadmins can view all shifts" ON shifts;

-- Users can view shifts for their salon
CREATE POLICY "Users can view shifts for their salon"
  ON shifts FOR SELECT
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Users can insert shifts for their salon
CREATE POLICY "Users can insert shifts for their salon"
  ON shifts FOR INSERT
  WITH CHECK (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Users can update shifts for their salon
CREATE POLICY "Users can update shifts for their salon"
  ON shifts FOR UPDATE
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Users can delete shifts for their salon
CREATE POLICY "Users can delete shifts for their salon"
  ON shifts FOR DELETE
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Superadmins can view all shifts
CREATE POLICY "Superadmins can view all shifts"
  ON shifts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_superadmin = TRUE
    )
  );

-- =====================================================
-- 6. SALONS TABLE
-- =====================================================

-- Enable RLS if not already enabled
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Users can view their own salon" ON salons;
DROP POLICY IF EXISTS "Users can update their own salon" ON salons;
DROP POLICY IF EXISTS "Superadmins can view all salons" ON salons;
DROP POLICY IF EXISTS "Superadmins can update all salons" ON salons;

-- Users can view their own salon
CREATE POLICY "Users can view their own salon"
  ON salons FOR SELECT
  USING (
    id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Users can update their own salon
CREATE POLICY "Users can update their own salon"
  ON salons FOR UPDATE
  USING (
    id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Superadmins can view all salons
CREATE POLICY "Superadmins can view all salons"
  ON salons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_superadmin = TRUE
    )
  );

-- Superadmins can update all salons
CREATE POLICY "Superadmins can update all salons"
  ON salons FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_superadmin = TRUE
    )
  );

-- Note: INSERT for salons is handled via RPC function `create_salon_for_current_user`
-- which automatically assigns the salon to the current user's profile

-- =====================================================
-- 7. PROFILES TABLE (Additional policies)
-- =====================================================

-- Enable RLS if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (user_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (user_id = auth.uid());

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Note: Superadmin policy already exists from add-superadmin.sql

-- =====================================================
-- Verification Queries (optional - run these to verify)
-- =====================================================

-- Check RLS is enabled on all tables
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('bookings', 'customers', 'employees', 'services', 'shifts', 'salons', 'profiles')
-- ORDER BY tablename;

-- List all policies for these tables
-- SELECT tablename, policyname, cmd
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- AND tablename IN ('bookings', 'customers', 'employees', 'services', 'shifts', 'salons', 'profiles')
-- ORDER BY tablename, policyname;

