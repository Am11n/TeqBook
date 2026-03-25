# TeqBook Pilot Share Readiness Checklist

Use this checklist before sharing TeqBook with pilot salons in `pilot-production`.

## How to Use

- Review every section in order.
- Mark each checkbox only when you have evidence.
- If any critical item fails, stop and fix before sharing with the next salon.

## 1) Environment and Access

- [x] `https://teqbook.com` is reachable from desktop and mobile.
- [x] Public app, dashboard, and admin point to `pilot-production` (not staging).
- [ ] No active Sev1 incident is open.
- [ ] Designated on-call owner is assigned for the current week.

## 2) Core Product Flows (Must Pass)

- [x] Signup, login, forgot password, and logout work.
- [ ] Onboarding can be completed without manual DB fixes.
- [ ] Salon has at least 1 active staff member.
- [ ] Salon has at least 3 active services.
- [ ] Opening hours or shifts are configured.
- [ ] Public booking slug resolves correctly.
- [ ] A real test booking can be created from the public flow.
- [ ] New booking appears in owner dashboard/calendar.
- [ ] Reschedule flow works end-to-end.
- [ ] Cancel flow works end-to-end.

## 3) Integrity and Safety Gates (Must Pass)

- [ ] Inactive services/employees are not bookable.
- [ ] Overlap and invalid-time bookings are blocked.
- [ ] No tenant isolation issue is observed (salon A cannot see salon B data).
- [ ] No critical release gate in CI is red for the release candidate.

## 4) Pilot Operations Readiness

- [ ] Support contact channel is shared with salon owner.
- [ ] SLA expectations are shared and acknowledged by salon owner.
- [ ] Known beta limitations are shared and acknowledged by salon owner.
- [ ] Rollback path is confirmed (disable booking, restore previous deploy).

## 5) Observability and Incident Readiness

- [ ] Booking failures are logged and traceable.
- [ ] Alert/monitoring path for booking failures is active.
- [ ] Incident severity model (Sev1/Sev2/Sev3) is known by responders.
- [ ] Escalation path is confirmed for support hours.

## 6) Evidence to Attach

- [ ] Screenshot: services/staff/opening hours configured in dashboard.
- [ ] URL proof: public booking page with correct slug.
- [ ] Proof: test booking created and visible in dashboard.
- [ ] Proof: reschedule and cancel actions completed.
- [ ] Mobile proof: owner login on iPhone Safari or Android Chrome.
- [ ] Link to latest `db:verify` evidence in `docs/ops/evidence/db-verify-logs/`.
- [ ] Link to latest critical E2E run or CI job evidence.

### Auth Email Setup Evidence (2026-03-25)

- [x] Password reset email branding proof captured.
  - Screenshot file: `/Users/aminismail/.cursor/projects/Users-aminismail-Documents-GitHub-TeqBook/assets/image-eb057d48-864d-4426-ad05-21989de0716e.png`
  - Verified: TeqBook logo/header, professional copy, support footer, Supabase reset URL present.
- [x] Supabase custom SMTP configuration proof captured.
  - Screenshot file: `/Users/aminismail/.cursor/projects/Users-aminismail-Documents-GitHub-TeqBook/assets/image-89b2c756-a515-43c5-804a-347ecf921cf7.png`
  - Verified: Custom SMTP enabled, sender `no-reply@teqbook.com`, sender name `TeqBook`, host `smtp.resend.com`, port `465`, username `resend`.

## 7) Go/No-Go Decision

Go only if all critical checks are complete and evidence is attached.

- [ ] GO: Ready to share with this pilot salon.
- [ ] NO-GO: Block sharing until failed items are fixed.

## Activation Decision Record

| Date | Salon | Reviewed By | Result | Evidence Link | Notes |
|---|---|---|---|---|---|
| YYYY-MM-DD |  |  | GO / NO-GO |  |  |
