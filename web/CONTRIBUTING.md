# Contributing to TeqBook

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

## Utviklingsprosess

### 1. Opprett en branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Gjør endringene

Følg kodestandardene i `docs/coding-style.md`.

### 3. Test endringene

Sørg for at:
- Koden kompilerer uten feil
- Ingen ESLint-feil
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

### 5. Push og opprett Pull Request

```bash
git push origin feature/your-feature-name
```

---

## Kodestandarder

### TypeScript

- Bruk TypeScript for all ny kode
- Definer typer eksplisitt
- Bruk domain-typer fra `src/lib/types.ts`

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

Test services med mocked repositories:

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

