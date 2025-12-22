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
- [x] `/settings/billing` – plan, add-ons, fakturering.
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
- [x] Legg til `whatsapp_number` i `salons` tabellen. (SQL-fil eksisterer: `add-whatsapp-number.sql`)

## Onboarding
- [x] Legg WhatsApp-felt i onboarding (steg 1).
- [x] Valider input.

## Settings
- [x] Legg WhatsApp-felt i `/settings/general`.
- [x] Lag server action for lagring.

## Public Booking
- [x] Vis knapp "Chat on WhatsApp".
- [x] Lenke format: `https://wa.me/{number}`.

## Dashboard Header
- [x] Hurtigknapp for WhatsApp.

---


# 2. Multilingual Booking (Frontend + Dashboard)

## Status (Eksisterende)
- ✅ `preferred_language` i `salons` tabell (allerede implementert).
- ✅ `SalonProvider` setter locale automatisk fra `salons.preferred_language` (allerede implementert).
- ✅ i18n-system med 15 språk (`nb`, `en`, `ar`, `so`, `ti`, `am`, `tr`, `pl`, `vi`, `zh`, `tl`, `fa`, `dar`, `ur`, `hi`).
- ✅ Dashboard bruker allerede i18n for alle sider.

## Database
- [x] Legg til `supported_languages` array<string> i `salons` (hvilke språk salongen støtter). (SQL-fil: `add-multilingual-support.sql`)
- [x] Legg til `preferred_language` i `profiles` (bruker-nivå, for dashboard). (SQL-fil: `add-multilingual-support.sql`)
- [x] Legg til `default_language` i `salons` (standard språk for public booking). (SQL-fil: `add-multilingual-support.sql`)

## Public Booking
- [x] Språkvelger (dropdown) som:
  - [x] Leser tilgjengelige språk fra `salons.supported_languages`.
  - [x] Leser initialt språkvalg fra:
        - localStorage (tidligere valg for denne salongen)
        - ellers → salon `default_language` eller `preferred_language`.
  - [x] Ved endring:
        - [x] Lagrer valgt språk i localStorage (kan oppgraderes til Supabase senere hvis bruker er innlogget).
- [x] Oversett alle steg, knapper og feilmeldinger via i18n. (Allerede implementert)

## Dashboard
- [x] Vise og kunne endre `preferred_language` på profile-siden. (Fullført)
- [x] Vise `supported_languages` i salon-innstillinger (med CRUD). (Fullført)

## i18n
- ✅ i18n-system er allerede på plass med 15 språk.
- ✅ Dashboard leser språk fra Supabase (`salons.preferred_language`).
- [x] Last inn språk dynamisk fra i18n-filer i public booking. (Allerede implementert)
- [x] Fjern hardkodet tekst i booking-side (sjekk `public-booking-page.tsx`). (Allerede implementert)
- [x] Sikre at public booking-side leser språk fra `salons.supported_languages`. (Implementert)

---

# 3. Reports & Analytics

## Database / RPC
Lag følgende Supabase RPC-funksjoner:

- [x] `rpc_total_bookings(salon_id)` (SQL-fil: `reports-rpc-functions.sql`)
- [x] `rpc_revenue_by_month(salon_id)` (SQL-fil: `reports-rpc-functions.sql`)
- [x] `rpc_bookings_per_service(salon_id)` (SQL-fil: `reports-rpc-functions.sql`)
- [x] `rpc_capacity_utilisation(salon_id)` (SQL-fil: `reports-rpc-functions.sql`)

## UI
- [x] Lag `/reports`. (Fullført)
- [x] Total-statistikk kort. (Fullført - viser total bookings, revenue, capacity, avg duration)
- [x] Sparkline charts. (Fullført - i stat-kortene for bookings og revenue)
- [x] Filtre: ansatt, dato, tjeneste. (Fullført - dato, status, tjeneste)

## Charts
- [x] Bookings per service. (Fullført - bar chart med revenue)
- [x] Revenue over tid. (Fullført - månedlig bar chart)
- [x] Kapasitetsmåler. (Fullført - progress bar med detaljer)

---

# 4. Inventory / Product Sales

## Database
- [x] Opprett `products` tabell:
  - name
  - price
  - stock
  - sku
  - active

## UI
- [x] `/products` listevisning.
- [x] Create/Edit modal.
- [x] Delete-knapp med bekreftelse.

## Booking Integration
- [x] Velg produkter i booking-detaljer.
- [x] Lagre relasjon booking ↔ produkter.

---

# 5. Shifts (Vaktplan)

## Status (Eksisterende)
- ✅ `/shifts` side eksisterer (`web/src/app/shifts/page.tsx`).
- ✅ `shifts` tabell med `salon_id`, `employee_id`, `start_time`, `end_time` (allerede implementert).
- ✅ `getShiftsForCurrentSalon()`, `createShift()`, `deleteShift()` i `shifts` repository.
- ✅ Basic CRUD funksjonalitet er på plass.

## UI Forbedringer
- [x] Ukevisning grid (i stedet for listevisning).
- [x] Drag-to-create shift (interaktiv kalender) - klikk på celle for å opprette.
- [x] Edit shift modal (forbedre eksisterende).
- [x] Visualisering av overlappende shifts.

