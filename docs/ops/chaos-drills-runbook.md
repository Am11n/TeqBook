# Chaos Drills Runbook

This runbook defines controlled chaos drills for TeqBook after baseline observability and booking reliability controls are active.

## Preconditions (mandatory)

- Tracing and request correlation live in runtime.
- Alert policies active for API error-rate, webhook failures, latency and queue/retry failures.
- Booking concurrency protection is enabled at DB level.
- Notification retry and dead-letter tracking are active.
- On-call owner and incident commander are assigned for drill window.

## Scope and Guardrails

- Chaos drills run only in staging.
- One fault domain per drill.
- Kill-switch and rollback owner must be present.
- No drill without explicit start/stop timestamps and postmortem notes.

## Drill Catalog

### 1) Stripe Timeout Drill

- Inject timeout/failure behavior in billing webhook dependency path.
- Verify:
  - alert triggers
  - incident trace can be followed by request-id
  - retry behavior and idempotency remain correct

### 2) Notification Provider Failure Drill

- Simulate provider outage (`resend` and/or `twilio`) for a fixed window.
- Verify:
  - `notification_jobs` transitions to `failed`/`dead_letter` correctly
  - `notification_attempts` records each retry and error
  - next retry schedule follows `30s -> 2m -> 10m`

### 3) Database Latency Spike Drill

- Introduce artificial latency in DB path.
- Verify:
  - p95 latency alert triggers
  - query budget gate captures slow queries
  - recovery and alert clear behavior documented

### 4) Worker Crash / Process Interruption Drill

- Stop/restart notification worker process flow.
- Verify:
  - no duplicate processing due to idempotency model
  - backlog recovery occurs within expected window

## Evidence Package Per Drill

- Timeline (start, detection, mitigation, recovery).
- Screenshots/exports from dashboards and alerts.
- Trace id examples for impacted requests.
- Postmortem notes with action items and owner.

## Exit Criteria

- Detection-to-mitigation time improves against previous baseline.
- No uncontrolled side effects or data corruption.
- Follow-up actions are tracked in operations backlog with owners.

