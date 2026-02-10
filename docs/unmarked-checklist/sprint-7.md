# Sprint 7: Data Governance + Admin RBAC

## Data Tools

- [ ] Data Tools page (`apps/admin/src/app/(admin)/data-tools/page.tsx`)
- [ ] Export tenant data (select salon -> full JSON export for GDPR)
- [ ] Anonymize/delete user (workflow with approval step)
- [ ] Retention policies (config UI)
- [ ] DLP alerts (log large exports / many user searches)

## Admin RBAC

- [ ] DB migration: admin_role column + enum
- [ ] Update admin-shell.tsx for role-based sidebar visibility
- [ ] Roles: support_admin, billing_admin, security_admin, auditor, super_admin
- [ ] Admins page (`apps/admin/src/app/(admin)/admins/page.tsx`)
- [ ] List all admin users with role
- [ ] Change role
- [ ] Invite new admin
