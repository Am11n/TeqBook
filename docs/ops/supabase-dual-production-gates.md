# Supabase Dual Production Gates

## Gate A - Pre-Pilot Production Activation

All items must be green before first pilot salon activation:

- [x] Environment mapping confirmed (`staging` vs `pilot-production`)
- [x] Manifest/checksum verification passed
- [x] Baseline + post-baseline apply succeeded
- [x] Verification pack passed
- [x] Seed policy split enforced
- [x] Recovery drill completed in staging
- [x] Engineering sign-off (manual approver recorded)
- [x] Ops sign-off (manual approver recorded)
- [x] QA evidence validation sign-off (manual approver recorded)

Evidence links (latest green):

- Apply log (staging): `docs/ops/evidence/db-apply-logs/apply-staging-qacgwgecrsinwjvuiobd-2026-03-16T15-42-34-732Z.md`
- Verify log (staging): `docs/ops/evidence/db-verify-logs/verify-staging-qacgwgecrsinwjvuiobd-2026-03-17T09-20-10-344Z.md`
- Apply log (pilot-production): `docs/ops/evidence/db-apply-logs/apply-pilot-production-mdqnburqfzvzhvsicdyo-2026-03-16T15-49-13-240Z.md`
- Verify log (pilot-production): `docs/ops/evidence/db-verify-logs/verify-pilot-production-mdqnburqfzvzhvsicdyo-2026-03-17T09-20-12-058Z.md`
- Recovery drill log: see archived failure/recovery sequence summary in `docs/ops/evidence/archive/2026-03-16-db-run-archive.md`
- Operational incident note: pilot verification was blocked by banned operator IP and recovered after unban (see `docs/ops/supabase-recovery-runbook.md`).

Approval:

- Engineering: Signed off (manual record completed)
- Ops: Signed off (manual record completed)
- QA: Signed off (manual record completed)
- Date: 2026-03-17 (Gate A sign-offs completed)

## Gate B - Pilot to Broader Production Rollout

All items must be green before expanding beyond pilot cohort:

- [ ] No unresolved Sev1 DB incidents
- [ ] Tenant isolation checks remain clean
- [ ] Booking integrity checks stable for 2 consecutive cycles
- [ ] Migration safety rules followed for 2 consecutive cycles
- [ ] Support/recovery thresholds within target
- [ ] No pilot salon requires environment/database relocation to remain active

Evidence links:

- Stability window report:
- Incident summary:
- Integrity report:

Approval:

- Engineering:
- Ops:
- Product:
- QA:
- Date:

