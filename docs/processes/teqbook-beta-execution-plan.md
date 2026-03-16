# TeqBook Beta Execution Plan

## Outcome

Run a controlled beta with 3-5 pilot salons, proving reliable daily usage of core booking flows before broader beta expansion.

## Assumptions and Constraints

- Pilot salons accept normal beta imperfections during pilot period.
- Support is staffed only in defined pilot support hours.
- Only approved pilot locales are fully supported.
- Billing/payment is not part of pilot success criteria.
- Team capacity prioritizes P0 integrity and reliability over feature expansion.

## Scope Model

- **P0a (value proof):** auth, onboarding, services, employees, opening hours/shifts, public booking, booking visible in dashboard.
- **P0b (operational readiness):** reschedule/cancel, customer basics, day/week calendar baseline, mobile dashboard baseline, observability minimum.
- **P1:** post-pilot improvements (notifications, reporting improvements, imports, admin assist, additional fully QA-tested locales).
- **P2:** billing, multi-salon, gift cards, packages, waitlist growth, loyalty, advanced analytics/commissions.

## Timeboxes

- Phase 1: 1-2 days
- Phase 2: 1-2 days
- Phase 3: 3-5 days
- Phase 4: 2-4 days
- Phase 5: 2-3 days
- Phase 6: 1-2 days
- Phase 7: 4-week pilot

## Dependency Map

- `WP3` depends on Phase 2 bootstrap and seed validation.
- `WP4` depends on `WP3` integrity stabilization.
- `WP5` starts only after P0a critical flows are stable.
- Phase 7 starts only after all release-gate items are green.
- Pilot expansion depends on stop-the-line checks staying clear.

## Phase Framework

Track for each phase:

- **Status:** Planned / In Progress / Blocked / Completed
- **Completion date**
- **Evidence links**
- **Objective**
- **Deliverables**
- **Exit criteria (binary)**
- **Owner**

---

## Phase 1 - Beta Freeze and Guardrails

- **Status:** Planned
- **Completion date:** TBD
- **Evidence links:** TBD
- **Objective:** freeze product surface to Beta 1 only.
- **Deliverables:**
  - `BETA_SCOPE.md` published and approved.
  - Feature inventory tagged as `P0a`, `P0b`, `hidden`, `disabled`, `post-beta`.
  - Guard strategy documented for hidden/disabled surfaces.
- **Exit criteria:**
  - Every non-P0 feature is hidden or disabled.
  - Pilot language set documented.
  - Product + Engineering approve scope.
- **Owner:** Product + Engineering.

## Phase 2 - Fresh Environment and Seed Validation

- **Status:** Planned
- **Completion date:** TBD
- **Evidence links:** TBD
- **Objective:** prove clean bootstrap from zero.
- **Deliverables:**
  - Fresh Supabase bootstrap procedure validated.
  - Deterministic seed data available.
  - Env matrix docs consolidated.
- **Exit criteria:**
  - Fresh Supabase boots with no manual SQL patching.
  - All three apps start locally.
  - Seed script succeeds.
  - Seeded demo salon completes onboarding.
  - Public booking resolves seeded salon slug.
- **Owner:** Platform/Backend.

## Phase 3 - Core Flow Integrity (P0a then P0b)

- **Status:** Planned
- **Completion date:** TBD
- **Evidence links:** TBD
- **Objective:** harden mission-critical behavior end-to-end.
- **Deliverables:**
  - P0a flows green.
  - P0b flows green.
  - Tenant isolation and public/private boundaries validated.
- **Exit criteria:**
  - Real booking can be created and appears in dashboard.
  - Inactive services/employees are not bookable.
  - Non-public salons are not publicly bookable.
  - Overlap and invalid-time bookings are blocked.
  - Reschedule/cancel works and calendar updates correctly.
- **Owner:** Full-stack feature owner.

## Phase 4 - Test Gate Hardening

- **Status:** Planned
- **Completion date:** TBD
- **Evidence links:** TBD
- **Objective:** make confidence measurable and blocking.
- **Deliverables:**
  - Critical E2E specs use strict outcome assertions.
  - Critical suite is release-blocking in CI.
  - Integrity-heavy integration tests expanded.
- **Exit criteria:**
  - Minimum 5 critical E2E tests pass on release candidates.
  - Failures block release.
  - Flaky threshold stays under 2% across the last 20 CI runs for critical E2E jobs.
- **Owner:** QA + Engineering.

## Phase 5 - UX Polish on Critical Surfaces

- **Status:** Planned
- **Completion date:** TBD
- **Evidence links:** TBD
- **Objective:** remove friction that blocks daily usage.
- **Deliverables:**
  - Onboarding/public booking/booking form/calendar/mobile dashboard polish.
  - Explicit loading/empty/error states on critical screens.
