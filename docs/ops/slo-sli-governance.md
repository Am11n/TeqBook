# SLO/SLI Governance

## Purpose

Operationalize reliability targets and error-budget policy as a release governance mechanism.

## Service-Level Indicators (SLIs)

- API latency (p95/p99)
- booking success rate
- payment success rate
- notification delivery success rate
- uptime

## Initial SLO Targets

- API latency p95 < 200ms (critical endpoints)
- booking success >= 99.9%
- payment success >= 99.5%
- notification delivery success >= 99.0%
- uptime >= 99.95%

## Alert math (operational thresholds)

These thresholds drive paging and must be reflected in dashboards/runbooks:

- **Stripe webhook failed ratio (15m):**
  - P1: `failed / total >= 0.05` OR `failed_count >= 5`
  - P2: `failed / total >= 0.02` OR `failed_count >= 2`
- **Public booking OTP/token abuse (15m):**
  - P1: `429_rate >= 0.15` OR `invalid_proof_403_rate >= 0.20`
  - P2: `429_rate >= 0.08` OR `invalid_proof_403_rate >= 0.12`
- **Critical API latency (15m):**
  - P1: `p95 > 600ms`
  - P2: `p95 > 400ms`

Every threshold change requires updates in:
- `docs/operations/runbook-critical-alarms.md`
- `docs/ops/observability.md`
- relevant CI/load gate notes

## Error Budget Policy

- Budget consumption is evaluated monthly.
- If budget is exhausted:
  - freeze non-critical feature releases
  - prioritize reliability fixes
  - require explicit leadership exception for production changes

## Review Cadence

- Weekly reliability review:
  - incidents
  - alert quality
  - short-term trend shifts
- Monthly governance review:
  - SLO compliance
  - budget status
  - go/no-go release recommendation

## Ownership Model

- Product owner: customer impact and priority trade-offs
- Engineering owner: technical remediation and instrumentation
- Operations owner: alert tuning and incident process compliance

## Required Artifacts

- SLO dashboard snapshots
- error budget report
- action plan with owners and due dates
- exceptions log for policy overrides

