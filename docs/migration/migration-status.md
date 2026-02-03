# Migration Status

## Fase A: Produksjonsstabilitet ✅

- ✅ Secure send-notifications endpoint (kun bookingId, med idempotency)
- ✅ Reminders pipeline (send direkte via Resend med locking)
- ✅ Public booking edge function (kontraktsbasert med rate limiting og caching)
- ✅ Reminders cron job verifisert

## Fase B: Monorepo-struktur ✅ (delvis)

- ✅ Root package.json med workspace config
- ✅ Supabase flyttet til root
- ✅ Packages struktur opprettet (shared, ui)
- ✅ Apps struktur opprettet (public, dashboard, admin)
- ✅ Standardiserte Supabase clients
- ✅ Import boundaries (ESLint rules)
- ✅ i18n strategi dokumentert
- ✅ Route-flytting for public app (fullført)
  - ✅ Landing page flyttet til `apps/public/src/app/landing/`
  - ✅ Landing components kopiert til `apps/public/src/components/landing/`
  - ✅ UI components kopiert til `apps/public/src/components/ui/`
  - ✅ Layout og error boundary opprettet
  - ✅ Auth routes (login, signup, login-2fa) flyttet
  - ✅ Public booking routes (`/book/[salon_slug]`) flyttet
  - ✅ Alle nødvendige services, types, repositories kopiert
  - ✅ Build og type-check verifisert (3. feb 2025)

- ✅ Route-flytting for dashboard app (fullført)
  - ✅ Alle dashboard routes flyttet (dashboard, calendar, bookings, customers, employees, services, settings, shifts, reports, products, profile, onboarding)
  - ✅ Alle dashboard komponenter kopiert
  - ✅ Alle services, types, repositories kopiert
  - ✅ Layout med DashboardShell opprettet
  - ✅ Build og type-check verifisert (3. feb 2025)

- ✅ Route-flytting for admin app (fullført)
  - ✅ Alle admin routes flyttet (admin, analytics, audit-logs, salons, users)
  - ✅ Admin layout og komponenter kopiert
  - ✅ Alle services, types, repositories kopiert
  - ✅ Layout med AdminShell opprettet
  - ✅ Build og type-check verifisert (3. feb 2025)

## Fullført 3. feb 2025

- ✅ Build og type-check for alle apper
- ✅ Supabase brukes via `@teqbook/shared` (lib/supabase i hver app)
- ✅ MVVM/lag dokumentert: `docs/frontend/mvvm-and-import-boundaries.md`
- ✅ CI bygger alle workspace-apper
- ✅ pnpm som package manager

## Gjenstående (valgfritt)

1. **Manuell testing** – Kjør dev for hver app og sjekk routes (se `docs/ops/testing-plan.md`)
2. **Refaktorering** – Flytt delte komponenter til `packages/ui` (se `docs/migration/import-migration-guide.md`)

## Fase C: Kvalitet

- ✅ MVVM/import boundaries dokumentert
- ✅ CI/CD strategi dokumentert og CI bygger alle apper
- ✅ Environment variables dokumentert
- ✅ Observability strategi dokumentert

## Status: Migration Fullført ✅

Alle routes er migrert, build/type-check passerer, og CI bygger alle apper. Se `docs/migration/migration-final-status.md` for full oversikt.
