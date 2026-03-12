-- Schedule waitlist expiry processor to run automatically.
-- This closes the ops gap where process-waitlist-expiry existed but was not scheduled.

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'process-waitlist-expiry-cron') THEN
    PERFORM cron.unschedule('process-waitlist-expiry-cron');
  END IF;
END $$;

SELECT cron.schedule(
  'process-waitlist-expiry-cron',
  '*/5 * * * *',
  $$
  SELECT
    net.http_post(
      url := COALESCE(
        current_setting('app.supabase_url', true),
        current_setting('app.supabase_url')
      ) || '/functions/v1/process-waitlist-expiry',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || COALESCE(
          current_setting('app.supabase_service_role_key', true),
          current_setting('app.supabase_service_role_key')
        )
      ),
      body := jsonb_build_object('limit', 200)
    ) AS request_id;
  $$
);

