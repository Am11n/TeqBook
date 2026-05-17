-- find_first_available_slots_batch: return earliest slots across all employees/dates,
-- not the first N slots from a single employee.

CREATE OR REPLACE FUNCTION public.find_first_available_slots_batch(
  p_salon_id UUID,
  p_service_id UUID,
  p_employee_ids UUID[] DEFAULT NULL,
  p_date_from DATE DEFAULT CURRENT_DATE,
  p_date_to DATE DEFAULT NULL,
  p_limit INTEGER DEFAULT 25
)
RETURNS TABLE(
  slot_start TIMESTAMPTZ,
  slot_end TIMESTAMPTZ,
  employee_id UUID,
  employee_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_date_to DATE;
  v_limit INTEGER;
BEGIN
  IF NOT public.salon_product_access_granted(p_salon_id) THEN
    RETURN;
  END IF;

  v_date_to := COALESCE(p_date_to, p_date_from + 14);
  v_limit := GREATEST(1, LEAST(COALESCE(p_limit, 25), 100));

  RETURN QUERY
  WITH days AS (
    SELECT gs::date AS day
      FROM generate_series(p_date_from, v_date_to, interval '1 day') AS gs
  ),
  staff AS (
    SELECT e.id AS emp_id, e.full_name AS emp_name
      FROM public.employees e
     WHERE e.salon_id = p_salon_id
       AND e.is_active = true
       AND (p_employee_ids IS NULL OR e.id = ANY(p_employee_ids))
  )
  SELECT
    ga.slot_start,
    ga.slot_end,
    s.emp_id,
    s.emp_name
  FROM days d
  CROSS JOIN staff s
  CROSS JOIN LATERAL public.generate_availability(p_salon_id, s.emp_id, p_service_id, d.day) ga
  ORDER BY ga.slot_start ASC
  LIMIT v_limit;
END;
$$;
