-- =====================================================
-- RLS: tenant writes require salon_tenant_mutation_allowed
-- =====================================================
-- Superadmin bypass is encoded inside salon_tenant_mutation_allowed().
-- Depends on: 20260329140000_salon_product_access_trial_billing_gate.sql
-- =====================================================

-- ─── Bookings ───
DROP POLICY IF EXISTS "Users can insert bookings for their salon" ON public.bookings;
CREATE POLICY "Users can insert bookings for their salon"
  ON public.bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  );

DROP POLICY IF EXISTS "Users can update bookings for their salon" ON public.bookings;
CREATE POLICY "Users can update bookings for their salon"
  ON public.bookings
  FOR UPDATE
  TO authenticated
  USING (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  )
  WITH CHECK (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  );

DROP POLICY IF EXISTS "Users can delete bookings for their salon" ON public.bookings;
CREATE POLICY "Users can delete bookings for their salon"
  ON public.bookings
  FOR DELETE
  TO authenticated
  USING (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  );

-- ─── Customers ───
DROP POLICY IF EXISTS "Users can insert customers for their salon" ON public.customers;
CREATE POLICY "Users can insert customers for their salon"
  ON public.customers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  );

DROP POLICY IF EXISTS "Users can update customers for their salon" ON public.customers;
CREATE POLICY "Users can update customers for their salon"
  ON public.customers
  FOR UPDATE
  TO authenticated
  USING (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  )
  WITH CHECK (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  );

DROP POLICY IF EXISTS "Users can delete customers for their salon" ON public.customers;
CREATE POLICY "Users can delete customers for their salon"
  ON public.customers
  FOR DELETE
  TO authenticated
  USING (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  );

-- ─── Shifts ───
DROP POLICY IF EXISTS "Users can insert shifts for their salon" ON public.shifts;
CREATE POLICY "Users can insert shifts for their salon"
  ON public.shifts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  );

DROP POLICY IF EXISTS "Users can update shifts for their salon" ON public.shifts;
CREATE POLICY "Users can update shifts for their salon"
  ON public.shifts
  FOR UPDATE
  TO authenticated
  USING (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  )
  WITH CHECK (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  );

DROP POLICY IF EXISTS "Users can delete shifts for their salon" ON public.shifts;
CREATE POLICY "Users can delete shifts for their salon"
  ON public.shifts
  FOR DELETE
  TO authenticated
  USING (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  );

-- ─── Opening hours ───
DROP POLICY IF EXISTS "Users can insert opening_hours for their salon" ON public.opening_hours;
CREATE POLICY "Users can insert opening_hours for their salon"
  ON public.opening_hours
  FOR INSERT
  TO authenticated
  WITH CHECK (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  );

DROP POLICY IF EXISTS "Users can update opening_hours for their salon" ON public.opening_hours;
CREATE POLICY "Users can update opening_hours for their salon"
  ON public.opening_hours
  FOR UPDATE
  TO authenticated
  USING (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  )
  WITH CHECK (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  );

-- ─── Opening hours breaks ───
DROP POLICY IF EXISTS "Users can insert breaks for their salon" ON public.opening_hours_breaks;
CREATE POLICY "Users can insert breaks for their salon"
  ON public.opening_hours_breaks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  );

DROP POLICY IF EXISTS "Users can update breaks for their salon" ON public.opening_hours_breaks;
CREATE POLICY "Users can update breaks for their salon"
  ON public.opening_hours_breaks
  FOR UPDATE
  TO authenticated
  USING (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  )
  WITH CHECK (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  );

DROP POLICY IF EXISTS "Users can delete breaks for their salon" ON public.opening_hours_breaks;
CREATE POLICY "Users can delete breaks for their salon"
  ON public.opening_hours_breaks
  FOR DELETE
  TO authenticated
  USING (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  );

-- ─── Gift cards ───
DROP POLICY IF EXISTS "Users can insert gift cards for their salon" ON public.gift_cards;
CREATE POLICY "Users can insert gift cards for their salon"
  ON public.gift_cards
  FOR INSERT
  TO authenticated
  WITH CHECK (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  );

DROP POLICY IF EXISTS "Users can update gift cards for their salon" ON public.gift_cards;
CREATE POLICY "Users can update gift cards for their salon"
  ON public.gift_cards
  FOR UPDATE
  TO authenticated
  USING (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  )
  WITH CHECK (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  );

-- ─── Personalliste ───
DROP POLICY IF EXISTS "Users can insert personalliste for their salon" ON public.personalliste_entries;
CREATE POLICY "Users can insert personalliste for their salon"
  ON public.personalliste_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  );

DROP POLICY IF EXISTS "Users can update personalliste for their salon" ON public.personalliste_entries;
CREATE POLICY "Users can update personalliste for their salon"
  ON public.personalliste_entries
  FOR UPDATE
  TO authenticated
  USING (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  )
  WITH CHECK (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  );

-- ─── Packages ───
DROP POLICY IF EXISTS "Users can insert packages for their salon" ON public.packages;
CREATE POLICY "Users can insert packages for their salon"
  ON public.packages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  );

DROP POLICY IF EXISTS "Users can update packages for their salon" ON public.packages;
CREATE POLICY "Users can update packages for their salon"
  ON public.packages
  FOR UPDATE
  TO authenticated
  USING (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  )
  WITH CHECK (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  );

