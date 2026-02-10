# Sprint 4: Audit Logs Pro + Security Events

## Audit Logs

- [ ] DB migration: add correlation_id to security_audit_log
- [ ] Event Detail Drawer (full metadata, before/after diff, correlation grouping, actor context)
- [ ] JSON export (alongside CSV)
- [ ] Signed export (SHA-256 hash)
- [ ] Presets: Last 24h security, All booking changes, All admin actions, All impersonation
- [ ] Date quick-picks: Today, 7d, 30d

## Security Events

- [ ] Security Events page (`apps/admin/src/app/(admin)/security-events/page.tsx`)
- [ ] Suspicious logins (new country/device, many failures)
- [ ] Brute force patterns
- [ ] Password reset storms
- [ ] Role changes
- [ ] Count badge per section
- [ ] Auto-create support case for critical patterns
- [ ] Force logout all sessions action per user
