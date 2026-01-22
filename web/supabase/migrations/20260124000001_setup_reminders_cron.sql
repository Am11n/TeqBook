-- =====================================================
-- Setup Reminders Cron Job
-- =====================================================
-- Task Group 47: Implement Reminders Cron Job
-- Creates a cron job to call the process-reminders Edge Function every 5 minutes
-- This ensures booking reminders are sent automatically
--
-- IMPORTANT: Before running this migration, you must set the following secrets in Supabase:
-- 1. Go to Project Settings > Edge Functions > Secrets
-- 2. Add secret: SUPABASE_URL (your project URL)
-- 3. Add secret: SUPABASE_SERVICE_ROLE_KEY (your service role key)
--
-- Alternatively, you can use the Supabase dashboard to set these as database settings:
-- ALTER DATABASE postgres SET app.supabase_url = 'https://your-project.supabase.co';
-- ALTER DATABASE postgres SET app.supabase_service_role_key = 'your-service-role-key';
-- =====================================================

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Drop existing cron job if it exists (for idempotency)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'process-reminders-cron') THEN
    PERFORM cron.unschedule('process-reminders-cron');
  END IF;
END $$;

-- Create cron job to call Edge Function every 5 minutes
-- Schedule: */5 * * * * (every 5 minutes)
-- The job calls the process-reminders Edge Function with service role authentication
-- 
-- Note: This uses current_setting() to get database settings. These must be configured
-- in Supabase project settings or via ALTER DATABASE commands.
SELECT cron.schedule(
  'process-reminders-cron',
  '*/5 * * * *', -- Every 5 minutes
  $$
  SELECT
    net.http_post(
      url := COALESCE(
        current_setting('app.supabase_url', true),
        current_setting('app.supabase_url')
      ) || '/functions/v1/process-reminders',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || COALESCE(
          current_setting('app.supabase_service_role_key', true),
          current_setting('app.supabase_service_role_key')
        )
      ),
      body := jsonb_build_object('limit', 100)
    ) AS request_id;
  $$
);

-- Add comment for documentation
COMMENT ON EXTENSION pg_cron IS 'Enables scheduled jobs (cron) for processing reminders';
COMMENT ON EXTENSION pg_net IS 'Enables HTTP requests from PostgreSQL for calling Edge Functions';

-- Create a function to manually trigger the cron job (for testing)
CREATE OR REPLACE FUNCTION trigger_process_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM
    net.http_post(
      url := COALESCE(
        current_setting('app.supabase_url', true),
        current_setting('app.supabase_url')
      ) || '/functions/v1/process-reminders',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || COALESCE(
          current_setting('app.supabase_service_role_key', true),
          current_setting('app.supabase_service_role_key')
        )
      ),
      body := jsonb_build_object('limit', 100)
    );
END;
$$;

COMMENT ON FUNCTION trigger_process_reminders() IS 
  'Manually trigger the process-reminders Edge Function. Useful for testing.';
