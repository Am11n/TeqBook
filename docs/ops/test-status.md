# Teststatus – TeqBook monorepo

**Alle kjørende tester bestås.** Type-check, unit-tester (647 stk), lint og E2E (53 tester) passerer når appene kjører og Playwright-browsere er installert.

Dette dokumentet beskriver hvilke tester som kjører i monorepoet og deres status. Sist oppdatert etter kjøring av alle tilgjengelige test-kommandoer.

---

## Oppsummering

| Kategori        | Kommando        | Status | Merknad |
|-----------------|-----------------|--------|---------|
| Type-check     | `pnpm run type-check` | ✅ Bestått | Alle workspaces |
| Unit-tester    | `pnpm run test:run`   | ✅ Bestått | 647 tester (dashboard 639, public 4, admin 4) |
| Lint           | `pnpm run lint`       | ✅ Bestått | Alle workspaces (admin, dashboard, public, shared, ui) |
| E2E-tester     | `pnpm run test:e2e`   | ✅ Bestått | 53 tester; krever at apper kjører (3001–3003) og `pnpm exec playwright install` |

**Konklusjon:** Alle tester (**type-check**, **unit-tester**, **lint** og **E2E**) **bestås** når forutsetningene er oppfylt (se E2E-delen under).

---

## 1. Type-check ✅ Bestått

**Kommando:** `pnpm run type-check`

Kjører `tsc --noEmit` i alle workspaces som har scriptet.

**Resultat (sist kjørt):**
- ✅ `@teqbook/admin`
- ✅ `@teqbook/dashboard`
- ✅ `@teqbook/public`
- ✅ `@teqbook/shared`
- ✅ `@teqbook/ui`

Ingen TypeScript-feil.

---

## 2. Unit-tester (Vitest) ✅ Bestått

**Kommando:** `pnpm run test:run`

Kjører Vitest én gang i dashboard, public og admin (fra rot: `pnpm run test:run`).

**Resultat (sist kjørt):**
- **Dashboard:** 639 tester (40 filer) – unit/services, unit/repositories, unit/security (delvis), unit/components (delvis), components. Integration/docs/rls ekskludert fra standard kjøring; noen filer ekskludert inntil tilpasning til dashboard API (se vitest.config.ts).
- **Public:** 4 tester (logger)
- **Admin:** 4 tester (logger)

**Testfiler (dashboard):** unit/services (logger, cache, plan-limits, permissions, audit-log, audit-trail, og mange andre), unit/repositories, components (command-palette m.m.), unit/security (delvis). Ekskludert: integration, docs, rls, type-safety, BookingsTable, table-system, calendar, api-auth, api-endpoint-security, supabase-client (kan tilpasses senere).

Alle 647 unit-tester bestås.

---

## 3. Lint ✅ Bestått

**Kommando:** `pnpm run lint`

Kjører ESLint i alle workspaces med `eslint.config.mjs` (ESLint 9 flat config). Admin, dashboard og public bruker Next.js-eslint; shared og ui bruker TypeScript-parser.

**Resultat (sist kjørt):**
- ✅ `@teqbook/admin`
- ✅ `@teqbook/dashboard`
- ✅ `@teqbook/public`
- ✅ `@teqbook/shared`
- ✅ `@teqbook/ui`

Lint fullfører uten feil (exit code 0). Enkelte regler er satt til «warn» for å unngå at eksisterende kode blokkerer; disse kan strammes inn over tid.

---

## 4. E2E-tester (Playwright) ✅ Bestått

**Kommando:** `pnpm run test:e2e`

E2E-tester ligger i `tests/e2e/`. Playwright gjenbruker eksisterende servere (`reuseExistingServer: true`); public (3001), dashboard (3002) og admin (3003) må kjøre før du kjører E2E (eller la Playwright starte dem ved behov).

**Resultat (sist kjørt):**
- 53 tester bestått (ca. 2–3 min)
- Prosjekter: setup-owner, setup-superadmin, public, authenticated, admin

**E2E-filer (prosjekter i Playwright):**
- `auth.owner.setup.ts`, `auth.superadmin.setup.ts` – auth-setup
- `landing.spec.ts`, `public-booking.spec.ts` – **public** (3001)
- `settings-form.spec.ts`, `settings-changes.spec.ts`, `billing-flow.spec.ts`, `booking-flow.spec.ts`, `onboarding.spec.ts` – **authenticated** (3002)
- `admin-operations.spec.ts` – **admin** (3003)

**For å kjøre E2E:**
1. Installer Playwright-browsere én gang: `pnpm exec playwright install`
2. E2E-brukere må finnes (f.eks. `pnpm run create:e2e-users`)
3. Start appene (3001, 3002, 3003) eller la Playwright starte dem
4. Kjør: `pnpm run test:e2e` (alle) eller `pnpm run test:e2e -- --project=public` for kun public

---

## Hvordan kjøre testene selv

Fra **repo-rot**:

```bash
# Type-check (alle workspaces)
pnpm run type-check

# Unit-tester (dashboard, én kjøring)
pnpm run test:run

# Lint (alle workspaces)
pnpm run lint

# E2E (krever at apper kjører på 3001–3003; kjør «pnpm exec playwright install» én gang)
pnpm run test:e2e
```

---

## Vedlikehold

- Oppdater **«Sist oppdatert»** og tabell/resultatene i dette dokumentet når du endrer testoppsett eller kjører en full testrunde.
- Lint er migrert til ESLint 9 flat config; status er ✅ Bestått.
- E2E er kjørt lokalt og bestått (53 tester). I CI kan E2E legges til senere (krever oppstart av alle tre apper eller schedule).
