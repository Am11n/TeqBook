# Testing Plan for Monorepo Migration

## Oversikt

Etter route-migrering må vi teste at hver app fungerer isolert. Dette dokumentet beskriver testplanen.

## Test Checklist per App

### Public App (`apps/public`)

#### Build Test
- [ ] `cd apps/public && npm run type-check` - Type checking
- [ ] `cd apps/public && npm run build` - Production build
- [ ] Verifiser at build er vellykket uten errors

#### Dev Server Test
- [ ] `cd apps/public && npm run dev` - Start dev server
- [ ] Test at server starter på port 3001
- [ ] Test at landing page laster (`http://localhost:3001/`)
- [ ] Test at login page laster (`http://localhost:3001/login`)
- [ ] Test at signup page laster (`http://localhost:3001/signup`)
- [ ] Test at booking page laster (`http://localhost:3001/book/[salon_slug]`)

#### Import Verification
- [ ] Sjekk at ingen imports fra `web/` eksisterer
- [ ] Sjekk at alle relative imports fungerer
- [ ] Sjekk at Supabase clients fungerer

### Dashboard App (`apps/dashboard`)

#### Build Test
- [ ] `cd apps/dashboard && npm run type-check` - Type checking
- [ ] `cd apps/dashboard && npm run build` - Production build
- [ ] Verifiser at build er vellykket uten errors

#### Dev Server Test
- [ ] `cd apps/dashboard && npm run dev` - Start dev server
- [ ] Test at server starter på port 3002
- [ ] Test at dashboard page laster (krever auth)
- [ ] Test at calendar page laster
- [ ] Test at bookings page laster
- [ ] Test at settings pages laster

#### Import Verification
- [ ] Sjekk at ingen imports fra `web/` eksisterer
- [ ] Sjekk at alle relative imports fungerer
- [ ] Sjekk at DashboardShell fungerer

### Admin App (`apps/admin`)

#### Build Test
- [ ] `cd apps/admin && npm run type-check` - Type checking
- [ ] `cd apps/admin && npm run build` - Production build
- [ ] Verifiser at build er vellykket uten errors

#### Dev Server Test
- [ ] `cd apps/admin && npm run dev` - Start dev server
- [ ] Test at server starter på port 3003 (hvis konfigurert)
- [ ] Test at admin page laster (krever superadmin)
- [ ] Test at analytics page laster
- [ ] Test at salons page laster

#### Import Verification
- [ ] Sjekk at ingen imports fra `web/` eksisterer
- [ ] Sjekk at alle relative imports fungerer
- [ ] Sjekk at AdminShell fungerer

## Common Issues to Check

### Type Errors
- [ ] Sjekk for TypeScript errors i alle apper
- [ ] Fikse manglende type definitions
- [ ] Fikse import type errors

### Missing Dependencies
- [ ] Sjekk at alle dependencies er installert
- [ ] Sjekk at workspace dependencies fungerer (`@teqbook/shared`, `@teqbook/ui`)
- [ ] Installer manglende dependencies

### Import Errors
- [ ] Sjekk for broken imports
- [ ] Fikse relative path imports
- [ ] Oppdater imports til å bruke packages hvor mulig

### Environment Variables
- [ ] Sjekk at `.env.local` er satt opp for hver app
- [ ] Verifiser at Supabase credentials fungerer
- [ ] Test at apper kan koble til Supabase

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
- Mange komponenter og services er kopiert
- Kan refaktoreres til packages senere

## Success Criteria

En app er "klar" når:
- ✅ Type checking passerer
- ✅ Build er vellykket
- ✅ Dev server starter uten errors
- ✅ Ingen imports fra `web/`
- ✅ Alle routes er tilgjengelige (med riktig auth)

## Next Steps After Testing

1. Fikse alle errors funnet under testing
2. Oppdater imports til å bruke packages
3. Refaktorer duplisert kode til packages
4. Sett opp CI/CD for alle apper
5. Deploy hver app individuelt
