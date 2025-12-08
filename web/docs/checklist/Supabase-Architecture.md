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

- [ ] Søk globalt i prosjektet etter Supabase-importer:

  - [ ] Finn alle forekomster av:
    - `createClient` fra `@/lib/supabase-client`
    - `createBrowserClient` / `createServerClient` hvis aktuelt
    - Direkte `@supabase/supabase-js` imports

  - [ ] Lag en liste over filer som inneholder disse importene, og noter:
    - [ ] Om filen ligger i `src/app/` (page/route)
    - [ ] Om filen ligger i `src/components/`
    - [ ] Om filen ligger i `src/lib/repositories/`
    - [ ] Om filen ligger i `src/lib/*` ellers

- [ ] Klassifiser hver fil som:
  - [ ] UI-lag (pages + components)
  - [ ] Service-lag (skal ligge i `src/lib/services/`)
  - [ ] Repository-lag (skal ligge i `src/lib/repositories/`)
  - [ ] Infrastruktur (supabase-klient, types, utils)

---

## 2. Definer klare lag og grenser

- [ ] Opprett (eller bekreft eksistensen av) følgende mapper:

  - [ ] `src/lib/repositories/`
  - [ ] `src/lib/services/`
  - [ ] `src/lib/types.ts`
  - [ ] `src/lib/supabase-client.ts`

- [ ] Dokumenter lag-inndelingen i egen fil:
  - [ ] Opprett `docs/architecture/layers.md`
  - [ ] Beskriv:
    - [ ] UI-lag: kun presentasjon, kaller services.
    - [ ] Services-lag: forretningslogikk, orkestrering av kall.
    - [ ] Repository-lag: rene databasekall mot Supabase.
    - [ ] Supabase-klient: definert ett sted, brukes kun i repositories.

---

## 3. Forbud mot direkte Supabase i UI-laget

### 3.1. Identifiser brudd i UI-laget

- [ ] Gå gjennom alle filer i:
  - [ ] `src/app/**`
  - [ ] `src/components/**`

- [ ] For hver fil i UI-laget:
  - [ ] Sjekk om det importeres Supabase-klient eller `@supabase/supabase-js`.
  - [ ] Sjekk om det gjøres kall som `.from(...)`, `.auth`, `.rpc`, `.insert`, `.update`, osv.

- [ ] Lag en konkret liste over “UI-filer som må refaktoreres”, f.eks. i:
  - [ ] `docs/cleanup/supabase-ui-usages.md`

### 3.2. Fjern direkte Supabase-kall fra UI

For hver UI-fil som har Supabase-kall:

- [ ] Identifiser hva kallet gjør:
  - [ ] Hvilken tabell / view / RPC?
  - [ ] Hvilke parametere tas imot?
  - [ ] Hvilken shape har return-data?
  - [ ] Hvilken logikk ligger rundt (validering, mapping, filtrering)?

- [ ] Fjern direkte Supabase-importen:
  - [ ] `import { createClient } from "@/lib/supabase-client";` skal ikke lenger være i UI-filer.
  - [ ] Ingen `supabase.from(...)` i UI.

- [ ] Opprett/bruk en passende service-funksjon i `src/lib/services/`:
  - [ ] Gi funksjonen et meningsfullt navn, f.eks.:
    - `fetchBookingsForCurrentSalon`
    - `createCustomerForSalon`
    - `getEmployeeSchedule`
  - [ ] Flytt forretningslogikken (validering, filtrering, mapping) inn i service-funksjonen.
  - [ ] La service-funksjonen kalle et repository i stedet for Supabase direkte.

- [ ] Oppdater UI-filen til å bruke service-funksjonen:
  - [ ] Importer fra `@/lib/services/...`
  - [ ] Håndter loading / error / data basert på service-output (ikke Supabase-respons direkte).

---

## 4. Rydding og standardisering av repository-laget

### 4.1. Sikre at alle Supabase-kall ligger i repositories

- [ ] Gå gjennom alle filer i `src/lib/repositories/`:

  - [ ] Verifiser at:
    - [ ] Kun repositories importerer `supabase-client`.
    - [ ] Alle databasekall gjøres gjennom Supabase-klienten her.
    - [ ] Ingen UI-spesifikk logikk (f.eks. toasts, router, redirect) finnes i repositories.

- [ ] For hvert repository:
  - [ ] Gi filen et domain-orientert navn:
    - `bookings-repository.ts`
    - `employees-repository.ts`
    - `services-repository.ts`
    - `customers-repository.ts`
    - `shifts-repository.ts`

  - [ ] Standardiser signaturen til funksjonene:
    - [ ] Input-typer definert i `src/lib/types.ts` (eller egne `types`-filer).
    - [ ] Return-typer er typed og konsistente, f.eks.:
      - `Promise<{ data: T | null; error: RepositoryError | null }>`
      - Eller tydelige `Result`-typer.

  - [ ] Sørg for at all Supabase-bruk:
    - [ ] Har eksplisitte select-felter der det er nødvendig.
    - [ ] Har tydelig håndtering av `error`.
    - [ ] Ikke eksponerer Supabase-respons direkte til UI-laget.

