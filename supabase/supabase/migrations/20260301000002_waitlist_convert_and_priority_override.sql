-- Waitlist dashboard conversion + manual priority override support.

ALTER TABLE waitlist_entries
  ADD COLUMN IF NOT EXISTS priority_override_score INTEGER,
  ADD COLUMN IF NOT EXISTS priority_override_reason TEXT,
  ADD COLUMN IF NOT EXISTS priority_overridden_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS priority_overridden_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_waitlist_entries_priority_override
  ON waitlist_entries (salon_id, service_id, preferred_date, status, priority_override_score)
  WHERE priority_override_score IS NOT NULL;

CREATE OR REPLACE FUNCTION convert_waitlist_entry_to_booking_atomic(
  p_salon_id UUID,
  p_waitlist_entry_id UUID,
  p_actor_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  ok BOOLEAN,
  message TEXT,
  waitlist_entry_id UUID,
  booking_id UUID,
  offer_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  selected_entry waitlist_entries%ROWTYPE;
  selected_offer waitlist_offers%ROWTYPE;
  created_booking RECORD;
  effective_slot_start TIMESTAMPTZ;
  effective_employee_id UUID;
BEGIN
  SELECT *
  INTO selected_entry
  FROM waitlist_entries
  WHERE id = p_waitlist_entry_id
    AND salon_id = p_salon_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Waitlist entry not found', NULL::UUID, NULL::UUID, NULL::UUID;
    RETURN;
  END IF;

  IF selected_entry.status <> 'notified' THEN
    RETURN QUERY SELECT false, 'Only notified entries can be converted to booking', selected_entry.id, NULL::UUID, NULL::UUID;
    RETURN;
  END IF;

  SELECT *
  INTO selected_offer
  FROM waitlist_offers
  WHERE waitlist_entry_id = selected_entry.id
    AND status = 'pending'
  ORDER BY created_at DESC
  LIMIT 1
  FOR UPDATE;

  IF FOUND THEN
    effective_slot_start := selected_offer.slot_start;
    effective_employee_id := selected_offer.employee_id;
  ELSE
    IF selected_entry.employee_id IS NULL OR selected_entry.preferred_time_start IS NULL THEN
      RETURN QUERY SELECT false, 'No pending offer and no explicit employee/time on entry', selected_entry.id, NULL::UUID, NULL::UUID;
      RETURN;
    END IF;
    effective_slot_start := (selected_entry.preferred_date::text || 'T' || selected_entry.preferred_time_start::text || 'Z')::timestamptz;
    effective_employee_id := selected_entry.employee_id;
  END IF;

  SELECT *
  INTO created_booking
  FROM create_booking_atomic(
    selected_entry.salon_id,
    effective_employee_id,
    selected_entry.service_id,
    effective_slot_start,
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

  IF FOUND THEN
    UPDATE waitlist_offers
    SET
      status = 'accepted',
      booking_id = created_booking.id,
      responded_at = now(),
      response_channel = 'dashboard',
      updated_at = now()
    WHERE id = selected_offer.id
      AND status = 'pending';
  END IF;

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
    'dashboard_convert_to_booking',
    jsonb_build_object(
      'offer_id', selected_offer.id,
      'booking_id', created_booking.id,
      'actor_user_id', p_actor_user_id
    )
  );

  RETURN QUERY SELECT true, 'Booking created from waitlist entry', selected_entry.id, created_booking.id, selected_offer.id;
END;
$$;

GRANT EXECUTE ON FUNCTION convert_waitlist_entry_to_booking_atomic(UUID, UUID, UUID) TO authenticated, service_role;
