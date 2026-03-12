# Notification Reliability Runtime Model

## Data Model

- `notification_events`: idempotency envelope per booking + event type.
- `notification_jobs`: runtime delivery state (`delivery_status`, `next_retry_at`, `dead_letter_reason`, `provider_used`).
- `notification_attempts`: immutable attempt log per channel/provider.

## Retry Policy

- Attempt 1 failure -> retry after 30 seconds
- Attempt 2 failure -> retry after 2 minutes
- Attempt 3+ failure -> retry after 10 minutes
- Terminal threshold -> `dead_letter`

## Delivery Status Contract

- `queued`: accepted for processing
- `processing`: active attempt in progress
- `sent`: at least one required channel delivered
- `failed`: retryable failure
- `dead_letter`: terminal failure requiring manual intervention

## Provider Failover Test Procedure (Staging)

1. Trigger notification send with provider dependency intentionally blocked.
2. Validate `notification_attempts` rows are created with failure errors.
3. Validate `notification_jobs.next_retry_at` follows schedule.
4. Restore provider and re-trigger processing.
5. Confirm successful state transition to `sent`.

## Operational Signals

- Dead-letter count by event type
- Retry success ratio
- Provider-specific error rate (`provider_used`)
- Oldest pending retry age

