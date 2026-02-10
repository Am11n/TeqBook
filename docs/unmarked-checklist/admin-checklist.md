# TeqBook Admin Panel Overhaul -- Master Checklist

> Merk av `[x]` etter hvert som oppgaver fullføres.
> Sist oppdatert: 2026-02-10

---

## Sprint 1: Foundation (Components + DB Schema)

### Components

- [ ] **KpiCard** -- `apps/admin/src/components/shared/kpi-card.tsx`
  - [ ] Tall (value) med stor font
  - [ ] Endring vs forrige periode (% badge, grønn/rød)
  - [ ] Periodevalg (7d / 30d)
  - [ ] Inline SVG sparkline
  - [ ] Klikkbar drill-down (onClick)
  - [ ] Ikon-prop
- [ ] **Sparkline** -- `apps/admin/src/components/shared/sparkline.tsx`
  - [ ] Inline SVG path fra number[]
  - [ ] Responsiv bredde
  - [ ] Fargekoding (grønn opp, rød ned)
- [ ] **DataTable** -- `apps/admin/src/components/shared/data-table.tsx`
  - [ ] Kolonnedefinisjon med typesikkerhet
  - [ ] Kolonnesynlighet (vis/skjul toggle)
  - [ ] Server-side sortering
  - [ ] Server-side paginering
  - [ ] Bulk-seleksjon (checkbox-kolonne)
  - [ ] Radhandlinger (dropdown per rad)
  - [ ] Sticky header
  - [ ] Lagrede views (localStorage)
  - [ ] Søk/filter-bar
- [ ] **DetailDrawer** -- `apps/admin/src/components/shared/detail-drawer.tsx`
  - [ ] Slide-over panel (høyre, 480px)
  - [ ] Basert på Radix Dialog
  - [ ] Content-slots for ulike entiteter
  - [ ] Lukk med Escape / klikk utenfor
- [ ] **NotesPanel** -- `apps/admin/src/components/shared/notes-panel.tsx`
  - [ ] Legg til notat (textarea + submit)
  - [ ] Liste notater (nyeste først)
  - [ ] Tags: vip, high-risk, needs-follow-up
  - [ ] Knyttet til entity_type + entity_id
- [ ] **PageHeader** forbedring -- `apps/admin/src/components/layout/page-header.tsx`
  - [ ] Primærhandling-knapp til høyre
  - [ ] Periodevalg (7d / 30d / 90d)
  - [ ] Breadcrumbs-slot
- [ ] **QuickActions** -- `apps/admin/src/components/shared/quick-actions.tsx`
  - [ ] Kompakt knappegrid
  - [ ] Ikoner + labels
- [ ] **NeedsAttentionFeed** -- `apps/admin/src/components/shared/needs-attention-feed.tsx`
  - [ ] Kortliste med handlingsknapper
  - [ ] Ikon per type (onboarding, cancellation, login, audit)
- [ ] **RecentActivity** -- `apps/admin/src/components/shared/recent-activity.tsx`
  - [ ] Siste 20 viktige events
  - [ ] Klikk for å åpne DetailDrawer

### Database Migrasjoner

- [ ] **support_cases tabell** -- `supabase/supabase/migrations/YYYYMMDD_admin_support_cases.sql`
  - [ ] Tabell med id, salon_id, user_id, type, status, priority, title, description, assignee_id, metadata, resolved_at, created_at, updated_at
  - [ ] RLS: kun super admins
  - [ ] Indekser på status, type, salon_id, assignee_id
  - [ ] Auto-generering trigger: onboarding_stuck (>48t)
  - [ ] Auto-generering trigger: login_problems (>5 failures/1t)
  - [ ] Auto-generering trigger: høy avbestillingsrate
- [ ] **admin_notes tabell** -- `supabase/supabase/migrations/YYYYMMDD_admin_notes.sql`
  - [ ] Tabell med id, entity_type, entity_id, author_id, content, tags, created_at
  - [ ] RLS: kun super admins
  - [ ] Indeks på entity_type + entity_id
- [ ] **Admin Dashboard RPCs** -- `supabase/supabase/migrations/YYYYMMDD_admin_dashboard_rpcs.sql`
  - [ ] `get_admin_dashboard_kpis(period_days)` -- alle KPI-verdier + delta
  - [ ] `get_admin_kpi_trend(metric, period_days)` -- daglige verdier for sparkline
  - [ ] `get_salons_paginated(filters, sort, limit, offset)` -- server-side paginert salongliste
  - [ ] `get_users_paginated(filters, sort, limit, offset)` -- server-side paginert brukerliste
  - [ ] `get_needs_attention_items()` -- salonger/brukere som trenger handling
  - [ ] `get_support_cases_list(filters, limit, offset)` -- paginerte support-saker

