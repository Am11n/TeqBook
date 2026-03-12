# Product Analytics and Growth Quality

## Purpose

Define a production-safe analytics contract for funnel quality across onboarding, booking, payment, and notification outcomes.

## Canonical KPI Set

- `onboarding_conversion_rate`
- `booking_completion_rate`
- `payment_dropoff_rate`
- `notification_delivery_success_rate`

## Event Contract

Public booking events are canonically defined in:
- `packages/shared-core/src/analytics/event-taxonomy.ts`

Rules:
- No ad-hoc event names in public booking code paths.
- Event payloads must include `salon_slug` and `step` when relevant.
- Event schema changes require changelog entry in this document.

## Funnel Definitions

### Onboarding Funnel

`landing_view -> signup_started -> signup_completed -> first_booking_created`

### Booking Funnel

`service_selected -> date_selected -> slot_selected -> booking_completed`

### Payment Funnel

`checkout_started -> payment_submitted -> payment_succeeded`

Drop-off is measured between adjacent funnel steps.

## Data Quality Gates

- [ ] Event name present in shared taxonomy
- [ ] Required payload fields documented
- [ ] Event included in dashboard query logic
- [ ] Backward compatibility evaluated for existing dashboards

## Dashboard Requirements

- Daily funnel conversion by tenant segment (plan + market)
- Weekly trend for booking completion and payment drop-off
- Alert on >10% week-over-week degradation in primary conversion

## Ownership

- Product owner: KPI targets and thresholds
- Engineering owner: instrumentation correctness
- Ops owner: alerting and incident linkage

