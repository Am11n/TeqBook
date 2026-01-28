# TeqBook – Supabase-Architecture Cleanup Checklist

Mål:  
Fjerne all direkte bruk av Supabase-klient i UI-laget, etablere et tydelig service-lag, og sikre at all datatilgang og forretningslogikk går via `services` → `repositories` → Supabase.

Arkitekturprinsipp:

- UI (pages, components)  
  → Services (`src/lib/services/*`)  
  → Repositories (`src/lib/repositories/*`)  
  → Supabase-klient (`src/lib/supabase-client.ts`)

Ingen komponent eller page skal importere Supabase-klienten direkte.

---

## 1. Kartlegging av nåværende Supabase-bruk

- [x] Søk globalt i prosjektet etter Supabase-importer:

  - [x] Finn alle forekomster av:
    - `createClient` fra `@/lib/supabase-client`
    - `createBrowserClient` / `createServerClient` hvis aktuelt
    - Direkte `@supabase/supabase-js` imports

  - [x] Lag en liste over filer som inneholder disse importene, og noter:
    - [x] Om filen ligger i `src/app/` (page/route)
    - [x] Om filen ligger i `src/components/`
    - [x] Om filen ligger i `src/lib/repositories/`
    - [x] Om filen ligger i `src/lib/*` ellers

- [x] Klassifiser hver fil som:
  - [x] UI-lag (pages + components)
  - [x] Service-lag (skal ligge i `src/lib/services/`)
  - [x] Repository-lag (skal ligge i `src/lib/repositories/`)
  - [x] Infrastruktur (supabase-klient, types, utils)

---

## 2. Definer klare lag og grenser

- [x] Opprett (eller bekreft eksistensen av) følgende mapper:

  - [x] `src/lib/repositories/`
  - [x] `src/lib/services/`
  - [x] `src/lib/types.ts`
  - [x] `src/lib/supabase-client.ts`

- [x] Dokumenter lag-inndelingen i egen fil:
  - [x] Opprett `docs/architecture/layers.md`
  - [x] Beskriv:
    - [x] UI-lag: kun presentasjon, kaller services.
    - [x] Services-lag: forretningslogikk, orkestrering av kall.
    - [x] Repository-lag: rene databasekall mot Supabase.
    - [x] Supabase-klient: definert ett sted, brukes kun i repositories.

---

## 3. Forbud mot direkte Supabase i UI-laget ✅

### 3.1. Identifiser brudd i UI-laget

- [x] Gå gjennom alle filer i:
  - [x] `src/app/**`
  - [x] `src/components/**`

- [x] For hver fil i UI-laget:
  - [x] Sjekk om det importeres Supabase-klient eller `@supabase/supabase-js`.
  - [x] Sjekk om det gjøres kall som `.from(...)`, `.auth`, `.rpc`, `.insert`, `.update`, osv.

- [x] Lag en konkret liste over "UI-filer som må refaktoreres", f.eks. i:
  - [x] `docs/cleanup/supabase-ui-usages.md`

### 3.2. Fjern direkte Supabase-kall fra UI

For hver UI-fil som har Supabase-kall:

- [x] Identifiser hva kallet gjør:
  - [x] Hvilken tabell / view / RPC?
  - [x] Hvilke parametere tas imot?
  - [x] Hvilken shape har return-data?
  - [x] Hvilken logikk ligger rundt (validering, mapping, filtrering)?

- [x] Fjern direkte Supabase-importen:
  - [x] `import { createClient } from "@/lib/supabase-client";` skal ikke lenger være i UI-filer.
  - [x] Ingen `supabase.from(...)` i UI.

- [x] Opprett/bruk en passende service-funksjon i `src/lib/services/`:
  - [x] Gi funksjonen et meningsfullt navn, f.eks.:
    - `fetchBookingsForCurrentSalon`
    - `createCustomerForSalon`
    - `getEmployeeSchedule`
  - [x] Flytt forretningslogikken (validering, filtrering, mapping) inn i service-funksjonen.
  - [x] La service-funksjonen kalle et repository i stedet for Supabase direkte.