---

## Sprint 2: Dashboard 2.0 + Support Inbox + Impersonation

### Sidebar

- [ ] Restrukturering av sidebar -- `apps/admin/src/components/layout/admin-shell.tsx`
  - [ ] Ny seksjonsinndeling (Overview, Operations, Tenants, Users & Access, Security, Analytics)
  - [ ] Oppdater desktop sidebar
  - [ ] Oppdater mobil-sidebar
  - [ ] Nye nav-items med riktige ikoner

### Dashboard

- [ ] Dashboard-rewrite -- `apps/admin/src/app/(admin)/page.tsx`
  - [ ] Seksjon 1: KPI-rad (6 kort)
    - [ ] Active Salons (7d/30d)
    - [ ] New Salons (7d)
    - [ ] Activated Salons
    - [ ] Bookings (today / 7d)
    - [ ] Billing Issues
    - [ ] Open Support Cases
  - [ ] Seksjon 2: "Needs Attention" feed
    - [ ] Henter fra `get_needs_attention_items()` + open cases
    - [ ] Handlingsknapper per item (View, Impersonate, Flag/Resolve)
  - [ ] Seksjon 3: Quick Actions grid
    - [ ] Create Salon, Invite User, Change Plan, Suspend, Export, Audit Search
  - [ ] Seksjon 4: Recent Activity
    - [ ] Siste 20 events fra security_audit_log
    - [ ] Klikk åpner DetailDrawer

### Support Inbox

- [ ] Support Inbox page -- `apps/admin/src/app/(admin)/support/page.tsx`
  - [ ] DataTable med cases (ID, Type, Salon, Status, Priority, Assignee, Created, Updated)
  - [ ] Filtre: type, status, priority, assignee, dato
  - [ ] Klikk rad -> DetailDrawer
    - [ ] Full case-detalj
    - [ ] Notater-historikk (NotesPanel)
    - [ ] Relaterte audit events
  - [ ] Endre status, assign, legg til notat
  - [ ] "Create Case" knapp (manuell opprettelse)
- [ ] Support case service -- `apps/admin/src/lib/services/support-service.ts`
  - [ ] CRUD for support cases
  - [ ] Kobling til audit log

### Impersonation

- [ ] Impersonation drawer -- `apps/admin/src/components/shared/impersonation-drawer.tsx`
  - [ ] Gul "IMPERSONATION MODE" banner
  - [ ] Read-only visning av salongdata
  - [ ] Separat Supabase-klient med service_role
  - [ ] Viser: bookings, ansatte, tjenester, innstillinger
  - [ ] Lukk-knapp avslutter session
- [ ] Impersonation API -- `apps/admin/src/app/api/impersonate/route.ts`
  - [ ] Verifiser super admin
  - [ ] Hent salongdata via service_role
  - [ ] Logg start/slutt i security_audit_log
- [ ] Impersonation logging
  - [ ] `impersonation_start` event med admin_id, target_salon_id
  - [ ] `impersonation_end` event med varighet
  - [ ] Synlig i audit logs

---

## Sprint 3: System Health + Pro Lister

### System Health

- [ ] Health endpoints
  - [ ] `apps/admin/src/app/api/health/route.ts` -- admin app health
  - [ ] Health-sjekk mot Supabase DB (ping)
  - [ ] Health-sjekk mot Stripe API
  - [ ] Health-sjekk mot Resend (email)
- [ ] System Health page -- `apps/admin/src/app/(admin)/system-health/page.tsx`
  - [ ] Statuskort per tjeneste (opp/degradert/nede + responstid)
  - [ ] Error rate fra Sentry API (siste 24t)
  - [ ] P95 latency (fra egne health checks)
  - [ ] Auto-refresh (30s intervall)
- [ ] Incidents
  - [ ] DB-migrasjon: `incidents` tabell
  - [ ] Incidents-side -- `apps/admin/src/app/(admin)/incidents/page.tsx`
  - [ ] Opprett/oppdater hendelse
  - [ ] Tidslinje-visning
  - [ ] Post-mortem notater
  - [ ] Status: investigating, identified, monitoring, resolved

