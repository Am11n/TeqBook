# Contributing to TeqBook

> **Merk:** Dette dokumentet er flyttet fra den tidligere `web/`-appen og er i ferd med å oppdateres til full monorepo-støtte (apps + packages). Innholdet gjelder fortsatt som standard, men enkelte eksempler kan referere til gamle stier eller deployment-oppsett.

Takk for at du vurderer å bidra til TeqBook! Dette dokumentet gir deg en guide for hvordan du kan bidra.

---

## Arkitektur

TeqBook følger en **lagdelt arkitektur** med tydelige grenser:

```
UI (pages, components)
  ↓
Services (src/lib/services/*)
  ↓
Repositories (src/lib/repositories/*)
  ↓
Supabase Client (src/lib/supabase-client.ts)
```

> I monorepoet ligger dette typisk under hver app, f.eks. `apps/dashboard/src/lib/services/*` osv.

### Kritisk regel: Datatilgang

**Når du trenger data i en page eller komponent:**

1. ✅ **Bruk services** - Opprett eller bruk en eksisterende service-funksjon i `src/lib/services/`
2. ❌ **Ikke kall Supabase direkte** - Aldri importer `@/lib/supabase-client` eller `@supabase/supabase-js` i UI-laget

**Eksempel:**

```typescript
// ✅ RIKTIG - Via service
import { getBookingsForSalon } from "@/lib/services/bookings-service";

const { data, error } = await getBookingsForSalon(salonId);

// ❌ FEIL - Direkte Supabase-kall
import { supabase } from "@/lib/supabase-client";
const { data } = await supabase.from("bookings").select("*");
```

### Hvor skal koden ligge?

- **UI-logikk** → `src/app/` eller `src/components/`
- **Forretningslogikk** → `src/lib/services/`
- **Database-operasjoner** → `src/lib/repositories/`
- **Types** → `src/lib/types.ts`

---

## Branch-strategi

TeqBook bruker **Git Flow** med følgende branch-typer:

### Main Branch

- `main` - Produksjonsklar kode
- **Beskytter:** Require pull request reviews

### Feature Branches

**Format:** `feature/description` eller `fix/description`

**Eksempler:**
- `feature/add-whatsapp-integration`
- `feature/multilingual-booking`
- `fix/booking-timezone-issue`
- `fix/profile-rls-policy`

**Regler:**
- Branches skal være korte og beskrivende
- En branch = én feature eller bugfix
- Branches skal merges til `main` via Pull Request

### Hotfix Branches

**Format:** `hotfix/description`

**Brukes for:** Kritiske bugfixes som må til produksjon umiddelbart

**Prosess:**
1. Opprett branch fra `main`
2. Fix buggen
3. Merge til `main` via Pull Request
4. Tag release

---

## Pull Request-regler

### Før du oppretter en PR

1. **Sørg for at koden kompilerer:**
   ```bash
   npm run build
   ```

2. **Kjør lint:**
   ```bash
   npm run lint
   ```

3. **Kjør type check:**
   ```bash
   npm run type-check
   ```
   (Fra monorepo-rot: `pnpm run type-check`.)

4. **Database- og E2E-scripts** (valgfritt ved lokal utvikling):  
   Fra repo-rot: `pnpm run seed`, `pnpm run migrate:local`, `pnpm run reset:db`, `pnpm run create:e2e-users`. Se `scripts/README.md`.

5. **Test funksjonaliteten:**
   - Test manuelt i dev-server
   - Sjekk at alle edge cases er håndtert

6. **Oppdater dokumentasjon:**
   - Hvis du legger til nye features → Oppdater relevante docs
   - Hvis du endrer arkitektur → Oppdater `docs/architecture/`

### PR-tittel

Bruk konvensjonelle commit-format:

```
feat: add WhatsApp integration
fix: resolve booking timezone issue
docs: update architecture diagram
refactor: simplify service layer
test: add unit tests for bookings service
```

### PR-beskrivelse

**Template:**

```markdown
## Beskrivelse
Kort beskrivelse av endringene.

## Type endring
- [ ] Ny feature
- [ ] Bugfix
- [ ] Dokumentasjon
- [ ] Refaktorering
- [ ] Test

## Testing
Hvordan har du testet endringene?

## Screenshots (hvis relevant)
Legg til screenshots for UI-endringer.

## Checklist
- [ ] Koden kompilerer uten feil
- [ ] Ingen ESLint-feil
- [ ] Type check passerer
- [ ] Dokumentasjon er oppdatert
- [ ] Jeg har testet endringene manuelt
- [ ] **Form Layout & Spacing:**
  - [ ] Alle nye/oppdaterte felter bruker `<Field />` komponenten
  - [ ] Ingen inline label layouts lagt til uten `variant="inline"`
  - [ ] Settings form screenshot test passerer (hvis relevant)
  - [ ] Lint passerer (ingen restricted label violations)
```

### PR-review prosess

1. **Automatisk checks:**
   - CI pipeline kjører automatisk (lint, type check, tests)
   - Alle checks må passere før merge

