-- =====================================================
-- Pilot access recovery: restore grants + RLS policies
-- =====================================================
-- Purpose:
-- - Repair permission drift that blocks authenticated users in pilot
--   from reading core tables after login.
-- - Keep this idempotent so it can be safely re-applied.

BEGIN;

-- Schema usage
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Base grants for app-facing tables
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO authenticated;
GRANT SELECT, UPDATE ON TABLE public.salons TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.opening_hours TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.services TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.employees TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.employee_services TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.bookings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.customers TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.personalliste_entries TO authenticated;
GRANT SELECT, INSERT ON TABLE public.security_audit_log TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.gift_cards TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.shifts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.addons TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.feedback_entries TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.support_cases TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.packages TO authenticated;
GRANT SELECT ON TABLE public.features TO anon, authenticated;
GRANT SELECT ON TABLE public.plan_features TO anon, authenticated;

-- Service role must always keep full access for server-side jobs/functions
GRANT ALL PRIVILEGES ON TABLE public.profiles TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.salons TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.opening_hours TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.notifications TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.services TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.employees TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.employee_services TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.bookings TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.customers TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.personalliste_entries TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.security_audit_log TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.gift_cards TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.shifts TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.addons TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.feedback_entries TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.support_cases TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.packages TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.features TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.plan_features TO service_role;

-- Ensure RLS remains enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opening_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personalliste_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_features ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Salons policies
DROP POLICY IF EXISTS "Users can view their own salon" ON public.salons;
CREATE POLICY "Users can view their own salon"
  ON public.salons
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT p.salon_id
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own salon" ON public.salons;
CREATE POLICY "Users can update their own salon"
  ON public.salons
  FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT p.salon_id
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    id IN (
      SELECT p.salon_id
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  );

