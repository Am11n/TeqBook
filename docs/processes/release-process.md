# TeqBook Release Process

## Scope

This process governs releases for monorepo applications:
- `apps/public`
- `apps/dashboard`
- `apps/admin`

Deployment target is Vercel-based app projects (not GitHub Pages).

## Release Model

- `main` -> production candidate
- Staging verification is mandatory before production approval
- Semantic versioning is used for release communication

## Pre-Release Gates (Must Pass)

- [ ] `pnpm run type-check`
- [ ] `pnpm run lint`
- [ ] `pnpm run format:check`
- [ ] `pnpm run test:run`
- [ ] `pnpm run test:integration`
- [ ] `pnpm run test:e2e`
- [ ] `pnpm run build`
- [ ] `pnpm run check:bundle-size`
- [ ] Security scan job completed (no unresolved high-severity release blockers)
- [ ] Migrations verified and reviewed
- [ ] Backup/restore readiness verified for release window
- [ ] Observability and alerting enabled for impacted flows
- [ ] Documentation and runbooks updated

## Release Steps

1. Create release branch from `main`.
2. Freeze non-critical scope changes.
3. Run full CI and staging validation.
4. Verify critical journeys:
   - booking
   - payment
   - reschedule
   - cancellation
   - notifications
5. Approve release in change log with accountable owner.
6. Merge to `main` and trigger production deployment.
7. Create release tag and publish release notes.

## Post-Release Validation

Within first hour:
- [ ] API error rate and latency within SLO thresholds
- [ ] Booking success and payment success stable
- [ ] No webhook backlog/failure spike
- [ ] No critical support incident spike

Within 24 hours:
- [ ] Incident review of any abnormal signals
- [ ] Confirm no tenant isolation regressions
- [ ] Update release notes with known issues/actions

## Rollback Plan

If release health degrades:
1. Stop forward deployments.
2. Roll back to previous stable deployment.
3. If data-impacting issue: execute controlled restore from verified backup point.
4. Disable high-risk side effects when needed (for example outbound notifications).
5. Open incident, assign commander, track remediation.

## Hotfix Process

1. Create `hotfix/*` branch from `main`.
2. Implement minimal fix and targeted tests.
3. Re-run mandatory gates for impacted scope.
4. Deploy to staging, then production.
5. Publish hotfix note and follow-up prevention task.

## Required Evidence

Each release must attach:
- CI run references
- staging verification notes
- migration verification
- rollback readiness confirmation
- post-release validation notes

## References

- `.github/workflows/ci.yml`
- `docs/ops/ci-cd-strategy.md`
- `docs/nordic-readiness/backup-restore.md`
- `docs/ops/observability.md`

