# Commit Strategy for Monorepo Migration

## Situasjon

Etter route-migrering har vi mange nye filer:
- `apps/public/src/` - Alle public routes, komponenter, services
- `apps/dashboard/src/` - Alle dashboard routes, komponenter, services  
- `apps/admin/src/` - Alle admin routes, komponenter, services
- Dokumentasjon i `docs/`
- Oppdateringer i `packages/shared/`

## Anbefalt Commit-struktur

### Commit 1: Infrastructure og packages
```bash
git add packages/shared/src/
git add docs/migration-*.md docs/route-migration-guide.md docs/import-migration-guide.md docs/testing-plan.md
git commit -m "feat: Add shared Supabase clients and migration documentation"
```

### Commit 2: Public app
```bash
git add apps/public/
git add docs/public-app-*.md
git commit -m "feat: Migrate public routes to apps/public

- Landing page
- Auth routes (login, signup, login-2fa)
- Public booking routes
- All supporting components and services"
```

### Commit 3: Dashboard app
```bash
git add apps/dashboard/
git add docs/dashboard-app-*.md
git commit -m "feat: Migrate dashboard routes to apps/dashboard

- Dashboard home, calendar, bookings
- Customers, employees, services
- Settings (all sub-routes)
- Shifts, reports, products, profile
- Onboarding
- All supporting components and services"
```

### Commit 4: Admin app
```bash
git add apps/admin/
git add docs/admin-app-*.md
git commit -m "feat: Migrate admin routes to apps/admin

- Admin home, analytics, audit-logs
- Salons and users management
- All supporting components and services"
```

### Commit 5: Documentation updates
```bash
git add docs/migration-status.md docs/migration-complete-summary.md docs/migration-final-status.md
git commit -m "docs: Update migration status documentation"
```

## Alternativ: En stor commit

Hvis du foretrekker en enkelt commit for hele migreringen:

```bash
git add apps/ packages/shared/src/ docs/
git commit -m "feat: Complete monorepo route migration

- Migrate all routes to separate apps (public, dashboard, admin)
- Add shared Supabase clients package
- Add comprehensive migration documentation
- All apps are now isolated with their own routes and components"
```

## Hva skal IKKE committes (ennå)

- `node_modules/` (allerede i .gitignore)
- `.next/` build directories
- Lokale `.env` filer
- Test-filer som ikke er ferdig

## Tips

1. **Review først**: Sjekk `git status` og `git diff` før du committer
2. **Test først**: Vurder å teste at appene bygger før du committer alt
3. **Inkrementelt**: Du kan committe hver app separat for bedre oversikt
4. **Branch**: Vurder å lage en feature branch først: `git checkout -b feat/monorepo-migration`

## Neste steg etter commit

1. Test at hver app bygger
2. Fikse eventuelle errors
3. Oppdatere imports til packages
4. Refaktorere delt kode
