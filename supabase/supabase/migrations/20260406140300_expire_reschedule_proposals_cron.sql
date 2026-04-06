-- Run expiry every minute so pending proposals flip to expired predictably (cron-first policy).

CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $cron$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'expire-booking-reschedule-proposals') THEN
    PERFORM cron.unschedule('expire-booking-reschedule-proposals');
  END IF;
END
$cron$;

SELECT cron.schedule(
  'expire-booking-reschedule-proposals',
  '* * * * *',
  $$SELECT public.expire_stale_booking_reschedule_proposals()$$
);
