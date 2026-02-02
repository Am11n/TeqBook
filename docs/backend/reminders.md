# Reminders System

## Overview

The reminders system automatically sends booking reminders to customers via email. Reminders are scheduled when bookings are created and processed by a cron job that runs every 5 minutes.

## Architecture

### Components

1. **Reminders Table** (`reminders`)
   - Stores scheduled reminders with status (pending, sent, failed, cancelled)
   - Linked to bookings via `booking_id`
   - Includes `reminder_type` (24h or 2h before appointment)

2. **Process Reminders Edge Function** (`process-reminders`)
   - Processes pending reminders that are due
   - Sends reminder emails via email service
   - Updates reminder status (sent/failed)

3. **Cron Job** (`process-reminders-cron`)
   - Runs every 5 minutes
   - Calls the `process-reminders` Edge Function
   - Configured via PostgreSQL `pg_cron` extension

## Setup

### Prerequisites

1. **Enable Extensions**
   - `pg_cron` - For scheduled jobs
   - `pg_net` - For HTTP requests to Edge Functions

2. **Configure Database Settings**
   
   Before running the migration, set the following database settings in Supabase:
   
   ```sql
   ALTER DATABASE postgres SET app.supabase_url = 'https://your-project.supabase.co';
   ALTER DATABASE postgres SET app.supabase_service_role_key = 'your-service-role-key';
   ```
   
   Or use Supabase Dashboard:
   - Go to Project Settings > Database > Settings
   - Add custom database settings

### Migration

Run the migration to set up the cron job:

```bash
# The migration file is located at:
supabase/migrations/20260124000001_setup_reminders_cron.sql
```

This migration:
- Enables `pg_cron` and `pg_net` extensions
- Creates a cron job scheduled every 5 minutes
- Creates a manual trigger function for testing

## Verification

### Check Cron Job Status

```sql
-- View all cron jobs
SELECT * FROM cron.job WHERE jobname = 'process-reminders-cron';

-- View cron job execution history
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'process-reminders-cron')
ORDER BY start_time DESC
LIMIT 10;
```

### Manual Trigger

For testing, you can manually trigger the cron job:

```sql
SELECT trigger_process_reminders();
```

### Check Edge Function Logs

1. Go to Supabase Dashboard
2. Navigate to Edge Functions > `process-reminders`
3. View execution logs and metrics

### Verify Reminders Processing

```sql
-- Check pending reminders
SELECT COUNT(*) FROM reminders WHERE status = 'pending' AND scheduled_at <= NOW();

-- Check recently sent reminders
SELECT * FROM reminders 
WHERE status = 'sent' 
ORDER BY sent_at DESC 
LIMIT 10;

-- Check failed reminders
SELECT * FROM reminders 
WHERE status = 'failed' 
ORDER BY updated_at DESC 
LIMIT 10;
```

## Monitoring

### Key Metrics

The Edge Function logs the following metrics:
- `processed` - Number of reminders successfully sent
- `errors` - Number of reminders that failed
- `total` - Total reminders processed in this run
- `timestamp` - Execution timestamp

### Error Handling

Failed reminders are marked with:
- `status = 'failed'`
- `error_message` - Description of the error
- `updated_at` - Timestamp of failure

Common failure reasons:
- Missing booking or customer email
- Email service errors
- Network/timeout issues

### Alerting

Monitor the following:
1. **Cron Job Failures**: Check `cron.job_run_details` for failed executions
2. **High Error Rate**: If `errors` consistently high, investigate email service
3. **Stuck Reminders**: Reminders stuck in `pending` status past `scheduled_at`

## Troubleshooting

### Cron Job Not Running

1. **Check if cron job exists:**
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'process-reminders-cron';
   ```

2. **Check database settings:**
   ```sql
   SHOW app.supabase_url;
   SHOW app.supabase_service_role_key;
   ```

3. **Check cron job execution history:**
   ```sql
   SELECT * FROM cron.job_run_details 
   WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'process-reminders-cron')
   ORDER BY start_time DESC;
   ```

### Edge Function Not Being Called

1. **Verify Edge Function exists:**
   - Check `supabase/functions/process-reminders/index.ts`

2. **Test Edge Function manually:**
   ```bash
   curl -X POST https://your-project.supabase.co/functions/v1/process-reminders \
     -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
     -H "Content-Type: application/json" \
     -d '{"limit": 10}'
   ```

3. **Check Edge Function logs in Supabase Dashboard**

### Reminders Not Being Sent

1. **Check reminder status:**
   ```sql
   SELECT * FROM reminders WHERE status = 'pending' AND scheduled_at <= NOW();
   ```

2. **Verify booking and customer data:**
   ```sql
   SELECT r.*, b.id as booking_exists, c.email as customer_email
   FROM reminders r
   LEFT JOIN bookings b ON r.booking_id = b.id
   LEFT JOIN customers c ON b.customer_id = c.id
   WHERE r.status = 'pending';
   ```

3. **Check email service configuration:**
   - Verify `RESEND_API_KEY` is set in Edge Function secrets
   - Check email service logs

## Configuration

### Schedule

The cron job runs every 5 minutes (`*/5 * * * *`). To change:

```sql
-- Unschedule existing job
SELECT cron.unschedule('process-reminders-cron');

-- Schedule with new interval (e.g., every 10 minutes)
SELECT cron.schedule(
  'process-reminders-cron',
  '*/10 * * * *',
  -- ... same SQL as in migration
);
```

### Batch Size

The Edge Function processes up to 100 reminders per run (configurable via `limit` parameter).

To change the batch size, update the cron job SQL to pass a different `limit` value.

## Related Files

- **Migration**: `supabase/migrations/20260124000001_setup_reminders_cron.sql`
- **Edge Function**: `supabase/functions/process-reminders/index.ts`
- **Reminders Table**: `supabase/migrations/20250105000001_create_reminders.sql`
- **Tests**: `apps/dashboard/tests/integration/reminders-cron.test.ts`

## Security

- Cron job uses service role key for authentication
- Edge Function validates service role key
- RLS policies protect reminder data
- Only service role can update reminder status