### Salons Pro

- [ ] Salons-rewrite -- `apps/admin/src/app/(admin)/salons/page.tsx`
  - [ ] DataTable med alle kolonner
    - [ ] Name + slug
    - [ ] Plan
    - [ ] Status (Active / Suspended / Trial / Past Due)
    - [ ] Created date
    - [ ] Last active
    - [ ] Bookings 7d
    - [ ] Owner email
    - [ ] Locale
    - [ ] Risk flag
  - [ ] Filtre: plan, status, created range, last active, bookings volum, locale
  - [ ] Lagrede views: "Trial Ending", "New Last 7d", "Inactive 30d", "High Volume"
  - [ ] Bulk actions: change plan, suspend, tag, export
  - [ ] Rad-klikk -> DetailDrawer
    - [ ] Statistikk-oversikt
    - [ ] Ansatt-telling
    - [ ] Booking-volum
    - [ ] Billing-status
    - [ ] Admin notater (NotesPanel)
    - [ ] Impersonate-knapp

### Users Pro

- [ ] Users-rewrite -- `apps/admin/src/app/(admin)/users/page.tsx`
  - [ ] DataTable med alle kolonner
    - [ ] Name / email
    - [ ] Role (super admin / owner / staff)
    - [ ] Salon
    - [ ] Last login
    - [ ] Login provider
    - [ ] Status (active / locked)
    - [ ] MFA (on/off)
    - [ ] Created
  - [ ] Rad-handlinger: Reset access, Force logout, Move user
  - [ ] Filtre: role, status, salon, last login range
  - [ ] Session-management
    - [ ] List aktive sesjoner
    - [ ] Force terminate
  - [ ] DetailDrawer med NotesPanel

---

## Sprint 4: Audit Logs Pro + Security Events

### Audit Logs

- [ ] DB-migrasjon: `correlation_id` -- `supabase/supabase/migrations/YYYYMMDD_add_correlation_id_audit_log.sql`
  - [ ] `ALTER TABLE security_audit_log ADD COLUMN correlation_id TEXT`
  - [ ] Indeks på correlation_id
- [ ] Audit logs forbedring -- `apps/admin/src/app/(admin)/audit-logs/page.tsx`
  - [ ] Event Detail Drawer
    - [ ] Full metadata-visning
    - [ ] Before/after diff (old/new i metadata)
    - [ ] Correlation ID-gruppering
    - [ ] Actor context (IP, user agent, session)
    - [ ] Link til relatert support case
  - [ ] Eksport-forbedring
    - [ ] JSON-eksport (i tillegg til CSV)
    - [ ] Signert eksport (SHA-256 hash)
  - [ ] Presets
    - [ ] "Last 24h security events"
    - [ ] "All booking changes"
    - [ ] "All admin actions"
    - [ ] "All impersonation events"
  - [ ] Dato hurtigvalg: Today, 7d, 30d

### Security Events

- [ ] Security Events page -- `apps/admin/src/app/(admin)/security-events/page.tsx`
  - [ ] Suspicious logins (nytt land/enhet, mange failures)
  - [ ] Brute force-mønstre
  - [ ] Password reset storms
  - [ ] Rolleendringer
  - [ ] Tellebadge per seksjon
  - [ ] Utvidbar detaljliste
  - [ ] Auto-opprett support case for kritiske mønstre
  - [ ] "Force logout all sessions" handling per bruker

---

## Sprint 5: Analytics + Onboarding Funnel

### Analytics

- [ ] Legg til `recharts` i `apps/admin/package.json`
- [ ] Analytics-rewrite -- `apps/admin/src/app/(admin)/analytics/page.tsx`
  - [ ] Tidsvelger: 7d, 30d, 90d
  - [ ] Aktivitet over tid (line chart)
    - [ ] Active salons/dag
    - [ ] Bookings/dag
    - [ ] New salons/dag
  - [ ] Aktiveringstrakt (funnel chart)
    - [ ] Create salon -> Add employee -> Add service -> First booking
  - [ ] Plan-distribusjon (beholde eksisterende + upgrade/downgrade/churn)
  - [ ] Top salons tabell (by bookings, growth)
  - [ ] Cohort retention (7d/30d grid)
- [ ] Backend RPCs
  - [ ] `get_analytics_time_series(metric, period_days)`
  - [ ] `get_activation_funnel(period_days)`
  - [ ] `get_top_salons(sort_by, limit)`
  - [ ] `get_salon_cohort_retention(cohort_period, retention_periods[])`

