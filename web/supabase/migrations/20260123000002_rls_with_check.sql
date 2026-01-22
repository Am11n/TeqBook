-- =====================================================
-- RLS UPDATE WITH CHECK Policies
-- =====================================================
-- Task Group 41: Add WITH CHECK to all UPDATE policies
-- and create salon_id immutability trigger
-- =====================================================
-- This migration:
-- 1. Adds WITH CHECK clauses to all UPDATE policies
-- 2. Creates trigger to prevent salon_id changes
-- =====================================================

-- =====================================================
-- 1. BOOKINGS TABLE
-- =====================================================

-- Drop existing UPDATE policy
DROP POLICY IF EXISTS "Users can update bookings for their salon" ON bookings;

-- Recreate with WITH CHECK
CREATE POLICY "Users can update bookings for their salon"
  ON bookings FOR UPDATE
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- 2. CUSTOMERS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can update customers for their salon" ON customers;

CREATE POLICY "Users can update customers for their salon"
  ON customers FOR UPDATE
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- 3. EMPLOYEES TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can update employees for their salon" ON employees;

CREATE POLICY "Users can update employees for their salon"
  ON employees FOR UPDATE
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- 4. SERVICES TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can update services for their salon" ON services;

CREATE POLICY "Users can update services for their salon"
  ON services FOR UPDATE
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- 5. SHIFTS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can update shifts for their salon" ON shifts;

CREATE POLICY "Users can update shifts for their salon"
  ON shifts FOR UPDATE
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- 6. SALONS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can update their own salon" ON salons;

CREATE POLICY "Users can update their own salon"
  ON salons FOR UPDATE
  USING (
    id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- 7. PRODUCTS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can update products for their salon" ON products;

CREATE POLICY "Users can update products for their salon"
  ON products FOR UPDATE
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- 8. BOOKING_PRODUCTS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can update booking_products for their salon" ON booking_products;

CREATE POLICY "Users can update booking_products for their salon"
  ON booking_products FOR UPDATE
  USING (
    booking_id IN (
      SELECT id FROM bookings
      WHERE salon_id IN (
        SELECT salon_id FROM profiles WHERE user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    booking_id IN (
      SELECT id FROM bookings
      WHERE salon_id IN (
        SELECT salon_id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

-- =====================================================
-- 9. OPENING_HOURS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can update opening_hours for their salon" ON opening_hours;

CREATE POLICY "Users can update opening_hours for their salon"
  ON opening_hours FOR UPDATE
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- 10. SALON_ADDONS TABLE (addons)
-- =====================================================

DROP POLICY IF EXISTS "Users can update addons for their salon" ON addons;

CREATE POLICY "Users can update addons for their salon"
  ON addons FOR UPDATE
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- SALON_ID IMMUTABILITY TRIGGER
-- =====================================================

-- Function to prevent salon_id changes
CREATE OR REPLACE FUNCTION prevent_salon_id_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if salon_id is being changed
  IF OLD.salon_id IS DISTINCT FROM NEW.salon_id THEN
    RAISE EXCEPTION 'salon_id cannot be changed after INSERT. Attempted to change from % to %', 
      OLD.salon_id, NEW.salon_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tenant tables with salon_id
CREATE TRIGGER prevent_salon_id_change_bookings
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION prevent_salon_id_change();

CREATE TRIGGER prevent_salon_id_change_customers
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION prevent_salon_id_change();

CREATE TRIGGER prevent_salon_id_change_employees
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION prevent_salon_id_change();

CREATE TRIGGER prevent_salon_id_change_services
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION prevent_salon_id_change();

CREATE TRIGGER prevent_salon_id_change_products
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION prevent_salon_id_change();

CREATE TRIGGER prevent_salon_id_change_opening_hours
  BEFORE UPDATE ON opening_hours
  FOR EACH ROW
  EXECUTE FUNCTION prevent_salon_id_change();

CREATE TRIGGER prevent_salon_id_change_addons
  BEFORE UPDATE ON addons
  FOR EACH ROW
  EXECUTE FUNCTION prevent_salon_id_change();

-- Note: shifts table doesn't have salon_id directly (uses employee_id)
-- Note: booking_products doesn't have salon_id directly (uses booking_id)
-- Note: salons table uses 'id' not 'salon_id', so no trigger needed

COMMENT ON FUNCTION prevent_salon_id_change IS 
  'Prevents salon_id from being changed after INSERT. This ensures tenant isolation cannot be bypassed by updating salon_id.';
