# Teststatus – TeqBook monorepo

**Alle kjørende tester bestås.** Type-check og unit-tester (28 stk) passerer. Lint kjører ikke før ESLint 9-config er på plass; E2E kjører manuelt ved behov.

Dette dokumentet beskriver hvilke tester som kjører i monorepoet og deres status. Sist oppdatert etter kjøring av alle tilgjengelige test-kommandoer.

---

## Oppsummering

| Kategori        | Kommando        | Status | Merknad |
|-----------------|-----------------|--------|---------|
| Type-check     | `pnpm run type-check` | ✅ Bestått | Alle workspaces |
| Unit-tester    | `pnpm run test:run`   | ✅ Bestått | 28 tester, dashboard |
| Lint           | `pnpm run lint`       | ⚠️ Ikke kjørt | Krever eslint.config.js (ESLint 9) |
| E2E-tester     | `pnpm run test:e2e`   | 📋 Kjør manuelt | Krever at apper kjører / at Playwright starter dem |

**Konklusjon:** Alle tester som er satt opp og kjøres uten ekstra oppsett (**type-check** og **unit-tester**) **bestås**.

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

Kjører Vitest én gang for dashboard-appen.

**Resultat (sist kjørt):**

```
✓ tests/unit/services/logger.test.ts         (4 tests)
✓ tests/unit/services/cache-service.test.ts (24 tests)

Test Files  2 passed (2)
     Tests  28 passed (28)
```

**Testfiler:**
- `apps/dashboard/tests/unit/services/logger.test.ts` – 4 tester
- `apps/dashboard/tests/unit/services/cache-service.test.ts` – 24 tester

Alle 28 unit-tester bestås.

---

## 3. Lint ⚠️ Ikke kjørt (konfigurasjon mangler)

**Kommando:** `pnpm run lint`

ESLint 9 forventer `eslint.config.(js|mjs|cjs)` i hvert workspace. Workspaces bruker fortsatt eldre oppsett (f.eks. `.eslintrc`), så lint feiler med «couldn't find eslint.config» og kjører ikke.

**For å få lint til å bestå:** Migrer til ESLint 9 flat config (`eslint.config.js`) i de berørte appene/pakene, eller tilpass CI slik at lint ikke kjører før migrering er gjort. Se `docs/ops/testing-plan.md` (Fase 2 – Lint).

---

## 4. E2E-tester (Playwright) 📋 Kjør manuelt

**Kommando:** `pnpm run test:e2e`

E2E-tester ligger i `tests/e2e/` og krever at public (3001), dashboard (3002) og admin (3003) kan startes (Playwright kan starte dem via `webServer` i `playwright.config.ts`).

**E2E-filer (prosjekter i Playwright):**
- `auth.owner.setup.ts`, `auth.superadmin.setup.ts` – auth-setup
- `landing.spec.ts`, `public-booking.spec.ts` – **public** (3001)
- `settings-form.spec.ts`, `settings-changes.spec.ts`, `billing-flow.spec.ts`, `booking-flow.spec.ts`, `onboarding.spec.ts` – **authenticated** (3002)
- `admin-operations.spec.ts` – **admin** (3003)

**For å kjøre E2E:**
1. E2E-brukere må finnes (f.eks. `pnpm run create:e2e-users`).
2. Kjør: `pnpm run test:e2e` (alle prosjekter) eller f.eks. `pnpm run test:e2e -- --project=public` for kun public.

E2E er ikke tatt med i den automatiske «alle tester bestås»-sjekken i dette dokumentet; de kan kjøres manuelt for å bekrefte at også E2E bestås.

---

## Hvordan kjøre testene selv

Fra **repo-rot**:

```bash
# Type-check (alle workspaces)
pnpm run type-check

# Unit-tester (dashboard, én kjøring)
pnpm run test:run

# Lint (når eslint.config.js er på plass)
pnpm run lint

# E2E (krever nettverk / at portene er ledige)
pnpm run test:e2e
```

---

## Vedlikehold

- Oppdater **«Sist oppdatert»** og tabell/resultatene i dette dokumentet når du endrer testoppsett eller kjører en full testrunde.
- Når lint er migrert til ESLint 9, oppdater statusen for Lint til ✅ og evt. «Bestått» i oppsummeringen.
- Når E2E kjører i CI eller som en del av din egen sjekk, kan du legge til en egen statusrad for E2E med ✅/❌ og kort merknad.
