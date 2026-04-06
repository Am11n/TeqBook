CREATE OR REPLACE FUNCTION public.expire_stale_booking_reschedule_proposals()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_count int := 0;
  rec record;
BEGIN
  FOR rec IN
    UPDATE public.booking_reschedule_proposals p
    SET status = 'expired', responded_at = now(), response_channel = 'system'
    WHERE p.status = 'pending'
      AND p.token_expires_at IS NOT NULL
      AND p.token_expires_at <= now()
    RETURNING p.id, p.salon_id, p.booking_id
  LOOP
    v_count := v_count + 1;
    INSERT INTO public.booking_reschedule_activity (
      salon_id, booking_id, proposal_id, event_type, actor_user_id, payload
    )
    VALUES (
      rec.salon_id,
      rec.booking_id,
      rec.id,
      'proposal_expired',
      NULL,
      jsonb_build_object('reason', 'cron')
    );
  END LOOP;

  RETURN v_count;
END;
$fn$;