- **Exit criteria:**
  - Owners find service setup, calendar, and public link without guidance.
  - Mobile checklist passes on iPhone Safari and Android Chrome.
- **Owner:** Product Design + Frontend.

## Phase 6 - Pilot Ops, SLA, and Rollback

- **Status:** Planned
- **Completion date:** TBD
- **Evidence links:** TBD
- **Objective:** guarantee operational control in pilot.
- **Deliverables:**
  - Support SLA and escalation path.
  - Rollback and emergency controls documented and drilled.
  - Error tracking + booking-failure logging active.
- **Support SLA:**
  - Support hours: 08:00-18:00 CET weekdays.
  - Outside support hours: best effort / next support window.
  - Critical booking issue: first response within 30 minutes (support hours).
  - Login/onboarding blocker: first response within 2 hours (support hours).
  - Cosmetic/non-blocking: triage within 1 business day.
- **Rollback minimum:**
  - Disable public booking quickly.
  - Restore previous deploy.
  - Reset/reseed demo contamination safely.
  - Pause one pilot salon without affecting others.
- **Exit criteria:**
  - On-call/support owner named.
  - SLA and escalation path published.
  - Rollback rehearsal passes in staging.
- **Owner:** Ops + Engineering.

## Phase 7 - Controlled Pilot and Feedback Loop

- **Status:** Planned
- **Completion date:** TBD
- **Evidence links:** TBD
- **Objective:** validate reliability and trust in real usage.
- **Deliverables:**
  - 3 pilot salons onboarded (barber, hair, beauty/nails).
  - Weekly structured feedback collected.
  - Go/no-go package prepared for broader beta.
- **Exit criteria:**
  - First booking within 24h per salon.
  - At least 10 real bookings per salon in pilot window.
  - At least one reschedule/cancel per salon.
  - No critical booking failures and no tenant leaks.
- **Owner:** Product + Customer Success + Engineering.

## Pilot Salon Activation Checklist (Per Salon)

- Salon profile is complete.
- At least 1 active staff member exists.
- At least 3 active services exist.
- Opening hours or shifts are configured.
- Public booking slug is verified.
- Owner login works on mobile.
- Support contact has been shared with owner.
- Owner acknowledges known beta limitations.

## Data Quality Control (Mandatory)

- Duplicate customers.
- Orphan bookings.
- Inactive staff shown in booking selection.
- Slug collisions.
- Timezone/date-boundary errors.
- Cancellation reason/status consistency.
- One timezone source of truth per salon, rendered consistently in public and dashboard flows.

## Incident Severity Levels

- **Sev 1:** booking creation failure, tenant isolation risk, production outage.
- **Sev 2:** reschedule/cancel broken, owner blocked from daily core task.
- **Sev 3:** degraded UX, cosmetic, non-blocking defect.

Escalation:

- **Sev 1:** immediate Engineering + Ops escalation, 30-min first response (support hours).
- **Sev 2:** same-day owner assignment, 2-hour first response (support hours).
- **Sev 3:** triage within 1 business day.

## Broader Beta Go/No-Go

### Go Criteria

- All 3 pilots complete pilot window.
- No unresolved Sev 1 incidents.
- At least 80% of critical pilot tasks completed without support intervention.
- No verified tenant isolation defects.
- Owner satisfaction at least 7/10 average weekly rating.
- Release gate green for 2 consecutive release cycles.

### No-Go Triggers

- Any verified tenant isolation breach.
- Repeated booking integrity failures.
- Pilot salon churn due to trust/reliability issues.
- Support load exceeds threshold for 2 consecutive weeks (more than 5 support requests per salon/week, or mean Sev 2 resolution above 1 business day).

## Pilot Scorecard (Weekly)

| Salon | First booking <24h | 10+ bookings | 1+ reschedule/cancel | No critical failures | No tenant leak | Owner active daily | Recommendation |
|---|---|---|---|---|---|---|---|
| Pilot A |  |  |  |  |  |  | Continue / Pause / Expand |
| Pilot B |  |  |  |  |  |  | Continue / Pause / Expand |
| Pilot C |  |  |  |  |  |  | Continue / Pause / Expand |

## Support Load Tracking (Weekly)

- Requests per salon per week.
- Mean first response time.
- Mean resolution time.
- Incident category distribution.
- Top repeated issues.

## Known Pilot Limitations

- Limited locale coverage in beta.
- Non-core modules intentionally hidden/disabled.
- Support available only in defined support hours.
- Feature requests collected weekly and prioritized, not promised ad hoc.

## Out-of-Scope Enforcement