-- Opening hours policies
DROP POLICY IF EXISTS "Users can view opening_hours for their salon" ON public.opening_hours;
CREATE POLICY "Users can view opening_hours for their salon"
  ON public.opening_hours
  FOR SELECT
  TO authenticated
  USING (
    salon_id IN (
      SELECT p.salon_id
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert opening_hours for their salon" ON public.opening_hours;
CREATE POLICY "Users can insert opening_hours for their salon"
  ON public.opening_hours
  FOR INSERT
  TO authenticated
  WITH CHECK (
    salon_id IN (
      SELECT p.salon_id
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update opening_hours for their salon" ON public.opening_hours;
CREATE POLICY "Users can update opening_hours for their salon"
  ON public.opening_hours
  FOR UPDATE
  TO authenticated
  USING (
    salon_id IN (
      SELECT p.salon_id
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    salon_id IN (
      SELECT p.salon_id
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  );

-- Notifications policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications"
  ON public.notifications
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications;
CREATE POLICY "Service role can insert notifications"
  ON public.notifications
  FOR INSERT
  TO authenticated, service_role
  WITH CHECK (true);

-- Services / employees / employee_services policies
DROP POLICY IF EXISTS "Users can view services for their salon" ON public.services;
CREATE POLICY "Users can view services for their salon"
  ON public.services
  FOR SELECT
  TO authenticated
  USING (
    salon_id IN (
      SELECT p.salon_id
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can view employees for their salon" ON public.employees;
CREATE POLICY "Users can view employees for their salon"
  ON public.employees
  FOR SELECT
  TO authenticated
  USING (
    salon_id IN (
      SELECT p.salon_id
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can view employee_services for their salon" ON public.employee_services;
CREATE POLICY "Users can view employee_services for their salon"
  ON public.employee_services
  FOR SELECT
  TO authenticated
  USING (
    salon_id IN (
      SELECT p.salon_id
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  );

-- Bookings policies
DROP POLICY IF EXISTS "Users can view bookings for their salon" ON public.bookings;
CREATE POLICY "Users can view bookings for their salon"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (
    salon_id IN (
      SELECT p.salon_id
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert bookings for their salon" ON public.bookings;
CREATE POLICY "Users can insert bookings for their salon"
  ON public.bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    salon_id IN (
      SELECT p.salon_id
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update bookings for their salon" ON public.bookings;
CREATE POLICY "Users can update bookings for their salon"
  ON public.bookings
  FOR UPDATE
  TO authenticated
  USING (
    salon_id IN (
      SELECT p.salon_id
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    salon_id IN (
      SELECT p.salon_id
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete bookings for their salon" ON public.bookings;
CREATE POLICY "Users can delete bookings for their salon"
  ON public.bookings
  FOR DELETE
  TO authenticated
  USING (
    salon_id IN (
      SELECT p.salon_id
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  );

-- Customers policies
DROP POLICY IF EXISTS "Users can view customers for their salon" ON public.customers;
CREATE POLICY "Users can view customers for their salon"
  ON public.customers
  FOR SELECT
  TO authenticated
  USING (
    salon_id IN (
      SELECT p.salon_id
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert customers for their salon" ON public.customers;
CREATE POLICY "Users can insert customers for their salon"
  ON public.customers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    salon_id IN (
      SELECT p.salon_id
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update customers for their salon" ON public.customers;
CREATE POLICY "Users can update customers for their salon"
  ON public.customers
  FOR UPDATE
  TO authenticated
  USING (
    salon_id IN (
      SELECT p.salon_id
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    salon_id IN (
      SELECT p.salon_id
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete customers for their salon" ON public.customers;
CREATE POLICY "Users can delete customers for their salon"
  ON public.customers
  FOR DELETE
  TO authenticated
  USING (
    salon_id IN (
      SELECT p.salon_id
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  );

-- Personalliste policies
DROP POLICY IF EXISTS "Users can view personalliste for their salon" ON public.personalliste_entries;
CREATE POLICY "Users can view personalliste for their salon"
  ON public.personalliste_entries
  FOR SELECT
  TO authenticated
  USING (
    salon_id IN (
      SELECT p.salon_id
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert personalliste for their salon" ON public.personalliste_entries;
CREATE POLICY "Users can insert personalliste for their salon"
  ON public.personalliste_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (
    salon_id IN (
      SELECT p.salon_id
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update personalliste for their salon" ON public.personalliste_entries;
CREATE POLICY "Users can update personalliste for their salon"
  ON public.personalliste_entries
  FOR UPDATE
  TO authenticated
  USING (
    salon_id IN (
      SELECT p.salon_id
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    salon_id IN (
      SELECT p.salon_id
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  );

-- Security audit log policies
DROP POLICY IF EXISTS "Salon members can read audit logs" ON public.security_audit_log;
CREATE POLICY "Salon members can read audit logs"
  ON public.security_audit_log
  FOR SELECT
  TO authenticated
  USING (
    salon_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
      AND p.salon_id = security_audit_log.salon_id
    )
  );

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
  );

DROP POLICY IF EXISTS "Anonymous audit logs allowed" ON public.security_audit_log;
CREATE POLICY "Anonymous audit logs allowed"
  ON public.security_audit_log
  FOR INSERT
  TO anon
  WITH CHECK (
    auth.uid() IS NULL
    AND user_id IS NULL
    AND salon_id IS NOT NULL
  );

DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.security_audit_log;
CREATE POLICY "Service role can insert audit logs"
  ON public.security_audit_log
  FOR INSERT
  TO service_role
  WITH CHECK (auth.role() = 'service_role');

-- Gift cards policies
DROP POLICY IF EXISTS "Users can view gift cards for their salon" ON public.gift_cards;
CREATE POLICY "Users can view gift cards for their salon"
  ON public.gift_cards
  FOR SELECT
  TO authenticated
  USING (
    salon_id IN (
      SELECT p.salon_id
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert gift cards for their salon" ON public.gift_cards;
CREATE POLICY "Users can insert gift cards for their salon"
  ON public.gift_cards
  FOR INSERT
  TO authenticated
  WITH CHECK (
    salon_id IN (
      SELECT p.salon_id
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update gift cards for their salon" ON public.gift_cards;
CREATE POLICY "Users can update gift cards for their salon"
  ON public.gift_cards
  FOR UPDATE
  TO authenticated
  USING (
    salon_id IN (
      SELECT p.salon_id
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    salon_id IN (
      SELECT p.salon_id
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  );

-- Shifts policies
DROP POLICY IF EXISTS "Users can view shifts for their salon" ON public.shifts;
CREATE POLICY "Users can view shifts for their salon"
  ON public.shifts
  FOR SELECT
  TO authenticated
  USING (
    salon_id IN (
      SELECT p.salon_id
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert shifts for their salon" ON public.shifts;
CREATE POLICY "Users can insert shifts for their salon"
  ON public.shifts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    salon_id IN (
      SELECT p.salon_id
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update shifts for their salon" ON public.shifts;
CREATE POLICY "Users can update shifts for their salon"
  ON public.shifts
  FOR UPDATE
  TO authenticated
  USING (
    salon_id IN (
      SELECT p.salon_id
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    salon_id IN (
      SELECT p.salon_id
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete shifts for their salon" ON public.shifts;
CREATE POLICY "Users can delete shifts for their salon"
  ON public.shifts
  FOR DELETE
  TO authenticated
  USING (
    salon_id IN (
      SELECT p.salon_id
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  );

-- Addons policies
DROP POLICY IF EXISTS "Users can view addons for their salon" ON public.addons;
CREATE POLICY "Users can view addons for their salon"
  ON public.addons
  FOR SELECT
  TO authenticated
  USING (
    salon_id IN (
      SELECT p.salon_id
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert addons for their salon" ON public.addons;
CREATE POLICY "Users can insert addons for their salon"
  ON public.addons
  FOR INSERT
  TO authenticated
  WITH CHECK (
    salon_id IN (
      SELECT p.salon_id
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update addons for their salon" ON public.addons;
CREATE POLICY "Users can update addons for their salon"
  ON public.addons
  FOR UPDATE
  TO authenticated
  USING (
    salon_id IN (
      SELECT p.salon_id
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    salon_id IN (
      SELECT p.salon_id
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete addons for their salon" ON public.addons;
CREATE POLICY "Users can delete addons for their salon"
  ON public.addons
  FOR DELETE
  TO authenticated
  USING (
    salon_id IN (
      SELECT p.salon_id
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  );

-- Feedback entries policies
DROP POLICY IF EXISTS "superadmins_feedback" ON public.feedback_entries;
CREATE POLICY "superadmins_feedback"
  ON public.feedback_entries
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
      AND p.is_superadmin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
      AND p.is_superadmin = true
    )
  );

DROP POLICY IF EXISTS "Salon owners can read own feedback" ON public.feedback_entries;
CREATE POLICY "Salon owners can read own feedback"
  ON public.feedback_entries
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
      AND p.salon_id = feedback_entries.salon_id
      AND p.role = 'owner'
    )
  );

DROP POLICY IF EXISTS "Salon owners can update own feedback when new" ON public.feedback_entries;
CREATE POLICY "Salon owners can update own feedback when new"
  ON public.feedback_entries
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    AND status = 'new'
  )
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'new'
  );

-- Support cases policies
DROP POLICY IF EXISTS "Superadmins can read support cases" ON public.support_cases;
CREATE POLICY "Superadmins can read support cases"
  ON public.support_cases
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
      AND p.is_superadmin = true
    )
  );

DROP POLICY IF EXISTS "Superadmins can insert support cases" ON public.support_cases;
CREATE POLICY "Superadmins can insert support cases"
  ON public.support_cases
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
      AND p.is_superadmin = true
    )
  );

DROP POLICY IF EXISTS "Superadmins can update support cases" ON public.support_cases;
CREATE POLICY "Superadmins can update support cases"
  ON public.support_cases
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
      AND p.is_superadmin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
      AND p.is_superadmin = true
    )
  );

DROP POLICY IF EXISTS "Salon owners can read own support cases" ON public.support_cases;
CREATE POLICY "Salon owners can read own support cases"
  ON public.support_cases
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
      AND p.salon_id = support_cases.salon_id
      AND p.role = 'owner'
    )
  );

DROP POLICY IF EXISTS "No deletes on support cases" ON public.support_cases;
CREATE POLICY "No deletes on support cases"
  ON public.support_cases
  FOR DELETE
  TO authenticated
  USING (false);

-- Packages policies
DROP POLICY IF EXISTS "Users can view packages for their salon" ON public.packages;
CREATE POLICY "Users can view packages for their salon"
  ON public.packages
  FOR SELECT
  TO authenticated
  USING (
    salon_id IN (
      SELECT p.salon_id
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert packages for their salon" ON public.packages;
CREATE POLICY "Users can insert packages for their salon"
  ON public.packages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    salon_id IN (
      SELECT p.salon_id
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update packages for their salon" ON public.packages;
CREATE POLICY "Users can update packages for their salon"
  ON public.packages
  FOR UPDATE
  TO authenticated
  USING (
    salon_id IN (
      SELECT p.salon_id
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    salon_id IN (
      SELECT p.salon_id
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  );

-- Storage recovery: salon-assets bucket + object policies
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'salon-assets',
  'salon-assets',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/*']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can read salon logos" ON storage.objects;
CREATE POLICY "Public can read salon logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'salon-assets');

DROP POLICY IF EXISTS "Salon members can upload salon logos" ON storage.objects;
CREATE POLICY "Salon members can upload salon logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'salon-assets'
  AND (storage.foldername(name))[1] = 'logos'
  AND (storage.foldername(name))[2] IN (
    SELECT p.salon_id::text
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.salon_id IS NOT NULL
  )
);

DROP POLICY IF EXISTS "Salon members can delete salon logos" ON storage.objects;
CREATE POLICY "Salon members can delete salon logos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'salon-assets'
  AND (storage.foldername(name))[1] = 'logos'
  AND (storage.foldername(name))[2] IN (
    SELECT p.salon_id::text
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.salon_id IS NOT NULL
  )
);

DROP POLICY IF EXISTS "Salon members can upload cover images" ON storage.objects;
CREATE POLICY "Salon members can upload cover images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'salon-assets'
  AND (storage.foldername(name))[1] = 'covers'
  AND (storage.foldername(name))[2] IN (
    SELECT p.salon_id::text
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.salon_id IS NOT NULL
  )
);

DROP POLICY IF EXISTS "Salon members can delete cover images" ON storage.objects;
CREATE POLICY "Salon members can delete cover images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'salon-assets'
  AND (storage.foldername(name))[1] = 'covers'
  AND (storage.foldername(name))[2] IN (
    SELECT p.salon_id::text
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.salon_id IS NOT NULL
  )
);

DROP POLICY IF EXISTS "Salon members can upload employee images" ON storage.objects;
CREATE POLICY "Salon members can upload employee images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'salon-assets'
  AND (storage.foldername(name))[1] = 'employees'
  AND (storage.foldername(name))[2] IN (
    SELECT p.salon_id::text
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.salon_id IS NOT NULL
  )
);

DROP POLICY IF EXISTS "Salon members can delete employee images" ON storage.objects;
CREATE POLICY "Salon members can delete employee images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'salon-assets'
  AND (storage.foldername(name))[1] = 'employees'
  AND (storage.foldername(name))[2] IN (
    SELECT p.salon_id::text
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.salon_id IS NOT NULL
  )
);

-- Public feature catalog policies
DROP POLICY IF EXISTS "Anyone can view features" ON public.features;
CREATE POLICY "Anyone can view features"
  ON public.features
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Anyone can view plan_features" ON public.plan_features;
CREATE POLICY "Anyone can view plan_features"
  ON public.plan_features
  FOR SELECT
  TO anon, authenticated
  USING (true);

COMMIT;
