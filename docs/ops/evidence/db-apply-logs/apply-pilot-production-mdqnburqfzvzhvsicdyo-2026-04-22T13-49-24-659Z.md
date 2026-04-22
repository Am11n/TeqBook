# DB Apply Run
target=pilot-production
project_ref=mdqnburqfzvzhvsicdyo
manifest=supabase/supabase/migration-manifest.json
started_at=2026-04-22T13:49:24.660Z

## supabase/supabase/baseline/BASELINE.sql
runner=pg
note=psql_not_installed_meta_commands_stripped

## supabase/supabase/baseline/BASELINE.sql (attempt 1/5)
runner=pg
elapsed_ms=759
status=failed
error: type "booking_status" already exists
    at /Users/aminismail/Documents/GitHub/TeqBook/node_modules/.pnpm/pg@8.20.0/node_modules/pg/lib/client.js:631:17
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async runSqlFile (/Users/aminismail/Documents/GitHub/TeqBook/scripts/db-apply.ts:140:7)
    at async main (/Users/aminismail/Documents/GitHub/TeqBook/scripts/db-apply.ts:241:3)