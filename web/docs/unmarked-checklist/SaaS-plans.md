# TeqBook – Feature Management & Advanced Architecture Checklist

Mål:
- Etablere et fleksibelt system for SaaS-pakker (planer) og funksjoner.
- Skille tydelig mellom plan/feature og brukers roller/rettigheter.
- Implementere avansert arkitektur og kvalitetstiltak som gjør TeqBook enkel å videreutvikle, teste og overlevere.

Denne sjekklisten skal gjennomføres systematisk, seksjon for seksjon.

---

## Del 1 – Planer, funksjoner og tilgangsstyring

### 1. Datamodell for planer og funksjoner

- [ ] Opprett tabellen `plans` i databasen (Supabase/Postgres):
  - [ ] Kolonner (forslag):
    - [ ] `id` (text, PK, f.eks. "basic", "standard", "pro")
    - [ ] `name` (text, visningsnavn)
    - [ ] `description` (text)
    - [ ] `price_monthly` (numeric)
    - [ ] `is_active` (boolean)
- [ ] Opprett tabellen `features`:
  - [ ] Kolonner:
    - [ ] `id` (serial eller uuid, PK)
    - [ ] `key` (text, unik, f.eks. "BOOKINGS", "CALENDAR", "SHIFTS", "ADVANCED_REPORTS")
    - [ ] `name` (text)
    - [ ] `description` (text)
- [ ] Opprett mange-til-mange-tabellen `plan_features`:
  - [ ] Kolonner:
    - [ ] `plan_id` (FK til `plans.id`)
    - [ ] `feature_id` (FK til `features.id`)
    - [ ] `limit_value` (optional, numeric, f.eks. maks antall ansatte, maks bookinger per måned)
  - [ ] Legg til unik constraint på (`plan_id`, `feature_id`).
- [ ] Oppdater `organizations` (salon/tenant-tabell):
  - [ ] Legg til kolonnen `plan_id` (FK til `plans.id`).
  - [ ] Legg til kolonnen `custom_feature_overrides` (JSONB, nullable) for spesialkunder med ekstra funksjoner.
- [ ] Oppdater tabellen som knytter brukere til organisasjon (f.eks. `organization_users`):
  - [ ] Kolonner:
    - [ ] `organization_id`
    - [ ] `user_id`
    - [ ] `role` (f.eks. "owner", "admin", "staff", "viewer")

### 2. Seed-data for planer og funksjoner

- [ ] Lag seed-scripts (SQL eller TypeScript) for:
  - [ ] `plans` (f.eks. "basic", "standard", "pro").
  - [ ] `features` (f.eks. BOOKING, CALENDAR, SHIFTS, ADVANCED_REPORTS, SMS_NOTIFICATIONS).
  - [ ] `plan_features` (kobling mellom plan og funksjoner).
- [ ] Sørg for at seed kan:
  - [ ] kjøres lokalt
  - [ ] kjøres i staging
  - [ ] være idempotent (ikke duplisere data ved gjentatt kjøring).

### 3. Service-lag for feature-tilgang

- [ ] Opprett `src/lib/types/domain.ts` (hvis ikke eksisterer) og definer:
  - [ ] `type FeatureKey = "BOOKINGS" | "CALENDAR" | "SHIFTS" | "ADVANCED_REPORTS" | "SMS_NOTIFICATIONS" | ...;`
- [ ] Opprett `src/lib/services/feature-flags-service.ts`:
  - [ ] Implementer funksjonen:
    - [ ] `hasFeature(organizationId: string, featureKey: FeatureKey): Promise<boolean>`
      - [ ] Hent org → plan
      - [ ] Finn features som hører til planen via `plan_features`
      - [ ] Les `custom_feature_overrides` hvis det brukes
      - [ ] Returner `true/false`
  - [ ] Implementer funksjonen:
    - [ ] `getFeaturesForOrganization(organizationId: string): Promise<FeatureKey[]>`
- [ ] Sørg for at all feature-sjekk i services går via dette laget, ikke direkte mot DB.

### 4. Skille mellom plan/feature og roller/rettigheter

- [ ] Dokumenter i `docs/backend/plan-and-feature-model.md`:
  - [ ] Plan bestemmer hvilke features en organisasjon har.
  - [ ] Features representerer modulene/områdene i systemet (booking, calendar, shifts, reports, osv.).
  - [ ] Roller (user roles) bestemmer hva en spesifikk bruker i org kan gjøre på en feature:
    - [ ] f.eks. admin kan configure, staff kan bruke, viewer kan kun lese.
