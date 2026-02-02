# Route Migration Guide

## Status

### Completed
- ✅ Monorepo structure created
- ✅ Packages (shared, ui) created
- ✅ Apps (public, dashboard, admin) created
- ✅ Import boundaries configured

### In Progress
- ⏳ Moving public routes to `apps/public`

### Remaining
- ⏳ Moving dashboard routes to `apps/dashboard`
- ⏳ Moving admin routes to `apps/admin`
- ⏳ Updating all imports to use packages
- ⏳ Standardizing MVVM pattern
- ⏳ Testing each app independently

## Migration Strategy

### Phase 1: Public App (Current)
Routes to move:
- `/` → `apps/public/src/app/page.tsx`
- `/landing` → `apps/public/src/app/landing/page.tsx`
- `/book/[salon_slug]` → `apps/public/src/app/book/[salon_slug]/page.tsx`
- `/book/[salon_slug]/confirmation` → `apps/public/src/app/book/[salon_slug]/confirmation/page.tsx`
- `/(auth)/login` → `apps/public/src/app/login/page.tsx`
- `/(auth)/login-2fa` → `apps/public/src/app/login-2fa/page.tsx`
- `/(auth)/signup` → `apps/public/src/app/signup/page.tsx`

Components (migrert fra tidligere web/):
- `apps/public/src/components/landing/*`
- `apps/public/src/components/public-booking-page.tsx`
- `apps/public/src/components/signup/*`
- `packages/ui/src/*` (shared UI)
- `apps/public/src/components/locale-provider.tsx`
- `apps/public/src/components/error-boundary.tsx`

Services/utilities to move:
- Auth-related services → `packages/shared/src/services/auth/` (if shared) or `apps/public/src/lib/services/` (if app-specific)
- i18n → `packages/shared/src/i18n/` (shared translations)

### Phase 2: Dashboard App
Routes to move:
- `/dashboard` → `apps/dashboard/src/app/dashboard/page.tsx`
- `/calendar` → `apps/dashboard/src/app/calendar/page.tsx`
- `/bookings` → `apps/dashboard/src/app/bookings/page.tsx`
- `/customers` → `apps/dashboard/src/app/customers/page.tsx`
- `/employees` → `apps/dashboard/src/app/employees/page.tsx`
- `/services` → `apps/dashboard/src/app/services/page.tsx`
- `/settings/*` → `apps/dashboard/src/app/settings/*`
- `/shifts` → `apps/dashboard/src/app/shifts/page.tsx`
- `/reports/*` → `apps/dashboard/src/app/reports/*`
- `/products` → `apps/dashboard/src/app/products/page.tsx`
- `/profile` → `apps/dashboard/src/app/profile/page.tsx`
- `/(onboarding)/onboarding` → `apps/dashboard/src/app/onboarding/page.tsx`

### Phase 3: Admin App
Routes to move:
- `/admin/*` → `apps/admin/src/app/admin/*`

## Import Update Strategy

1. **Supabase clients**: Use `@teqbook/shared` exports
2. **UI components**: Move to `@teqbook/ui` and import from there
3. **Shared utilities**: Move to `@teqbook/shared`
4. **App-specific code**: Keep in app's `src/` directory

## Testing Checklist

For each app:
- [ ] App builds successfully (`npm run build`)
- [ ] App runs in dev mode (`npm run dev`)
- [ ] All routes are accessible
- [x] No imports from `web/` (web/ fjernet)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
