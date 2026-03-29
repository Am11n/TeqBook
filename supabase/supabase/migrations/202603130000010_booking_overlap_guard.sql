-- =====================================================
-- Booking overlap hard guard + atomic booking update
-- =====================================================
-- Adds DB-level overlap protection for active bookings and
-- introduces an atomic update RPC for reschedule/employee changes.

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE bookings
  DROP CONSTRAINT IF EXISTS bookings_no_overlapping_active_slots;

ALTER TABLE bookings
  ADD CONSTRAINT bookings_no_overlapping_active_slots
  EXCLUDE USING gist (
    salon_id WITH =,
    employee_id WITH =,
    tstzrange(start_time, end_time, '[)') WITH &&
  )
  WHERE (status IN ('pending', 'confirmed', 'scheduled'));
