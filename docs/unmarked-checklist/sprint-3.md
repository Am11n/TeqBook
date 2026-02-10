# Sprint 3: System Health + Pro Lists

## System Health

- [ ] Health endpoint (`apps/admin/src/app/api/health/route.ts`)
- [ ] Supabase DB ping check
- [ ] Stripe API check
- [ ] Resend (email) check
- [ ] System Health page (`apps/admin/src/app/(admin)/system-health/page.tsx`)
- [ ] Status cards per service (up/degraded/down + response time)
- [ ] Error rate from Sentry API
- [ ] Auto-refresh (30s)

## Incidents

- [ ] DB migration: incidents table
- [ ] Incidents page (`apps/admin/src/app/(admin)/incidents/page.tsx`)
- [ ] Create/update incident
- [ ] Timeline view
- [ ] Post-mortem notes
- [ ] Status: investigating, identified, monitoring, resolved

## Salons Pro

- [ ] Salons page rewrite with DataTable
- [ ] Columns: Name+slug, Plan, Status, Created, Last active, Bookings 7d, Owner, Locale, Risk flag
- [ ] Filters: plan, status, created range, last active, bookings volume, locale
- [ ] Saved views: Trial Ending, New Last 7d, Inactive 30d, High Volume
- [ ] Bulk actions: change plan, suspend, tag, export
- [ ] Row click opens DetailDrawer with stats + notes + impersonate button

## Users Pro

- [ ] Users page rewrite with DataTable
- [ ] Columns: Name/email, Role, Salon, Last Login, Provider, Status, MFA, Created
- [ ] Row actions: Reset access, Force logout, Move user
- [ ] Filters: role, status, salon, last login range
- [ ] Session management (list sessions, force terminate)
- [ ] DetailDrawer with NotesPanel