- New feature requests during pilot go to backlog by default.
- Exception only for Sev 1 or direct release-gate requirement.
- All exceptions require decision-log entry with owner and rollback note.

## Pilot Change Control

- No non-critical feature releases directly to pilot salons without review.
- Bug fixes allowed.
- Low-risk UX tweaks allowed if documented.
- Schema/data-impacting changes require rollback note.
- Every pilot-facing release includes short release notes.

## Manual Booking Data Recovery (Runbook Minimum)

- Inspect missing booking.
- Confirm whether create failed, succeeded, or partially persisted.
- Repair a booking record manually if needed.
- Communicate status to affected salon/customer.

## Top Pilot Risks (Light Register)

- Booking integrity defect - owner: Engineering.
- Tenant isolation defect - owner: Engineering + Ops.
- Weak onboarding activation - owner: Product.
- Mobile usability friction - owner: Frontend.
- Slow incident response - owner: Ops.
- Flaky E2E false confidence - owner: QA.

## Pilot Communication Templates

- Welcome message.
- Support instructions.
- Known limitations notice.
- Incident acknowledgment.
- Weekly feedback request.

## Onboarding Success Metrics

- Invite to completed onboarding.
- Onboarding completion to first bookable setup.
- Setup completion to first booking.

## Work Packages (WP1-WP8)

### WP1 - Beta Freeze and Feature Guards
- **Status:** Planned
- **Completion date:** TBD
- **Evidence links:** TBD
- **Owner:** Product + Engineering
- **Definition of done:** no non-P0 surface exposed to pilot users.

### WP2 - Fresh Setup and Seed Reliability
- **Status:** Planned
- **Completion date:** TBD
- **Evidence links:** TBD
- **Owner:** Platform/Backend
- **Definition of done:** clean setup and seeded salon publicly bookable.

### WP3 - Booking Integrity Hardening
- **Status:** Planned
- **Completion date:** TBD
- **Evidence links:** TBD
- **Owner:** Backend/Full-stack
- **Definition of done:** integrity rules enforced at DB boundary.

### WP4 - E2E and CI Gate Hardening
- **Status:** Planned
- **Completion date:** TBD
- **Evidence links:** TBD
- **Owner:** QA + Engineering
- **Definition of done:** failed critical test blocks release candidate.

### WP5 - Public Booking and Mobile UX Polish
- **Status:** Planned
- **Completion date:** TBD
- **Evidence links:** TBD
- **Owner:** Frontend + Product Design
- **Definition of done:** key owner tasks completed without guidance.

### WP6 - Pilot Ops, SLA, and Support Tooling
- **Status:** Planned
- **Completion date:** TBD
- **Evidence links:** TBD
- **Owner:** Ops + Engineering
- **Definition of done:** support operates within SLA with tested rollback.

### WP7 - Pilot Execution and Weekly Feedback Loop
- **Status:** Planned
- **Completion date:** TBD
- **Evidence links:** TBD
- **Owner:** Product + Customer Success
- **Definition of done:** complete pilot evidence package for go/no-go.

### WP8 - Documentation and Completion Tracking
- **Status:** Planned
- **Completion date:** TBD
- **Evidence links:** TBD
- **Owner:** Product/Program Owner
- **Definition of done:** every phase has status, completion date, and evidence links.

## Release Gate (Pre-Pilot)

- Clean install from zero works.
- Onboarding works without manual DB intervention.
- Demo salon is publicly bookable and appears in dashboard.
- Booking can be rescheduled and canceled.
- Overlap and invalid-time booking blocked.
- Tenant isolation verified.
- Mobile dashboard baseline passes checklist.
- Critical E2E set passes and blocks on failure.
- Error tracking/logging active.
- Support SLA channel active.
- Rollback playbook tested.
- Data quality checks pass.

## Sign-off

- Product: scope + UX acceptance.
- Engineering: integrity + release safety.
- Ops: monitoring + rollback readiness.
- QA/manual: critical path and device matrix validation.
- Customer Success: pilot salon communication ownership.

No pilot salon activation without all sign-offs.

## Stop-the-Line Rule

Pause pilot expansion immediately if:

- Tenant isolation issue is suspected.
- Booking integrity is uncertain.
- Rollback rehearsal fails in staging.
- Critical E2E gate is red on release candidate.

Resume only after containment, corrective fix, and explicit re-sign-off.

## Documentation Rule

- Document both planned work and completed work.
- Include owner, date, and evidence links.
- Update at end of each phase, after incidents/rollback drills, and weekly pilot review.

## Decision Log

| Date | Decision | Why | Approved By | Consequence | Reversal Plan |
|---|---|---|---|---|---|
| YYYY-MM-DD |  |  |  |  |  |

