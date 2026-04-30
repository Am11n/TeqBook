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

## CI artifact-evidens

`migration-integrity`-jobben laster opp artifact med navn `migration-integrity-evidence` som inneholder:

- `migration-integrity-db-apply.log`
- `migration-integrity-db-verify.log`

**Evidens:** En grønn kjøring på `main` (eller PR) med denne jobben + artifact over dokumenterer at manifest-sjekk, apply og verify passerte på GitHub-runner.

Når du lukker P0.4 i ops-checklists, legg ved:

1. URL til workflow-run.
2. Referanse til artifact `migration-integrity-evidence`.
3. Eventuell avvikskommentar hvis `db:verify` gir miljøspesifikke datafunn.
