# DB Apply Run
target=pilot-production
project_ref=mdqnburqfzvzhvsicdyo
manifest=supabase/supabase/migration-manifest.json
started_at=2026-03-18T09:25:59.875Z

## supabase/supabase/baseline/BASELINE.sql (attempt 1/5)
elapsed_ms=747
status=failed
error: syntax error at or near "\"
    at /Users/aminismail/Documents/GitHub/TeqBook/node_modules/.pnpm/pg@8.20.0/node_modules/pg/lib/client.js:631:17
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async runSqlFile (/Users/aminismail/Documents/GitHub/TeqBook/scripts/db-apply.ts:72:7)
    at async main (/Users/aminismail/Documents/GitHub/TeqBook/scripts/db-apply.ts:147:3)