## Sprint 7: Data Governance + Admin RBAC

### Data Tools

- [x] DB-migrasjon: Data requests + Admin RBAC -- `20260210000008_data_requests_admin_rbac.sql`
  - [x] `data_requests` tabell (export, deletion, anonymization)
  - [x] Status workflow: pending -> approved -> processing -> completed
  - [x] `admin_role` kolonne på profiles (support_admin, billing_admin, security_admin, read_only_auditor, full_admin)
- [x] Data Tools page -- `apps/admin/src/app/(admin)/data-tools/page.tsx`
  - [x] Retention policies info cards
  - [x] DataTable med data requests
  - [x] Row actions: Approve, Process, Complete, Reject
  - [x] DetailDrawer med status workflow buttons
  - [x] New Request button

### Admin RBAC

- [x] Admins page -- `apps/admin/src/app/(admin)/admins/page.tsx`
  - [x] DataTable med admin users (email, superadmin, admin_role, joined)
  - [x] RBAC roles overview cards
  - [x] Row actions: Set role (full_admin, support_admin, billing_admin, security_admin, read_only_auditor)
  - [x] Remove admin role action
  - [x] Add Admin button
