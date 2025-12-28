-- =====================================================
-- TeqBook Supabase Foundation - Complete Setup
-- =====================================================
-- This comprehensive SQL script implements all requirements
-- from Supabase-foundation.md:
-- 1. Postgres enums for central fields
-- 2. Indexes on all relevant tables
-- 3. Foreign key constraints verification
-- 4. Language preferences in Supabase
--
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- PART 1: CREATE POSTGRES ENUMS
-- =====================================================

-- 1.1. Booking Status Enum
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
    CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no-show', 'scheduled');
  END IF;
END $$;

-- 1.2. Employee Role Enum
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employee_role') THEN
    CREATE TYPE employee_role AS ENUM ('owner', 'manager', 'staff');
  END IF;
END $$;

-- 1.3. Plan Type Enum
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_type') THEN
    CREATE TYPE plan_type AS ENUM ('starter', 'pro', 'business');
  END IF;
END $$;

-- 1.4. Notification Type Enum
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    CREATE TYPE notification_type AS ENUM ('sms', 'email', 'whatsapp');
  END IF;
END $$;

-- 1.5. Notification Status Enum
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_status') THEN
    CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed');
  END IF;
END $$;

-- 1.6. Payment Method Enum
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
    CREATE TYPE payment_method AS ENUM ('in_salon', 'online');
  END IF;
END $$;

-- =====================================================
-- PART 2: VERIFY AND ADD FOREIGN KEYS
-- =====================================================

-- 2.1. Verify employees table has salon_id foreign key
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'employees' 
    AND constraint_name LIKE '%salon_id%'
    AND constraint_type = 'FOREIGN KEY'
  ) THEN
    ALTER TABLE employees 
    ADD CONSTRAINT employees_salon_id_fkey 
    FOREIGN KEY (salon_id) 
    REFERENCES salons(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- 2.2. Verify bookings table has salon_id foreign key
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'bookings' 
    AND constraint_name LIKE '%salon_id%'
    AND constraint_type = 'FOREIGN KEY'
  ) THEN
    ALTER TABLE bookings 
    ADD CONSTRAINT bookings_salon_id_fkey 
    FOREIGN KEY (salon_id) 
    REFERENCES salons(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- 2.3. Verify services table has salon_id foreign key
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'services' 
    AND constraint_name LIKE '%salon_id%'
    AND constraint_type = 'FOREIGN KEY'
  ) THEN
    ALTER TABLE services 
    ADD CONSTRAINT services_salon_id_fkey 
    FOREIGN KEY (salon_id) 
    REFERENCES salons(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- 2.4. Verify customers table has salon_id foreign key
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'customers' 
    AND constraint_name LIKE '%salon_id%'
    AND constraint_type = 'FOREIGN KEY'
  ) THEN
    ALTER TABLE customers 
    ADD CONSTRAINT customers_salon_id_fkey 
    FOREIGN KEY (salon_id) 
    REFERENCES salons(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- 2.5. Verify shifts table has salon_id foreign key
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'shifts' 
    AND constraint_name LIKE '%salon_id%'
    AND constraint_type = 'FOREIGN KEY'
  ) THEN
    ALTER TABLE shifts 
    ADD CONSTRAINT shifts_salon_id_fkey 
    FOREIGN KEY (salon_id) 
    REFERENCES salons(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- =====================================================
-- PART 3: CREATE INDEXES
-- =====================================================

-- 3.1. Bookings indexes
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_bookings_salon_start_time 
ON bookings(salon_id, start_time);

CREATE INDEX IF NOT EXISTS idx_bookings_salon_employee_start 
ON bookings(salon_id, employee_id, start_time)
WHERE employee_id IS NOT NULL;

-- 3.2. Employees index
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_employees_salon_id 
ON employees(salon_id);

-- 3.3. Customers index
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_customers_salon_id 
ON customers(salon_id);

-- 3.4. Services index
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_services_salon_id 
ON services(salon_id);

-- 3.5. Shifts indexes
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_shifts_salon_id 
ON shifts(salon_id);

CREATE INDEX IF NOT EXISTS idx_shifts_salon_employee_start 
ON shifts(salon_id, employee_id, start_time)
WHERE employee_id IS NOT NULL;

-- 3.6. Opening hours index
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_opening_hours_salon_id 
ON opening_hours(salon_id);

-- 3.7. Employee services index
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_employee_services_salon_id 
ON employee_services(salon_id);

-- =====================================================
-- PART 4: LANGUAGE PREFERENCES IN SUPABASE
-- =====================================================

-- 4.1. Add supported_languages to salons (array of text)
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'salons' AND column_name = 'supported_languages'
  ) THEN
    ALTER TABLE salons ADD COLUMN supported_languages TEXT[] DEFAULT ARRAY['en']::TEXT[];
    COMMENT ON COLUMN salons.supported_languages IS 'Array of supported languages for this salon (matches AppLocale values)';
  END IF;
END $$;

-- 4.2. Add default_language to salons
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'salons' AND column_name = 'default_language'
  ) THEN
    ALTER TABLE salons ADD COLUMN default_language TEXT DEFAULT 'en';
    COMMENT ON COLUMN salons.default_language IS 'Default language for this salon (matches AppLocale)';
  END IF;
END $$;

-- 4.3. Ensure profiles.preferred_language exists (should already exist)
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'preferred_language'
  ) THEN
    ALTER TABLE profiles ADD COLUMN preferred_language TEXT;
    COMMENT ON COLUMN profiles.preferred_language IS 'User preferred language (matches AppLocale)';
  END IF;
END $$;

-- =====================================================
-- PART 5: UPDATE EXISTING COLUMNS TO USE ENUMS (OPTIONAL)
-- =====================================================
-- Note: This is optional and can be done gradually.
-- For now, we'll keep text columns but add constraints
-- that match enum values. Full migration can be done later.

-- 5.1. Add constraint to bookings.status to match enum values
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'bookings' 
    AND constraint_name = 'bookings_status_check'
  ) THEN
    ALTER TABLE bookings 
    ADD CONSTRAINT bookings_status_check 
    CHECK (status IS NULL OR status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no-show', 'scheduled'));
  END IF;
END $$;

-- 5.2. Add constraint to profiles.role to match enum values
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'profiles' 
    AND constraint_name = 'profiles_role_check'
  ) THEN
    ALTER TABLE profiles 
    ADD CONSTRAINT profiles_role_check 
    CHECK (role IS NULL OR role IN ('owner', 'manager', 'staff', 'superadmin'));
  END IF;
END $$;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the setup:

-- Check enums:
-- SELECT typname FROM pg_type WHERE typname IN ('booking_status', 'employee_role', 'plan_type', 'notification_type', 'notification_status', 'payment_method');

-- Check indexes:
-- SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%';

-- Check foreign keys:
-- SELECT tc.table_name, tc.constraint_name, kcu.column_name, ccu.table_name AS foreign_table_name
-- FROM information_schema.table_constraints AS tc
-- JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
-- JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
-- WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name IN ('employees', 'bookings', 'services', 'customers', 'shifts');

-- Check language columns:
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name IN ('salons', 'profiles') 
-- AND column_name IN ('supported_languages', 'default_language', 'preferred_language');