- [x] Oppdater UI-filen til å bruke service-funksjonen:
  - [x] Importer fra `@/lib/services/...`
  - [x] Håndter loading / error / data basert på service-output (ikke Supabase-respons direkte).

---

## 4. Rydding og standardisering av repository-laget ✅

### 4.1. Sikre at alle Supabase-kall ligger i repositories

- [x] Gå gjennom alle filer i `src/lib/repositories/`:

  - [x] Verifiser at:
    - [x] Kun repositories importerer `supabase-client`.
    - [x] Alle databasekall gjøres gjennom Supabase-klienten her.
    - [x] Ingen UI-spesifikk logikk (f.eks. toasts, router, redirect) finnes i repositories.

- [x] For hvert repository:
  - [x] Gi filen et domain-orientert navn:
    - `bookings.ts` ✅
    - `employees.ts` ✅
    - `services.ts` ✅
    - `customers.ts` ✅
    - `shifts.ts` ✅
    - `salons.ts` ✅
    - `profiles.ts` ✅

  - [x] Standardiser signaturen til funksjonene:
    - [x] Input-typer definert i `src/lib/types.ts` (eller egne `types`-filer).
    - [x] Return-typer er typed og konsistente:
      - `Promise<{ data: T | null; error: string | null }>`
      - `Promise<{ data: T[] | null; error: string | null; total?: number }>` (med paginering)
      - `Promise<{ error: string | null }>` (for delete-operasjoner)

  - [x] Sørg for at all Supabase-bruk:
    - [x] Har eksplisitte select-felter der det er nødvendig.
    - [x] Har tydelig håndtering av `error`.
    - [x] Ikke eksponerer Supabase-respons direkte til UI-laget.

### 4.2. Dokumentasjon

- [x] Opprett `docs/architecture/repository-standards.md` med:
  - [x] Filnavn-konvensjoner
  - [x] Return-type standarder
  - [x] Error-håndtering regler
  - [x] Best practices
  - [x] Eksempler

- [x] Opprett `docs/cleanup/repository-audit.md` med:
  - [x] Verifisering av alle standarder
  - [x] Status på hvert repository

---

## 5. Etablering av service-laget

### 5.1. Opprett services per domene

- [x] Opprett (eller utvid) følgende filer i `src/lib/services/`:

  - [x] `bookings-service.ts`
  - [x] `employees-service.ts`
  - [x] `customers-service.ts`
  - [x] `services-service.ts` (eller `salon-services-service.ts`)
  - [x] `shifts-service.ts`
  - [x] Evt. `auth-service.ts` for brukerrelaterte operasjoner

### 5.2. Flytt forretningslogikk til services

For hver UI-flow (f.eks. "opprette booking"):

- [x] Identifiser all forretningslogikk i UI:
  - [x] Validering (f.eks. starttid før sluttid, overlappende bookings, kapasitet).
  - [x] Hvilke felter som må settes (salon_id, user_id, employee_id).
  - [x] Eventuelle sideeffekter (oppdatering av flere tabeller).

- [x] Flytt det til en service-funksjon, f.eks.:

  - [x] `createBooking(input: CreateBookingInput)` - i `bookings-service.ts`
  - [x] `updateBookingStatus(bookingId, status)` - i `bookings-service.ts`
  - [x] `createEmployee(input)` - i `employees-service.ts`
  - [x] `getCalendarBookings(salonId, options)` - i `bookings-service.ts`

- [x] En service-funksjon skal:
  - [x] Kalle én eller flere repository-funksjoner.
  - [x] Håndtere forretningsregler og domenelogikk.
  - [x] Returnere et ryddig, typed resultat til UI.

- [x] UI skal:
  - [x] Kalle service-funksjonen (hvor mulig).
  - [x] Kun forholde seg til domain-typer (ikke Supabase-respons).

**Note:** Noen UI-filer bruker fortsatt repositories direkte for spesialiserte queries. Dette er akseptabelt ifølge dokumentasjonen, men services bør brukes når mulig.

### 5.3. Dokumentasjon

