# Observability Strategy

## Scope

This document defines observability standards for:
- `apps/public`
- `apps/dashboard`
- `apps/admin`
- Supabase Edge Functions

## Logging Standard

All logs must include:
- `app` (`public` | `dashboard` | `admin`) or `fn` for edge functions
- `request_id` / `correlationId`
- `tenant_id` (when available)
- `user_id` (when authenticated)
- `route` and `method`
- `status_code` and `latency_ms`

Recommended structure:

```typescript
{
  timestamp: "2026-03-12T10:00:00Z",
  level: "info",
  message: "booking notification sent",
  correlationId: "uuid",
  context: {
    app: "public",
    route: "/api/bookings/send-notifications",
    method: "POST",
    tenant_id: "salon_123",
    user_id: "user_456",
    latency_ms: 123
  }
}
```

## Tracing

Critical chains must be traceable end-to-end:
- `booking -> reminder scheduling -> notification`
- `billing action -> Stripe webhook -> salon state update`
- `waitlist trigger -> lifecycle processor -> claim flow`

Minimum requirement:
- One request ID generated/propagated across route handlers and service calls.
- Include `event_id` for webhook-driven flows.

## Metrics and Dashboards

Required dashboards:
- Bookings per minute
- Booking completion rate
- Notification delivery success/failure
- API latency (p50, p95, p99)
- DB query latency
- Stripe webhook success/failure

## Alerts

Minimum alert thresholds:
- Error rate > 5% for 5 minutes
- Booking API failure spike
- Webhook processing failures
- p95 latency > 200ms for critical APIs
- Repeated background job lock contention/failures

## SLI/SLO Governance

Primary SLIs:
- Availability
- Latency
- Success rate
- Data freshness for scheduled processors

Initial SLO targets:
- API latency p95 < 200ms for critical routes
- Booking success >= 99.9%
- Uptime >= 99.95%
- Error rate < 1%

Governance process:
- Weekly operations review
- Monthly SLO review with error budget status
- Release freeze when error budget is exhausted

## Instrumentation Review Checklist

Before merging changes to critical flows:
- [ ] Request ID/correlation propagation verified
- [ ] Logs include app/fn + route + tenant/user context
- [ ] Metrics emitted or observable for new path
- [ ] Alerts updated if failure mode changes
- [ ] Runbook impact documented
