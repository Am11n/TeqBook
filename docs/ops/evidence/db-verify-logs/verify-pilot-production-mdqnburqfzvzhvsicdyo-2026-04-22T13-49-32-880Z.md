# DB Verification Run
target=pilot-production
project_ref=mdqnburqfzvzhvsicdyo
started_at=2026-04-22T13:49:32.881Z

## supabase/supabase/verification/00_schema_and_security.sql (attempt 1/5)
runner=pg
status=success
## supabase/supabase/verification/01_booking_integrity.sql (attempt 1/5)
runner=pg
status=success
## supabase/supabase/verification/02_data_quality.sql (attempt 1/5)
runner=pg
status=failed
error: Data quality failed: duplicate customers found (1).
    at /Users/aminismail/Documents/GitHub/TeqBook/node_modules/.pnpm/pg@8.20.0/node_modules/pg/lib/client.js:631:17
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async runWithPg (/Users/aminismail/Documents/GitHub/TeqBook/scripts/db-verify.ts:82:9)
    at async main (/Users/aminismail/Documents/GitHub/TeqBook/scripts/db-verify.ts:187:5)