## Logic
- [x] Hindre overlapp (validering ved opprettelse/oppdatering).
- [x] Advarsel om underbemanning (når ingen ansatte er tilgjengelig).
- [x] Markér bookinger uten ansatte tilgjengelig.
- [x] Integrer med availability-logikk for booking (generate_availability RPC bruker shifts).

---

# 6. Roller & Tilganger

## Status (Eksisterende)
- ✅ `role` felt i `employees` tabell (allerede implementert, se `web/src/lib/types.ts`).
- ✅ `role` vises i Employees-listen (sjekk `web/src/app/employees/page.tsx`).

## Database
- [x] Verifiser at `role` støtter: `owner`, `manager`, `staff` (eller utvid hvis nødvendig).
- [x] Legg til `role` i `profiles` for bruker-nivå tilgang (hvis ikke allerede).

## Backend
- [x] Middleware/helper for tilgangskontroll:
  - `staff` → begrenset tilgang (kun egne bookinger, ingen settings).
  - `manager` → delvis tilgang (kan se alle bookinger, ingen billing).
  - `owner` → full tilgang (alle funksjoner).
- [ ] RLS policies basert på rolle (hvis nødvendig) - kan legges til senere hvis nødvendig.

## UI
- [x] Rollevelger i Employees-listen (forbedre eksisterende) - dropdown i stedet for tekst-input.
- [x] Skjul sidebar items basert på rolle (i `DashboardShell`).
- [x] Vis tilgangsnivå i user badge.
- [x] Role selector i Settings/General page.

---

# 7. Accounting & Exports

## Exports
- [x] Bookinger CSV.
- [x] Omsetning CSV.
- [x] Ansatte arbeidsmengde CSV.

## UI
- [x] `/reports/export` side.
- [x] Tre CSV-knapper.
- [x] Toast-melding "File exported".

---

# 8. Add-ons System + Plan Limits

## Database
- [x] `addons` tabell:
  - salon_id
  - type
  - qty
  - (SQL-fil: `add-addons-and-plan-limits.sql`)

## Plan Limits
- Starter: 2 ansatte, 2 språk  
- Pro: 5 ansatte, 5 språk  
- Business: ubegrenset

## Logic
- [x] Sjekk staff-limit ved ny ansatt.
- [ ] Vis "Upgrade or add seat" modal (kan legges til senere).
- [x] Sjekk språk-limit når salongen forsøker å legge til flere språk enn plan + addons tillater.

## UI
- [x] Add-ons-seksjon på `/settings/billing`.

---

# 9. Branding Editor (Custom Themes)

## Database
- [x] `theme` JSON:
  - primary
  - secondary
  - font
  - presets
  - (SQL-fil: `add-branding-theme.sql`)

## UI
- [x] `/settings/branding`
- [x] Fargevelgere
- [x] Logo-opplasting (file upload + URL)
- [x] Live preview av booking-side
- [x] Preset themes

---

# 10. SaaS Admin Panel

## UI
- [x] Lag `/admin` rot-side.
- [x] Oversikt:
  - Salonger (med plan, status, stats)
  - Brukere
  - Planer (vises i salon-tabellen)
  - Add-ons (vises i usage stats)

## Features
- [x] Endre plan manuelt.
- [ ] Lås opp features (kan legges til senere via custom_feature_overrides).
- [x] Deaktiver en salong (via is_public toggle).
- [x] Vis usage-statistikk (employees, bookings, customers, services, add-ons).

---

# 11. Billing Skeleton (for fremtidig Stripe)

## Database
- [x] `billing_customer_id` (text i `salons`). (SQL-fil: `add-billing-fields.sql`)
- [x] `billing_subscription_id` (text i `salons`). (SQL-fil: `add-billing-fields.sql`)
- [x] `current_period_end` (timestamp i `salons`). (SQL-fil: `add-billing-fields.sql`)
- [x] `trial_end` (timestamp i `salons`). (SQL-fil: `add-billing-fields.sql`)
- [x] `plan` (text i `salons`: `starter`, `pro`, `business`). (Allerede implementert i seksjon 8)

## API
- [x] Endepunkt `createCustomer` (Supabase Edge Function skeleton). (`billing-create-customer`)
- [x] `createSubscription` (Supabase Edge Function skeleton). (`billing-create-subscription`)
- [x] `updatePlan` (Supabase Edge Function skeleton). (`billing-update-plan`)
- [x] Webhook handler for Stripe events (subscription updated, cancelled, etc.). (`billing-webhook`)

## Stripe Integration
- [x] Stripe SDK integrert i alle Edge Functions
- [x] Stripe Elements integrert i test-siden (`/test-billing`)
- [x] Betalingsbekreftelse fungerer med Stripe Elements
- [x] Plan-oppgradering fungerer
- [x] Webhook-håndtering implementert

**Status:** ✅ Fullstendig implementert og testet!

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
- [x] Email confirmation ved booking (valgfritt felt) - email felt allerede i booking form.
- [x] Booking confirmation page med detaljer.

## Booking Cancellation
- [x] Cancel booking flow (fra confirmation email).
- [x] Cancel booking fra dashboard.
- [x] Cancellation reason (valgfritt).

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
