# Sprint 5: Analytics + Onboarding Funnel

## Analytics

- [ ] Add recharts to package.json
- [ ] Time selector: 7d, 30d, 90d
- [ ] Activity over time (line chart: active salons/day, bookings/day, new salons/day)
- [ ] Activation funnel (create salon -> add employee -> add service -> first booking)
- [ ] Plan distribution (existing + upgrade/downgrade/churn)
- [ ] Top salons table (by bookings, growth)
- [ ] Cohort retention (7d/30d grid)
- [ ] Backend RPCs: get_analytics_time_series, get_activation_funnel, get_top_salons, get_salon_cohort_retention

## Onboarding Funnel

- [ ] Onboarding page (`apps/admin/src/app/(admin)/onboarding/page.tsx`)
- [ ] Aggregate funnel (conversion rates per step)
- [ ] Per-salon onboarding status (step-by-step with blockers)
- [ ] Actions: Send nudge (email), Create support case, View salon
- [ ] Filters: stuck >24h, >48h, >7d
