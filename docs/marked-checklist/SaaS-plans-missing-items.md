# Manglende implementeringer fra SaaS-plans.md

Dette dokumentet lister opp hva som mangler fra `SaaS-plans.md` og `SaaS-plans-evaluation.md`.

## Del 1 – Planer, funksjoner og tilgangsstyring

### 1. Datamodell for planer og funksjoner

- [ ] **`custom_feature_overrides` kolonne i `salons` tabell**
  - Status: Ikke implementert (markert som fremtidig forbedring)
  - Beskrivelse: JSONB kolonne for spesialkunder med ekstra funksjoner
  - Prioritet: Lav (fremtidig forbedring)

### 4. Skille mellom plan/feature og roller/rettigheter

- [ ] **Dokumentasjon av plan/feature vs roller**
  - Status: Delvis implementert
  - `docs/backend/plan-and-feature-model.md` finnes, men mangler:
    - [ ] Tydelig forklaring av at plan bestemmer hvilke features en organisasjon har
    - [ ] Tydelig forklaring av at features representerer modulene/områdene i systemet
    - [ ] Tydelig forklaring av at roller bestemmer hva en spesifikk bruker kan gjøre på en feature
  - Prioritet: Medium

- [ ] **`hasFeatureForUser` funksjon**
  - Status: Ikke implementert
  - Beskrivelse: Kombinasjon av `hasFeature(org, featureKey)` og rolle
  - Lokasjon: `src/lib/services/feature-flags-service.ts` eller `src/lib/utils/access-control.ts`
  - Prioritet: Medium
  - Eksempel:
    ```typescript
    export async function hasFeatureForUser(
      userId: string,
      featureKey: FeatureKey
    ): Promise<{ hasFeature: boolean; error: string | null }> {
      // 1. Hent user's salon_id fra profile
      // 2. Sjekk om salon har feature (hasFeature)
      // 3. Sjekk om user's rolle har tilgang til feature
      // 4. Returner kombinasjon
    }
    ```

- [ ] **Feature-validering i services**
  - Status: Ikke implementert
  - Beskrivelse: Services skal kaste domain-feil hvis feature ikke er aktiv for org
  - Eksempel: `createShift` skal sjekke om `SHIFTS` feature er aktiv før opprettelse
  - Prioritet: Høy (sikkerhet)
  - Services som trenger dette:
    - [ ] `shifts-service.ts` - sjekk `SHIFTS` feature
    - [ ] `products-service.ts` - sjekk `INVENTORY` feature
    - [ ] `reports-service.ts` - sjekk `ADVANCED_REPORTS` feature
    - [ ] `exports-service.ts` - sjekk `EXPORTS` feature

### 5. Hook for feature-bruk i frontend

- [ ] **Bruk hooken i alle settings-sider**
  - Status: Delvis implementert
  - Implementert: Sidebar, Dashboard
  - Mangler:
    - [ ] Settings/general - låse/låse opp seksjoner basert på features
    - [ ] Settings/notifications - låse/låse opp notifikasjonstyper basert på features
    - [ ] Settings/billing - allerede implementert
    - [ ] Settings/branding - allerede implementert (BRANDING feature)
  - Prioritet: Medium

---

## Del 2 – Avanserte forbedringer for TeqBook-arkitektur

### 8. Error boundaries og feilhåndtering

- [ ] **Error boundary rundt DashboardShell**
  - Status: Ikke implementert
  - Beskrivelse: Error boundary er kun i root layout, men bør også være rundt DashboardShell for bedre feilhåndtering
  - Prioritet: Medium
  - Lokasjon: `src/components/layout/dashboard-shell.tsx`

### 11. Databasetriggere for integritet

- [ ] **Dokumenter databasetriggere**
  - Status: Delvis implementert
  - ON DELETE CASCADE finnes for mange tabeller
  - Mangler dokumentasjon i `docs/backend/data-integrity-and-triggers.md`
  - Prioritet: Medium
  - Trenger dokumentasjon for:
    - [ ] Sletting av salon → relaterte bookings, employees, services håndteres (CASCADE)
    - [ ] Sletting av employee → bookings håndteres (hva skjer? flagges, overføres, eller sperres?)
    - [ ] Eksisterende triggers (f.eks. `prevent-orphaned-salons.sql`)

### 15. Release-notes og endringslogg

- [ ] **Changesets setup**
  - Status: Ikke implementert
  - Beskrivelse: Legg inn `@changesets/cli` eller annen enkel changelog-løsning
  - Trenger:
    - [ ] Installer `@changesets/cli`
    - [ ] Opprett `.changeset/` mappe
    - [ ] Konfigurer scripts i `package.json`
    - [ ] Dokumenter prosess i `docs/processes/release-process.md`
  - Prioritet: Lav (nice-to-have)

