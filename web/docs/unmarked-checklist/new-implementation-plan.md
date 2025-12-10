# TeqBook – Full Feature Roadmap (Cursor-Ready)
Denne filen inneholder alle funksjonene som må implementeres for å gjøre TeqBook komplett.  
Hver modul kan arbeides på i vilkårlig rekkefølge.  
Alle punkter er bygget for Cursor AI med små, tydelige tasks.  
All vedvarende state (språk, preferanser osv.) skal lagres i Supabase, ikke i localStorage.

---

# 0. Foundation (må være på plass først)

## SaaS Admin Framework
- [x] Legg til `is_superadmin` i `profiles`.
- [x] Opprett `/admin` dashboard.
- [x] Vis alle salonger, brukere og planer (planer vises når billing er implementert).
- [x] Gi superadmin full tilgang til alle funksjoner i TeqBook (via is_superadmin check).

## Settings Infrastructure
- [x] Opprett `/settings` layout med tabs (general, notifications, billing, branding).
- [x] `/settings/general` – generelle salon-innstillinger (navn, type, WhatsApp, etc.).
- [x] `/settings/notifications` – notification preferences (email).
- [ ] `/settings/billing` – plan, add-ons, fakturering.
- [x] `/settings/branding` – tema, logo, farger.
- [x] Server actions for lagring av innstillinger (general og notifications settings).

## Database Migration Strategy
- [x] Alle SQL-endringer skal være i `web/supabase/` mappen.
- [x] Hver modul skal ha egen SQL-fil (f.eks. `whatsapp-integration.sql`).
- [x] SQL-filer skal være idempotent (bruk `IF NOT EXISTS`, `DROP IF EXISTS`).
- [x] Dokumenter alle schema-endringer i SQL-filene (se `supabase/README.md`).

## Edge Functions Setup (for fremtidig bruk)
- [x] Opprett `supabase/functions/` struktur.
- [x] Setup for WhatsApp Edge Functions.
- [x] Authentication middleware for Edge Functions.

---

# 1. WhatsApp Integrasjon

## Database
- [ ] Legg til `whatsapp_number` i `salons` tabellen.

## Onboarding
- [ ] Legg WhatsApp-felt i onboarding (steg 1).
- [ ] Valider input.

## Settings
- [ ] Legg WhatsApp-felt i `/settings/general`.
- [ ] Lag server action for lagring.

## Public Booking
- [ ] Vis knapp “Chat on WhatsApp”.
- [ ] Lenke format: `https://wa.me/{number}`.

## Dashboard Header
- [ ] Hurtigknapp for WhatsApp.

---


# 2. Multilingual Booking (Frontend + Dashboard)

## Status (Eksisterende)
- ✅ `preferred_language` i `salons` tabell (allerede implementert).
- ✅ `SalonProvider` setter locale automatisk fra `salons.preferred_language` (allerede implementert).
- ✅ i18n-system med 15 språk (`nb`, `en`, `ar`, `so`, `ti`, `am`, `tr`, `pl`, `vi`, `zh`, `tl`, `fa`, `dar`, `ur`, `hi`).
- ✅ Dashboard bruker allerede i18n for alle sider.

## Database
- [ ] Legg til `supported_languages` array<string> i `salons` (hvilke språk salongen støtter).
- [ ] Legg til `preferred_language` i `profiles` (bruker-nivå, for dashboard).
- [ ] (Evt.) Egen `booking_preferences` tabell for siste-valgt språk per bruker/salong-kombinasjon.

## Public Booking
- [ ] Språkvelger (dropdown) som:
  - [ ] Leser tilgjengelige språk fra `salons.supported_languages`.
  - [ ] Leser initialt språkvalg fra:
        - logget inn bruker → `profiles.preferred_language`
        - ellers → salon default-språk.
  - [ ] Ved endring:
        - [ ] Kaller server action / Supabase update for å lagre valgt språk for bruker (hvis innlogget).
- [ ] Oversett alle steg, knapper og feilmeldinger via i18n.

## Dashboard
- [ ] Vise og kunne endre `preferred_language` på profile-siden.
- [ ] Vise `supported_languages` i salon-innstillinger (med CRUD).

