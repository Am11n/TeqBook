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

