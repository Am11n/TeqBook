-- Single-statement migration: Supabase CLI rejects multiple SQL commands in one prepared statement.

CREATE OR REPLACE FUNCTION claim_waitlist_offer_atomic(
  p_token TEXT,
  p_action TEXT DEFAULT 'accept',
  p_response_channel TEXT DEFAULT 'email_link'
)
RETURNS TABLE (
  ok BOOLEAN,
  message TEXT,
  offer_id UUID,
  waitlist_entry_id UUID,
  booking_id UUID,
  result_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  token_digest TEXT;
  selected_offer waitlist_offers%ROWTYPE;
  selected_entry waitlist_entries%ROWTYPE;
  policy_record RECORD;
  created_booking RECORD;
  apply_passive BOOLEAN;
BEGIN
  IF p_action NOT IN ('accept', 'decline') THEN
    RETURN QUERY SELECT false, 'Invalid action', NULL::UUID, NULL::UUID, NULL::UUID, 'invalid_action'::TEXT;
    RETURN;
  END IF;

  IF p_response_channel NOT IN ('sms_link', 'email_link', 'dashboard', 'system') THEN
    RETURN QUERY SELECT false, 'Invalid response channel', NULL::UUID, NULL::UUID, NULL::UUID, 'invalid_channel'::TEXT;
    RETURN;
  END IF;

  token_digest := encode(digest(p_token, 'sha256'), 'hex');

  SELECT *
  INTO selected_offer
  FROM waitlist_offers
  WHERE token_hash = token_digest
    AND status = 'pending'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Offer is invalid or already processed', NULL::UUID, NULL::UUID, NULL::UUID, 'offer_not_found'::TEXT;
    RETURN;
  END IF;

  IF selected_offer.token_expires_at <= now() THEN
    UPDATE waitlist_offers
    SET status = 'expired', responded_at = now(), response_channel = 'system', updated_at = now()
    WHERE id = selected_offer.id;

    RETURN QUERY
      SELECT false, 'Offer has expired', selected_offer.id, selected_offer.waitlist_entry_id, NULL::UUID, 'expired'::TEXT;
    RETURN;
  END IF;

  SELECT *
  INTO selected_entry
  FROM waitlist_entries
  WHERE id = selected_offer.waitlist_entry_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Waitlist entry not found', selected_offer.id, NULL::UUID, NULL::UUID, 'entry_not_found'::TEXT;
    RETURN;
  END IF;

  SELECT * INTO policy_record
  FROM resolve_waitlist_policy(selected_entry.salon_id, selected_entry.service_id);

  IF p_action = 'decline' THEN
    apply_passive := (COALESCE(selected_entry.decline_count, 0) + 1) >= COALESCE(policy_record.passive_decline_threshold, 3);

    UPDATE waitlist_entries
    SET
      status = 'cooldown',
      decline_count = COALESCE(decline_count, 0) + 1,
      cooldown_reason = 'declined',
      cooldown_until = now() + make_interval(mins => CASE
        WHEN apply_passive THEN COALESCE(policy_record.passive_cooldown_minutes, 10080)
        ELSE COALESCE(policy_record.cooldown_minutes, 60)
      END)
    WHERE id = selected_entry.id;

    UPDATE waitlist_offers
    SET
      status = 'declined',
      responded_at = now(),
      response_channel = p_response_channel,
      updated_at = now()
    WHERE id = selected_offer.id;

    INSERT INTO waitlist_lifecycle_events (
      waitlist_entry_id,
      salon_id,
      from_status,
      to_status,
      reason,
      metadata
    )
    VALUES (
      selected_entry.id,
      selected_entry.salon_id,
      selected_entry.status,
      'cooldown',
      'declined_offer',
      jsonb_build_object(
        'offer_id', selected_offer.id,
        'response_channel', p_response_channel,
        'passive_applied', apply_passive
      )
    );

    RETURN QUERY
      SELECT true, 'Offer declined', selected_offer.id, selected_entry.id, NULL::UUID, 'declined'::TEXT;
    RETURN;
  END IF;

  SELECT *
  INTO created_booking
  FROM create_booking_atomic(
    selected_entry.salon_id,
    selected_offer.employee_id,
    selected_entry.service_id,
    selected_offer.slot_start,
    selected_entry.customer_name,
    selected_entry.customer_email,
    selected_entry.customer_phone,
    NULL,
    false
  )
  LIMIT 1;

  UPDATE waitlist_entries
  SET
    status = 'booked',
    booking_id = created_booking.id,
    cooldown_until = NULL,
    cooldown_reason = NULL
  WHERE id = selected_entry.id;

  UPDATE waitlist_offers
  SET
    status = 'accepted',
    booking_id = created_booking.id,
    responded_at = now(),
    response_channel = p_response_channel,
    updated_at = now()
  WHERE id = selected_offer.id;

  INSERT INTO waitlist_lifecycle_events (
    waitlist_entry_id,
    salon_id,
    from_status,
    to_status,
    reason,
    metadata
  )
  VALUES (
    selected_entry.id,
    selected_entry.salon_id,
    selected_entry.status,
    'booked',
    'claim_accepted',
    jsonb_build_object(
      'offer_id', selected_offer.id,
      'booking_id', created_booking.id,
      'response_channel', p_response_channel
    )
  );

  RETURN QUERY
    SELECT true, 'Offer accepted and booking created', selected_offer.id, selected_entry.id, created_booking.id, 'accepted'::TEXT;
END;
$$;
