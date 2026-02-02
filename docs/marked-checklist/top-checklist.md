# TeqBook – Top 1% SaaS Architecture Implementation Checklist

Mål:  
Gi TeqBook en verdensklasse prosjektstruktur som matcher de største SaaS-plattformene (Stripe, Linear, Vercel, Notion).  
Dette sikrer skalerbarhet, forutsigbarhet, lett onboarding av utviklere og minimal fremtidig teknisk gjeld.

Denne sjekklisten skal implementeres **fullt og presist**.

---

## 1. Opprett fremtidssikker mappestruktur ✅

### 1.1. Oppdater /apps/dashboard/src/lib til å ha rene domene-lag ✅

- [x] Opprett `src/lib/types/` ✅
  - [x] `domain.ts` – Booking, Salon, Customer, Employee, Service, Shift, UserProfile ✅
  - [x] `dto.ts` – Input/output for API/service-lag ✅
  - [x] `index.ts` – Central export point ✅
- [x] Opprett `src/lib/repositories/` ✅
  - [x] Ett repository per domene (bookings, customers, employees, services, shifts) ✅
  - [x] Kun Supabase-kall tillates her ✅
  - [x] Ingen logikk, kun databaseoperasjoner ✅
  - [x] Opprettet `opening-hours.ts` repository ✅
- [x] Opprett `src/lib/services/` ✅
  - [x] Flytt all logikk fra pages og UI til dette laget ✅
  - [x] En service-fil per domene ✅
- [x] Opprett `src/lib/validation/` ✅
  - [x] Validering per domene (bookings, employees, services, customers) ✅
  - [x] `index.ts` – Central export point ✅
- [x] Opprett `src/lib/utils/` ✅
  - [x] Date-utils, formatting, helpers (eksisterer allerede) ✅

### 1.2. Rydd i komponentstrukturen ✅

- [x] Opprett `src/components/ui/` ✅
  - [x] Buttons, Inputs, Selects, Cards, Switch, Accordion, Modal ✅
  - [x] Ingen domene- eller businesslogikk ✅
- [x] Opprett `src/components/layout/` ✅
  - [x] DashboardShell ✅
  - [x] PageHeader ✅
  - [x] FormLayout ✅
  - [x] Section ✅
- [x] Opprett `src/components/domain/` ✅
  - [x] bookings/ ✅
  - [x] customers/ ✅
  - [x] employees/ ✅
  - [x] services/ ✅
  - [x] shifts/ ✅
- [x] Flytt alle "smarte" komponenter hit slik at pages kun er tynne wrappers ✅
  - [x] Oppdatert alle imports til nye paths ✅

---

## 2. Standardiser UI og design-system ✅

### 2.1. Definer token-basert design ✅

- [x] Opprett egen fil: `docs/frontend/design-tokens.md` ✅
- [x] Opprett følgende tokens: ✅
  - [x] Farger: `primary`, `secondary`, `accent`, `muted`, `background`, `surface` ✅
  - [x] Typografi-skala ✅
  - [x] Radius (sm, md, lg) ✅
  - [x] Shadows (soft, medium, hard) ✅
  - [x] Spacing-steps ✅
- [x] Sørg for at alle tokens finnes i CSS-variabler (via `globals.css`) ✅
- [x] Fjern alle hardkodede hex-koder fra JSX ✅
  - [x] Erstattet alle hex-koder i landing/page.tsx ✅
  - [x] Erstattet alle hex-koder i dashboard/page.tsx ✅
  - [x] Erstattet alle hex-koder i onboarding/page.tsx ✅
  - [x] Erstattet alle hex-koder i signup/page.tsx ✅
  - [x] Erstattet alle hex-koder i login/page.tsx ✅
  - [x] Erstattet alle hex-koder i dashboard-shell.tsx ✅
  - [x] Erstattet alle hex-koder i command-palette.tsx ✅
  - [x] Erstattet alle hex-koder i notification-center.tsx ✅

### 2.2. Bygg et skikkelig Button-API ✅

