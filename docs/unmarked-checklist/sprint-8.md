# Sprint 8: Polish -- Global Search, Changelog, Feedback

## Global Search

- [ ] Upgrade command palette (`apps/admin/src/components/admin-command-palette.tsx`)
- [ ] Search salons (name, slug, owner)
- [ ] Search users (email, name)
- [ ] Search bookings (ID)
- [ ] Search audit events (action, resource)
- [ ] Results grouped with quick actions
- [ ] Backend RPC: admin_global_search(query, limit)

## Changelog

- [ ] Changelog page (`apps/admin/src/app/(admin)/changelog/page.tsx`)
- [ ] Markdown-rendered release list
- [ ] Date, version, changes
- [ ] Which tenants got it (feature-flagged)

## Feedback

- [ ] Feedback page (`apps/admin/src/app/(admin)/feedback/page.tsx`)
- [ ] Aggregate top issues from support cases
- [ ] Feature requests per tenant
- [ ] Prioritization view: issue x frequency x tenant value

## Final

- [ ] All pages responsive (mobile + desktop)
- [ ] All actions logged in audit log
- [ ] Type-check passes (pnpm run type-check)
- [ ] Lint passes (pnpm run lint)
- [ ] Manual test of all pages
- [ ] Update README with new admin features
