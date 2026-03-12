# TeqBook 10/10 Hardening Batch Execution

This document records runtime implementation work for the hardening batches with explicit DoD, evidence and rollback context.

## Batch 1: Tracing And Runtime Observability

### Problem
- Request correlation was inconsistent across apps and route handlers.
- No guaranteed `x-request-id` propagation from ingress to application handlers.

### Change
- Added request-context helpers in shared package:
  - `packages/shared-core/src/tracing/request-context.ts`
- Added ingress middleware in:
  - `apps/public/middleware.ts`
  - `apps/dashboard/middleware.ts`
  - `apps/admin/middleware.ts`
- Added request-id propagation into booking notification routes and response headers.
- Extended route-handler Supabase client creation to forward request id as a global header.

### Evidence
- Middleware now stamps `x-request-id` and `traceparent` for every request.
- Critical booking notification routes include request id in log context and response headers.
- Shared helper exports are available via `@teqbook/shared`.

### Rollback
- Remove middleware files / revert middleware edits.
- Revert request-id propagation additions in route handlers and shared Supabase server client.

### Risks
- Middleware matcher changes can affect edge execution scope.
- Trace id generation fallback is non-cryptographic when `crypto.randomUUID` is unavailable.

## Batch 2: Booking Race Hardening

### Problem
- Booking create had atomic RPC, but update/reschedule paths could still write directly.
- No exclusion constraint guaranteeing non-overlap at DB level for active slots.

### Change
- Added migration:
  - `supabase/supabase/migrations/20260313000001_booking_overlap_guard.sql`
- Implemented:
  - `bookings_no_overlapping_active_slots` exclusion constraint
  - `update_booking_atomic(...)` RPC with conflict checks and row lock
- Updated booking mutation repositories (`public`, `dashboard`, `admin`) so reschedule/employee-change updates use `update_booking_atomic`.

### Evidence
- DB now enforces overlap guard for active booking statuses.
- Repository paths route schedule-sensitive updates through atomic RPC.
- Existing race-condition suite for create booking remains in place.

### Rollback
- Drop exclusion constraint and function via follow-up SQL migration.
- Revert repository RPC usage and restore direct update behavior.

### Risks
- Existing overlapping historical data can block migration apply.
- Exclusion constraints add write-path overhead.

## Batch 3: Staging Load And DB Gate

### Problem
- No explicit staging-only load gate with pass/fail thresholds.

### Change
- Added k6 load scripts:
  - `tests/load/public-booking-smoke.js`
  - `tests/load/dashboard-api-smoke.js`
- Added workflow:
  - `.github/workflows/staging-load-gate.yml`
- Added scripts:
  - `test:load:public`
  - `test:load:dashboard`
  - `test:load:staging`

### Evidence
- Nightly scheduled and manual dispatch staging load workflow now exists.
- Thresholds codified in k6 script options (`http_req_failed`, `p95` duration).

### Rollback
- Remove load workflow and scripts from package and test directories.

### Risks
- Staging drift from production can produce false confidence.
- Endpoint choice in smoke scripts may need periodic adjustment.

## Batch 4: Notification Reliability Model

### Problem
- Notification idempotency model existed but lacked explicit DLQ/retry scheduling fields and runtime state transitions in public flows.

### Change
- Added migration:
  - `supabase/supabase/migrations/20260313000002_notification_reliability_fields.sql`
- Extended `notification_events` with:
  - `next_retry_at`
  - `dead_letter_reason`
  - `provider_used`
  - `dead_letter` status support
- Updated public notification/cancellation routes to:
  - short-circuit already-sent events
  - increment attempts
  - mark `sent`/`failed`/`dead_letter`
  - set backoff (`next_retry_at`) for retryable failures

### Evidence
- Runtime routes persist delivery outcome and retry metadata per booking event.
- Data model now stores both delivery provider and terminal failure reason.

### Rollback
- Revert route logic and schema extension migration.

### Risks
- Aggressive dead-letter threshold may require tenant-specific tuning.
- Mixed channel success criteria must be reviewed periodically.

## Batch 5: Feature Delivery, Admin Guardrails, Chaos Sequencing

### Problem
- Need explicit separation of feature flags vs experimentation plus operational guardrails and chaos sequencing policy.

### Change
- Enforced release-control model through existing feature flag platform (already present in schema and admin service).
- Codified operational rules in this execution record:
  - Feature flags are release controls.
  - Experimentation is a separate layer and should only run after baseline stability.
  - Chaos testing is gated and executed after observability/alerts/concurrency/retry maturity.

### Evidence
- Existing feature flag service is present (`apps/admin/src/lib/services/feature-flags-service.ts`).
- Hardening batches above now satisfy sequencing prerequisites for controlled chaos drills.

### Rollback
- Disable feature flags for new rollouts and suspend experimentation/chaos drills.

### Risks
- Admin superpower actions still require strict role and audit review per release.
- Chaos drills can create incident noise if launched without active on-call ownership.

## Ownership Matrix

- Engineering owner: Platform/backend lead
- Review owner: Principal engineer / designated reviewer
- Tester: QA + service owner for changed domain
- Operations sign-off: Incident/on-call owner
- Product sign-off (Batch 5): Product lead

## SLO Targets Used

- Trace coverage target for critical chains: >= 80%
- Critical API request-id propagation: 100%
- Double-booking in concurrency suite: 0
- Notification retry success after transient failure: > 99%
- Staging load p95 thresholds:
  - Public booking smoke: < 300 ms
  - Dashboard API smoke: < 250 ms
