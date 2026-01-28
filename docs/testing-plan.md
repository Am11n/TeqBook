# Testing Plan for Monorepo Migration

## Oversikt

Etter route-migrering må vi teste at hver app fungerer isolert. Dette dokumentet beskriver testplanen.

## Test Checklist per App

### Public App (`apps/public`)

#### Build Test
- [x] `cd apps/public && npm run type-check` - Type checking
- [x] `cd apps/public && npm run build` - Production build (kompilerte vellykket)
- [x] Verifiser at build er vellykket uten errors

#### Dev Server Test
- [x] `cd apps/public && npm run dev` - Start dev server
- [x] Test at server starter på port 3001
- [x] Test at landing page laster (`http://localhost:3001/`)
- [x] Test at login page laster (`http://localhost:3001/login`)
- [x] Test at signup page laster (`http://localhost:3001/signup`)
- [x] Test at booking page laster (`http://localhost:3001/book/[salon_slug]`)

#### Import Verification
- [x] Sjekk at ingen imports fra `web/` eksisterer
- [x] Sjekk at alle relative imports fungerer
- [x] Sjekk at Supabase clients fungerer

#### Ekstra fikset
- [x] Kopiert manglende utils, templates, services fra web/
- [x] Lagt til postcss.config.mjs for Tailwind
- [x] Fikset dynamisk import av email-service (resend)
- [x] Lagt til favicon (Favikon.svg)

---

### Dashboard App (`apps/dashboard`)

#### Build Test
- [x] `cd apps/dashboard && npm run type-check` - Type checking
- [x] `cd apps/dashboard && npm run build` - Production build (kompilerte vellykket)
- [x] Verifiser at build er vellykket uten errors

#### Dev Server Test
- [x] `cd apps/dashboard && npm run dev` - Start dev server
- [x] Test at server starter på port 3002
- [x] Test at dashboard page laster (krever auth)
- [x] Test at calendar page laster
- [x] Test at bookings page laster
- [x] Test at settings pages laster

#### Import Verification
- [x] Sjekk at ingen imports fra `web/` eksisterer
- [x] Sjekk at alle relative imports fungerer
- [x] Sjekk at DashboardShell fungerer

#### Ekstra fikset
- [x] Kopiert utils/, templates/, components/ fra web/
- [x] Lagt til postcss.config.mjs for Tailwind
- [x] Installert @stripe/react-stripe-js, @stripe/stripe-js
- [x] Fikset dynamisk import av email-service (resend)
- [x] Lagt til favicon (Favikon.svg)
- [x] Lagt til redirect fra / til /dashboard/
- [x] Reimplementert API-ruter for booking-bekreftelse og kansellering i dashboard (`/api/bookings/send-notifications`, `/api/bookings/send-cancellation`)

---

### Admin App (`apps/admin`)

#### Build Test
- [x] `cd apps/admin && npm run type-check` - Type checking
- [x] `cd apps/admin && npm run build` - Production build
- [x] Verifiser at build er vellykket uten errors

#### Dev Server Test
- [x] `cd apps/admin && npm run dev` - Start dev server
- [x] Test at server starter på port 3003
- [x] Test at admin page laster (krever superadmin)
- [x] Test at analytics page laster
- [x] Test at salons page laster

#### Import Verification
- [x] Sjekk at ingen imports fra `web/` eksisterer
- [x] Sjekk at alle relative imports fungerer
- [x] Sjekk at AdminShell fungerer

#### Ekstra fikset
- [x] Kopiert utils/, templates/, components/, hooks/ fra web/
- [x] Lagt til postcss.config.mjs for Tailwind
- [x] Installert tw-animate-css
- [x] Lagt til favicon (Favikon.svg)
- [x] Lagt til redirect fra / til /login
- [x] Opprettet egen Admin Login-side (/login)

---

## Common Issues to Check

### Type Errors
- [x] Sjekk for TypeScript errors i alle apper
- [x] Fikse manglende type definitions
- [x] Fikse import type errors

### Missing Dependencies
- [x] Sjekk at alle dependencies er installert
- [x] Sjekk at workspace dependencies fungerer (`@teqbook/shared`, `@teqbook/ui`)
- [x] Installer manglende dependencies

### Import Errors
- [x] Sjekk for broken imports
- [x] Fikse relative path imports
- [x] Oppdater imports til å bruke packages hvor mulig

### Environment Variables
- [x] Sjekk at `.env.local` er satt opp for hver app
- [x] Verifiser at Supabase credentials fungerer
- [x] Test at apper kan koble til Supabase

## Test Scripts

### Quick Test (alle apper)
```bash
# Fra root
npm run type-check  # Type check alle apper
npm run build       # Build alle apper
```

### Individual App Test
```bash
# Public app
cd apps/public
npm run type-check
npm run build
npm run dev

# Dashboard app
cd apps/dashboard
npm run type-check
npm run build
npm run dev

# Admin app
cd apps/admin
npm run type-check
npm run build
npm run dev
```

## Known Issues

### Redirects
- Login redirecter til `/onboarding`, `/dashboard`, `/admin` - disse er i andre apper
- Må håndteres med absolute URLs eller routing mellom apper

### Shared State
- SalonProvider og LocaleProvider er kopiert i hver app
- Kan refaktoreres til shared package senere

### Duplicated Code
- ~~Mange komponenter og services er kopiert~~ Session-service og timezone-utils er flyttet til `@teqbook/shared`
- Kan refaktoreres til packages senere (SalonProvider, auth-service, etc.)

## Success Criteria

En app er "klar" når:
- ✅ Type checking passerer
- ✅ Build er vellykket
- ✅ Dev server starter uten errors
- ✅ Ingen imports fra `web/`
- ✅ Alle routes er tilgjengelige (med riktig auth)

**Status:**
- ✅ **Public App** - KLAR
- ✅ **Dashboard App** - KLAR  
- ✅ **Admin App** - KLAR

## Next Steps After Testing

1. ~~Fikse alle errors funnet under testing~~ ✅
2. ~~Oppdater imports til å bruke packages~~ ✅ (Supabase, session-service, timezone fra @teqbook/shared)
3. ~~Refaktorer duplisert kode til packages~~ ✅ (session-service og timezone-utils i @teqbook/shared)
4. [ ] Sett opp CI/CD for alle apper
5. [ ] Deploy hver app individuelt
