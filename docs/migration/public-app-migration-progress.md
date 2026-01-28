# Public App Migration Progress

## Completed ✅

### Infrastructure
- ✅ Created `apps/public/src/app/layout.tsx` with LocaleProvider and ErrorBoundary
- ✅ Copied `globals.css` to `apps/public/src/app/globals.css`
- ✅ Created directory structure for components

### Landing Page
- ✅ Moved `/landing` route to `apps/public/src/app/landing/page.tsx`
- ✅ Copied all landing components to `apps/public/src/components/landing/`:
  - LandingHeader.tsx
  - LandingHero.tsx
  - LandingStats.tsx
  - LandingPricing.tsx
  - LandingFAQ.tsx
  - LandingFooter.tsx
  - LandingMobileMenu.tsx
  - landing-copy.ts
  - constants.ts

### Supporting Components
- ✅ Copied UI components to `apps/public/src/components/ui/`
- ✅ Copied layout components (`section.tsx`)
- ✅ Copied `stats-grid.tsx`
- ✅ Copied `locale-provider.tsx`
- ✅ Copied `error-boundary.tsx` and `error-message.tsx`
- ✅ Copied `logger.ts` service
- ✅ Copied `utils.ts` (cn function)
- ✅ Copied i18n files to `apps/public/src/i18n/`

### Root Route
- ✅ Updated `apps/public/src/app/page.tsx` to import landing page

## Remaining Work ⏳

### Auth Routes ✅
- [x] Move `/login` to `apps/public/src/app/login/page.tsx`
- [x] Move `/login-2fa` to `apps/public/src/app/login-2fa/page.tsx`
- [x] Move `/signup` to `apps/public/src/app/signup/page.tsx`
- [x] Copy signup components to `apps/public/src/components/signup/`
- [x] Copy auth services (auth-service.ts, etc.)
- [x] Copy rate-limit-service.ts
- [x] Copy session-service.ts
- [x] Copy profiles-service.ts
- [x] Copy two-factor-service.ts
- [x] Copy useSignup hook

### Public Booking Routes ✅
- [x] Move `/book/[salon_slug]` to `apps/public/src/app/book/[salon_slug]/page.tsx`
- [x] Move `/book/[salon_slug]/confirmation` to `apps/public/src/app/book/[salon_slug]/confirmation/`
- [x] Copy `public-booking-page.tsx` component
- [x] Copy booking-related services (bookings-service, salons-service, services-service, employees-service)
- [x] Copy empty-state component
- [x] Copy types, repositories, and supporting services

### Dependencies ✅
- [x] Check all imports in copied files and update paths
- [x] Ensure all services are available or copied
- [x] Copy types, repositories, and supabase clients
- [ ] Test that landing page works in isolation
- [ ] Update imports to use `@teqbook/shared` where applicable (valgfritt)

## Notes

- All files are copied (not moved) to allow gradual migration
- All necessary services, types, repositories, and infrastructure have been copied
- Redirects to `/onboarding`, `/dashboard`, `/admin` need to be handled (these routes are in other apps)
- After testing, we can refactor to use shared packages where possible
