# Query Budgets And Zero-Downtime Migration Guide

## Query Budgets

- Booking query budget: `< 20ms` mean execution time
- Dashboard query budget: `< 50ms` mean execution time
- Budget gate source: `pg_stat_statements`

## Runtime Gate

- SQL function: `get_query_budget_violations(...)`
- CI/operations script: `pnpm run check:query-budgets`
- Staging workflow gate: `.github/workflows/staging-load-gate.yml`

## Baseline Process

1. Run representative staging load traffic.
2. Execute query budget gate script.
3. Store violations (if any) in release evidence package.
4. Fix indexes/query paths and re-run until green.

## Zero-Downtime Migration Rules

- Avoid destructive schema changes in one step.
- Add new nullable columns first, backfill second, enforce constraints last.
- Prefer `CONCURRENTLY` for index builds where supported.
- Keep migrations backward-compatible with previous app version until rollout completion.
- Include rollback SQL notes for each production migration.

## Release Candidate Checklist

- [ ] Staging load gate passed
- [ ] Query budget gate passed
- [ ] No blocking migration lock-time warnings
- [ ] Rollback path documented