- [ ] Implementer service-funksjoner (eller utvid eksisterende) for tilgang:
  - [ ] `hasPermission(user, permissionKey)` (rolle-basert logikk).
  - [ ] `hasFeatureForUser(user, featureKey)` → kombinasjon av `hasFeature(org, featureKey)` og rolle.
- [ ] I UI skal:
  - [ ] Ikke vis menypunkter eller knapper for features som er deaktivert (`!hasFeature`).
  - [ ] I services/backend skal:
    - [ ] Funksjoner kaste domain-feil hvis feature ikke er aktiv for org, selv om UI prøver.

### 5. Hook for feature-bruk i frontend

- [ ] Opprett `src/hooks/useFeatures.ts` (eller `src/lib/hooks/use-features.ts`):
  - [ ] Hent current organization / salon-id fra context.
  - [ ] Kall `getFeaturesForOrganization(organizationId)`.
  - [ ] Eksponer:
    - [ ] `features: FeatureKey[]`
    - [ ] `hasFeature(featureKey: FeatureKey): boolean`
- [ ] Bruk hooken i:
  - [ ] Sidebar for å bestemme hvilke menypunkter som skal vises.
  - [ ] Dashboard for å bestemme hvilke cards/widgets som vises.
  - [ ] Settings-sider for å låse/låse opp seksjoner.

### 6. Fremtidig kobling mot billing

- [ ] Dokumenter i `docs/backend/billing-and-plans.md`:
  - [ ] Hvordan `plans` vil mappes mot prispakker i et betalingssystem (Stripe, Paddle etc.).
  - [ ] Hvordan `organization.plan_id` oppdateres etter en vellykket endring av abonnement.
- [ ] Sørg for at all feature-sjekk fortsatt går via:
  - [ ] `plans` → `plan_features` → `features`
  - [ ] ikke via “hardkodede if-sjekker på plan-navn” i UI.

---

## Del 2 – Avanserte forbedringer for TeqBook-arkitektur

### 7. Feature flags (utover planer)

- [ ] Opprett `src/lib/config/feature-flags.ts`:
  - [ ] Definer toggles som er uavhengige av plan, f.eks.:
    - [ ] `newBookingFlow`
    - [ ] `employeeShiftBeta`
    - [ ] `newDashboardDesign`
- [ ] Bruk disse som “internal” toggles for eksperimenter/gradvis utrulling.
- [ ] Dokumenter bruken i `docs/architecture/feature-flags.md`.

### 8. Error boundaries og feilhåndtering

- [ ] Opprett `src/components/feedback/error-boundary.tsx`:
  - [ ] Standard React error boundary-komponent for å fange runtime-feil.
- [ ] Opprett `src/components/feedback/error-message.tsx`:
  - [ ] En konsistent måte å vise feilmeldinger på.
- [ ] Integrer error boundary rundt:
  - [ ] sentrale layout-level komponenter (f.eks. rundt `DashboardShell`).
- [ ] Dokumenter strategi i `docs/frontend/error-handling.md`.

### 9. Standard Result-type for services

- [ ] Opprett `src/lib/services/result.ts`:
  - [ ] Definer:
    ```ts
    export type Result<T> =
      | { ok: true; data: T }
      | { ok: false; message: string; code?: string };
    ```
- [ ] Oppdater services til å returnere `Result<T>`:
  - [ ] Ingen services skal returnere rå `{ data, error }` direkte fra Supabase.
- [ ] Oppdater UI til å håndtere `Result<T>` enhetlig:
  - [ ] `if (!result.ok) showError(result.message)`.

### 10. Dokumentert RLS-strategi

- [ ] Opprett `docs/backend/rls-strategy.md`:
  - [ ] For hver tabell:
    - [ ] hvordan `organization_id` / `salon_id` brukes
    - [ ] hvordan policy sikrer at bruker kun ser egen org
  - [ ] Forklar hvordan users knyttes til org/profiles.
- [ ] Verifiser at alle tabeller med tenant-data har RLS:
  - [ ] `bookings`, `customers`, `employees`, `services`, `shifts`, etc.

### 11. Databasetriggere for integritet

- [ ] Identifiser dataflyt som bør sikres i DB:
  - [ ] sletting av salon → relaterte bookings, employees, services håndteres.
  - [ ] sletting av employee → bookings håndteres (flagges, overføres, eller sperres).
- [ ] Opprett Postgres-triggere eller bruk ON DELETE CASCADE der det passer.
- [ ] Dokumenter i `docs/backend/data-integrity-and-triggers.md`.

### 12. Fokusert teststrategi

- [ ] Opprett struktur:
  - [ ] `tests/unit/services/`
  - [ ] `tests/e2e/`
