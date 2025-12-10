# TeqBook – Top 1% SaaS Architecture Implementation Checklist

Mål:  
Gi TeqBook en verdensklasse prosjektstruktur som matcher de største SaaS-plattformene (Stripe, Linear, Vercel, Notion).  
Dette sikrer skalerbarhet, forutsigbarhet, lett onboarding av utviklere og minimal fremtidig teknisk gjeld.

Denne sjekklisten skal implementeres **fullt og presist**.

---

## 1. Opprett fremtidssikker mappestruktur

### 1.1. Oppdater /web/src/lib til å ha rene domene-lag

- [ ] Opprett `src/lib/types/`
  - [ ] `domain.ts` – Booking, Salon, Customer, Employee, Service, Shift, UserProfile
  - [ ] `dto.ts` – Input/output for API/service-lag
- [ ] Opprett `src/lib/repositories/`
  - [ ] Ett repository per domene (bookings, customers, employees, services, shifts)
  - [ ] Kun Supabase-kall tillates her
  - [ ] Ingen logikk, kun databaseoperasjoner
- [ ] Opprett `src/lib/services/`
  - [ ] Flytt all logikk fra pages og UI til dette laget
  - [ ] En service-fil per domene
- [ ] Opprett `src/lib/validation/`
  - [ ] zod-skjemaer eller annen validering per domene
- [ ] Opprett `src/lib/utils/`
  - [ ] Date-utils, formatting, helpers

### 1.2. Rydd i komponentstrukturen

- [ ] Opprett `src/components/ui/`
  - [ ] Buttons, Inputs, Selects, Cards, Switch, Accordion, Modal
  - [ ] Ingen domene- eller businesslogikk
- [ ] Opprett `src/components/layout/`
  - [ ] DashboardShell
  - [ ] PageHeader
  - [ ] Navigation, Sidebar, Topbar
- [ ] Opprett `src/components/domain/`
  - [ ] bookings/
  - [ ] customers/
  - [ ] employees/
  - [ ] services/
  - [ ] shifts/
- [ ] Flytt alle “smarte” komponenter hit slik at pages kun er tynne wrappers

---

## 2. Standardiser UI og design-system

### 2.1. Definer token-basert design

- [ ] Opprett egen fil: `docs/frontend/design-tokens.md`
- [ ] Opprett følgende tokens:
  - [ ] Farger: `primary`, `secondary`, `accent`, `muted`, `background`, `surface`
  - [ ] Typografi-skala
  - [ ] Radius (sm, md, lg)
  - [ ] Shadows (soft, medium, hard)
  - [ ] Spacing-steps
- [ ] Sørg for at alle tokens finnes i `tailwind.config.js`
- [ ] Fjern alle hardkodede hex-koder fra JSX

### 2.2. Bygg et skikkelig Button-API

- [ ] Variants: `primary`, `secondary`, `outline`, `ghost`, `destructive`
- [ ] Sizes: `sm`, `md`, `lg`, `icon`
- [ ] Alle knapper i hele prosjektet skal bruke denne komponenten
- [ ] Dokumenter i `docs/frontend/ui-system.md`

### 2.3. Standardiser bakgrunner og layout

- [ ] Definer 1 hovedbakgrunn for app
- [ ] Definer 1 bakgrunn for paneler
- [ ] Definer regler for gradienter (kun i spesifikke steder)
- [ ] Lag egen seksjon om bakgrunns- og layout-strategi i `ui-system.md`

---

## 3. Etabler en ekstremt tydelig arkitektur

### 3.1. Dokumentasjon av arkitektur

- [ ] Opprett `docs/architecture/overview.md`
  - [ ] Høy-nivå systemoversikt
  - [ ] Multi-tenant-modellen
  - [ ] Dataflow fra UI → Services → Repositories → Supabase
- [ ] Opprett `docs/architecture/folder-structure.md`
  - [ ] Forklar hver mappe og hvorfor den finnes
- [ ] Opprett `docs/architecture/layers.md`
  - [ ] Beskriv lag-delingsprinsipper og regler
- [ ] Opprett `docs/architecture/diagram.md`
  - [ ] Lag et mermaid-diagram med systemet

### 3.2. Dokumentasjon av backend og datamodell

- [ ] Opprett `docs/backend/data-model.md`
  - [ ] Tabelloversikt: Salon, Employees, Services, Bookings, Customers, Shifts
  - [ ] Felter + relasjoner
  - [ ] RLS-regler per tabell
  - [ ] Hvordan multi-tenant håndteres
- [ ] Oppdater `supabase/README.md` med:
  - [ ] migreringer
  - [ ] seed
  - [ ] admin scripts
  - [ ] RLS-design

---

## 4. Rydding av Supabase-bruk

### 4.1. Forbud mot Supabase i UI

- [ ] Søk gjennom hele prosjektet etter:
  - `createClient`
  - `supabase.from(`
- [ ] Fjern alle direkte kall i:
  - [ ] pages
  - [ ] komponenter
  - [ ] hooks
- [ ] Flytt alle kall til repositories
- [ ] Flytt all logikk til services

### 4.2. Opprett konsistente repository-mønstre

- [ ] Alle repositories skal:
  - [ ] ha typed input
  - [ ] returnere typed output
  - [ ] aldri returnere rå Supabase-respons
  - [ ] aldri inneholde presentasjonslogikk

---

## 5. Implementer minimum CI + testing

### 5.1. Opprett teststruktur

- [ ] Opprett `tests/unit/` og `tests/e2e/`
- [ ] Opprett tester for:
  - [ ] Booking-service
  - [ ] Customer-service
  - [ ] Employee-service
  - [ ] Public booking flow (E2E)

### 5.2. Opprett GitHub Actions workflow

- [ ] `.github/workflows/ci.yml` med:
  - [ ] install deps
  - [ ] lint
  - [ ] test
  - [ ] build

---

## 6. Opprett developer experience-dokumenter

- [ ] `CONTRIBUTING.md`
  - [ ] branch-strategi
  - [ ] pull request-prosess
  - [ ] commit-mønster
  - [ ] regler for UI
  - [ ] regler for typed services
- [ ] `docs/onboarding.md`
  - [ ] installasjon
  - [ ] miljøvariabler
  - [ ] hvordan man kjører migreringer
- [ ] `docs/processes/release-process.md`

---

## 7. Gjør prosjektet “shocking clean”

Dette er ting som gjør senior-utviklere imponert:

- [ ] Ingen “random” utils – alt strukturert i domene eller tekniske mapper
- [ ] Et 100% ferdig UI-system, ikke “løse komponenter”
- [ ] Alle side-layouter bruker felles komponenter
- [ ] Ingen inline-styles eller inline-farger
- [ ] Alle features har:
  - [ ] service
  - [ ] repository
  - [ ] types
  - [ ] dokumentasjon

---

# Bonus: Elementer som gjør prosjektet “top-tier”

- [ ] ADRs (Architecture Decision Records) under `docs/decisions/`
- [ ] Scripts for:
  - [ ] seeding
  - [ ] lokal migrering
  - [ ] resetting local DB
- [ ] Egen logikk for domain-eventer i services-laget
- [ ] “Error mapping” – egne error-typer per domene
- [ ] Konsistent interface-prefixing (`IBooking`, `ICustomer`, osv.)

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

