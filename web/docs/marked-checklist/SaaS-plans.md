# TeqBook – Feature Management & Advanced Architecture Checklist

Mål:
- Etablere et fleksibelt system for SaaS-pakker (planer) og funksjoner.
- Skille tydelig mellom plan/feature og brukers roller/rettigheter.
- Implementere avansert arkitektur og kvalitetstiltak som gjør TeqBook enkel å videreutvikle, teste og overlevere.

Denne sjekklisten skal gjennomføres systematisk, seksjon for seksjon.

---

## Del 1 – Planer, funksjoner og tilgangsstyring

### 1. Datamodell for planer og funksjoner

- [x] Opprett tabellen `features` i databasen (Supabase/Postgres):
  - [x] Kolonner:
    - [x] `id` (UUID, PK)
    - [x] `key` (text, unik, f.eks. "BOOKINGS", "CALENDAR", "SHIFTS", "ADVANCED_REPORTS")
    - [x] `name` (text)
    - [x] `description` (text)
    - [x] `created_at`, `updated_at` (timestamps)
- [x] Opprett mange-til-mange-tabellen `plan_features`:
  - [x] Kolonner:
    - [x] `plan_type` (plan_type enum, ikke FK - bruker eksisterende enum)
    - [x] `feature_id` (FK til `features.id`)
    - [x] `limit_value` (optional, numeric, f.eks. maks antall ansatte, maks språk)
  - [x] Legg til unik constraint på (`plan_type`, `feature_id`).
- [x] Behold eksisterende `salons.plan` (plan_type enum) - bygger videre på dette
- [ ] Legg til kolonnen `custom_feature_overrides` (JSONB, nullable) i `salons` for spesialkunder med ekstra funksjoner (fremtidig forbedring)
- [x] Eksisterende `profiles` tabell håndterer allerede:
  - [x] `salon_id` (FK til salons)
  - [x] `role` (f.eks. "owner", "manager", "staff")

### 2. Seed-data for planer og funksjoner

- [x] Lag seed-scripts (SQL) for:
  - [x] `features` (14 features: BOOKINGS, CALENDAR, SHIFTS, ADVANCED_REPORTS, etc.)
  - [x] `plan_features` (kobling mellom plan_type enum og features).
- [x] Seed er idempotent (bruker `ON CONFLICT DO NOTHING`)
- [x] Seed kan kjøres i Supabase SQL Editor (lokalt, staging, produksjon)

### 3. Service-lag for feature-tilgang

- [x] Opprett `src/lib/types/domain.ts` og definer:
  - [x] `type FeatureKey = "BOOKINGS" | "CALENDAR" | "SHIFTS" | ...` (14 features)
- [x] Opprett `src/lib/services/feature-flags-service.ts`:
  - [x] Implementer funksjonen:
    - [x] `hasFeature(salonId: string, featureKey: FeatureKey): Promise<{hasFeature: boolean, error: string | null}>`
      - [x] Hent salon → plan
      - [x] Finn features som hører til planen via `plan_features`
      - [x] Returner `hasFeature` boolean
  - [x] Implementer funksjonen:
    - [x] `getFeaturesForSalon(salonId: string): Promise<{features: FeatureKey[], error: string | null}>`
  - [x] Implementer funksjonen:
    - [x] `getFeatureLimit(salonId: string, featureKey: FeatureKey): Promise<{limit: number | null, error: string | null}>`
- [x] Opprett `src/lib/repositories/features.ts` for database-tilgang
- [ ] TODO: Integrer `custom_feature_overrides` når det implementeres

### 4. Skille mellom plan/feature og roller/rettigheter

- [x] Dokumenter i `docs/backend/plan-and-feature-model.md`:
  - [x] Plan bestemmer hvilke features en organisasjon har.
  - [x] Features representerer modulene/områdene i systemet (booking, calendar, shifts, reports, osv.).
  - [x] Roller (user roles) bestemmer hva en spesifikk bruker i org kan gjøre på en feature:
    - [x] f.eks. admin kan configure, staff kan bruke, viewer kan kun lese.
- [x] Implementer service-funksjoner (eller utvid eksisterende) for tilgang:
  - [x] `hasPermission(user, permissionKey)` (rolle-basert logikk).
  - [x] `hasFeatureForUser(user, featureKey)` → kombinasjon av `hasFeature(org, featureKey)` og rolle.
- [x] I UI skal:
  - [x] Ikke vis menypunkter eller knapper for features som er deaktivert (`!hasFeature`).
  - [x] I services/backend skal:
    - [x] Funksjoner kaste domain-feil hvis feature ikke er aktiv for org, selv om UI prøver.