## i18n
- ✅ i18n-system er allerede på plass med 15 språk.
- ✅ Dashboard leser språk fra Supabase (`salons.preferred_language`).
- [ ] Last inn språk dynamisk fra i18n-filer i public booking.
- [ ] Fjern hardkodet tekst i booking-side (sjekk `public-booking-page.tsx`).
- [ ] Sikre at public booking-side leser språk fra `salons.supported_languages`.

---

# 3. Reports & Analytics

## Database / RPC
Lag følgende Supabase RPC-funksjoner:

- [ ] `rpc_total_bookings(salon_id)`
- [ ] `rpc_revenue_by_month(salon_id)`
- [ ] `rpc_bookings_per_service(salon_id)`
- [ ] `rpc_capacity_utilisation(salon_id)`

## UI
- [ ] Lag `/reports`.
- [ ] Total-statistikk kort.
- [ ] Sparkline charts.
- [ ] Filtre: ansatt, dato, tjeneste.

## Charts
- [ ] Bookings per service.
- [ ] Revenue over tid.
- [ ] Kapasitetsmåler.

---

# 4. Inventory / Product Sales

## Database
- [ ] Opprett `products` tabell:
  - name
  - price
  - stock
  - sku
  - active

## UI
- [ ] `/products` listevisning.
- [ ] Create/Edit modal.
- [ ] Delete-knapp med bekreftelse.

## Booking Integration
- [ ] Velg produkter i booking-detaljer.
- [ ] Lagre relasjon booking ↔ produkter.

---

# 5. Shifts (Vaktplan)

## Status (Eksisterende)
- ✅ `/shifts` side eksisterer (`web/src/app/shifts/page.tsx`).
- ✅ `shifts` tabell med `salon_id`, `employee_id`, `start_time`, `end_time` (allerede implementert).
- ✅ `getShiftsForCurrentSalon()`, `createShift()`, `deleteShift()` i `shifts` repository.
- ✅ Basic CRUD funksjonalitet er på plass.

## UI Forbedringer
- [ ] Ukevisning grid (i stedet for listevisning).
- [ ] Drag-to-create shift (interaktiv kalender).
- [ ] Edit shift modal (forbedre eksisterende).
- [ ] Visualisering av overlappende shifts.

## Logic
- [ ] Hindre overlapp (validering ved opprettelse/oppdatering).
- [ ] Advarsel om underbemanning (når ingen ansatte er tilgjengelig).
- [ ] Markér bookinger uten ansatte tilgjengelig.
- [ ] Integrer med availability-logikk for booking.

---

# 6. Roller & Tilganger

## Status (Eksisterende)
- ✅ `role` felt i `employees` tabell (allerede implementert, se `web/src/lib/types.ts`).
- ✅ `role` vises i Employees-listen (sjekk `web/src/app/employees/page.tsx`).

## Database
- [ ] Verifiser at `role` støtter: `owner`, `manager`, `staff` (eller utvid hvis nødvendig).
- [ ] Legg til `role` i `profiles` for bruker-nivå tilgang (hvis ikke allerede).

## Backend
- [ ] Middleware/helper for tilgangskontroll:
  - `staff` → begrenset tilgang (kun egne bookinger, ingen settings).
  - `manager` → delvis tilgang (kan se alle bookinger, ingen billing).
  - `owner` → full tilgang (alle funksjoner).
- [ ] RLS policies basert på rolle (hvis nødvendig).

## UI
- [ ] Rollevelger i Employees-listen (forbedre eksisterende).
- [ ] Skjul sidebar items basert på rolle (i `DashboardShell`).
- [ ] Vis tilgangsnivå i user badge.

---

# 7. Accounting & Exports

## Exports
- [ ] Bookinger CSV.
- [ ] Omsetning CSV.
- [ ] Ansatte arbeidsmengde CSV.

## UI
- [ ] `/reports/export` side.
- [ ] Tre CSV-knapper.
- [ ] Toast-melding “File exported”.

---

# 8. Add-ons System + Plan Limits

## Database
- [ ] `addons` tabell:
  - salon_id
  - type
  - qty

## Plan Limits
- Starter: 2 ansatte, 2 språk  
- Pro: 5 ansatte, 5 språk  
- Business: ubegrenset

