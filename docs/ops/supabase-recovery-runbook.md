# Supabase Recovery Runbook (Pilot Production)

This runbook prioritizes continuity for live salon data.

## Recovery Priority

1. Forward-fix
2. Isolated repair
3. PITR/restore only when approved as last resort

## Incident Roles

| Role | Owner | Responsibility |
|---|---|---|
| Engineering incident lead | TBD | Technical triage and fix |
| Ops lead | TBD | Environment control and rollback/PITR decisions |
| Salon communication owner | TBD | Communication to affected pilot salons |

## Immediate Incident Steps

1. Classify severity (Sev1/Sev2/Sev3).
2. Pause risky rollout activity.
3. Capture evidence (query outputs, logs, timestamps).
4. Decide path: forward-fix vs isolated repair vs restore.
5. Record decision in decision log before execution.

## Booking Recovery (Manual)

1. Identify whether booking is missing, partial, or duplicated.
2. Confirm status by querying booking + related customer/service/employee references.
3. If isolated repair is approved, repair only affected booking records.
4. Re-verify integrity constraints after repair.
5. Confirm customer/salon-facing status through communication owner.

## Rollback / Restore Guardrails

- Full DB rollback requires explicit approval from Engineering + Ops.
- Assess expected data loss window before restore.
- Prefer PITR target closest to incident timestamp.
- Document exact restore point and post-restore verification evidence.

## Staging Drill Requirements

- Run recovery rehearsal in staging first.
- Capture elapsed time, issues found, and follow-up fixes.
- Update this runbook after each rehearsal.

