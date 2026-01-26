-- Fix RLS policies for email_log and reminders to allow server-side API routes
-- API routes run server-side without user context, so we need to allow inserts
-- when salon_id is provided and valid

-- Drop existing INSERT policies
DROP POLICY IF EXISTS "Authenticated users can insert email logs" ON email_log;
DROP POLICY IF EXISTS "Authenticated users can insert reminders" ON reminders;

-- New policy: Allow inserts if salon_id is provided and belongs to a valid salon
-- This allows server-side API routes to insert email logs
CREATE POLICY "Allow inserts for valid salon_id"
  ON email_log
  FOR INSERT
  WITH CHECK (
    -- Allow if salon_id is NULL (for system emails)
    salon_id IS NULL
    OR
    -- Allow if salon_id exists in salons table
    salon_id IN (SELECT id FROM public.salons)
    OR
    -- Allow if user is authenticated and has access to salon
    (auth.uid() IS NOT NULL AND salon_id IN (
      SELECT salon_id FROM public.profiles WHERE user_id = auth.uid()
    ))
  );

-- New policy: Allow inserts for reminders if booking belongs to a valid salon
CREATE POLICY "Allow inserts for reminders with valid booking"
  ON reminders
  FOR INSERT
  WITH CHECK (
    -- Allow if booking exists and belongs to a valid salon
    booking_id IN (
      SELECT bookings.id FROM public.bookings
      WHERE bookings.salon_id IN (SELECT id FROM public.salons)
    )
    OR
    -- Allow if user is authenticated and has access to booking's salon
    (auth.uid() IS NOT NULL AND booking_id IN (
      SELECT bookings.id FROM public.bookings
      WHERE bookings.salon_id IN (
        SELECT profiles.salon_id FROM public.profiles WHERE profiles.user_id = auth.uid()
      )
    ))
  );

COMMENT ON POLICY "Allow inserts for valid salon_id" ON email_log IS 'Allows server-side API routes to insert email logs for valid salons';
COMMENT ON POLICY "Allow inserts for reminders with valid booking" ON reminders IS 'Allows server-side API routes to insert reminders for bookings in valid salons';

