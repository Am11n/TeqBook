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

## In Scope (P0b)

- Booking operations: reschedule and cancel.
- Customers: basic create/search/view.
- Calendar: day/week baseline usability.
- Mobile baseline: owner can complete core daily tasks without guidance.
- Minimum observability: booking errors logged and traceable.

## Out of Scope for Beta 1 (Hidden/Disabled/Post-Beta)

- Billing/Stripe monetization hardening.
- Gift cards, packages, loyalty, waitlist growth features.
- Advanced analytics/reporting beyond pilot needs.
- Advanced commission logic.
- Multi-salon capabilities.
- Non-critical admin/premium growth modules.

## Language Scope

- Only 2-3 approved pilot locales are fully supported.
- Incomplete locale surfaces are hidden or deferred.

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