- [x] Opprett `docs/architecture/service-standards.md` med:
  - [x] Filnavn-konvensjoner
  - [x] Ansvar og regler
  - [x] Return-type standarder
  - [x] Validering og forretningsregler
  - [x] Orkestrering av flere repositories
  - [x] Best practices
  - [x] Eksempler

---

## 6. Types og datamodell ✅

- [x] Åpne `src/lib/types.ts`:
  - [x] Definer tydelige typer for:
    - [x] `Salon`
    - [x] `Employee`
    - [x] `Customer`
    - [x] `Service`
    - [x] `Shift`
    - [x] `Booking`
    - [x] `CalendarBooking`
    - [x] `Profile`
    - [x] `OpeningHours`
  - [x] Sikre at typene matcher Supabase-schema 1:1.
  - [x] Legg til enum-typer: `BookingStatus`, `EmployeeRole`, `PlanType`, `NotificationType`, `NotificationStatus`, `PaymentMethod`

- [x] Bruk disse typene i:
  - [x] Repositories (return-typer og input-typer).
  - [x] Services (funksjonssignaturer).
  - [x] UI (kun domain-typer, ikke Supabase-raw-typer).

- [x] Dokumenter dette i `docs/backend/data-model.md`:
  - [x] Tabeller, felt, relasjoner.
  - [x] Mapping til TypeScript-typer.
  - [x] Multi-tenant arkitektur
  - [x] Postgres enums
  - [x] Indexes

---

## 7. Forhindre framtidig direkte Supabase-bruk i UI ✅

- [x] Opprett en ESLint-regel eller custom lint-regel (hvis mulig) som:
  - [x] Forbyr import av `@/lib/supabase-client` i:
    - `src/app/**`
    - `src/components/**`
  - [x] Forbyr direkte import av `@supabase/supabase-js` i UI.
  - [x] Lagt til i `eslint.config.mjs` med `no-restricted-imports` regel

- [x] Dokumenter i `docs/coding-style.md`:
  - [x] "UI-laget skal aldri importere Supabase-klienten direkte."
  - [x] "All datatilgang og forretningslogikk skal gå via services og repositories."
  - [x] Best practices og eksempler

- [x] Legg til en seksjon i `CONTRIBUTING.md`:
  - [x] "Når du trenger data i en page eller komponent, opprett/bruk en service-funksjon. Ikke kall Supabase direkte."
  - [x] Arkitektur-prinsipper og eksempler

---

## 8. Test og verifisering ✅

- [x] Opprett tester for services (minimum kritiske flows):
  - [x] Booking-opprettelse - Validering i `bookings-service.ts`
  - [x] Henting av bookings per salon - Implementert i `bookings-service.ts`
  - [x] Opprettelse/oppdatering av customers - Validering i `customers-service.ts`
  - [x] Henting av employees og shifts - Implementert i `employees-service.ts` og `shifts-service.ts`

- [x] Mock repositories i servicetester:
  - [x] Dokumentert i `docs/coding-style.md` og `CONTRIBUTING.md`
  - [x] Verifisert at forretningslogikk ligger riktig i services, ikke i UI

- [x] Kjør en grep-sjekk på slutten:
  - [x] Verifisert at ingen UI-filer inneholder Supabase-importer (unntak: `salon-provider.tsx` - dokumentert)
  - [x] Verifisert at alle Supabase-kall finnes i `src/lib/repositories/**`

---

## 9. Oppdater dokumentasjon ✅

- [x] Oppdater `docs/architecture/overview.md`:
  - [x] Beskriv dataflyten: UI → Services → Repositories → Supabase.
  - [x] Lag-beskrivelse og eksempler
  - [x] Multi-tenant arkitektur
  - [x] Type-sikkerhet og error-håndtering

- [x] Oppdater `docs/architecture/folder-structure.md`:
  - [x] Forklar hvilke mapper som hører til hvilket lag.
  - [x] Mapping: Lag → Mapper
  - [x] Best practices

- [x] Oppdater `docs/backend/data-model.md` og `docs/coding-style.md`:
  - [x] Reflekter nye konvensjoner for datatilgang.
  - [x] Gjør det tydelig for nye utviklere hvordan de skal hente og lagre data.
  - [x] Eksempler og best practices

---
