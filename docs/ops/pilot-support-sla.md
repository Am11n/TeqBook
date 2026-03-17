# Pilot Support SLA and Escalation

Date: 2026-03-17
Environment: `pilot-production`

## Support Window

- Support hours: 08:00-18:00 CET, Monday-Friday.
- Outside support hours: best effort; otherwise handled in next support window.

## Severity and Response Targets

| Severity | Example | First Response Target | Resolution Target |
|---|---|---|---|
| Sev1 | Booking creation failure, tenant isolation risk, outage | 30 minutes (support hours) | Same-day containment + active workaround |
| Sev2 | Reschedule/cancel broken, owner blocked from core task | 2 hours (support hours) | Within 1 business day |
| Sev3 | Cosmetic/non-blocking defect | 1 business day (triage) | Planned backlog cycle |

## Escalation Path

1. Support triage opens incident with severity and affected salon IDs.
2. Engineering on-call is paged for Sev1/Sev2.
3. Ops lead validates continuity risk and decides mitigation path.
4. Communication owner sends pilot salon updates for Sev1/Sev2.
5. Close with evidence links and follow-up action item.

## Emergency Controls

- Public booking kill switch for affected salon(s).
- Rollback to previous deploy for application-level regressions.
- Prefer forward-fix or isolated data repair over destructive DB rollback.
- Full DB restore in pilot-production requires explicit Engineering + Ops approval.

## Runbook References

- Recovery and rollback: `docs/ops/supabase-recovery-runbook.md`
- Environment gates and sign-off: `docs/ops/supabase-dual-production-gates.md`
- Junior manual flow: `docs/ops/supabase-junior-manual-guide.md`
