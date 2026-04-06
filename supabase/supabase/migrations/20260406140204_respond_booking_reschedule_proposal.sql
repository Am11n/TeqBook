CREATE OR REPLACE FUNCTION public.respond_booking_reschedule_proposal(
  p_token text,
  p_action text,
  p_response_channel text DEFAULT 'email_link'
)
RETURNS TABLE (
  ok boolean,
  message text,
  result_status text,
  booking_id uuid,
  salon_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_digest text;
  v_prop record;
  v_booking record;
BEGIN
  IF p_action NOT IN ('accept', 'decline') THEN
    RETURN QUERY SELECT false, 'Invalid action'::text, 'invalid_action'::text, NULL::uuid, NULL::uuid;
    RETURN;
  END IF;

  IF p_response_channel IS NOT NULL AND p_response_channel NOT IN ('sms_link', 'email_link', 'system') THEN
    RETURN QUERY SELECT false, 'Invalid response channel'::text, 'invalid_channel'::text, NULL::uuid, NULL::uuid;
    RETURN;
  END IF;

  v_digest := encode(digest(trim(p_token), 'sha256'), 'hex');

  SELECT * INTO v_prop
  FROM public.booking_reschedule_proposals p
  WHERE p.token_hash = v_digest
  FOR UPDATE;

  IF v_prop.id IS NULL THEN
    RETURN QUERY SELECT false, 'Invalid or unknown link'::text, 'invalid_token'::text, NULL::uuid, NULL::uuid;
    RETURN;
  END IF;

  IF v_prop.status = 'accepted' THEN
    IF p_action = 'accept' THEN
      RETURN QUERY SELECT true, 'Already accepted'::text, 'accepted'::text, v_prop.booking_id, v_prop.salon_id;
    ELSE
      RETURN QUERY SELECT false, 'Proposal was already accepted'::text, 'proposal_already_accepted'::text, v_prop.booking_id, v_prop.salon_id;
    END IF;
    RETURN;
  END IF;

  IF v_prop.status = 'declined' THEN
    IF p_action = 'decline' THEN
      RETURN QUERY SELECT true, 'Already declined'::text, 'declined'::text, v_prop.booking_id, v_prop.salon_id;
    ELSE
      RETURN QUERY SELECT false, 'Proposal was already declined'::text, 'proposal_already_declined'::text, v_prop.booking_id, v_prop.salon_id;
    END IF;
    RETURN;
  END IF;

  IF v_prop.status = 'superseded' THEN
    RETURN QUERY SELECT false, 'This request was replaced by a newer one'::text, 'proposal_superseded'::text, v_prop.booking_id, v_prop.salon_id;
    RETURN;
  END IF;

  IF v_prop.status IN ('expired', 'cancelled') THEN
    RETURN QUERY SELECT false, 'This request is no longer active'::text, 'proposal_expired'::text, v_prop.booking_id, v_prop.salon_id;
    RETURN;
  END IF;

  IF v_prop.status = 'notification_failed' THEN
    RETURN QUERY SELECT false, 'This request could not be delivered'::text, 'notification_failed'::text, v_prop.booking_id, v_prop.salon_id;
    RETURN;
  END IF;

  IF v_prop.status = 'failed_slot_taken' THEN
    IF p_action = 'accept' THEN
      RETURN QUERY SELECT false, 'That time is no longer available'::text, 'failed_slot_taken'::text, v_prop.booking_id, v_prop.salon_id;
    ELSE
      RETURN QUERY SELECT false, 'Proposal already closed'::text, 'proposal_closed'::text, v_prop.booking_id, v_prop.salon_id;
    END IF;
    RETURN;
  END IF;

  IF v_prop.status = 'notification_pending' THEN
    RETURN QUERY SELECT false, 'This request is not active yet'::text, 'proposal_not_ready'::text, v_prop.booking_id, v_prop.salon_id;
    RETURN;
  END IF;

  IF v_prop.status <> 'pending' THEN
    RETURN QUERY SELECT false, 'Invalid proposal state'::text, 'invalid_state'::text, v_prop.booking_id, v_prop.salon_id;
    RETURN;
  END IF;

  IF v_prop.token_expires_at IS NOT NULL AND v_prop.token_expires_at <= now() THEN
    UPDATE public.booking_reschedule_proposals
    SET status = 'expired', responded_at = now(), response_channel = COALESCE(p_response_channel, 'system')
    WHERE id = v_prop.id AND status = 'pending';

    INSERT INTO public.booking_reschedule_activity (
      salon_id, booking_id, proposal_id, event_type, actor_user_id, payload
    )
    VALUES (
      v_prop.salon_id,
      v_prop.booking_id,
      v_prop.id,
      'proposal_expired',
      NULL,
      jsonb_build_object('reason', 'respond_after_deadline')
    );

    RETURN QUERY SELECT false, 'This request has expired'::text, 'proposal_expired'::text, v_prop.booking_id, v_prop.salon_id;
    RETURN;
  END IF;

  IF p_action = 'decline' THEN
    UPDATE public.booking_reschedule_proposals
    SET
      status = 'declined',
      responded_at = now(),
      response_channel = COALESCE(p_response_channel, 'email_link')
    WHERE id = v_prop.id;

    INSERT INTO public.booking_reschedule_activity (
      salon_id, booking_id, proposal_id, event_type, actor_user_id, payload
    )
    VALUES (
      v_prop.salon_id,
      v_prop.booking_id,
      v_prop.id,
      'proposal_declined',
      NULL,
      jsonb_build_object('channel', p_response_channel)
    );

    RETURN QUERY SELECT true, 'Declined'::text, 'declined'::text, v_prop.booking_id, v_prop.salon_id;
    RETURN;
  END IF;

  SELECT * INTO v_booking
  FROM public.bookings b
  WHERE b.id = v_prop.booking_id AND b.salon_id = v_prop.salon_id
  FOR UPDATE;

  IF v_booking.id IS NULL THEN
    RETURN QUERY SELECT false, 'Booking not found'::text, 'booking_not_found'::text, NULL::uuid, NULL::uuid;
    RETURN;
  END IF;

  PERFORM 1
  FROM public.bookings b
  WHERE b.salon_id = v_prop.salon_id
    AND b.employee_id = v_prop.employee_id
    AND b.id <> v_prop.booking_id
    AND b.status IN ('pending', 'confirmed', 'scheduled')
    AND tstzrange(b.start_time, b.end_time, '[)') && tstzrange(v_prop.proposed_start_time, v_prop.proposed_end_time, '[)');

  IF FOUND THEN
    UPDATE public.booking_reschedule_proposals
    SET status = 'failed_slot_taken', responded_at = now(), response_channel = COALESCE(p_response_channel, 'email_link')
    WHERE id = v_prop.id;

    INSERT INTO public.booking_reschedule_activity (
      salon_id, booking_id, proposal_id, event_type, actor_user_id, payload
    )
    VALUES (
      v_prop.salon_id,
      v_prop.booking_id,
      v_prop.id,
      'proposal_failed_slot',
      NULL,
      jsonb_build_object('reason', 'overlap_at_accept')
    );

    RETURN QUERY SELECT false, 'That time is no longer available'::text, 'failed_slot_taken'::text, v_prop.booking_id, v_prop.salon_id;
    RETURN;
  END IF;

  BEGIN
    PERFORM 1
    FROM public.update_booking_atomic(
      v_prop.salon_id,
      v_prop.booking_id,
      v_prop.proposed_start_time,
      v_prop.proposed_end_time,
      NULL::uuid,
      NULL::text,
      NULL::text
    )
    LIMIT 1;
  EXCEPTION
    WHEN OTHERS THEN
      UPDATE public.booking_reschedule_proposals
      SET status = 'failed_slot_taken', responded_at = now(), response_channel = COALESCE(p_response_channel, 'email_link')
      WHERE id = v_prop.id;

      INSERT INTO public.booking_reschedule_activity (
        salon_id, booking_id, proposal_id, event_type, actor_user_id, payload
      )
      VALUES (
        v_prop.salon_id,
        v_prop.booking_id,
        v_prop.id,
        'proposal_failed_slot',
        NULL,
        jsonb_build_object('reason', 'update_booking_atomic_error', 'detail', SQLERRM)
      );

      RETURN QUERY SELECT false, 'That time is no longer available'::text, 'failed_slot_taken'::text, v_prop.booking_id, v_prop.salon_id;
      RETURN;
  END;

  UPDATE public.booking_reschedule_proposals
  SET
    status = 'accepted',
    responded_at = now(),
    response_channel = COALESCE(p_response_channel, 'email_link')
  WHERE id = v_prop.id;

  INSERT INTO public.booking_reschedule_activity (
    salon_id, booking_id, proposal_id, event_type, actor_user_id, payload
  )
  VALUES (
    v_prop.salon_id,
    v_prop.booking_id,
    v_prop.id,
    'proposal_accepted',
    NULL,
    jsonb_build_object('channel', p_response_channel)
  );

  RETURN QUERY SELECT true, 'Accepted'::text, 'accepted'::text, v_prop.booking_id, v_prop.salon_id;
END;
$fn$;
