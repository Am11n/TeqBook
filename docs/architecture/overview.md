# TeqBook – Architecture Overview

Dette dokumentet gir en oversikt over arkitekturen i TeqBook.

---

## Arkitektur-prinsipp

TeqBook følger en **lagdelt arkitektur** (layered architecture) med tydelige grenser mellom lag:

```
┌─────────────────────────────────────┐
│   UI Layer                           │
│   (pages, components)                │
│   - Presentasjon                     │
│   - Brukerinteraksjoner              │
│   - Loading/error states             │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│   Services Layer                    │
│   (src/lib/services/*)              │
│   - Forretningslogikk               │
│   - Validering                      │
│   - Orkestrering                    │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│   Repositories Layer                │
│   (src/lib/repositories/*)          │
│   - Database-operasjoner            │
│   - Data mapping                    │
│   - Error-håndtering                │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│   Supabase Client                   │
│   (src/lib/supabase-client.ts)      │
│   - Database-klient                 │
│   - Auth-klient                     │
└─────────────────────────────────────┘
```

---

## Dataflyt

### Eksempel: Hente bookings

1. **UI** kaller service:
   ```typescript
   const { data, error } = await getBookingsForSalon(salonId);
   ```

2. **Service** validerer og kaller repository:
   ```typescript
   // Validering
   if (!salonId) {
     return { data: null, error: "Salon ID is required" };
   }
   
   // Kaller repository
   return await bookingsRepo.getBookingsForCurrentSalon(salonId);
   ```

3. **Repository** gjør database-kall:
   ```typescript
   const { data, error } = await supabase
     .from("bookings")
     .select("*")
     .eq("salon_id", salonId);
   ```

4. **Data flyter tilbake:**
   - Repository → Service → UI

---

## Lag-beskrivelse

### UI Layer

**Lokasjon:** `src/app/`, `src/components/`

**Ansvar:**
- Presentasjon av data
- Brukerinteraksjoner
- Loading/error states
- Routing

**Regler:**
- ❌ **FORBUDT:** Direkte Supabase-imports
- ✅ **TILLATT:** Import fra `@/lib/services/*`
- ✅ **TILLATT:** Import fra `@/lib/types`

### Services Layer

**Lokasjon:** `src/lib/services/`

**Ansvar:**
- Forretningslogikk
- Validering
- Orkestrering av flere repository-kall
- Data-transformering

**Regler:**
- ✅ **TILLATT:** Import fra `@/lib/repositories/*`
- ❌ **FORBUDT:** Direkte Supabase-imports
- ❌ **FORBUDT:** UI-spesifikk logikk

### Repositories Layer

**Lokasjon:** `src/lib/repositories/`

**Ansvar:**
- Rene database-operasjoner
- Mapping mellom Supabase og domain-typer
- Error-håndtering

**Regler:**
- ✅ **TILLATT:** Import fra `@/lib/supabase-client`
- ❌ **FORBUDT:** Forretningslogikk
- ❌ **FORBUDT:** UI-spesifikk logikk

---

## Multi-Tenant Architecture

TeqBook bruker en **salon-basert multi-tenant arkitektur**:

- Alle funksjonelle tabeller har `salon_id` foreign key
- Data er isolert per salong
- RLS (Row Level Security) sikrer at brukere kun ser data fra sin salong

**Eksempel:**
```sql
-- Alle queries inkluderer salon_id
SELECT * FROM bookings WHERE salon_id = '...';
```

---

## Type-sikkerhet

Alle typer er definert i `src/lib/types.ts`:

- **Entity-typer:** `Employee`, `Service`, `Booking`, etc.
- **Input-typer:** `CreateEmployeeInput`, `UpdateServiceInput`, etc.
- **Enum-typer:** `BookingStatus`, `EmployeeRole`, etc.

**Bruk domain-typer, ikke Supabase-raw-typer:**
```typescript
// ✅ RIKTIG
import type { Booking } from "@/lib/types";

// ❌ FEIL
import type { Database } from "@/lib/supabase-types";
```

---

## Error-håndtering

Alle lag returnerer konsistent format:

```typescript
{ data: T | null; error: string | null }
```

**Eksempel:**
```typescript
// Repository
return { data: bookings, error: null };

// Service
if (!salonId) {
  return { data: null, error: "Salon ID is required" };
}

// UI
const { data, error } = await getBookingsForSalon(salonId);
if (error) {
  setError(error);
  return;
}
```

---

## Testing Strategy

### Services

Test services med mocked repositories:

```typescript
jest.mock("@/lib/repositories/bookings");

it("should validate required fields", async () => {
  const result = await createBooking({} as CreateBookingInput);
  expect(result.error).toBe("Missing required fields");
});
```

### Repositories

Test repositories med mocked Supabase-klient (eller integration tests).

---

## Relaterte dokumenter

- `docs/architecture/layers.md` - Detaljert lag-inndeling
- `docs/architecture/service-standards.md` - Service-standarder
- `docs/architecture/repository-standards.md` - Repository-standarder
- `docs/architecture/types.md` - Type-dokumentasjon
- `docs/backend/data-model.md` - Datamodell
- `docs/coding-style.md` - Kodestilguide