---

## 5. Etablering av service-laget

### 5.1. Opprett services per domene

- [ ] Opprett (eller utvid) følgende filer i `src/lib/services/`:

  - [ ] `bookings-service.ts`
  - [ ] `employees-service.ts`
  - [ ] `customers-service.ts`
  - [ ] `services-service.ts` (eller `salon-services-service.ts`)
  - [ ] `shifts-service.ts`
  - [ ] Evt. `auth-service.ts` for brukerrelaterte operasjoner

### 5.2. Flytt forretningslogikk til services

For hver UI-flow (f.eks. “opprette booking”):

- [ ] Identifiser all forretningslogikk i UI:
  - [ ] Validering (f.eks. starttid før sluttid, overlappende bookings, kapasitet).
  - [ ] Hvilke felter som må settes (salon_id, user_id, employee_id).
  - [ ] Eventuelle sideeffekter (oppdatering av flere tabeller).

- [ ] Flytt det til en service-funksjon, f.eks.:

  - [ ] `createBookingForCustomer(input: CreateBookingInput)`
  - [ ] `updateBookingStatus(bookingId, status)`
  - [ ] `createOrUpdateEmployeeProfile(input)`
  - [ ] `getCalendarEntriesForSalon(params)`

- [ ] En service-funksjon skal:
  - [ ] Kalle én eller flere repository-funksjoner.
  - [ ] Håndtere forretningsregler og domenelogikk.
  - [ ] Returnere et ryddig, typed resultat til UI.

- [ ] UI skal:
  - [ ] Kalle service-funksjonen.
  - [ ] Kun forholde seg til domain-typer (ikke Supabase-respons).

---

## 6. Types og datamodell

- [ ] Åpne `src/lib/types.ts`:
  - [ ] Definer tydelige typer for:
    - [ ] `Salon`
    - [ ] `Employee`
    - [ ] `Customer`
    - [ ] `Service`
    - [ ] `Shift`
    - [ ] `Booking`
  - [ ] Sikre at typene matcher Supabase-schema 1:1.

- [ ] Bruk disse typene i:
  - [ ] Repositories (return-typer og input-typer).
  - [ ] Services (funksjonssignaturer).
  - [ ] UI (kun domain-typer, ikke Supabase-raw-typer).

- [ ] Dokumenter dette i `docs/backend/data-model.md`:
  - [ ] Tabeller, felt, relasjoner.
  - [ ] Mapping til TypeScript-typer.

---

## 7. Forhindre framtidig direkte Supabase-bruk i UI

- [ ] Opprett en ESLint-regel eller custom lint-regel (hvis mulig) som:
  - [ ] Forbyr import av `@/lib/supabase-client` i:
    - `src/app/**`
    - `src/components/**`
  - [ ] Forbyr direkte import av `@supabase/supabase-js` i UI.

- [ ] Dokumenter i `docs/coding-style.md`:
  - [ ] “UI-laget skal aldri importere Supabase-klienten direkte.”
  - [ ] “All datatilgang og forretningslogikk skal gå via services og repositories.”

- [ ] Legg til en seksjon i `CONTRIBUTING.md`:
  - [ ] “Når du trenger data i en page eller komponent, opprett/bruk en service-funksjon. Ikke kall Supabase direkte.”

---

## 8. Test og verifisering

- [ ] Opprett tester for services (minimum kritiske flows):
  - [ ] Booking-opprettelse.
  - [ ] Henting av bookings per salon.
  - [ ] Opprettelse/oppdatering av customers.
  - [ ] Henting av employees og shifts.

- [ ] Mock repositories i servicetester:
  - [ ] Verifiser at forretningslogikk ligger riktig i services, ikke i UI.

- [ ] Kjør en grep-sjekk på slutten:
  - [ ] Verifiser at ingen UI-filer inneholder Supabase-importer.
  - [ ] Verifiser at alle Supabase-kall finnes i `src/lib/repositories/**`.

---

## 9. Oppdater dokumentasjon

- [ ] Oppdater `docs/architecture/overview.md`:
  - [ ] Beskriv dataflyten: UI → Services → Repositories → Supabase.

- [ ] Oppdater `docs/architecture/folder-structure.md`:
  - [ ] Forklar hvilke mapper som hører til hvilket lag.

- [ ] Oppdater `docs/backend/data-model.md` og `docs/coding-style.md`:
  - [ ] Reflekter nye konvensjoner for datatilgang.
  - [ ] Gjør det tydelig for nye utviklere hvordan de skal hente og lagre data.

---
