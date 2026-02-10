## Sprint 2: Dashboard 2.0 + Support Inbox + Impersonation

### Sidebar

- [x] Restrukturering av sidebar -- `apps/admin/src/components/layout/admin-shell.tsx`
  - [x] Ny seksjonsinndeling (Overview, Operations, Tenants, Users & Access, Security, Analytics, Product)
  - [x] Oppdater desktop sidebar
  - [x] Oppdater mobil-sidebar
  - [x] Nye nav-items med riktige ikoner

### Dashboard

- [x] Dashboard-rewrite -- `apps/admin/src/app/(admin)/page.tsx`
  - [x] Seksjon 1: KPI-rad (6 kort)
    - [x] Active Salons (7d/30d)
    - [x] New Salons (7d)
    - [x] Activated Salons
    - [x] Bookings (today / 7d)
    - [x] Total Users
    - [x] Open Support Cases
  - [x] Seksjon 2: "Needs Attention" feed
    - [x] Henter fra `get_needs_attention_items()` + open cases
    - [x] Handlingsknapper per item (View, Resolve)
  - [x] Seksjon 3: Quick Actions grid
    - [x] Create Salon, Invite User, Change Plan, Suspend, Export, Audit Search
  - [x] Seksjon 4: Recent Activity
    - [x] Siste 20 events fra security_audit_log
    - [x] Klikk åpner DetailDrawer

### Support Inbox

- [x] Support Inbox page -- `apps/admin/src/app/(admin)/support/page.tsx`
  - [x] DataTable med cases (Title, Type, Salon, Status, Priority, Assignee, Created, Updated)
  - [x] Row actions: Mark In Progress, Resolve, Close
  - [x] Klikk rad -> DetailDrawer
    - [x] Full case-detalj
    - [x] Notater-historikk (NotesPanel)
  - [x] Endre status, legg til notat
  - [x] "Create Case" knapp
- [x] Support case service -- `apps/admin/src/lib/services/support-service.ts`
  - [x] CRUD for support cases (getSupportCases, createSupportCase, updateCaseStatus, assignCase)

### Impersonation

- [x] Impersonation drawer -- `apps/admin/src/components/shared/impersonation-drawer.tsx`
  - [x] Gul "IMPERSONATION MODE" banner
  - [x] Read-only visning av salongdata (employees, bookings, services, customers)
  - [x] Lukk-knapp avslutter session
- [x] Impersonation API -- `apps/admin/src/app/api/impersonate/route.ts`
  - [x] Verifiser super admin
  - [x] Hent salongdata
  - [x] Logg i security_audit_log
- [x] Impersonation logging
  - [x] `impersonation_start` event
  - [x] `impersonation_end` event
  - [x] `impersonation_api_access` event
