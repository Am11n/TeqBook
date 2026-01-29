# Testing Plan for Monorepo Migration

## Oversikt

Etter route-migrering må vi teste at hver app fungerer isolert. Dette dokumentet beskriver testplanen.

## Test Checklist per App

### Public App (`apps/public`)

#### Build Test
- [x] `cd apps/public && npm run type-check` - Type checking
- [x] `cd apps/public && npm run build` - Production build (kompilerte vellykket)
- [x] Verifiser at build er vellykket uten errors

#### Dev Server Test
- [x] `cd apps/public && npm run dev` - Start dev server
- [x] Test at server starter på port 3001
- [x] Test at landing page laster (`http://localhost:3001/`)
- [x] Test at login page laster (`http://localhost:3001/login`)
- [x] Test at signup page laster (`http://localhost:3001/signup`)
- [x] Test at booking page laster (`http://localhost:3001/book/[salon_slug]`)

#### Import Verification
- [x] Sjekk at ingen imports fra `web/` eksisterer
- [x] Sjekk at alle relative imports fungerer
- [x] Sjekk at Supabase clients fungerer

#### Ekstra fikset
- [x] Kopiert manglende utils, templates, services fra web/
- [x] Lagt til postcss.config.mjs for Tailwind
- [x] Fikset dynamisk import av email-service (resend)
- [x] Lagt til favicon (Favikon.svg)

---

### Dashboard App (`apps/dashboard`)

#### Build Test
- [x] `cd apps/dashboard && npm run type-check` - Type checking
- [x] `cd apps/dashboard && npm run build` - Production build (kompilerte vellykket)
- [x] Verifiser at build er vellykket uten errors

#### Dev Server Test
- [x] `cd apps/dashboard && npm run dev` - Start dev server
- [x] Test at server starter på port 3002
- [x] Test at dashboard page laster (krever auth)
- [x] Test at calendar page laster
- [x] Test at bookings page laster
- [x] Test at settings pages laster

#### Import Verification
- [x] Sjekk at ingen imports fra `web/` eksisterer
- [x] Sjekk at alle relative imports fungerer
- [x] Sjekk at DashboardShell fungerer

#### Ekstra fikset
- [x] Kopiert utils/, templates/, components/ fra web/
- [x] Lagt til postcss.config.mjs for Tailwind
- [x] Installert @stripe/react-stripe-js, @stripe/stripe-js
- [x] Fikset dynamisk import av email-service (resend)
- [x] Lagt til favicon (Favikon.svg)
- [x] Lagt til redirect fra / til /dashboard/
- [x] Reimplementert API-ruter for booking-bekreftelse og kansellering i dashboard (`/api/bookings/send-notifications`, `/api/bookings/send-cancellation`)

---

### Admin App (`apps/admin`)

#### Build Test
- [x] `cd apps/admin && npm run type-check` - Type checking
- [x] `cd apps/admin && npm run build` - Production build
- [x] Verifiser at build er vellykket uten errors

#### Dev Server Test
- [x] `cd apps/admin && npm run dev` - Start dev server
- [x] Test at server starter på port 3003
- [x] Test at admin page laster (krever superadmin)
- [x] Test at analytics page laster
- [x] Test at salons page laster

#### Import Verification
- [x] Sjekk at ingen imports fra `web/` eksisterer
- [x] Sjekk at alle relative imports fungerer
- [x] Sjekk at AdminShell fungerer

#### Ekstra fikset
- [x] Kopiert utils/, templates/, components/, hooks/ fra web/
- [x] Lagt til postcss.config.mjs for Tailwind
- [x] Installert tw-animate-css
- [x] Lagt til favicon (Favikon.svg)
- [x] Lagt til redirect fra / til /login
- [x] Opprettet egen Admin Login-side (/login)

---

## Common Issues to Check

### Type Errors
- [x] Sjekk for TypeScript errors i alle apper
- [x] Fikse manglende type definitions
- [x] Fikse import type errors

### Missing Dependencies
- [x] Sjekk at alle dependencies er installert
- [x] Sjekk at workspace dependencies fungerer (`@teqbook/shared`, `@teqbook/ui`)
- [x] Installer manglende dependencies