2. **Code review:**
   - Minst **én approver** kreves
   - Reviewer sjekker:
     - Kodekvalitet
     - Arkitektur-følgelse
     - Test-dekning
     - Dokumentasjon

3. **Merge:**
   - **Squash and merge** anbefales for feature branches
   - **Merge commit** for hotfixes
   - **Rebase and merge** for små endringer

---

## Code Review Krav

### Hva skal reviewers sjekke?

#### 1. Arkitektur-følgelse

- ✅ Bruker services i stedet for direkte Supabase-kall
- ✅ Følger lagdelt arkitektur (UI → Services → Repositories)
- ✅ Ingen direkte Supabase-imports i UI-komponenter

#### 2. Kodekvalitet

- ✅ TypeScript-typer er korrekte
- ✅ Error-håndtering er på plass
- ✅ Ingen hardkodede verdier
- ✅ Kode er lesbar og vedlikeholdbar

#### 3. Testing

- ✅ Nye features har tester (hvis relevant)
- ✅ Eksisterende tester passerer
- ✅ Edge cases er håndtert

#### 4. Dokumentasjon

- ✅ Kode er dokumentert (hvis kompleks)
- ✅ README/docs er oppdatert (hvis relevant)
- ✅ Commit-meldinger er tydelige

#### 5. Sikkerhet

- ✅ Ingen sensitive data i kode
- ✅ RLS policies er korrekte (hvis database-endringer)
- ✅ Input-validering er på plass

### Review-kommentarer

**Format:**
- **Must fix:** Blokkerer merge
- **Should fix:** Anbefalt, men ikke blokkerende
- **Nice to have:** Forbedringsforslag

**Eksempler:**

```typescript
// ❌ Must fix: Direkte Supabase-kall i komponent
const { data } = await supabase.from("bookings").select("*");

// ✅ Should fix: Bruk service i stedet
const { data } = await getBookingsForSalon(salonId);

// 💡 Nice to have: Legg til loading state
```

---

## Utviklingsprosess (Oppsummert)

### 1. Opprett en branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Gjør endringene

Følg kodestandardene i `docs/coding-style.md` og arkitektur-dokumentene i `docs/architecture/`.

### 3. Test endringene

Sørg for at:
- Koden kompilerer uten feil (`npm run build`)
- Ingen ESLint-feil (`npm run lint`)
- Type check passerer (`npm run type-check`)
- Funksjonaliteten fungerer som forventet

### 4. Commit endringene

```bash
git commit -m "feat: add new feature"
```

Bruk konvensjonelle commit-meldinger:
- `feat:` - Ny funksjonalitet
- `fix:` - Bugfix
- `docs:` - Dokumentasjon
- `refactor:` - Refaktorering
- `test:` - Tester
- `chore:` - Maintenance tasks

### 5. Push og opprett Pull Request

```bash
git push origin feature/your-feature-name
```

Deretter:
1. Gå til GitHub
2. Opprett Pull Request
3. Fyll ut PR-beskrivelse
4. Vent på code review
5. Merge når godkjent

---

## Kodestandarder

### TypeScript

- Bruk TypeScript for all ny kode
- Definer typer eksplisitt
- Bruk domain-typer fra `src/lib/types.ts` (per app/package)

### Naming Conventions

- **Funksjoner:** camelCase (`getBookingsForSalon`)
- **Komponenter:** PascalCase (`BookingList`)
- **Types:** PascalCase (`Booking`, `CreateBookingInput`)
- **Filer:** kebab-case (`bookings-service.ts`)

### Error-håndtering

Alltid håndter errors fra services:

```typescript
const { data, error } = await getBookingsForSalon(salonId);
if (error) {
  // Håndter error
  setError(error);
  return;
}
// Bruk data
setBookings(data ?? []);
```

---

## Testing

### Services

Test services med mocked repositories (tilpass sti til riktig app/package):

```typescript
import { createBooking } from "@/lib/services/bookings-service";
import * as bookingsRepo from "@/lib/repositories/bookings";

jest.mock("@/lib/repositories/bookings");

it("should validate required fields", async () => {
  const result = await createBooking({} as CreateBookingInput);
  expect(result.error).toBe("Missing required fields");
});
```

---

## Dokumentasjon

### Oppdater dokumentasjon

Hvis du:
- Legger til nye features → Oppdater `docs/architecture/` eller `docs/backend/`
- Endrer arkitektur → Oppdater `docs/architecture/layers.md`
- Legger til nye typer → Oppdater `docs/architecture/types.md`

---

## Spørsmål?

Hvis du har spørsmål eller trenger hjelp:
1. Sjekk dokumentasjonen i `docs/`
2. Se på eksisterende kode for eksempler
3. Opprett en issue eller kontakt teamet

---

## Relaterte dokumenter

- `docs/coding-style.md` - Detaljert kodestilguide
- `docs/architecture/layers.md` - Arkitektur og lag-inndeling
- `docs/architecture/service-standards.md` - Service-standarder
- `docs/architecture/repository-standards.md` - Repository-standarder
- `docs/cursor-rule.md` - Cursor AI Development Standards

