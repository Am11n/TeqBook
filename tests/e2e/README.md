# E2E tests (monorepo)

E2E tests run against all three apps:

- **Public** (`http://localhost:3001`) – landing, public booking
- **Dashboard** (`http://localhost:3002`) – settings, billing, booking flow, onboarding (owner auth)
- **Admin** (`http://localhost:3003`) – admin operations (superadmin auth)

## Run from repo root

```bash
# All E2E (starts public, dashboard, admin via Playwright webServer)
pnpm run test:e2e

# With UI
pnpm run test:e2e:ui

# Single project (e.g. public only)
pnpm exec playwright test --project=public
```

## Auth setup

- **Owner** (dashboard): `auth.owner.setup.ts` logs in at `/login` on dashboard (3002), saves state to `.auth/owner.json`.
- **Superadmin** (admin): `auth.superadmin.setup.ts` logs in at `/login` on admin (3003), saves state to `.auth/superadmin.json`.

E2E users must exist (e.g. run `scripts/create-e2e-users.ts` from `web/` or equivalent in monorepo).

## Config

Root `playwright.config.ts` defines projects and webServers. Base URL is set per project (3001 / 3002 / 3003).
