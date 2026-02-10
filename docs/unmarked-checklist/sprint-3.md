## Sprint 3: System Health + Pro Lister

### System Health

- [x] Health endpoints
  - [x] `apps/admin/src/app/api/health/route.ts` -- admin app health
  - [x] Health-sjekk mot Supabase DB (ping)
  - [x] Health-sjekk mot Stripe API
- [x] System Health page -- `apps/admin/src/app/(admin)/system-health/page.tsx`
  - [x] Statuskort per tjeneste (opp/degradert/nede + responstid)
  - [x] Overall status banner
  - [x] Auto-refresh (30s intervall)
  - [x] Uptime history visualization
- [x] Incidents
  - [x] DB-migrasjon: `incidents` tabell -- `20260210000004_incidents.sql`
  - [x] Incidents-side -- `apps/admin/src/app/(admin)/incidents/page.tsx`
  - [x] DataTable med severity, status, affected services
  - [x] Row actions: investigating, identified, monitoring, resolved
  - [x] DetailDrawer med post-mortem notater

### Salons Pro

- [x] Salons-rewrite -- `apps/admin/src/app/(admin)/salons/page.tsx`
  - [x] DataTable med kolonner: Name+slug, Plan, Status, Type, Created, Last active, Employees, Bookings 7d, Owner
  - [x] Server-side pagination via `get_salons_paginated()`
  - [x] Lagrede views: "New last 7d", "Inactive 30d", "Trial ending"
  - [x] Bulk actions: Export, Suspend
  - [x] Row actions: Impersonate, Change Plan, Toggle Status
  - [x] Rad-klikk -> DetailDrawer med statistikk, NotesPanel, Impersonate-knapp

### Users Pro

- [x] Users-rewrite -- `apps/admin/src/app/(admin)/users/page.tsx`
  - [x] DataTable med kolonner: Email+name, Role, Salon, Last login, Created
  - [x] Server-side pagination via `get_users_paginated()`
  - [x] Row actions: View Audit Trail, Force Logout
  - [x] Bulk actions: Export
  - [x] DetailDrawer med NotesPanel