### 5. Hook for feature-bruk i frontend

- [x] Opprett `src/lib/hooks/use-features.ts`:
  - [x] Hent current salon-id fra `SalonProvider` context.
  - [x] Kall `getFeaturesForSalon(salonId)`.
  - [x] Eksponer:
    - [x] `features: FeatureKey[]`
    - [x] `hasFeature(featureKey: FeatureKey): boolean`
    - [x] `loading: boolean`
    - [x] `error: string | null`
- [x] TODO: Bruk hooken i:
  - [x] Sidebar for å bestemme hvilke menypunkter som skal vises.
  - [x] Dashboard for å bestemme hvilke cards/widgets som vises.
  - [x] Settings-sider for å låse/låse opp seksjoner.

### 6. Fremtidig kobling mot billing

- [x] Dokumenter i `docs/backend/billing-and-plans.md`:
  - [x] Hvordan `plans` vil mappes mot prispakker i et betalingssystem (Stripe, Paddle etc.).
  - [x] Hvordan `organization.plan_id` oppdateres etter en vellykket endring av abonnement.
- [x] Sørg for at all feature-sjekk fortsatt går via:
  - [x] `plans` → `plan_features` → `features`
  - [x] ikke via "hardkodede if-sjekker på plan-navn" i UI.

---

## Del 2 – Avanserte forbedringer for TeqBook-arkitektur

### 7. Feature flags (utover planer)

- [x] Opprett `src/lib/config/feature-flags.ts`:
  - [x] Definer toggles som er uavhengige av plan, f.eks.:
    - [x] `newBookingFlow`
    - [x] `employeeShiftBeta`
    - [x] `newDashboardDesign`
- [x] Bruk disse som "internal" toggles for eksperimenter/gradvis utrulling.
- [x] Dokumenter bruken i `docs/architecture/feature-flags.md`.

### 8. Error boundaries og feilhåndtering

- [x] Opprett `src/components/feedback/error-boundary.tsx`:
  - [x] Standard React error boundary-komponent for å fange runtime-feil.
  - [x] Forbedret med ErrorMessage komponent og "Try Again" funksjonalitet.
- [x] Opprett `src/components/feedback/error-message.tsx`:
  - [x] En konsistent måte å vise feilmeldinger på.
  - [x] Støtter variants (destructive, warning, default).
  - [x] Støtter dismiss-funksjonalitet.
- [x] TODO: Integrer error boundary rundt:
  - [x] sentrale layout-level komponenter (f.eks. rundt `DashboardShell`).
- [x] Dokumenter strategi i `docs/frontend/error-handling.md`.

### 9. Standard Result-type for services

- [ ] Vurdert: Eksisterende `{ data: T | null; error: string | null }` pattern fungerer godt
- [ ] Result type er valgfritt - kan implementeres senere hvis behovet oppstår
- [x] Eksisterende pattern er:
  - [x] Konsistent over alle services og repositories
  - [x] Enkelt å bruke i UI
  - [x] Godt dokumentert i `docs/architecture/service-standards.md`
- [ ] TODO: Vurder Result type hvis vi trenger bedre type-safety eller error codes

### 10. Dokumentert RLS-strategi

- [x] Opprett `docs/backend/rls-strategy.md`:
  - [x] For hver tabell:
    - [x] hvordan `salon_id` brukes
    - [x] hvordan policy sikrer at bruker kun ser egen salon
  - [x] Forklar hvordan users knyttes til saloner via `profiles`.
  - [x] Dokumenter standard policy pattern
  - [x] Liste over alle tabeller med RLS
  - [x] Superadmin-tilgang dokumentert
- [x] Verifisert at alle tabeller med tenant-data har RLS:
  - [x] `bookings`, `customers`, `employees`, `services`, `shifts`, `addons`, `products`, etc.

### 11. Databasetriggere for integritet

- [x] Identifiser dataflyt som bør sikres i DB:
  - [x] sletting av salon → relaterte bookings, employees, services håndteres.
  - [x] sletting av employee → bookings håndteres (flagges, overføres, eller sperres).
- [x] Opprett Postgres-triggere eller bruk ON DELETE CASCADE der det passer.
- [x] Dokumenter i `docs/backend/data-integrity-and-triggers.md`.

### 12. Fokusert teststrategi

- [x] Opprett struktur:
  - [x] `tests/unit/services/`
  - [x] `tests/e2e/`
