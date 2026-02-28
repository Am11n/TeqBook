# Waitlist Operations Runbook

## Scope

This runbook documents the operational waitlist flow across public booking and dashboard management, including lifecycle transitions, notification channels, expiry automation, and realtime behavior.

## Lifecycle State Machine

- `waiting` -> initial state when created from dashboard or public intake.
- `waiting` -> `notified` when a cancelled slot is matched to a waitlist entry.
- `notified` -> `booked` when customer accepts claim-link and booking is created atomically.
- `notified` -> `expired` when `expires_at` passes and expiry processor runs.
- `notified` -> `cooldown` when customer declines/offer times out.
- `cooldown` -> `waiting` when `cooldown_until` passes and reactivation job runs.
- `waiting`/`notified` -> `cancelled` by manual salon action.

Database hardening and lifecycle defaults:

- Status constraint and lifecycle trigger: `supabase/supabase/migrations/20260228000002_waitlist_lifecycle_hardening.sql`
- Expiry processor function and event log: `supabase/supabase/migrations/20260228000003_waitlist_expiry_processor.sql`
- Offers/cooldown/policy + atomic claim RPC:
  - `supabase/supabase/migrations/20260301000001_waitlist_offers_and_cooldown.sql`

## Public Flow

- Public intake API with validation + rate limiting:
  - `apps/public/src/app/api/waitlist/route.ts`
  - Rate-limit policy: `packages/shared-core/src/rate-limit/policy.ts` (`public-waitlist-intake`)
- Public booking UX fallback to waitlist when no slots exist:
  - `apps/public/src/components/public-booking/usePublicBooking.ts`
  - `apps/public/src/components/public-booking/index.tsx`
  - i18n strings: `apps/public/src/i18n/en.ts`, `apps/public/src/i18n/nb.ts`

## Dashboard Owner Flow

- Waitlist list/filter/search/pagination/create/manage UI:
  - `apps/dashboard/src/app/bookings/waitlist/page.tsx`
- Service/repository entry points:
  - `apps/dashboard/src/lib/services/waitlist-service.ts`
  - `apps/dashboard/src/lib/repositories/waitlist.ts`
  - `apps/dashboard/src/lib/services/waitlist-cancellation.ts`
  - `apps/dashboard/src/lib/services/waitlist-automation.ts`

## Notifications (Email + SMS)

- Waitlist claim offers are sent with signed token links (accept/decline) via SMS/email:
  - `apps/dashboard/src/lib/services/waitlist-cancellation.ts`
- Public claim endpoint executes atomic accept/decline:
  - `apps/public/src/app/api/waitlist/claim/route.ts`
- SMS transport and usage logging pipeline:
  - `apps/dashboard/src/lib/services/sms/service.ts`
  - `apps/dashboard/src/lib/services/unified-notification/sms-channel.ts`
  - `supabase/supabase/migrations/20260227000001_create_sms_usage_and_log.sql`
  - `supabase/supabase/migrations/20260228000001_add_sms_log_status_update_rpc.sql`

## Expiry Automation

- Scheduled edge function target:
  - `supabase/supabase/functions/process-waitlist-expiry/index.ts`
- Function config for scheduler/no JWT:
  - `supabase/config.toml` (`[functions.process-waitlist-expiry]`)
- Core DB RPC:
  - `expire_waitlist_entries(max_rows integer)`
- Offer timeout and cooldown reactivation API processor:
  - `apps/dashboard/src/app/api/waitlist/process-lifecycle/route.ts`

## Realtime Contract and Fallback

Dashboard waitlist subscriptions use salon-scoped channel naming:

- Channel: `waitlist:salon:{salonId}`
- Source table: `waitlist_entries`
- Events: `INSERT`, `UPDATE`, `DELETE` (subscribed with wildcard `*`)

Reducer behavior:

- Payloads are deduplicated by `eventType + rowId + commit_timestamp`.
- On accepted event, list is refreshed and filter/search/pagination are reapplied.

Fallback strategy:

- On `CHANNEL_ERROR`, bounded retry with exponential backoff (up to 4 retries).
- Independent 60-second polling remains active for state self-healing.
- Degraded realtime uses polling without blocking dashboard operations.

Implementation reference:

- `apps/dashboard/src/app/bookings/waitlist/page.tsx`

## Troubleshooting

- Public waitlist submissions fail with `429`:
  - Verify rate-limit state for `public-waitlist-intake`.
- Public waitlist `500` on insert:
  - Verify `SUPABASE_SERVICE_ROLE_KEY` and `NEXT_PUBLIC_SUPABASE_URL` in public app runtime.
- Entries do not auto-expire:
  - Confirm `process-waitlist-expiry` function is deployed and scheduler is configured.
  - Verify `expire_waitlist_entries` returns rows for stale `notified` records.
- SMS not sent for waitlist claim:
  - Validate salon SMS policy and quotas.
  - Check `sms_log` for `waitlist_claim` entries and provider status.
- Claim-link returns invalid/expired:
  - Verify `waitlist_offers.status='pending'` and `token_expires_at`.
  - Confirm token hash lookup via `claim_waitlist_offer_atomic(...)`.
- Customers remain in cooldown too long:
  - Check `waitlist_entries.cooldown_until` and policy from `resolve_waitlist_policy(...)`.
  - Trigger lifecycle processor route if scheduler lagged.
- Dashboard not updating in realtime:
  - Check browser console for `CHANNEL_ERROR`.
  - Confirm polling fallback updates data within one minute.

## Test Evidence

- Public waitlist API rate-limit tests:
  - `apps/public/tests/unit/api/waitlist-rate-limit.test.ts`
- Public waitlist claim endpoint tests:
  - `apps/public/tests/unit/api/waitlist-claim.test.ts`
- Waitlist service transition/notification tests:
  - `apps/dashboard/tests/unit/services/waitlist-service.test.ts`
