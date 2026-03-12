# Post-Launch 30-Day Validation

## Purpose

Run structured production validation on day 7, day 14, and day 30 to confirm launch quality and guide go-forward decisions.

## Checkpoint Schedule

- Day 7: early stability and conversion sanity
- Day 14: trend validation and friction triage
- Day 30: scale-up vs hardening decision

## KPI Package (All Checkpoints)

- onboarding conversion rate
- booking completion rate
- payment drop-off rate
- notification delivery success rate

## Support and Incident Package

- ticket volume by category
- first response and resolution times
- incident count by severity
- MTTR trend

## UX Package

- top 10 pain points list
- mobile friction findings
- unresolved UX blockers and owners

## Reliability Package

- SLO compliance snapshot
- error budget usage
- notable regression windows and mitigations

## Decision Template

Use this template for each checkpoint:

```text
Checkpoint: Day X
Date:
Owner:

What improved:
What regressed:
Top risks:

Decision:
- Proceed
- Proceed with restrictions
- Hardening sprint required

Actions:
1)
2)
3)
```

## Exit Criteria at Day 30

- Stable trend on core KPI set
- No unresolved Sev1 reliability gap
- Clear decision log for next 60-day roadmap