- [x] Variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link` ✅
- [x] Sizes: `sm`, `default`, `lg`, `icon`, `icon-sm`, `icon-lg` ✅
- [x] Alle knapper i hele prosjektet skal bruke denne komponenten ✅
- [x] Dokumenter i `docs/frontend/ui-system.md` ✅

### 2.3. Standardiser bakgrunner og layout ✅

- [x] Definer 1 hovedbakgrunn for app (`--background`) ✅
- [x] Definer 1 bakgrunn for paneler (`--card`) ✅
- [x] Definer regler for gradienter (kun i spesifikke steder) ✅
- [x] Lag egen seksjon om bakgrunns- og layout-strategi i `ui-system.md` ✅

---

## 3. Etabler en ekstremt tydelig arkitektur ✅

### 3.1. Dokumentasjon av arkitektur ✅

- [x] Opprett `docs/architecture/overview.md` ✅
  - [x] Høy-nivå systemoversikt ✅
  - [x] Multi-tenant-modellen ✅
  - [x] Dataflow fra UI → Services → Repositories → Supabase ✅
- [x] Opprett `docs/architecture/folder-structure.md` ✅
  - [x] Forklar hver mappe og hvorfor den finnes ✅
- [x] Opprett `docs/architecture/layers.md` ✅
  - [x] Beskriv lag-delingsprinsipper og regler ✅
- [x] Opprett `docs/architecture/diagram.md` ✅
  - [x] Lag et mermaid-diagram med systemet ✅

### 3.2. Dokumentasjon av backend og datamodell ✅

- [x] Opprett `docs/backend/data-model.md` ✅
  - [x] Tabelloversikt: Salon, Employees, Services, Bookings, Customers, Shifts ✅
  - [x] Felter + relasjoner ✅
  - [x] RLS-regler per tabell ✅
  - [x] Hvordan multi-tenant håndteres ✅
- [x] Oppdater `supabase/README.md` med: ✅
  - [x] migreringer ✅
  - [x] admin scripts ✅
  - [x] RLS-design ✅

---

## 4. Rydding av Supabase-bruk ✅

### 4.1. Forbud mot Supabase i UI ✅

- [x] Søk gjennom hele prosjektet etter: ✅
  - [x] `createClient` - Kun i `supabase-client.ts` (forventet) ✅
  - [x] `supabase.from(` - Flyttet til repositories ✅
- [x] Fjern alle direkte kall i: ✅
  - [x] pages - Ingen direkte kall funnet ✅
  - [x] komponenter - `salon-provider.tsx` bruker Supabase for auth (akseptabelt for provider) ✅
  - [x] hooks - Ingen direkte kall funnet ✅
- [x] Flytt alle kall til repositories ✅
  - [x] Opprettet `admin.ts` repository for RPC-kall ✅
  - [x] Opprettet `search.ts` repository for søk-operasjoner ✅
  - [x] Opprettet `opening-hours.ts` repository ✅
  - [x] Lagt til `createSalonForCurrentUser` i `salons.ts` repository ✅
- [x] Flytt all logikk til services ✅
  - [x] Refaktorert `onboarding-service.ts` ✅
  - [x] Refaktorert `admin-service.ts` ✅
  - [x] Refaktorert `search-service.ts` ✅

### 4.2. Opprett konsistente repository-mønstre ✅

- [x] Alle repositories skal: ✅
  - [x] ha typed input ✅
  - [x] returnere typed output ✅
  - [x] aldri returnere rå Supabase-respons ✅
  - [x] aldri inneholde presentasjonslogikk ✅

---

## 5. Implementer minimum CI + testing ✅

### 5.1. Opprett teststruktur ✅

- [x] Opprett `tests/unit/` og `tests/e2e/` ✅
- [x] Opprett tester for: ✅
  - [x] Booking-service ✅
  - [x] Customer-service ✅
  - [x] Employee-service ✅
  - [x] Public booking flow (E2E) ✅

### 5.2. Opprett GitHub Actions workflow ✅

- [x] `.github/workflows/ci.yml` med: ✅
  - [x] install deps ✅
  - [x] lint ✅
  - [x] test ✅
  - [x] build ✅
  - [x] E2E tests ✅

---

## 6. Opprett developer experience-dokumenter ✅

- [x] `CONTRIBUTING.md` ✅
  - [x] branch-strategi ✅
  - [x] pull request-prosess ✅
  - [x] commit-mønster ✅
  - [x] regler for UI ✅
  - [x] regler for typed services ✅
  - [x] code review krav ✅
  - [x] deployment-instruksjoner ✅
- [x] `docs/onboarding.md` ✅
  - [x] installasjon ✅
  - [x] miljøvariabler ✅
  - [x] hvordan man kjører migreringer ✅
- [x] `docs/processes/release-process.md` ✅
  - [x] Release-strategi ✅
  - [x] Pre-release checklist ✅
  - [x] Release-prosess ✅
  - [x] Hotfix-prosess ✅
  - [x] Rollback-prosess ✅

---

## 7. Gjør prosjektet "shocking clean" ✅

Dette er ting som gjør senior-utviklere imponert:

- [x] Ingen "random" utils – alt strukturert i domene eller tekniske mapper ✅
  - [x] `utils.ts` inneholder kun teknisk utility (`cn()` for Tailwind) ✅
  - [x] Validering er organisert i `src/lib/validation/` ✅
  - [x] Types er organisert i `src/lib/types/` ✅
- [x] Et 100% ferdig UI-system, ikke "løse komponenter" ✅
  - [x] Alle base-komponenter i `src/components/ui/` ✅
  - [x] Layout-komponenter i `src/components/layout/` ✅
  - [x] Domain-komponenter i `src/components/domain/` ✅
- [x] Alle side-layouter bruker felles komponenter ✅
  - [x] DashboardShell brukes konsekvent ✅
  - [x] PageHeader brukes konsekvent ✅
- [x] Ingen inline-styles eller inline-farger ✅
  - [x] Alle hex-koder erstattet med design tokens ✅
  - [x] Inline styles kun for dynamiske verdier (animasjon-delays, dynamiske høyder) ✅
- [x] Alle features har: ✅
  - [x] service ✅ (11 services: bookings, customers, employees, services, shifts, salons, profiles, auth, admin, onboarding, search)
  - [x] repository ✅ (11 repositories: bookings, customers, employees, services, shifts, salons, profiles, admin, search, opening-hours, types)
  - [x] types ✅ (organisert i `src/lib/types/domain.ts` og `dto.ts`)
  - [x] dokumentasjon ✅ (docs/architecture/, docs/backend/, docs/frontend/, docs/features/)

---

# Bonus: Elementer som gjør prosjektet "top-tier" ✅

- [x] ADRs (Architecture Decision Records) under `docs/decisions/` ✅
  - [x] ADR-0001: Layered Architecture Pattern ✅
  - [x] ADR-0002: Supabase as Backend-as-a-Service ✅
  - [x] ADR-0003: Repository Pattern for Data Access ✅
  - [x] ADR-0004: Service Layer for Business Logic ✅
  - [x] README.md med ADR-oversikt ✅
- [x] Scripts for: ✅
  - [x] seeding (`scripts/seed.ts`) ✅
  - [x] lokal migrering (`scripts/migrate-local.ts`) ✅
  - [x] resetting local DB (`scripts/reset-db.ts`) ✅
  - [x] Scripts dokumentert i `scripts/README.md` ✅
  - [x] NPM scripts lagt til i `package.json` ✅
- [x] Egen logikk for domain-eventer i services-laget ✅
  - [x] `src/lib/events/domain-events.ts` opprettet ✅
  - [x] Event types for alle domener (Booking, Customer, Employee, Service) ✅
  - [x] DomainEventBus for event publishing/handling ✅
  - [x] Event handler interface definert ✅
- [x] "Error mapping" – egne error-typer per domene ✅
  - [x] `src/lib/errors/domain-errors.ts` opprettet ✅
  - [x] DomainError base class ✅
  - [x] BookingError, CustomerError, EmployeeError, ServiceError, SalonError ✅
  - [x] Error codes per domene ✅
  - [x] Error mapping utilities ✅
- [x] Konsistent interface-prefixing (`IBooking`, `ICustomer`, osv.) ✅
  - [x] `src/lib/types/interfaces.ts` opprettet ✅
  - [x] Interface-versjoner av alle domain types (IBooking, ICustomer, etc.) ✅
  - [x] Dokumentert i `domain.ts` ✅

---

## Når alt er implementert:

TeqBook vil da ha en struktur som matcher profesjonelle SaaS-plattformer.  
Ingen indie SaaS gjør dette.  
Ingen junior dev gjør dette.  
Mange senior devs gjør det ikke engang.

Dette nivået gjør prosjektet ditt:

- lett å utvide  
- lett å overlevere  
- lett å dokumentere  
- skalerbart  
- ekstremt profesjonelt synlig under code review  

