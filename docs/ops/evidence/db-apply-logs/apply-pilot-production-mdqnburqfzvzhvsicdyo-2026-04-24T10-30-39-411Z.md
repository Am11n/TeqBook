# DB Apply Run
target=pilot-production
project_ref=mdqnburqfzvzhvsicdyo
manifest=supabase/supabase/migration-manifest.json
started_at=2026-04-24T10:30:39.412Z

## supabase/supabase/baseline/BASELINE.sql
runner=pg
note=psql_not_installed_meta_commands_stripped

## supabase/supabase/baseline/BASELINE.sql (attempt 1/5)
runner=pg
elapsed_ms=820
status=failed
error: type "booking_status" already exists
    at /Users/aminismail/Documents/GitHub/TeqBook/node_modules/.pnpm/pg@8.20.0/node_modules/pg/lib/client.js:631:17
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async runSqlFile (/Users/aminismail/Documents/GitHub/TeqBook/scripts/db-apply.ts:140:7)
    at async main (/Users/aminismail/Documents/GitHub/TeqBook/scripts/db-apply.ts:242:5)
## supabase/supabase/baseline/BASELINE.sql
status=skipped
reason=baseline_already_present

## supabase/supabase/migrations/20260317162000_pilot_access_recovery.sql (attempt 1/5)
runner=pg
elapsed_ms=717
status=success
## supabase/supabase/migrations/20260326095500_fix_announcements_superadmin_rls.sql (attempt 1/5)
runner=pg
elapsed_ms=344
status=success
## supabase/supabase/migrations/20260326101000_fix_announcements_table_grants.sql (attempt 1/5)
runner=pg
elapsed_ms=319
status=success
completed_at=2026-04-24T10:30:41.815Z
status=success
