-- Fix ambiguous column reference "id" in reminders RLS policies
-- This migration updates the RLS policies to use explicit table prefixes

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view reminders for their salon bookings" ON reminders;
DROP POLICY IF EXISTS "Users can update reminders for their salon bookings" ON reminders;

-- Recreate with explicit table prefixes to avoid ambiguous column references
CREATE POLICY "Users can view reminders for their salon bookings"
  ON reminders FOR SELECT
  USING (
    reminders.booking_id IN (
      SELECT bookings.id FROM public.bookings
      WHERE bookings.salon_id IN (
        SELECT profiles.salon_id FROM public.profiles WHERE profiles.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update reminders for their salon bookings"
  ON reminders FOR UPDATE
  USING (
    reminders.booking_id IN (
      SELECT bookings.id FROM public.bookings
      WHERE bookings.salon_id IN (
        SELECT profiles.salon_id FROM public.profiles WHERE profiles.user_id = auth.uid()
      )
    )
  );

COMMENT ON POLICY "Users can view reminders for their salon bookings" ON reminders IS 
  'Allows users to view reminders for bookings in their salon. Uses explicit table prefixes to avoid ambiguous column references.';

COMMENT ON POLICY "Users can update reminders for their salon bookings" ON reminders IS 
  'Allows users to update reminders for bookings in their salon. Uses explicit table prefixes to avoid ambiguous column references.';

