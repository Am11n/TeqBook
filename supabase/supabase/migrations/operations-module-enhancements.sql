-- =====================================================
-- Operations Module Enhancements
-- =====================================================
-- This SQL script adds new fields and relationships
-- to enhance the operations modules (services, employees, bookings, etc.)
--
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Enhance services table
-- =====================================================

-- Add category column to services
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'services' AND column_name = 'category'
  ) THEN
    ALTER TABLE services ADD COLUMN category TEXT;
  END IF;
  
  -- Add constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'services' AND constraint_name = 'services_category_check'
  ) THEN
    ALTER TABLE services ADD CONSTRAINT services_category_check 
      CHECK (category IS NULL OR category IN ('cut', 'beard', 'color', 'nails', 'massage', 'other'));
  END IF;
END $$;

-- Add sort_order column to services
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'services' AND column_name = 'sort_order'
  ) THEN
    ALTER TABLE services ADD COLUMN sort_order INTEGER DEFAULT 0;
  END IF;
END $$;

-- Add comments
COMMENT ON COLUMN services.category IS 'Service category: cut, beard, color, nails, massage, or other';
COMMENT ON COLUMN services.sort_order IS 'Display order for services (lower numbers appear first)';

-- Step 2: Enhance employees table
-- =====================================================

-- Add preferred_language column to employees
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'employees' AND column_name = 'preferred_language'
  ) THEN
    ALTER TABLE employees ADD COLUMN preferred_language TEXT DEFAULT 'en';
  END IF;
  
  -- Add constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'employees' AND constraint_name = 'employees_preferred_language_check'
  ) THEN
    ALTER TABLE employees ADD CONSTRAINT employees_preferred_language_check 
      CHECK (preferred_language IS NULL OR preferred_language IN ('nb', 'en', 'ar', 'so', 'ti', 'am', 'tr', 'pl', 'vi', 'tl', 'zh', 'fa', 'dar', 'ur', 'hi'));
  END IF;
END $$;

-- Note: role and is_active already exist

COMMENT ON COLUMN employees.preferred_language IS 'Preferred language for employee interface (matches AppLocale)';

-- Step 3: Create employee_services junction table
-- =====================================================

-- Create junction table for many-to-many relationship between employees and services
CREATE TABLE IF NOT EXISTS employee_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, service_id)
);

-- Enable RLS
ALTER TABLE employee_services ENABLE ROW LEVEL SECURITY;

-- RLS policies: Drop existing policies if they exist, then create them
DROP POLICY IF EXISTS "Users can view employee_services for their salon" ON employee_services;
DROP POLICY IF EXISTS "Users can insert employee_services for their salon" ON employee_services;
DROP POLICY IF EXISTS "Users can delete employee_services for their salon" ON employee_services;

-- RLS policy: Users can only see employee_services for their salon
CREATE POLICY "Users can view employee_services for their salon"
ON employee_services FOR SELECT
USING (
  salon_id IN (
    SELECT salon_id FROM profiles WHERE user_id = auth.uid()
  )
);

-- RLS policy: Users can insert employee_services for their salon
CREATE POLICY "Users can insert employee_services for their salon"
ON employee_services FOR INSERT
WITH CHECK (
  salon_id IN (
    SELECT salon_id FROM profiles WHERE user_id = auth.uid()
  )
);

-- RLS policy: Users can delete employee_services for their salon
CREATE POLICY "Users can delete employee_services for their salon"
ON employee_services FOR DELETE
USING (
  salon_id IN (
    SELECT salon_id FROM profiles WHERE user_id = auth.uid()
  )
);

COMMENT ON TABLE employee_services IS 'Junction table linking employees to services they can provide';

-- Step 4: Enhance bookings table
-- =====================================================

-- Update status column to support new statuses
-- First, check if we need to update existing status values
DO $$
BEGIN
  -- Add is_walk_in column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'is_walk_in'
  ) THEN
    ALTER TABLE bookings ADD COLUMN is_walk_in BOOLEAN DEFAULT false;
  END IF;
  
  -- Update status constraint if needed
  -- Note: This assumes status is currently a text field
  -- If status has a constraint, we may need to drop and recreate it
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'bookings' AND constraint_name = 'bookings_status_check'
  ) THEN
    ALTER TABLE bookings DROP CONSTRAINT bookings_status_check;
  END IF;
  
  -- Add new constraint with all statuses
  ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
    CHECK (status IS NULL OR status IN ('pending', 'confirmed', 'no-show', 'completed', 'cancelled', 'scheduled'));
END $$;

-- Add comments
COMMENT ON COLUMN bookings.is_walk_in IS 'Whether this booking was made as a walk-in (true) or online (false)';
COMMENT ON COLUMN bookings.status IS 'Booking status: pending, confirmed, no-show, completed, cancelled, or scheduled';

-- Step 5: Ensure shifts are properly linked to employees
-- =====================================================