## Logic
- [ ] Sjekk staff-limit ved ny ansatt.
- [ ] Vis “Upgrade or add seat” modal.
- [ ] Sjekk språk-limit når salongen forsøker å legge til flere språk enn plan + addons tillater.

## UI
- [ ] Add-ons-seksjon på `/settings/billing`.

---

# 9. Branding Editor (Custom Themes)

## Database
- [ ] `theme` JSON:
  - primary
  - secondary
  - font
  - presets

## UI
- [ ] `/settings/branding`
- [ ] Fargevelgere
- [ ] Logo-opplasting
- [ ] Live preview av booking-side

---

# 10. SaaS Admin Panel

## UI
- [ ] Lag `/admin` rot-side.
- [ ] Oversikt:
  - Salonger
  - Brukere
  - Ansatte
  - Planer
  - Add-ons

## Features
- [ ] Endre plan manuelt.
- [ ] Lås opp features.
- [ ] Deaktiver en salong.
- [ ] Vis usage-statistikk.

---

# 11. Billing Skeleton (for fremtidig Stripe)

## Database
- [ ] `billing_customer_id` (text i `salons`).
- [ ] `billing_subscription_id` (text i `salons`).
- [ ] `current_period_end` (timestamp i `salons`).
- [ ] `trial_end` (timestamp i `salons`).
- [ ] `plan` (text i `salons`: `starter`, `pro`, `business`).

## API
- [ ] Endepunkt `createCustomer` (Supabase Edge Function eller server action).
- [ ] `createSubscription` (Supabase Edge Function).
- [ ] `updatePlan` (Supabase Edge Function).
- [ ] Webhook handler for Stripe events (subscription updated, cancelled, etc.).

---

# 12. Testing Strategy

## Unit Tests
- [ ] Setup testing framework (Vitest eller Jest).
- [ ] Test repository functions (`getEmployeesForCurrentSalon`, etc.).
- [ ] Test utility functions.

## Integration Tests
- [ ] Test Supabase RPC functions.
- [ ] Test booking flow end-to-end.
- [ ] Test onboarding flow.

## E2E Tests
- [ ] Setup Playwright eller Cypress.
- [ ] Test kritiske flows:
  - [ ] Onboarding → Create salon → Add employee → Create booking.
  - [ ] Public booking flow.
  - [ ] Login → Dashboard navigation.

## Error Handling
- [ ] Standardiser error handling patterns.
- [ ] Error boundaries for React components.
- [ ] User-friendly error messages (i18n).
- [ ] Logging strategy (Sentry eller lignende).

---

# 13. Public Booking Enhancements

## Booking Confirmation
- [ ] Email confirmation ved booking (valgfritt felt).
- [ ] Booking confirmation page med detaljer.

## Booking Cancellation
- [ ] Cancel booking flow (fra confirmation email).
- [ ] Cancel booking fra dashboard.
- [ ] Cancellation reason (valgfritt).

## Customer History
- [ ] Vis tidligere bookinger i public booking (hvis innlogget).
- [ ] Quick rebooking fra historikk.

---

# Fullføringsstatus
Bruk checkboxes for hver del.  
Cursor Agent tar én seksjon av gangen til den er ferdig.

---

# Prioriteringsforslag

## Høy prioritet (første fase)
1. **#0 Foundation** – SaaS Admin, Settings Infrastructure, Migration Strategy
2. **#8 Add-ons System** – Nødvendig for monetisering og plan limits
3. **#2 Multilingual Booking** – Delvis ferdig, raskt å fullføre
4. **#1 WhatsApp** – Enkel integrasjon, høy verdi for brukere

## Medium prioritet (andre fase)
5. **#3 Reports & Analytics** – Viktig for salonger
6. **#6 Roller & Tilganger** – Utvide eksisterende `role`-felt
7. **#5 Shifts** – Forbedre eksisterende side med drag-to-create
8. **#7 Accounting & Exports** – CSV-eksport
9. **#13 Public Booking Enhancements** – Confirmation, cancellation

## Lavere prioritet (tredje fase)
10. **#4 Inventory / Product Sales** – Nice-to-have
11. **#9 Branding Editor** – Advanced feature
12. **#11 Billing Skeleton** – Når Stripe-integrasjon er klar
13. **#12 Testing Strategy** – Kontinuerlig forbedring

---
