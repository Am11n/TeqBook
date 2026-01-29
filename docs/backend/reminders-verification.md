# Reminders System Verification

## Verify Cron Job is Running

```sql
-- Check if cron job exists
SELECT * FROM cron.job WHERE jobname = 'process-reminders-cron';

-- View recent execution history
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'process-reminders-cron')
ORDER BY start_time DESC
LIMIT 10;

-- Check for errors
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'process-reminders-cron')
  AND status = 'failed'
ORDER BY start_time DESC
LIMIT 10;
```

## Verify Edge Function Configuration

1. **Check environment variables in Supabase:**
   - Go to Project Settings > Edge Functions > Secrets
   - Verify `RESEND_API_KEY` is set
   - Verify `SUPABASE_URL` is set
   - Verify `SUPABASE_SERVICE_ROLE_KEY` is set

2. **Test edge function manually:**
   ```sql
   SELECT trigger_process_reminders();
   ```

3. **Check reminders table:**
   ```sql
   -- Check pending reminders
   SELECT COUNT(*) FROM reminders WHERE status = 'pending';
   
   -- Check reminders being processed
   SELECT COUNT(*) FROM reminders WHERE status = 'sending';
   
   -- Check sent reminders
   SELECT COUNT(*) FROM reminders WHERE status = 'sent';
   
   -- Check failed reminders
   SELECT * FROM reminders WHERE status = 'failed' 
   ORDER BY updated_at DESC LIMIT 10;
   ```

## Verify Reminders are Being Sent

1. **Check email logs** (if email_log table exists)
2. **Check reminders with sent_at timestamp**
3. **Monitor edge function logs** in Supabase dashboard

## Troubleshooting

- **Cron job not running:** Check database settings for `app.supabase_url` and `app.supabase_service_role_key`
- **Edge function errors:** Check edge function logs in Supabase dashboard
- **Reminders stuck in 'sending':** Check locked_at timestamp - locks expire after 10 minutes
- **Reminders failing:** Check last_error column for error messages
