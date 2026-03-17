# Pilot Incident Severity and Escalation

## Severity Definitions

- **Sev1**
  - Booking creation failure
  - Tenant isolation risk/breach
  - Production outage
- **Sev2**
  - Reschedule/cancel broken
  - Owner blocked from a core daily task
- **Sev3**
  - Degraded UX, cosmetic, non-blocking defect

## Escalation Targets

| Severity | First Response Target | Escalation |
|---|---|---|
| Sev1 | 30 minutes (support hours) | Immediate Engineering + Ops + Communication owner |
| Sev2 | 2 hours (support hours) | Engineering owner same day |
| Sev3 | 1 business day (triage) | Normal backlog cycle |

## Stop-the-Line Conditions

- Suspected tenant isolation issue.
- Booking integrity uncertainty.
- Critical release gate red.
- Continuity risk for active pilot salons.

## Incident Record Template

| Date | Severity | Salon(s) | Summary | Containment | Owner | Resolution ETA | Postmortem Link |
|---|---|---|---|---|---|---|---|
| YYYY-MM-DD | Sev1/Sev2/Sev3 |  |  |  |  |  |  |
