DO $booking_reschedule_grants$
BEGIN
  EXECUTE 'REVOKE ALL ON FUNCTION public.user_can_access_salon_for_booking_ops(uuid) FROM PUBLIC';
  EXECUTE 'REVOKE ALL ON FUNCTION public.user_can_bypass_reschedule_approval(uuid) FROM PUBLIC';

  EXECUTE 'GRANT EXECUTE ON FUNCTION public.create_booking_reschedule_proposal(uuid, uuid, timestamptz, timestamptz) TO authenticated';
  EXECUTE 'GRANT EXECUTE ON FUNCTION public.activate_booking_reschedule_proposal(uuid, uuid, jsonb, boolean) TO authenticated';
  EXECUTE 'GRANT EXECUTE ON FUNCTION public.respond_booking_reschedule_proposal(text, text, text) TO service_role';
  EXECUTE 'GRANT EXECUTE ON FUNCTION public.expire_stale_booking_reschedule_proposals() TO service_role';
  EXECUTE 'GRANT EXECUTE ON FUNCTION public.direct_reschedule_booking_atomic(uuid, uuid, timestamptz, timestamptz, text) TO authenticated';
END;
$booking_reschedule_grants$;
