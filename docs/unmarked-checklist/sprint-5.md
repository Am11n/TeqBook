## Sprint 5: Analytics + Onboarding Funnel

### Analytics RPCs

- [x] DB-migrasjon: Analytics RPCs -- `20260210000006_analytics_rpcs.sql`
  - [x] `get_admin_activity_timeseries()` -- daglig bookings, new salons, active salons
  - [x] `get_admin_activation_funnel()` -- stegvis funnel
  - [x] `get_admin_top_salons()` -- topp salonger med vekst-%
  - [x] `get_admin_plan_distribution()` -- plan fordeling
  - [x] `get_admin_cohort_retention()` -- uke-over-uke retention

### Analytics Page

- [x] Analytics rewrite -- `apps/admin/src/app/(admin)/analytics/page.tsx`
  - [x] Period selector (7d/30d/90d)
  - [x] KPI-rad: Bookings, New Salons, Avg Active/day, Total Salons
  - [x] SVG bar charts: Bookings/day, New Salons/day, Active Salons/day
  - [x] Activation funnel visualization
  - [x] Top salons table (by bookings, med growth %)
  - [x] Plan distribution bars

### Cohorts

- [x] Cohorts page -- `apps/admin/src/app/(admin)/analytics/cohorts/page.tsx`
  - [x] Heatmap-tabell med cohort retention week-over-week
  - [x] Fargekoding basert på retention %
  - [x] Breadcrumbs: Analytics / Cohorts

### Onboarding Funnel

- [x] Onboarding page -- `apps/admin/src/app/(admin)/onboarding/page.tsx`
  - [x] Funnel-sammendrag (4-stegs bar)
  - [x] DataTable med salonger som ikke har fullført onboarding
  - [x] Onboarding step + progress bar per salon
  - [x] Hours since creation
  - [x] Row actions: View Salon, Send Nudge