### 17. Telemetri og bruksmåling (anonymt)

- [ ] **Telemetri-system**
  - Status: Ikke implementert
  - Beskrivelse: Design en enkel event-modell for bruksmåling
  - Trenger:
    - [ ] Design event-modell (`page_view`, `booking_created`, `booking_cancelled`, `feature_used`)
    - [ ] Lag tabell for events (hvis egen lagring)
    - [ ] Lag klient: `logEvent(eventName, payload)`
    - [ ] Dokumenter i `docs/analytics/telemetry.md`
  - Prioritet: Lav (nice-to-have)
  - Note: Domain events finnes allerede (`src/lib/events/domain-events.ts`), kan bygge videre på dette

### 19. Standard side-layouts

- [ ] **Refaktorer customers side til PageLayout**
  - Status: Ikke implementert
  - Beskrivelse: `src/app/customers/page.tsx` bruker fortsatt `PageHeader` direkte, ikke `PageLayout`
  - Prioritet: Medium

- [ ] **Refaktorer settings-sider til PageLayout**
  - Status: Ikke implementert
  - Beskrivelse: Settings-sider bruker ikke `PageLayout` komponenten
  - Prioritet: Medium
  - Sider:
    - [ ] `src/app/settings/general/page.tsx`
    - [ ] `src/app/settings/notifications/page.tsx`
    - [ ] `src/app/settings/billing/page.tsx`
    - [ ] `src/app/settings/branding/page.tsx`

- [ ] **Dokumenter layout-regler i ui-system.md**
  - Status: Delvis implementert
  - `docs/frontend/ui-system.md` finnes og er omfattende
  - Mangler kanskje:
    - [ ] Eksplisitt dokumentasjon av spacing-regler for PageLayout
    - [ ] Eksplisitt dokumentasjon av heading-nivå for PageLayout
    - [ ] Eksplisitt dokumentasjon av plassering av primary actions
  - Prioritet: Lav (dokumentasjonen er allerede god)

---

## Prioriterte neste steg

### Høy prioritet (sikkerhet og funksjonalitet)

1. **Feature-validering i services** (Punkt 4)
   - Implementer feature-sjekk i `shifts-service.ts`, `products-service.ts`, `reports-service.ts`, `exports-service.ts`
   - Dette er viktig for sikkerhet - forhindrer at brukere kan bruke features de ikke har tilgang til

2. **`hasFeatureForUser` funksjon** (Punkt 4)
   - Kombiner feature-sjekk med rolle-sjekk
   - Gjør det enklere å sjekke både feature og rolle i UI

### Medium prioritet (konsistens og dokumentasjon)

3. **Refaktorer customers og settings-sider til PageLayout** (Punkt 19)
   - Konsistent struktur på tvers av alle sider

4. **Dokumenter plan/feature vs roller** (Punkt 4)
   - Tydeligere dokumentasjon i `plan-and-feature-model.md`

5. **Error boundary rundt DashboardShell** (Punkt 8)
   - Bedre feilhåndtering på dashboard-nivå

6. **Dokumenter databasetriggere** (Punkt 11)
   - Dokumenter eksisterende triggers og CASCADE-regler

### Lav prioritet (nice-to-have)

7. **Telemetri-system** (Punkt 17)
   - Kan bygge videre på eksisterende domain events

8. **Changesets setup** (Punkt 15)
   - Automatisk changelog-generering

9. **`custom_feature_overrides`** (Punkt 1)
   - Fremtidig forbedring for spesialkunder

---

## Status-oversikt

### Fullført ✅
- Features og plan_features tabeller
- Feature flags service
- useFeatures hook
- Feature-integrasjon i sidebar, dashboard, bookings, calendar, employees, services
- PageLayout komponent
- Error boundaries og error handling
- RLS dokumentasjon
- Domain principles dokumentasjon
- Test strategy
- Data lifecycle dokumentasjon
- UI patterns dokumentasjon
- Monorepo blueprint

### Delvis implementert ⚠️
- Hook brukt i settings (kun branding)
- Dokumentasjon av plan/feature vs roller
- Databasetriggere (finnes, men ikke dokumentert)
- Layout-regler dokumentasjon (finnes, men kan forbedres)

### Ikke implementert ❌
- `custom_feature_overrides` kolonne
- `hasFeatureForUser` funksjon
- Feature-validering i services
- Error boundary rundt DashboardShell
- Changesets setup
- Telemetri-system
- Customers og settings-sider refaktorert til PageLayout