- [ ] Skriv tester (minimum) for:
  - [ ] booking-service (tidspunkter, overlapp, org-tilhørighet)
  - [ ] employee-service (shift-overlapp, aktiv/inaktiv ansatte)
  - [ ] customer-service (unikhet på e-post/telefon)
- [ ] Skriv minst én e2e-test:
  - [ ] end-to-end booking-flow (create booking via UI, sjekk DB-state).
- [ ] Dokumenter teststrategi i `docs/testing/strategy.md`.

### 13. Forberedelse for multi-produkt / multi-klient

- [ ] Sørg for at all domenelogikk ligger i:
  - [ ] `src/lib/services/`
  - [ ] `src/lib/repositories/`
- [ ] UI skal kun bruke:
  - [ ] services, ikke Supabase direkte.
- [ ] Dokumenter i `docs/architecture/future-multi-client.md` hvordan:
  - [ ] React Native-app
  - [ ] ekstra web-app
  - [ ] kunne gjenbruke samme services.

### 14. Domeneprinsipper (core domain philosophy)

- [ ] Opprett `docs/architecture/domain-principles.md`:
  - [ ] Definer hva en Booking er (state machine: f.eks. draft → confirmed → completed → cancelled).
  - [ ] Definer hva en Employee er (roller, states).
  - [ ] Definer hva en Customer er.
  - [ ] Definer hva en Salon/Organization er.
- [ ] Beskriv sentrale regler:
  - [ ] hva som er lov/ikke lov i hver state.
  - [ ] hvilke overganger som er gyldige.

### 15. Release-notes og endringslogg

- [ ] Legg inn `@changesets/cli` eller annen enkel changelog-løsning:
  - [ ] Sett opp mappe `.changeset/`.
  - [ ] Konfigurer scripts i `package.json` for generering av release notes.
- [ ] Dokumenter prosess i `docs/processes/release-process.md`.

### 16. Data-livssyklus og GDPR-tenkning

- [ ] Opprett `docs/compliance/data-lifecycle.md`:
  - [ ] Retention på bookings.
  - [ ] Håndtering av sletting/anonymisering av kunde-data.
  - [ ] Håndtering av sletting av salonger.
- [ ] Planlegg og evt. implementer:
  - [ ] periodiske ryddejobber (cron/edge jobs).

### 17. Telemetri og bruksmåling (anonymt)

- [ ] Design en enkel event-modell:
  - [ ] `page_view`, `booking_created`, `booking_cancelled`, `feature_used`.
- [ ] Lag en tabell for events (hvis du bruker egen lagring).
- [ ] Lag en liten klient:
  - [ ] `logEvent(eventName, payload)` som brukes i UI.
- [ ] Dokumenter i `docs/analytics/telemetry.md`.

### 18. UI-patterns-katalog

- [ ] Opprett `docs/frontend/interaction-patterns.md`:
  - [ ] Tabellmønstre (filter, sortering, paginering).
  - [ ] Modal-mønstre (åpne/lukke, fokus, confirm).
  - [ ] Loading states (spinners, skeletons).
  - [ ] Error states (inline errors, toast, full-page error).

### 19. Standard side-layouts

- [ ] Opprett `components/layout/page-layout.tsx` (eller tilsvarende):
  - [ ] Standard header, tittel, actions, breadcrumbs, content-område.
- [ ] Refaktorer sider til å bruke felles layout:
  - [ ] dashboard, bookings, calendar, customers, employees, settings.
- [ ] Dokumenter layout-regler i `docs/frontend/ui-system.md`:
  - [ ] spacing
  - [ ] heading-nivå
  - [ ] plassering av primary actions.

### 20. Fremtidig monorepo-blåkopi

- [ ] Opprett `docs/architecture/monorepo-blueprint.md`:
  - [ ] Beskriv hvordan dagens `web/`-app kan flyttes til:
    - [ ] `apps/web-admin`
    - [ ] `apps/web-public`
    - [ ] `packages/ui`
    - [ ] `packages/core-domain`
    - [ ] `packages/supabase-client`
  - [ ] Beskriv hvilke moduler som allerede er rene nok til å ekstrakteres.
  - [ ] Beskriv hvilke refaktoreringer som vil være nødvendige.

---

Når alle punkter i denne filen er gjennomført, skal TeqBook:

- Ha fleksibel, databasedrevet plan- og feature-styring.
- Ha tydelig lagdelt arkitektur (UI → services → repositories → Supabase).
- Ha et dokumentert, etterprøvbart domene- og sikkerhetsdesign.
- Være strukturert nok til at andre er oppriktig overrasket over hvor ryddig alt er.

