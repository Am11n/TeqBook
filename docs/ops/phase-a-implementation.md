# TeqBook Phase A Implementation Log

Date: 2026-03-12

Owner: AI implementation session

Scope: Phase A (A1-A5) from `TeqBook Elite SaaS Readiness Blueprint`

---

## Summary

Phase A security and production-safety hardening has been implemented across public/dashboard/admin APIs, CI, and migration tooling.

For each change area below, this log captures:
- Problem
- Change
- Verification evidence
- Rollback notes

---

## A1 - Server Authoritative Logic (Public notifications)

### Problem

Public booking notification routes accepted client payload as authoritative source for booking/customer data.

### Change

- Public confirmation route now fetches booking + customer data server-side with service-role client and validates:
  - booking exists for `bookingId + salonId`
  - booking status is allowed (`confirmed`, `pending`, `scheduled`)
  - `customerEmail` (if provided) matches authoritative booking customer email
- Public cancellation route now fetches booking server-side and validates:
  - booking exists for `bookingId + salonId`
  - booking status is allowed (`cancelled`, `no-show`)
  - `customerEmail` (if provided) matches authoritative booking customer email
- Email/SMS/in-app notification payloads are now generated from DB-backed values.

### Files

- `apps/public/src/app/api/bookings/send-notifications/route.ts`
- `apps/public/src/app/api/bookings/send-cancellation/route.ts`
- `apps/public/src/lib/supabase/admin.ts`

### Verification Evidence

- Typecheck:
  - `pnpm --filter '@teqbook/public' run type-check`
- Tests:
  - `pnpm --filter '@teqbook/public' exec vitest --run tests/unit/api/bookings-send-notifications-rate-limit.test.ts tests/unit/api/bookings-send-cancellation-rate-limit.test.ts`

### Rollback Notes

- Revert the two route handlers and `apps/public/src/lib/supabase/admin.ts`.
- No schema rollback needed for this subpart.

---

## A2 - Tenant Isolation / Integration-RLS CI Gate

### Problem

Integration/RLS suite existed but was not required in CI before build/deploy.

### Change

- Added required `integration` job in CI to run `pnpm run test:integration`.
- Build job now depends on `integration`.

### Files

- `.github/workflows/ci.yml`

### Verification Evidence

- CI config updated with dedicated `integration` job and `needs` chain.
- Local command verified availability:
  - `pnpm run test:integration` (requires env/secrets in CI runtime).

### Rollback Notes

- Remove `integration` job and restore previous `build.needs`.

---

## A3 - Queue/Scheduler Safety And Distributed Processing Guards

### Problem

Waitlist lifecycle processing could run concurrently without distributed lock.
Waitlist expiry processor existed but lacked explicit cron scheduling migration.

### Change

- Added advisory lock RPC functions for lifecycle processing:
  - `acquire_waitlist_lifecycle_lock()`
  - `release_waitlist_lifecycle_lock()`
- Updated lifecycle route to:
  - acquire lock before processing
  - skip with conflict response when already running
  - always release lock in `finally`
- Added migration to schedule `process-waitlist-expiry` every 5 minutes with `pg_cron` + `pg_net`.

### Files

- `apps/dashboard/src/app/api/waitlist/process-lifecycle/route.ts`
- `supabase/supabase/migrations/20260312000001_waitlist_lifecycle_lock.sql`
- `supabase/supabase/migrations/20260312000002_schedule_waitlist_expiry_processor.sql`

### Verification Evidence

- Typecheck:
  - `pnpm --filter '@teqbook/dashboard' run type-check`
- SQL migrations added as idempotent, explicit cron/lock setup.

### Rollback Notes

- Revert the lifecycle route and both migrations.
- If migrations already applied, unschedule cron + drop functions manually.

---

## A4 - API Exposure / CSRF / Rate-Limit Hardening

### Problem

