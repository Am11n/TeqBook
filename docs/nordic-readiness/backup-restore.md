# Backup and Restore

## Purpose

Define executable backup and disaster recovery requirements for production and staging.

## Environment Policy

| Environment | Full Backup | Incremental | Target RPO | Target RTO |
| --- | --- | --- | --- | --- |
| Production | Daily | Hourly | <= 1 hour | <= 2 hours |
| Staging | Daily | Every 6 hours | <= 6 hours | <= 4 hours |
| Development | Weekly | None | Best effort | Best effort |

## Required Controls

- Backup encryption at rest must be enabled.
- Restore operations must be auditable (who, when, why, result).
- Backup integrity verification must run after each full backup.
- Monthly restore drill is mandatory for production policy compliance.

## Restore Runbook

1. Declare incident and assign incident commander.
2. Freeze high-risk writes (booking creation, billing plan changes, bulk operations) where possible.
3. Identify latest known-good backup and snapshot timestamp.
4. Restore into verification environment first.
5. Validate:
   - tenant isolation and RLS-sensitive paths
   - critical tables (`salons`, `bookings`, `customers`, billing references)
   - scheduled job continuity (reminders/waitlist processors)
6. Obtain approval from engineering + operations owner.
7. Execute production restore.
8. Run post-restore smoke tests and monitor SLOs for at least 60 minutes.
9. Publish incident summary and corrective actions.

## Monthly Restore Drill Checklist

- [ ] Dry-run restore completed in isolated environment
- [ ] Data integrity checks passed
- [ ] Application smoke tests passed
- [ ] Measured RPO and RTO recorded
- [ ] Lessons learned documented in incident log

## Evidence Requirements

Every restore or drill must include:
- timestamp
- operator
- backup identifier
- start/end time
- observed RPO/RTO
- pass/fail with notes

## References

- `docs/ops/observability.md`
- `docs/nordic-readiness/incident-response.md`
