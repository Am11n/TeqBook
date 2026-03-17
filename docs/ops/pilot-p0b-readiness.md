# P0b Operational Readiness

Date: 2026-03-17
Scope: Reschedule/cancel, customer basics, mobile baseline, minimum observability.

## Exit Criteria Checklist

- [x] Reschedule/cancel behavior is defined as release-critical flow.
- [x] Customer basics (create/search/view) included in pilot acceptance.
- [x] Day/week calendar baseline included in manual QA matrix.
- [x] Mobile baseline defined for iPhone Safari and Android Chrome.
- [x] Booking failure observability and escalation path are documented.

## Operational Evidence

- SLA and escalation: `docs/ops/pilot-support-sla.md`
- Recovery/rollback: `docs/ops/supabase-recovery-runbook.md`
- Incident gates/sign-off: `docs/ops/supabase-dual-production-gates.md`
- Observability baseline: `docs/ops/observability.md`
- UX/manual QA baseline: `docs/ops/ux-consistency-design-qa.md`

## Manual Validation Matrix (Required per Release Candidate)

| Surface | Device | Result | Notes |
|---|---|---|---|
| Calendar day view | iPhone Safari | Pending each RC | Verify load state, timezone rendering, and booking card actions |
| Calendar week view | Android Chrome | Pending each RC | Verify navigation and slot rendering |
| Booking reschedule | Desktop Chrome | Pending each RC | Confirm updated time appears immediately |
| Booking cancel | Desktop Chrome | Pending each RC | Confirm status and cancellation reason consistency |
| Customer search/view | Desktop Chrome | Pending each RC | Confirm lookup by name/phone |

## Readiness Decision

P0b is operationally ready for controlled pilot execution as long as release candidates keep the matrix green and no Sev1/tenant isolation incidents are open.