-- Shifts table should already have employee_id, but let's verify the foreign key exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'shifts' 
    AND constraint_name LIKE '%employee%'
    AND constraint_type = 'FOREIGN KEY'
  ) THEN
    -- Add foreign key if it doesn't exist
    ALTER TABLE shifts 
    ADD CONSTRAINT shifts_employee_id_fkey 
    FOREIGN KEY (employee_id) 
    REFERENCES employees(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Step 6: Update create_booking_with_validation RPC function to support is_walk_in
-- =====================================================

-- Drop existing function if it exists (handles both old and new signatures)
DROP FUNCTION IF EXISTS create_booking_with_validation(UUID, UUID, UUID, TIMESTAMPTZ, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS create_booking_with_validation(UUID, UUID, UUID, TIMESTAMPTZ, TEXT, TEXT, TEXT, TEXT, BOOLEAN);

-- Create updated function with is_walk_in parameter
CREATE OR REPLACE FUNCTION create_booking_with_validation(
  p_salon_id UUID,
  p_employee_id UUID,
  p_service_id UUID,
  p_start_time TIMESTAMPTZ,
  p_customer_full_name TEXT,
  p_customer_email TEXT DEFAULT NULL,
  p_customer_phone TEXT DEFAULT NULL,
  p_customer_notes TEXT DEFAULT NULL,
  p_is_walk_in BOOLEAN DEFAULT false
)
RETURNS TABLE (
  id UUID,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  status TEXT,
  is_walk_in BOOLEAN,
  notes TEXT,
  customers JSONB,
  employees JSONB,
  services JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_service_duration INTEGER;
  v_end_time TIMESTAMPTZ;
  v_customer_id UUID;
  v_booking_id UUID;
BEGIN
  -- Get service duration
  SELECT duration_minutes INTO v_service_duration
  FROM services
  WHERE id = p_service_id AND salon_id = p_salon_id;

  IF v_service_duration IS NULL THEN
    RAISE EXCEPTION 'Service not found or does not belong to salon';
  END IF;

  -- Calculate end time
  v_end_time := p_start_time + (v_service_duration || ' minutes')::INTERVAL;

  -- Check for overlapping bookings
  IF EXISTS (
    SELECT 1 FROM bookings
    WHERE salon_id = p_salon_id
      AND employee_id = p_employee_id
      AND (
        (start_time < v_end_time AND end_time > p_start_time)
        OR (start_time = p_start_time)
      )
      AND status NOT IN ('cancelled', 'no-show')
  ) THEN
    RAISE EXCEPTION 'Time slot is already booked';
  END IF;

  -- Upsert customer
  INSERT INTO customers (salon_id, full_name, email, phone, notes)
  VALUES (p_salon_id, p_customer_full_name, p_customer_email, p_customer_phone, p_customer_notes)
  ON CONFLICT (salon_id, email) WHERE email IS NOT NULL
  DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(EXCLUDED.phone, customers.phone),
    notes = COALESCE(EXCLUDED.notes, customers.notes),
    updated_at = NOW()
  RETURNING id INTO v_customer_id;

  -- If no email conflict, get the customer_id from the insert
  IF v_customer_id IS NULL THEN
    SELECT id INTO v_customer_id
    FROM customers
    WHERE salon_id = p_salon_id
      AND (
        (email IS NOT NULL AND email = p_customer_email)
        OR (email IS NULL AND full_name = p_customer_full_name)
      )
    LIMIT 1;
  END IF;

  -- Create booking with default status 'pending' for walk-ins, 'confirmed' for online
  INSERT INTO bookings (
    salon_id,
    employee_id,
    service_id,
    customer_id,
    start_time,
    end_time,
    status,
    is_walk_in,
    notes
  )
  VALUES (
    p_salon_id,
    p_employee_id,
    p_service_id,
    v_customer_id,
    p_start_time,
    v_end_time,
    CASE WHEN p_is_walk_in THEN 'pending' ELSE 'confirmed' END,
    p_is_walk_in,
    p_customer_notes
  )
  RETURNING id INTO v_booking_id;

  -- Return booking with related data
  RETURN QUERY
  SELECT
    b.id,
    b.start_time,
    b.end_time,
    b.status,
    b.is_walk_in,
    b.notes,
    jsonb_build_object('full_name', c.full_name) as customers,
    jsonb_build_object('full_name', e.full_name) as employees,
    jsonb_build_object('name', s.name) as services
  FROM bookings b
  LEFT JOIN customers c ON b.customer_id = c.id
  LEFT JOIN employees e ON b.employee_id = e.id
  LEFT JOIN services s ON b.service_id = s.id
  WHERE b.id = v_booking_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_booking_with_validation(UUID, UUID, UUID, TIMESTAMPTZ, TEXT, TEXT, TEXT, TEXT, BOOLEAN) TO authenticated;

-- =====================================================
-- Verification queries (optional - run these to verify)
-- =====================================================

-- Check services columns
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'services'
-- AND column_name IN ('category', 'sort_order')
-- ORDER BY column_name;

-- Check employees columns
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'employees'
-- AND column_name IN ('preferred_language', 'role', 'is_active')
-- ORDER BY column_name;

-- Check bookings columns
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'bookings'
-- AND column_name IN ('status', 'is_walk_in')
-- ORDER BY column_name;

-- Check employee_services table
-- SELECT table_name, column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'employee_services'
-- ORDER BY ordinal_position;