Several mutating cookie-authenticated routes had no explicit same-origin guard and some waitlist mutation endpoints lacked rate-limiting.
Admin health endpoint was unauthenticated.
Public waitlist claim route had no abuse throttle.
Rate-limit edge function allowed permissive reset behavior.

### Change

- Added same-origin guards for mutating dashboard/admin routes.
- Added rate-limits for waitlist mutation routes in dashboard.
- Added authz + rate-limit to admin health endpoint (superadmin-only).
- Added rate-limiting for public waitlist claim GET/POST.
- Hardened rate-limit edge function reset action:
  - requires either `x-rate-limit-reset-token` (server secret) or valid bearer user token
  - rejects invalid reset caller.
- Added new endpoint policies to shared and edge configs:
  - `public-waitlist-claim`
  - `admin-health`
  - `waitlist-notify`
  - `waitlist-priority-override`
  - `waitlist-convert-booking`
  - `waitlist-process-cancellation`

### Files

- `apps/dashboard/src/lib/api-security.ts`
- `apps/admin/src/lib/api-security.ts`
- `apps/dashboard/src/app/api/bookings/send-notifications/route.ts`
- `apps/dashboard/src/app/api/bookings/send-cancellation/route.ts`
- `apps/dashboard/src/app/api/settings/send-test-notification/route.ts`
- `apps/admin/src/app/api/impersonate/route.ts`
- `apps/dashboard/src/app/api/waitlist/notify/route.ts`
- `apps/dashboard/src/app/api/waitlist/priority-override/route.ts`
- `apps/dashboard/src/app/api/waitlist/convert-booking/route.ts`
- `apps/dashboard/src/app/api/waitlist/process-cancellation/route.ts`
- `apps/admin/src/app/api/health/route.ts`
- `apps/public/src/app/api/waitlist/claim/route.ts`
- `packages/shared-core/src/rate-limit/policy.ts`
- `supabase/supabase/functions/_shared/rate-limit-config.ts`
- `supabase/supabase/functions/rate-limit-check/index.ts`

### Verification Evidence

- Typecheck:
  - `pnpm --filter '@teqbook/dashboard' run type-check`
  - `pnpm --filter '@teqbook/admin' run type-check`
  - `pnpm --filter '@teqbook/public' run type-check`
- Tests:
  - `pnpm --filter '@teqbook/public' exec vitest --run tests/unit/api/waitlist-claim.test.ts`

### Rollback Notes

- Revert route-level guards and rate-limit calls.
- Revert policy/config additions.
- Revert rate-limit edge reset authorization branch.

---

## A5 - Migration Integrity

### Problem

Migration scripts and docs referenced `supabase/migrations` while repository migrations are in `supabase/supabase/migrations`.
Integration test migration path was also incorrect.

### Change

- Updated migration script path references to `supabase/supabase/migrations`.
- Updated scripts docs to match canonical path.
- Fixed integration test migration directory resolution.

### Files

- `scripts/migrate-local.ts`
- `scripts/README.md`
- `apps/dashboard/tests/integration/query-performance.test.ts`

### Verification Evidence

- Typecheck:
  - `pnpm --filter '@teqbook/dashboard' run type-check`
- Test file path now points to repository root migrations location.

### Rollback Notes

- Revert script/docs/test path changes if directory convention changes again.

---

## Validation Commands Executed

- `pnpm --filter '@teqbook/public' run type-check`
- `pnpm --filter '@teqbook/dashboard' run type-check`
- `pnpm --filter '@teqbook/admin' run type-check`
- `pnpm --filter '@teqbook/public' exec vitest --run tests/unit/api/bookings-send-notifications-rate-limit.test.ts tests/unit/api/bookings-send-cancellation-rate-limit.test.ts tests/unit/api/waitlist-claim.test.ts`

## Known Non-Blocking Note

- `apps/dashboard/tests/integration/query-performance.test.ts` currently fails on pre-existing `SELECT *` violations in repositories (not introduced by this Phase A work). The migration path issue in this test was fixed; the data-access quality violations are separate remediation items.

