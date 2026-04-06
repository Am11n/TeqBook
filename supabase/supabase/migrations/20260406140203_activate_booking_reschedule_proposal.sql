CREATE OR REPLACE FUNCTION public.activate_booking_reschedule_proposal(
  p_proposal_id uuid,
  p_salon_id uuid,
  p_delivery_attempts jsonb,
  p_any_channel_succeeded boolean
)
RETURNS TABLE (
  ok boolean,
  message text,
  error_code text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_prop record;
BEGIN
  IF NOT public.user_can_access_salon_for_booking_ops(p_salon_id) THEN
    RETURN QUERY SELECT false, 'Not authorized'::text, 'not_authorized'::text;
    RETURN;
  END IF;

  SELECT * INTO v_prop
  FROM public.booking_reschedule_proposals p
  WHERE p.id = p_proposal_id AND p.salon_id = p_salon_id
  FOR UPDATE;

  IF v_prop.id IS NULL THEN
    RETURN QUERY SELECT false, 'Proposal not found'::text, 'proposal_not_found'::text;
    RETURN;
  END IF;

  IF v_prop.status <> 'notification_pending' THEN
    RETURN QUERY SELECT false, 'Proposal is not awaiting delivery'::text, 'invalid_state'::text;
    RETURN;
  END IF;

  UPDATE public.booking_reschedule_proposals
  SET
    delivery_attempts = COALESCE(p_delivery_attempts, '[]'::jsonb),
    status = CASE WHEN p_any_channel_succeeded THEN 'pending' ELSE 'notification_failed' END,
    token_expires_at = CASE WHEN p_any_channel_succeeded THEN now() + interval '15 minutes' ELSE NULL END
  WHERE id = p_proposal_id;

  INSERT INTO public.booking_reschedule_activity (
    salon_id, booking_id, proposal_id, event_type, actor_user_id, payload
  )
  VALUES (
    p_salon_id,
    v_prop.booking_id,
    p_proposal_id,
    CASE WHEN p_any_channel_succeeded THEN 'proposal_activated' ELSE 'notification_failed' END,
    auth.uid(),
    jsonb_build_object(
      'delivery_attempts', COALESCE(p_delivery_attempts, '[]'::jsonb),
      'any_channel_succeeded', p_any_channel_succeeded
    )
  );

  IF p_any_channel_succeeded THEN
    RETURN QUERY SELECT true, 'Proposal is pending customer response'::text, NULL::text;
  ELSE
    RETURN QUERY SELECT true, 'No delivery channel succeeded'::text, 'notification_failed'::text;
  END IF;
END;
$fn$;
