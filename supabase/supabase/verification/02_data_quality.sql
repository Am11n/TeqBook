-- WS5 verification: data quality guardrails
-- Designed to fail hard when blocked conditions exist.

DO $$
DECLARE
  duplicate_customer_count INTEGER := 0;
  orphan_booking_count INTEGER := 0;
  inactive_staff_booking_count INTEGER := 0;
  slug_collision_count INTEGER := 0;
BEGIN
  -- Duplicate customer check by (salon_id, phone)
  SELECT COUNT(*) INTO duplicate_customer_count
  FROM (
    SELECT salon_id, phone
    FROM public.customers
    WHERE phone IS NOT NULL
    GROUP BY salon_id, phone
    HAVING COUNT(*) > 1
  ) d;

  -- Orphan bookings: customer, employee or service deleted/missing
  SELECT COUNT(*) INTO orphan_booking_count
  FROM public.bookings b
  LEFT JOIN public.customers c ON c.id = b.customer_id
  LEFT JOIN public.employees e ON e.id = b.employee_id
  LEFT JOIN public.services s ON s.id = b.service_id
  WHERE c.id IS NULL OR e.id IS NULL OR s.id IS NULL;

  -- Inactive employee still has upcoming non-cancelled bookings
  SELECT COUNT(*) INTO inactive_staff_booking_count
  FROM public.bookings b
  JOIN public.employees e ON e.id = b.employee_id
  WHERE e.is_active = FALSE
    AND b.start_time >= now()
    AND b.status NOT IN ('cancelled', 'no_show');

  -- Slug collisions
  SELECT COUNT(*) INTO slug_collision_count
  FROM (
    SELECT slug
    FROM public.salons
    WHERE slug IS NOT NULL
    GROUP BY slug
    HAVING COUNT(*) > 1
  ) collisions;

  IF duplicate_customer_count > 0 THEN
    RAISE EXCEPTION 'Data quality failed: duplicate customers found (%).', duplicate_customer_count;
  END IF;

  IF orphan_booking_count > 0 THEN
    RAISE EXCEPTION 'Data quality failed: orphan bookings found (%).', orphan_booking_count;
  END IF;

  IF inactive_staff_booking_count > 0 THEN
    RAISE EXCEPTION 'Data quality failed: inactive staff with upcoming bookings found (%).', inactive_staff_booking_count;
  END IF;

  IF slug_collision_count > 0 THEN
    RAISE EXCEPTION 'Data quality failed: slug collisions found (%).', slug_collision_count;
  END IF;
END $$;

SELECT 'data_quality_ok' AS verification_result;

