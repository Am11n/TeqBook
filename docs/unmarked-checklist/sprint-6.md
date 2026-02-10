## Sprint 6: Plans & Billing + Feature Flags

### Plans & Billing

- [x] Plans & Billing page -- `apps/admin/src/app/(admin)/plans/page.tsx`
  - [x] Plan distribution summary cards (per plan med %)
  - [x] DataTable med salonger sortert etter plan
  - [x] Row action: Change Plan
  - [x] DetailDrawer med plan change UI (Starter/Pro/Business buttons)
  - [x] Bruker `get_salons_paginated()` og `get_admin_plan_distribution()` RPCs

### Feature Flags

- [x] DB-migrasjon: Feature flags -- `20260210000007_feature_flags.sql`
  - [x] `feature_flags` tabell med salon_id (null = global), flag_key, enabled
  - [x] RLS for superadmins
  - [x] Seeded default global flags
- [x] Feature Flags page -- `apps/admin/src/app/(admin)/feature-flags/page.tsx`
  - [x] Global flags seksjon med toggle switches
  - [x] Per-salon overrides seksjon
  - [x] ON/OFF badges
  - [x] Add Flag button
