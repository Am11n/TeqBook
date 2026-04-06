CREATE OR REPLACE FUNCTION public.create_booking_reschedule_proposal(
  p_salon_id uuid,
  p_booking_id uuid,
  p_proposed_start_time timestamptz,
  p_proposed_end_time timestamptz
)
RETURNS TABLE (
  ok boolean,
  proposal_id uuid,
  raw_token text,
  message text,
  error_code text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_booking record;
  v_raw text;
  v_digest text;
  v_new_id uuid;
  v_superseded int;
BEGIN
  IF NOT public.user_can_access_salon_for_booking_ops(p_salon_id) THEN
    RETURN QUERY SELECT false, NULL::uuid, NULL::text, 'Not authorized'::text, 'not_authorized'::text;
    RETURN;
  END IF;

  SELECT b.* INTO v_booking
  FROM public.bookings b
  WHERE b.id = p_booking_id AND b.salon_id = p_salon_id
  FOR UPDATE;

  IF v_booking.id IS NULL THEN
    RETURN QUERY SELECT false, NULL::uuid, NULL::text, 'Booking not found'::text, 'booking_not_found'::text;
    RETURN;
  END IF;

  IF p_proposed_end_time <= p_proposed_start_time THEN
    RETURN QUERY SELECT false, NULL::uuid, NULL::text, 'Invalid time range'::text, 'invalid_range'::text;
    RETURN;
  END IF;

  PERFORM 1
  FROM public.bookings b
  WHERE b.salon_id = p_salon_id
    AND b.employee_id = v_booking.employee_id
    AND b.id <> p_booking_id
    AND b.status IN ('pending', 'confirmed', 'scheduled')
    AND tstzrange(b.start_time, b.end_time, '[)') && tstzrange(p_proposed_start_time, p_proposed_end_time, '[)');

  IF FOUND THEN
    RETURN QUERY SELECT false, NULL::uuid, NULL::text, 'Time slot is already booked'::text, 'slot_conflict'::text;
    RETURN;
  END IF;

  UPDATE public.booking_reschedule_proposals p
  SET
    status = 'superseded',
    responded_at = COALESCE(p.responded_at, now())
  WHERE p.booking_id = p_booking_id
    AND p.status IN ('pending', 'notification_pending');

  GET DIAGNOSTICS v_superseded = ROW_COUNT;

  IF v_superseded > 0 THEN
    INSERT INTO public.booking_reschedule_activity (
      salon_id, booking_id, proposal_id, event_type, actor_user_id, payload
    )
    VALUES (
      p_salon_id,
      p_booking_id,
      NULL,
      'proposal_superseded',
      auth.uid(),
      jsonb_build_object('reason', 'new_proposal', 'count', v_superseded)
    );
  END IF;

  v_raw := encode(gen_random_bytes(32), 'hex');
  v_digest := encode(digest(v_raw, 'sha256'), 'hex');

  BEGIN
    INSERT INTO public.booking_reschedule_proposals (
      salon_id,
      booking_id,
      employee_id,
      proposed_start_time,
      proposed_end_time,
      previous_start_time,
      previous_end_time,
      token_hash,
      status,
      created_by
    )
    VALUES (
      p_salon_id,
      p_booking_id,
      v_booking.employee_id,
      p_proposed_start_time,
      p_proposed_end_time,
      v_booking.start_time,
      v_booking.end_time,
      v_digest,
      'notification_pending',
      auth.uid()
    )
    RETURNING id INTO v_new_id;
  EXCEPTION
    WHEN unique_violation THEN
      RETURN QUERY SELECT false, NULL::uuid, NULL::text,
        'Another pending proposal holds this slot'::text, 'slot_held_by_other_proposal'::text;
      RETURN;
  END;

  INSERT INTO public.booking_reschedule_activity (
    salon_id, booking_id, proposal_id, event_type, actor_user_id, payload
  )
  VALUES (
    p_salon_id,
    p_booking_id,
    v_new_id,
    'proposal_created',
    auth.uid(),
    jsonb_build_object(
      'proposed_start', p_proposed_start_time,
      'proposed_end', p_proposed_end_time,
      'previous_start', v_booking.start_time,
      'previous_end', v_booking.end_time
    )
  );

  RETURN QUERY SELECT true, v_new_id, v_raw, 'Proposal created'::text, NULL::text;
END;
$fn$;
