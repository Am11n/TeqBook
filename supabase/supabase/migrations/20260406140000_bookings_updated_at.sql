-- Add bookings.updated_at required by update_booking_atomic (fixes missing column error).

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

UPDATE public.bookings
SET updated_at = created_at
WHERE updated_at IS NULL;

CREATE OR REPLACE FUNCTION public.set_bookings_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $fn$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS bookings_set_updated_at ON public.bookings;
CREATE TRIGGER bookings_set_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_bookings_updated_at();
