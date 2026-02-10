# Sprint 1: Foundation (Components + DB Schema) -- DONE

## Components

- [x] **KpiCard** -- `apps/admin/src/components/shared/kpi-card.tsx`
  - [x] Tall (value) med stor font
  - [x] Endring vs forrige periode (% badge, grønn/rød)
  - [x] Periodevalg (7d / 30d)
  - [x] Inline SVG sparkline
  - [x] Klikkbar drill-down (onClick)
  - [x] Ikon-prop
- [x] **Sparkline** -- `apps/admin/src/components/shared/sparkline.tsx`
  - [x] Inline SVG path fra number[]
  - [x] Responsiv bredde
  - [x] Fargekoding (grønn opp, rød ned)
- [x] **DataTable** -- `apps/admin/src/components/shared/data-table.tsx`
  - [x] Kolonnedefinisjon med typesikkerhet
  - [x] Kolonnesynlighet (vis/skjul toggle)
  - [x] Server-side sortering
  - [x] Server-side paginering
  - [x] Bulk-seleksjon (checkbox-kolonne)
  - [x] Radhandlinger (dropdown per rad)
  - [x] Sticky header
  - [x] Lagrede views (localStorage)
  - [x] Søk/filter-bar
- [x] **DetailDrawer** -- `apps/admin/src/components/shared/detail-drawer.tsx`
  - [x] Slide-over panel (høyre, 480px)
  - [x] Basert på Radix Dialog
  - [x] Content-slots for ulike entiteter
  - [x] Lukk med Escape / klikk utenfor
- [x] **NotesPanel** -- `apps/admin/src/components/shared/notes-panel.tsx`
  - [x] Legg til notat (textarea + submit)
  - [x] Liste notater (nyeste først)
  - [x] Tags: vip, high-risk, needs-follow-up
  - [x] Knyttet til entity_type + entity_id
- [x] **PageHeader** forbedring -- `apps/admin/src/components/layout/page-header.tsx`
  - [x] Primærhandling-knapp til høyre
  - [x] Periodevalg (7d / 30d / 90d)
  - [x] Breadcrumbs-slot
- [x] **QuickActions** -- `apps/admin/src/components/shared/quick-actions.tsx`
  - [x] Kompakt knappegrid
  - [x] Ikoner + labels
- [x] **NeedsAttentionFeed** -- `apps/admin/src/components/shared/needs-attention-feed.tsx`
  - [x] Kortliste med handlingsknapper
  - [x] Ikon per type (onboarding, cancellation, login, audit)
- [x] **RecentActivity** -- `apps/admin/src/components/shared/recent-activity.tsx`
  - [x] Siste 20 viktige events
  - [x] Klikk for å åpne DetailDrawer

## Database Migrasjoner

- [x] **support_cases tabell** -- `supabase/supabase/migrations/20260210000001_admin_support_cases.sql`
  - [x] Tabell med id, salon_id, user_id, type, status, priority, title, description, assignee_id, metadata, resolved_at, created_at, updated_at
  - [x] RLS: kun super admins
  - [x] Indekser på status, type, salon_id, assignee_id
  - [x] Auto-generering funksjon: onboarding_stuck (>48t)
  - [x] Auto-generering funksjon: login_problems (>5 failures/1t)
  - [x] Auto-generering funksjon: høy avbestillingsrate
- [x] **admin_notes tabell** -- `supabase/supabase/migrations/20260210000002_admin_notes.sql`
  - [x] Tabell med id, entity_type, entity_id, author_id, content, tags, created_at
  - [x] RLS: kun super admins
  - [x] Indeks på entity_type + entity_id
- [x] **Admin Dashboard RPCs** -- `supabase/supabase/migrations/20260210000003_admin_dashboard_rpcs.sql`
  - [x] `get_admin_dashboard_kpis(period_days)` -- alle KPI-verdier + delta
  - [x] `get_admin_kpi_trend(metric, period_days)` -- daglige verdier for sparkline
  - [x] `get_salons_paginated(filters, sort, limit, offset)` -- server-side paginert salongliste
  - [x] `get_users_paginated(filters, sort, limit, offset)` -- server-side paginert brukerliste
  - [x] `get_needs_attention_items()` -- salonger/brukere som trenger handling
  - [x] `get_support_cases_list(filters, limit, offset)` -- paginerte support-saker