### Onboarding Funnel

- [ ] Onboarding page -- `apps/admin/src/app/(admin)/onboarding/page.tsx`
  - [ ] Aggregert trakt (konverteringsrater per steg)
  - [ ] Per-salong onboarding-status
    - [ ] Stegvis: salon opprettet, ansatt lagt til, tjeneste lagt til, første booking, billing
    - [ ] Blockers markert
  - [ ] Handlinger: "Send nudge" (email), "Create support case", "View salon"
  - [ ] Filtre: stuck > 24t, > 48t, > 7d

---

## Sprint 6: Plans & Billing + Feature Flags

### Plans & Billing

- [ ] Plans & Billing page -- `apps/admin/src/app/(admin)/plans/page.tsx`
  - [ ] Oversikt: plan-distribusjon, MRR, churn rate
  - [ ] Planendringer-tabell (upgrades/downgrades med datoer og audit trail)
  - [ ] Per-salong billing-handlinger
    - [ ] Change plan (med audit)
    - [ ] Grace period
    - [ ] Comp months
    - [ ] Manuell justering
  - [ ] Past due workflow
    - [ ] Liste salonger med past_due billing
    - [ ] Handlinger: remind, suspend, close

### Feature Flags

- [ ] DB-migrasjon: `salon_feature_overrides` tabell
- [ ] Feature Flags page -- `apps/admin/src/app/(admin)/feature-flags/page.tsx`
  - [ ] Grid: features x plans (on/off + limits)
  - [ ] Per-tenant override (toggle on/off per salong)
  - [ ] Bruksområde: ringfence buggy feature, pilot til utvalgte

---

## Sprint 7: Data Governance + Admin RBAC

### Data Tools

- [ ] Data Tools page -- `apps/admin/src/app/(admin)/data-tools/page.tsx`
  - [ ] Export tenant data (velg salong -> full JSON-eksport for GDPR)
  - [ ] Anonymiser/slett bruker (workflow med godkjenningssteg)
  - [ ] Retention policies (konfig-UI for hva som slettes når)
  - [ ] DLP-varsler (logg ved store eksporter / mange brukersøk)

### Admin RBAC

- [ ] DB-migrasjon: `admin_role` kolonne + enum
- [ ] Oppdater admin-shell.tsx for rollebasert synlighet
  - [ ] `support_admin`: Dashboard, Support, Salons (read+notes), Users (read+notes)
  - [ ] `billing_admin`: Dashboard, Plans & Billing, Salons
  - [ ] `security_admin`: Dashboard, Audit Logs, Security Events, Data Tools
  - [ ] `auditor`: Alle sider read-only
  - [ ] `super_admin`: alt
- [ ] Admins page -- `apps/admin/src/app/(admin)/admins/page.tsx`
  - [ ] Liste alle admin-brukere med rolle
  - [ ] Endre rolle
  - [ ] Invite ny admin

---

## Sprint 8: Polish -- Global Search, Changelog, Feedback

### Global Search

- [ ] Oppgradere command palette -- `apps/admin/src/components/admin-command-palette.tsx`
  - [ ] Søk salonger (navn, slug, owner)
  - [ ] Søk brukere (email, navn)
  - [ ] Søk bookinger (ID)
  - [ ] Søk audit events (action, resource)
  - [ ] Resultater gruppert med quick actions
  - [ ] Backend: `admin_global_search(query, limit)` RPC

### Changelog

- [ ] Changelog page -- `apps/admin/src/app/(admin)/changelog/page.tsx`
  - [ ] Markdown-rendret liste over releaser
  - [ ] Dato, versjon, endringer
  - [ ] "Hvilke tenants fikk det" (feature-flagget)

### Feedback

- [ ] Feedback page -- `apps/admin/src/app/(admin)/feedback/page.tsx`
  - [ ] Aggreger "top issues" fra support cases
  - [ ] Feature requests per tenant
  - [ ] Prioriteringsvisning: issue x frekvens x tenant-verdi

---

## Ferdigstilling

- [ ] Alle sider responsiv (mobil + desktop)
- [ ] Alle handlinger logget i audit log
- [ ] Type-check passerer (`pnpm run type-check`)
- [ ] Lint passerer (`pnpm run lint`)
- [ ] Manuell test av alle sider
- [ ] Oppdater README med nye admin-features