### Import Errors
- [x] Sjekk for broken imports
- [x] Fikse relative path imports
- [x] Oppdater imports til å bruke packages hvor mulig

### Environment Variables
- [x] Sjekk at `.env.local` er satt opp for hver app
- [x] Verifiser at Supabase credentials fungerer
- [x] Test at apper kan koble til Supabase

## Test Scripts

### Quick Test (fra repo-rot)
```bash
pnpm run type-check   # Type-check alle workspaces
pnpm run lint         # Lint alle workspaces
pnpm run test:run     # Unit-tester (dashboard, 28 stk)
pnpm run test:coverage # Coverage (dashboard, services/repositories)
pnpm run build        # Build alle apper
pnpm run test:e2e     # E2E (53 tester; krever apper på 3001–3003 og «pnpm exec playwright install»)
pnpm run test:integration  # Integration/docs/rls (dashboard; krever Supabase-env for integration)
```

### Individual App Test
```bash
# Public app
cd apps/public
npm run type-check
npm run build
npm run dev

# Dashboard app
cd apps/dashboard
npm run type-check
npm run build
npm run dev

# Admin app
cd apps/admin
npm run type-check
npm run build
npm run dev
```

## Known Issues

### Redirects
- Login redirecter til `/onboarding`, `/dashboard`, `/admin` - disse er i andre apper
- Må håndteres med absolute URLs eller routing mellom apper

### Shared State
- SalonProvider og LocaleProvider er kopiert i hver app
- Kan refaktoreres til shared package senere

### Duplicated Code
- ~~Mange komponenter og services er kopiert~~ Session-service og timezone-utils er flyttet til `@teqbook/shared`
- Kan refaktoreres til packages senere (SalonProvider, auth-service, etc.)

## Success Criteria

En app er "klar" når:
- ✅ Type checking passerer
- ✅ Build er vellykket
- ✅ Dev server starter uten errors
- ✅ Ingen imports fra `web/`
- ✅ Alle routes er tilgjengelige (med riktig auth)

**Status:**
- ✅ **Public App** - KLAR
- ✅ **Dashboard App** - KLAR  
- ✅ **Admin App** - KLAR

## Next Steps After Testing

1. ~~Fikse alle errors funnet under testing~~ ✅
2. ~~Oppdater imports til å bruke packages~~ ✅ (Supabase, session-service, timezone fra @teqbook/shared)
3. ~~Refaktorer duplisert kode til packages~~ ✅ (session-service og timezone-utils i @teqbook/shared)
4. [x] Sett opp CI for monorepo (`.github/workflows/ci.yml`: type-check, lint, test:run, build)
5. [ ] Deploy hver app individuelt (Vercel per app, se `docs/ops/ci-cd-strategy.md`)

---

## Fase 2 – Status (monorepo)

- [x] **Tester**: E2E i `tests/e2e/` (Playwright, 53 tester), unit i `apps/dashboard/tests/` (Vitest, 28 tester). Root: `pnpm run test:run`, `pnpm run test:e2e`. Se `docs/ops/test-status.md`.
- [x] **Scripts**: Root `package.json` har `seed`, `seed:reset`, `seed:force`, `migrate:local`, `reset:db`, `create:e2e-users`, `setup:e2e` – kjør fra rot med `pnpm run <script>`. Env fra rot `.env.local`/`.env`. Se `scripts/README.md`.
- [x] **CI**: `.github/workflows/ci.yml` kjører type-check, lint, test:run, build på push/PR mot main/develop/monorepo.
- [x] **Lint**: ESLint 9 flat config (`eslint.config.mjs`) er på plass i alle workspaces (admin, dashboard, public, shared, ui); lint bestås.
- [x] **E2E i CI**: E2E-job i `.github/workflows/ci.yml` kjører etter build; Playwright starter alle tre apper (3001, 3002, 3003) via `webServer`. Se `docs/ops/ci-cd-strategy.md`.

---

## Videre Teststrategi (monorepo)

For å gjøre testoppsettet permanent og uavhengig av den gamle single-appen:

### 1. Automatisert testkjøring i CI
- [x] Kjør type-check, lint, unit tests og build i CI: `.github/workflows/ci.yml` (pnpm, type-check, lint, test:run, build).
- [x] PR-er mot main/develop/monorepo trigger CI; build avhenger av type-check, lint og test.
- [x] E2E i CI: jobb `e2e` i `ci.yml` kjører `pnpm run test:e2e` etter build; Playwright starter appene via `webServer`.

### 2. Migrere og strukturere tester
- [x] Etablér felles test-struktur for monorepo: E2E i rot `tests/e2e/`, unit per app (f.eks. `apps/dashboard/tests/`).
- [x] Migrere E2E fra web: `tests/e2e/` med landing, public-booking, settings, billing, onboarding, admin; auth setup per app (owner på 3002, superadmin på 3003).
- [x] Playwright-konfig i rot: `playwright.config.ts` med prosjekter og webServers for 3001, 3002, 3003.
- [x] Vitest i dashboard: `apps/dashboard/vitest.config.ts`, `tests/setup.ts`, eksempel unit-test (logger).
- [x] **Alle tester fra web/tests migrert til dashboard:** Unit (services, repositories, security, components), components/, type-safety, docs, rls og integration er kopiert til `apps/dashboard/tests/`. Standard kjøring: `pnpm run test:run`. Integration, docs og rls kjøres med `pnpm run test:integration` (eget oppsett/Supabase). Ekskludert fra standard kjøring: type-safety (mangler valideringsmoduler), BookingsTable og table-system (Radix Dropdown i jsdom). calendar.test.tsx kjører. Se `apps/dashboard/tests/README.md` og `vitest.config.ts`.

### 3. Minimumsdekning per app
- **Public (`apps/public`)**
  - [x] E2E: landing (`landing.spec.ts`), navigere til login (`landing.spec.ts`), booking-flow (`public-booking.spec.ts`). Signup har ikke egen E2E ennå.
  - [x] Unit: Vitest på plass; 4 tester (logger i `tests/unit/services/`). [ ] Flere: kritiske komponenter, helpers.
- **Dashboard (`apps/dashboard`)**
  - [x] E2E: login (auth.owner.setup), settings (`settings-form.spec.ts`, `settings-changes.spec.ts`), billing (`billing-flow.spec.ts`), booking (`booking-flow.spec.ts`), onboarding (`onboarding.spec.ts`). Dashboard/calendar dekkes indirekte via andre flows.
  - [x] Unit: 639 tester (services, repositories, security, components – migrert fra `web/tests/`). Noen filer ekskludert inntil API-tilpasning.
- **Admin (`apps/admin`)**
  - [x] E2E: admin-login (auth.superadmin.setup), admin-operations (`admin-operations.spec.ts` – salons, analytics m.m.).
  - [x] Unit: Vitest på plass; 4 tester (logger i `tests/unit/services/`). [ ] Flere: admin-relaterte services og tilgangskontroll.

### 4. Rapporter og dekning
- [x] Slå på coverage-rapportering for Vitest: `apps/dashboard/vitest.config.ts` har `coverage` (v8, text + json-summary) for `src/lib/services/**` og `src/lib/repositories/**`. Root: `pnpm run test:coverage`.
- [x] Legg til enkel rapportering i CI: `.github/workflows/ci.yml` har jobb `coverage` som kjører `pnpm run test:coverage` og laster opp artefakt `coverage-dashboard` fra `apps/dashboard/coverage/`.

---

## Neste konkrete steg (fortsett planen)

1. ~~**Migrere alle tester fra web/tests/**~~ ✅ Fullført: alle filer kopiert til dashboard; 639 tester kjører. **Valgfritt:** Tilpass de ekskluderte testene (type-safety, BookingsTable, table-system, calendar, api-auth, api-endpoint-security, supabase-client) og/eller kjør integration/docs/rls med eget oppsett.
2. ~~**Public/Admin unit-tester:** Legg til Vitest og første unit-tester~~ ✅ Vitest + logger.test er på plass i public og admin (4 tester hver).
3. ~~**E2E i CI (valgfritt):**~~ ✅ E2E-job i `ci.yml` kjører `pnpm run test:e2e` etter build; Playwright starter appene.
4. **Deploy:** Fullfør deploy per app (Vercel), se `docs/ops/ci-cd-strategy.md`. 
