# Support Tooling and Customer Operations

## Purpose

Standardize support operations with measurable SLA behavior and a repeatable escalation model.

## Ticket Taxonomy

Canonical categories:
- billing
- booking
- notifications
- authentication
- ux
- integrations
- data
- other

Reference: `packages/shared-core/src/analytics/event-taxonomy.ts`

## SLA Targets

- Sev1: first response <= 15 min, continuous handling
- Sev2: first response <= 1 hour
- Sev3: first response <= 1 business day

## Operational Signals

Collect weekly:
- ticket volume by category
- first response time p50/p95
- time to resolution p50/p95
- reopen rate
- incident-linked ticket ratio

## Escalation Flow

1. Support triage assigns category + severity.
2. If Sev1/Sev2, escalate to engineering on-call.
3. Incident owner creates/links incident note.
4. Resolution outcome feeds backlog with owner and due date.

## Customer Ops Review (Weekly)

Mandatory review output:
- top 5 ticket drivers
- highest business impact customer issues
- recurring defect classes
- recommended product/engineering actions

## Evidence Checklist

- [ ] Category applied to all tickets
- [ ] SLA metrics exported
- [ ] Escalations linked to incidents when required
- [ ] Follow-up action items assigned and tracked