-- ─── Addons ───
DROP POLICY IF EXISTS "Users can insert addons for their salon" ON public.addons;
CREATE POLICY "Users can insert addons for their salon"
  ON public.addons
  FOR INSERT
  TO authenticated
  WITH CHECK (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  );

DROP POLICY IF EXISTS "Users can update addons for their salon" ON public.addons;
CREATE POLICY "Users can update addons for their salon"
  ON public.addons
  FOR UPDATE
  TO authenticated
  USING (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  )
  WITH CHECK (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  );

DROP POLICY IF EXISTS "Users can delete addons for their salon" ON public.addons;
CREATE POLICY "Users can delete addons for their salon"
  ON public.addons
  FOR DELETE
  TO authenticated
  USING (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  );

-- ─── Time blocks ───
DROP POLICY IF EXISTS "Users can insert time_blocks for their salon" ON public.time_blocks;
CREATE POLICY "Users can insert time_blocks for their salon"
  ON public.time_blocks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  );

DROP POLICY IF EXISTS "Users can update time_blocks for their salon" ON public.time_blocks;
CREATE POLICY "Users can update time_blocks for their salon"
  ON public.time_blocks
  FOR UPDATE
  TO authenticated
  USING (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  )
  WITH CHECK (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  );

DROP POLICY IF EXISTS "Users can delete time_blocks for their salon" ON public.time_blocks;
CREATE POLICY "Users can delete time_blocks for their salon"
  ON public.time_blocks
  FOR DELETE
  TO authenticated
  USING (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  );

-- ─── Services (legacy policy names from 20250104000000) ───
DROP POLICY IF EXISTS "Users can insert services for their salon" ON public.services;
CREATE POLICY "Users can insert services for their salon"
  ON public.services
  FOR INSERT
  TO authenticated
  WITH CHECK (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  );

DROP POLICY IF EXISTS "Users can update services for their salon" ON public.services;
CREATE POLICY "Users can update services for their salon"
  ON public.services
  FOR UPDATE
  TO authenticated
  USING (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  )
  WITH CHECK (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  );

DROP POLICY IF EXISTS "Users can delete services for their salon" ON public.services;
CREATE POLICY "Users can delete services for their salon"
  ON public.services
  FOR DELETE
  TO authenticated
  USING (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  );

-- ─── Employees (legacy policy names) ───
DROP POLICY IF EXISTS "Users can insert employees for their salon" ON public.employees;
CREATE POLICY "Users can insert employees for their salon"
  ON public.employees
  FOR INSERT
  TO authenticated
  WITH CHECK (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  );

DROP POLICY IF EXISTS "Users can update employees for their salon" ON public.employees;
CREATE POLICY "Users can update employees for their salon"
  ON public.employees
  FOR UPDATE
  TO authenticated
  USING (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  )
  WITH CHECK (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  );

DROP POLICY IF EXISTS "Users can delete employees for their salon" ON public.employees;
CREATE POLICY "Users can delete employees for their salon"
  ON public.employees
  FOR DELETE
  TO authenticated
  USING (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  );

-- ─── Employee services junction ───
DROP POLICY IF EXISTS "Users can insert employee_services for their salon" ON public.employee_services;
CREATE POLICY "Users can insert employee_services for their salon"
  ON public.employee_services
  FOR INSERT
  TO authenticated
  WITH CHECK (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  );

DROP POLICY IF EXISTS "Users can delete employee_services for their salon" ON public.employee_services;
CREATE POLICY "Users can delete employee_services for their salon"
  ON public.employee_services
  FOR DELETE
  TO authenticated
  USING (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  );

-- ─── Waitlist (salon-scoped rows only) ───
DROP POLICY IF EXISTS "Users can insert waitlist policies for their salon" ON public.waitlist_policies;
CREATE POLICY "Users can insert waitlist policies for their salon"
  ON public.waitlist_policies
  FOR INSERT
  TO authenticated
  WITH CHECK (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  );

DROP POLICY IF EXISTS "Users can update waitlist policies for their salon" ON public.waitlist_policies;
CREATE POLICY "Users can update waitlist policies for their salon"
  ON public.waitlist_policies
  FOR UPDATE
  TO authenticated
  USING (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  )
  WITH CHECK (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  );

DROP POLICY IF EXISTS "Users can insert waitlist offers for their salon" ON public.waitlist_offers;
CREATE POLICY "Users can insert waitlist offers for their salon"
  ON public.waitlist_offers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  );

DROP POLICY IF EXISTS "Users can update waitlist offers for their salon" ON public.waitlist_offers;
CREATE POLICY "Users can update waitlist offers for their salon"
  ON public.waitlist_offers
  FOR UPDATE
  TO authenticated
  USING (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  )
  WITH CHECK (
    salon_id IN (
      SELECT p.salon_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  );

-- ─── Security audit log (tenant inserts) ───
DROP POLICY IF EXISTS "Users can insert audit logs" ON public.security_audit_log;
CREATE POLICY "Users can insert audit logs"
  ON public.security_audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND salon_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.salon_id = security_audit_log.salon_id
    )
    AND public.salon_tenant_mutation_allowed(salon_id)
  );
