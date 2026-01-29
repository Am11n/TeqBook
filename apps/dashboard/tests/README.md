# Dashboard tests

Unit- og komponenttester migrert fra `web/tests/`. Kjør med `pnpm run test:run` (eller `pnpm run test` for watch).

## Struktur

- **unit/services/** – enhetstester for services (logger, cache, plan-limits, permissions, audit-log, audit-trail, bookings, osv.)
- **unit/repositories/** – enhetstester for repositories (bookings, products, salons, shifts, notifications, reports)
- **unit/security/** – api-auth, api-endpoint-security, booking-conflicts, rls-policies, ssr-auth, supabase-client
- **unit/components/** – booking-form, calendar, error-boundary
- **components/** – BookingsTable, command-palette, CreateEmployeeForm, CreateServiceForm, table-system, test-utils
- **integration/** – repositories, billing, rls (ekskludert fra standard kjøring – kjør med `pnpm run test:integration`)
- **docs/** – api-docs (ekskludert – kjør med `pnpm run test:integration`)
- **rls/** – rls-policies (ekskludert – kjør med `pnpm run test:integration`)

## Ekskluderte tester

I `vitest.config.ts` er følgende ekskludert fra `pnpm run test:run`:

- **type-safety** – dashboard har ikke valideringsmoduler (bookings, employees, services, customers) ennå
- **BookingsTable**, **table-system** – Radix DropdownMenu åpnes ikke med `fireEvent` i jsdom; krever `@testing-library/user-event` eller E2E for å kjøre

**calendar.test.tsx** kjører nå som del av standard kjøring.

## Integration / docs / RLS

Kjør med eget script og (for integration) Supabase-miljøvariabler:

```bash
# Fra repo-rot
pnpm run test:integration

# Eller fra apps/dashboard (med env for integration)
pnpm run test:integration
```

Krever for integration-tester: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Noen tester forventer paths i repo-rot (f.eks. `tests/integration/query-performance.test.ts` bruker `supabase/migrations` – i monorepo ligger den i rot; tilpass `MIGRATIONS_DIR` eller kjør med cwd i rot). Docs-tester bruker `process.cwd()` for `docs/api` og `src/app/api`.
