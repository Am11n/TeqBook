# Dashboard Locale QA Checklist (NB + EN)

This checklist is used to validate that dashboard UI text is correct in both Norwegian (`nb`) and English (`en`).

## 1) Navigation and Layout

- Sidebar section headers and menu labels:
  - Overview, Operations, Management, Compliance, System
  - Sales, Help, Reports, Settings
- Route-level page headers:
  - `sales/*`, `help/*`, `reports/*`, `bookings/*`, `settings/*`
- Tab labels per route:
  - Sales: Gift Cards / Packages
  - Help: Feedback / Support
  - Reports: Overview / Commissions / Capacity / Export
  - Bookings: Bookings / Waitlist
  - Settings: No-show / Import / Security and existing translated tabs

## 2) Priority Route Checks

- `apps/dashboard/src/app/sales/layout.tsx`
- `apps/dashboard/src/app/help/layout.tsx`
- `apps/dashboard/src/app/reports/layout.tsx`
- `apps/dashboard/src/app/bookings/layout.tsx`
- `apps/dashboard/src/app/settings/layout.tsx`
- `apps/dashboard/src/lib/hooks/dashboard/useDashboardMenuItems.ts`

## 3) Component Sweep (Phased)

### Phase A (done in this pass)

- Help tabs and top actions (`support`, `feedback`) use locale-driven labels.
- Sales top actions and empty states use locale-driven labels.

### Phase B (next pass)

- Booking/calendar components with high text density:
  - quick create, reschedule modal, booking side panel, calendar controls, quick actions.
- Reports filter components and table utility texts.

### Phase C (next pass)

- Remaining dialogs/placeholders/a11y text across settings and profile pages.
- Legacy fallback strings and inline `locale === "nb"` branches.

## 4) Translation Parity Validation

For each touched namespace, validate that both `en` and `nb` contain the same keys:

- `dashboard`
- `bookings`
- `settings`

Recommended check:

1. Extract keys for both locale files.
2. Diff keys in each namespace.
3. Resolve missing keys before release.

## 5) Manual Regression Matrix

For each route above, run:

1. Set locale to `en` and capture labels/titles/tabs/buttons.
2. Set locale to `nb` and capture labels/titles/tabs/buttons.
3. Verify no mixed-language text in the same surface.
4. Verify tab navigation still works and active tab matches URL.
