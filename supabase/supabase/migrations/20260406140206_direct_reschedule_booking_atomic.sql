CREATE OR REPLACE FUNCTION public.direct_reschedule_booking_atomic(
  p_salon_id uuid,
  p_booking_id uuid,
  p_start_time timestamptz,
  p_end_time timestamptz,
  p_reason text DEFAULT NULL
)
RETURNS TABLE (
  ok boolean,
  message text,
  error_code text,
  id uuid,
  start_time timestamptz,
  end_time timestamptz,
  status text,
  is_walk_in boolean,
  notes text,
  customers jsonb,
  employees jsonb,
  services jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_old_start timestamptz;
  v_old_end timestamptz;
BEGIN
  IF NOT public.user_can_bypass_reschedule_approval(p_salon_id) THEN
    RETURN QUERY SELECT false, 'Not authorized for direct reschedule'::text, 'not_authorized'::text,
      NULL::uuid, NULL::timestamptz, NULL::timestamptz, NULL::text, NULL::boolean, NULL::text,
      NULL::jsonb, NULL::jsonb, NULL::jsonb;
    RETURN;
  END IF;

  IF NOT public.user_can_access_salon_for_booking_ops(p_salon_id) THEN
    RETURN QUERY SELECT false, 'Not authorized'::text, 'not_authorized'::text,
      NULL::uuid, NULL::timestamptz, NULL::timestamptz, NULL::text, NULL::boolean, NULL::text,
      NULL::jsonb, NULL::jsonb, NULL::jsonb;
    RETURN;
  END IF;

  SELECT b.start_time, b.end_time INTO v_old_start, v_old_end
  FROM public.bookings b
  WHERE b.id = p_booking_id AND b.salon_id = p_salon_id;

  IF v_old_start IS NULL THEN
    RETURN QUERY SELECT false, 'Booking not found'::text, 'booking_not_found'::text,
      NULL::uuid, NULL::timestamptz, NULL::timestamptz, NULL::text, NULL::boolean, NULL::text,
      NULL::jsonb, NULL::jsonb, NULL::jsonb;
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    true,
    'Updated'::text,
    NULL::text,
    r.id,
    r.start_time,
    r.end_time,
    r.status,
    r.is_walk_in,
    r.notes,
    r.customers,
    r.employees,
    r.services
  FROM public.update_booking_atomic(
    p_salon_id,
    p_booking_id,
    p_start_time,
    p_end_time,
    NULL::uuid,
    NULL::text,
    NULL::text
  ) AS r;

  INSERT INTO public.booking_reschedule_activity (
    salon_id, booking_id, proposal_id, event_type, actor_user_id, payload
  )
  VALUES (
    p_salon_id,
    p_booking_id,
    NULL,
    'direct_reschedule',
    auth.uid(),
    jsonb_build_object(
      'previous_start', v_old_start,
      'previous_end', v_old_end,
      'new_start', p_start_time,
      'new_end', p_end_time,
      'reason', p_reason
    )
  );
END;
$fn$;
