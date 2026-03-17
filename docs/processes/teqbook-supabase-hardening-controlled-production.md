# TeqBook Supabase Hardening Plan (Controlled Production)

## Principle

Pilot is restricted production, not disposable beta.

## Environment Model

- `staging`: resettable validation with fixture data.
- `pilot-production`: live pilot data for first salons.
- `broader-rollout`: expansion of same `pilot-production` line.

## Core Rules

- Baseline is immutable after capture.
- Post-baseline migrations are the only forward path.
- Manifest order is canonical apply order.
- Manual SQL Editor rollout is prohibited for normal changes.
- Emergency SQL must be reconciled to version-controlled SQL before next normal release cycle.

## Environment Selection Protocol

- `cp .env.staging .env.local` for staging commands.
- `cp .env.pilot .env.local` for pilot-production commands.
- Run preflight checks before every DB command.

## Workstreams

### WS1 - Environment and Access Hardening
- Deliverables: environment matrix, ownership, revocation procedure.
- Reference: `docs/ops/supabase-environment-matrix.md`.

### WS2 - Baseline Capture and Governance
- Deliverables: `baseline/BASELINE.sql`, `migration-manifest.json`, `migration-checksums.json`.
- Reference: `supabase/supabase/baseline/BASELINE.sql`.

### WS3 - Automated Apply Path
- Command flow:
  - `pnpm run db:manifest:verify`
  - `pnpm run db:apply`
- Evidence: apply logs in `docs/ops/evidence/db-apply-logs`.

### WS4 - Verification Pack
- Command: `pnpm run db:verify`
- SQL checks:
  - `supabase/supabase/verification/00_schema_and_security.sql`
  - `supabase/supabase/verification/01_booking_integrity.sql`
  - `supabase/supabase/verification/02_data_quality.sql`
- Evidence: logs in `docs/ops/evidence/db-verify-logs`.

### WS5 - Seed Split Policy
- Staging-only fixtures allowed.
- Pilot-production fixtures forbidden.
- Guardrails enforced in scripts.

### WS6 - Recovery Readiness
- Forward-fix and isolated repair first.
- PITR/restore as approved last resort.
- Reference: `docs/ops/supabase-recovery-runbook.md`.

### WS7 - Dual Gates
- Gate A: before first pilot activation.
- Gate B: before broader rollout.
- Reference: `docs/ops/supabase-dual-production-gates.md`.

