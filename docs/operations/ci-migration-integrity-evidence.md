# Migration integrity — CI-evidens

**Job:** `Migration Integrity` i [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) (`migration-integrity`).

**Krever secrets (GitHub repository):**

- `SUPABASE_DB_URL` — Postgres connection string for målmiljøet som skal verifiseres.
- `NEXT_PUBLIC_SUPABASE_URL` — brukes av `scripts/lib/db-env.ts` til ref-preflight der det er relevant.
- `NEXT_PUBLIC_SUPABASE_PROJECT_REF_PILOT_PRODUCTION` — valgfri/legacy alias avhengig av miljø.

**Miljøvariabler satt i jobben:**

- `TEQBOOK_DB_USE_PROCESS_ENV=1`
- `TEQBOOK_ENV_TARGET=pilot-production`
- `TEQBOOK_SUPABASE_TARGET=pilot-production`

**Steg:** `pnpm run db:manifest:verify` deretter `pnpm run db:apply && pnpm run db:verify`.

**Evidens:** En grønn kjøring på `main` (eller PR) med denne jobben dokumenterer at manifest-sjekk, apply og verify passerte på GitHub-runner. Lenk til konkret workflow-run i `critical-fixes-master-checklist` når du lukker P0.4-aksept.
