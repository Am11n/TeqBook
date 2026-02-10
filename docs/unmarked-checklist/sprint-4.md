## Sprint 4: Audit Logs Pro + Security Events

### Audit Logs

- [x] Correlation ID migrasjon -- `20260210000005_audit_correlation_id.sql`
  - [x] Lagt til `correlation_id`, `before_state`, `after_state`, `ip_address`, `user_agent`
  - [x] Indekser for correlation_id, action, resource_type
- [x] Audit logs pro-rewrite -- `apps/admin/src/app/(admin)/audit-logs/page.tsx`
  - [x] DataTable med kolonner: Time, Action, Resource, User, Salon, IP, Resource ID
  - [x] Quick date presets: Today, 24h, 7d, 30d
  - [x] View presets: Security events, Booking changes, Admin actions
  - [x] Filters: search, action, resource type, date range
  - [x] Eksport: CSV og JSON
  - [x] DetailDrawer med:
    - [x] Full metadata
    - [x] Before/after diff visning
    - [x] Actor context (IP, user agent)
    - [x] Correlated events listing
  - [x] Deep link support (?user=id)

### Security Events

- [x] Security Events page -- `apps/admin/src/app/(admin)/security-events/page.tsx`
  - [x] KPI-rad: Failed Logins, Role Changes, Impersonations
  - [x] Filtrert audit log (kun security-relevante actions)
  - [x] Period selector (7d/30d/90d)
  - [x] DataTable med fargekodede event-typer
  - [x] DetailDrawer med full metadata