- [x] Skriv tester (minimum) for:
  - [x] booking-service (tidspunkter, overlapp, org-tilhørighet)
  - [x] employee-service (shift-overlapp, aktiv/inaktiv ansatte)
  - [x] customer-service (unikhet på e-post/telefon)
- [x] Skriv minst én e2e-test:
  - [x] end-to-end booking-flow (create booking via UI, sjekk DB-state).
- [x] Dokumenter teststrategi i `docs/testing/strategy.md`.

### 13. Forberedelse for multi-produkt / multi-klient

- [x] Sørg for at all domenelogikk ligger i:
  - [x] `src/lib/services/`
  - [x] `src/lib/repositories/`
- [x] UI skal kun bruke:
  - [x] services, ikke Supabase direkte.
- [x] Dokumenter i `docs/architecture/monorepo-blueprint.md` hvordan:
  - [x] React Native-app
  - [x] ekstra web-app
  - [x] kunne gjenbruke samme services.

### 14. Domeneprinsipper (core domain philosophy)

- [x] Opprett `docs/architecture/domain-principles.md`:
  - [x] Definer hva en Booking er (state machine: f.eks. draft → confirmed → completed → cancelled).
  - [x] Definer hva en Employee er (roller, states).
  - [x] Definer hva en Customer er.
  - [x] Definer hva en Salon/Organization er.
- [x] Beskriv sentrale regler:
  - [x] hva som er lov/ikke lov i hver state.
  - [x] hvilke overganger som er gyldige.

### 15. Release-notes og endringslogg

- [ ] Legg inn `@changesets/cli` eller annen enkel changelog-løsning:
  - [ ] Sett opp mappe `.changeset/`.
  - [ ] Konfigurer scripts i `package.json` for generering av release notes.
- [ ] Dokumenter prosess i `docs/processes/release-process.md`.

### 16. Data-livssyklus og GDPR-tenkning

- [x] Opprett `docs/compliance/data-lifecycle.md`:
  - [x] Retention på bookings.
  - [x] Håndtering av sletting/anonymisering av kunde-data.
  - [x] Håndtering av sletting av salonger.
- [x] Planlegg og evt. implementer:
  - [x] periodiske ryddejobber (cron/edge jobs).

### 17. Telemetri og bruksmåling (anonymt)

- [ ] Design en enkel event-modell:
  - [ ] `page_view`, `booking_created`, `booking_cancelled`, `feature_used`.
- [ ] Lag en tabell for events (hvis du bruker egen lagring).
- [ ] Lag en liten klient:
  - [ ] `logEvent(eventName, payload)` som brukes i UI.
- [ ] Dokumenter i `docs/analytics/telemetry.md`.

### 18. UI-patterns-katalog

- [x] Opprett `docs/frontend/interaction-patterns.md`:
  - [x] Tabellmønstre (filter, sortering, paginering).
  - [x] Modal-mønstre (åpne/lukke, fokus, confirm).
  - [x] Loading states (spinners, skeletons).
  - [x] Error states (inline errors, toast, full-page error).

### 19. Standard side-layouts

- [x] Opprett `components/layout/page-layout.tsx` (eller tilsvarende):
  - [x] Standard header, tittel, actions, breadcrumbs, content-område.
- [x] Refaktorer sider til å bruke felles layout:
  - [x] dashboard, bookings, calendar, customers, employees, settings.
- [x] Dokumenter layout-regler i `docs/frontend/ui-system.md`:
  - [x] spacing
  - [x] heading-nivå
  - [x] plassering av primary actions.

### 20. Fremtidig monorepo-blåkopi

- [x] Opprett `docs/architecture/monorepo-blueprint.md`:
  - [x] Beskriv hvordan dagens `web/`-app kan flyttes til:
    - [x] `apps/web-admin`
    - [x] `apps/web-public`
    - [x] `packages/ui`
    - [x] `packages/core-domain`
    - [x] `packages/supabase-client`
  - [x] Beskriv hvilke moduler som allerede er rene nok til å ekstrakteres.
  - [x] Beskriv hvilke refaktoreringer som vil være nødvendige.

---

Når alle punkter i denne filen er gjennomført, skal TeqBook:

- Ha fleksibel, databasedrevet plan- og feature-styring.
- Ha tydelig lagdelt arkitektur (UI → services → repositories → Supabase).
- Ha et dokumentert, etterprøvbart domene- og sikkerhetsdesign.
- Være strukturert nok til at andre er oppriktig overrasket over hvor ryddig alt er.

