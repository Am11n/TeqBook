# Supabase Workflow (Controlled Production)

This document defines TeqBook's database workflow for a 2-project setup:

- `staging`: resettable validation environment
- `pilot-production`: live controlled production environment

## Core Rules

1. Pilot is restricted production, not disposable beta.
2. No normal schema rollout via manual SQL Editor copy/paste.
3. Baseline is immutable after capture.
4. Post-baseline migrations are the only forward path.
5. Manifest order is canonical apply order.
6. Staging fixtures are allowed only in staging.
7. Pilot-production data is real production data from day one.

## Directory Layout

```text
supabase/supabase/
├── baseline/
│   └── BASELINE.sql
├── migrations/
├── verification/
│   ├── 00_schema_and_security.sql
│   ├── 01_booking_integrity.sql
│   └── 02_data_quality.sql
├── migration-manifest.json
└── migration-checksums.json
```

## Environment Switching

Use root env files:

- `.env.staging`
- `.env.pilot`

Before DB commands:

```bash
# staging
cp .env.staging .env.local

# pilot-production
cp .env.pilot .env.local
```

Required in `.env.local`:

- `TEQBOOK_ENV_TARGET` (`staging` or `pilot-production`)
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL` (for psql-based apply/verify)

Optional safety refs:

- `TEQBOOK_STAGING_PROJECT_REF`
- `TEQBOOK_PILOT_PROJECT_REF`

## Scripts

From repository root:

```bash
# Manifest governance
pnpm run db:manifest:verify
pnpm run db:manifest:lock

# Apply and verification
pnpm run db:apply
pnpm run db:verify

# Existing staging-only helpers
pnpm run migrate:local
pnpm run seed
pnpm run reset:db
```

### Guardrails

- `migrate:local` is restricted to `TEQBOOK_ENV_TARGET=staging`.
- `reset:db` is restricted to `TEQBOOK_ENV_TARGET=staging`.
- `seed` blocks in pilot-production unless `--allow-pilot-bootstrap`.

## Standard Flow

### Staging

1. Switch to staging env.
2. Verify manifest/checksums.
3. Apply baseline + post-baseline migrations.
4. Run verification SQL pack.
5. Run staging fixture seed (if needed).
6. Run data quality checks and keep evidence.

### Pilot-Production

1. Switch to pilot env.
2. Verify manifest/checksums.
3. Apply baseline + post-baseline migrations.
4. Run verification SQL pack.
5. Do minimal bootstrap only (no fixture/demo data).
6. Preserve continuity for already onboarded salons.

## Emergency SQL Exception

Manual SQL Editor use is allowed only for approved emergency investigation/repair.

After emergency SQL:

1. Document incident and exact SQL.
2. Reconcile into version-controlled SQL.
3. Complete reconciliation before next normal release cycle.

## Recovery Posture

### Staging

- Aggressive rollback rehearsal is allowed.

### Pilot-Production

- Prefer forward-fix or isolated repair.
- Full DB rollback is last resort after approval and impact review.
- Use PITR/backup restore when unavoidable.
- Keep booking-level manual recovery runbook ready.

