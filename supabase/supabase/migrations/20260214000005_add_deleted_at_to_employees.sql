-- Add soft delete support for employees
-- Instead of hard DELETE (which fails due to FK from bookings),
-- we set deleted_at to archive the employee while preserving booking history.
ALTER TABLE employees ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
