# Supabase Dual Production Gates

## Gate A - Pre-Pilot Production Activation

All items must be green before first pilot salon activation:

- [ ] Environment mapping confirmed (`staging` vs `pilot-production`)
- [ ] Manifest/checksum verification passed
- [ ] Baseline + post-baseline apply succeeded
- [ ] Verification pack passed
- [ ] Seed policy split enforced
- [ ] Recovery drill completed in staging
- [ ] Engineering sign-off
- [ ] Ops sign-off
- [ ] QA evidence validation sign-off

Evidence links:

- Apply log:
- Verify log:
- Recovery drill log:

Approval:

- Engineering:
- Ops:
- QA:
- Date:

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

