# UX Consistency and Design QA Gates

## Purpose

Establish release-quality UX gates for critical user journeys across public, dashboard, and admin surfaces.

## Critical Flows

- booking creation
- payment and billing update
- reschedule/cancellation
- notification settings and delivery feedback

## Required UX States

Every critical flow must demonstrate:
- loading state
- success state
- empty state
- recoverable error state
- permission/access-denied state

## Mobile Friction Review

For each release candidate:
- verify top tasks on <=390px viewport
- verify keyboard/input ergonomics
- verify CTA visibility and tap size
- verify no blocking horizontal overflow

## Design QA Checklist

- [ ] Copy consistency across locales for core actions
- [ ] Error language clear and actionable
- [ ] No dead-end UX states without next action
- [ ] Keyboard and focus behavior tested
- [ ] Visual regressions checked on key pages

## Top Pain Points Process

Weekly:
1. Aggregate issues from analytics + support.
2. Rank top 10 by impact and frequency.
3. Assign owner, target release, and validation metric.

## Evidence Format

Per release, attach:
- checklist result
- screenshots/video for mobile review
- list of accepted UX risks with owner

