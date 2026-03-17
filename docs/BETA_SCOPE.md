# TeqBook Beta 1 Scope

## Outcome

Enable 3-5 pilot salons to run core daily booking operations reliably, with controlled risk and clear support boundaries.

## In Scope (P0a)

- Auth: signup, login, forgot password, logout.
- Onboarding: language selection, create salon, basic info, opening hours.
- Services: create, edit, deactivate, price, duration.
- Employees: create, edit, active/inactive, simple role.
- Availability setup: opening hours/shifts.
- Public booking: salon page, service/staff selection, valid time selection, customer info, confirmation.
- Booking visibility: newly created booking appears in owner dashboard.

Owner: Product + Engineering
Evidence: critical E2E results, staging verification log, manual replay notes

## In Scope (P0b)

- Booking operations: reschedule and cancel.
- Customers: basic create/search/view.
- Calendar: day/week baseline usability.
- Mobile baseline: owner can complete core daily tasks without guidance.
- Minimum observability: booking errors logged and traceable.

Owner: Product Design + Frontend + Engineering + Ops
Evidence: mobile checklist, alert/log screenshots, reschedule/cancel replay notes

## Out of Scope for Beta 1 (Hidden/Disabled/Post-Beta)

- Billing/Stripe monetization hardening.
- Gift cards, packages, loyalty, waitlist growth features.
- Advanced analytics/reporting beyond pilot needs.
- Advanced commission logic.
- Multi-salon capabilities.
- Non-critical admin/premium growth modules.

Guard strategy:
- Hidden: route/menu entries removed from pilot UI.
- Disabled: visible but non-interactive with explicit "Post-beta" messaging.
- Post-beta: backlog only, no pilot commitment.

## Feature Inventory and Classification

| Feature Surface | Class | Pilot Visibility | Owner | Evidence |
|---|---|---|---|---|
| Authentication (signup/login/logout/forgot) | P0a | Enabled | Engineering | E2E auth setup results |
| Onboarding (salon basics + opening hours) | P0a | Enabled | Product + Engineering | Onboarding replay notes |
| Services CRUD (incl. deactivate) | P0a | Enabled | Engineering | Dashboard functional check |
| Employees CRUD (incl. active/inactive) | P0a | Enabled | Engineering | Booking eligibility validation |
| Public booking (bookable salon only) | P0a | Enabled | Engineering | Public booking E2E + DB verification |
| Booking visibility in dashboard | P0a | Enabled | Engineering | Created booking appears in dashboard |
| Reschedule/cancel booking | P0b | Enabled | Engineering | Calendar state update replay |
| Customer basics (create/search/view) | P0b | Enabled | Product + Engineering | Manual acceptance checklist |
| Day/week calendar baseline | P0b | Enabled | Frontend | UX checklist + screenshots |
| Mobile owner baseline | P0b | Enabled | Frontend + Product Design | iPhone Safari / Android Chrome checklist |
| Minimum observability (booking failure logs) | P0b | Enabled | Ops + Engineering | Error tracking evidence |
| Billing/monetization hardening | Post-beta | Hidden | Product | Backlog entry only |
| Gift cards/packages/loyalty/waitlist growth | Post-beta | Hidden | Product | Backlog entry only |
| Advanced analytics/commissions | Post-beta | Hidden | Product | Backlog entry only |
| Multi-salon management | Post-beta | Hidden | Product + Engineering | Backlog entry only |
| Non-critical admin growth modules | Disabled | Disabled | Product + Engineering | Route guard screenshots |

## Language Scope

- Only 2-3 approved pilot locales are fully supported.
- Incomplete locale surfaces are hidden or deferred.

Pilot locales (approved): `en`, `nb`, `pl`

## Out-of-Scope Enforcement

- New feature requests during pilot go to backlog by default.
- Exception only if request is Sev 1 related or directly required for release gate.
- Any exception must include owner, reason, and rollback note in the decision log.

## Pilot Salon Activation Checklist (Per Salon)

- Salon profile complete.
- At least 1 active staff member.
- At least 3 active services.
- Opening hours or shifts configured.
- Public booking slug verified.
- Owner login verified on mobile.
- Support contact shared with owner.
- Known beta limitations acknowledged by owner.

## Stop-the-Line Conditions

Pilot expansion pauses immediately if:

- Tenant isolation issue is suspected.
- Booking creation integrity is uncertain.
- Staging rollback rehearsal fails.
- Critical E2E gate is red on release candidate.

Expansion resumes only after containment, fix, and re-sign-off.

## Scope Sign-off

- Product sign-off: Completed
- Engineering sign-off: Completed
- Date: 2026-03-17

