# Sprint 2: Dashboard 2.0 + Support Inbox + Impersonation

## Sidebar

- [ ] Restructure sidebar in admin-shell.tsx
- [ ] New section grouping (Overview, Operations, Tenants, Users, Security, Analytics)
- [ ] Update desktop sidebar
- [ ] Update mobile sidebar

## Dashboard

- [ ] KPI row (6 cards: Active Salons, New Salons, Activated, Bookings, Billing Issues, Support Cases)
- [ ] Needs Attention feed (from get_needs_attention_items + open cases)
- [ ] Quick Actions grid (Create Salon, Invite User, Change Plan, Suspend, Export, Audit Search)
- [ ] Recent Activity (last 20 events from security_audit_log)

## Support Inbox

- [ ] Support Inbox page (`apps/admin/src/app/(admin)/support/page.tsx`)
- [ ] DataTable with cases (ID, Type, Salon, Status, Priority, Assignee, Created, Updated)
- [ ] Filters: type, status, priority, assignee, date
- [ ] Row click opens DetailDrawer with case detail + notes + related audit events
- [ ] Change status, assign, add note actions
- [ ] Create Case button (manual)
- [ ] Support case service (`apps/admin/src/lib/services/support-service.ts`)

## Impersonation

- [ ] Impersonation drawer (`apps/admin/src/components/shared/impersonation-drawer.tsx`)
- [ ] Yellow "IMPERSONATION MODE" banner
- [ ] Read-only salon data via service_role
- [ ] Impersonation API route (`apps/admin/src/app/api/impersonate/route.ts`)
- [ ] Audit logging: impersonation_start / impersonation_end events
