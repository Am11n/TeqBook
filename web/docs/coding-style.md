# TeqBook – Coding Style Guide

Dette dokumentet beskriver kodestandarder og best practices for TeqBook.

---

## Arkitektur-prinsipper

### Lag-inndeling

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

**Kritisk regel:** Ingen komponent eller page skal importere Supabase-klienten direkte.

---

## UI-laget

### ❌ FORBUDT i UI-laget

```typescript
// ❌ FEIL - Direkte Supabase-import
import { supabase } from "@/lib/supabase-client";
import { createClient } from "@supabase/supabase-js";

// ❌ FEIL - Direkte databasekall
const { data } = await supabase.from("bookings").select("*");
const { data } = await supabase.rpc("some_function");
const { user } = await supabase.auth.getUser();
```

### ✅ TILLATT i UI-laget

```typescript
// ✅ RIKTIG - Via services
import { getBookingsForSalon } from "@/lib/services/bookings-service";
import { createEmployee } from "@/lib/services/employees-service";

// ✅ RIKTIG - Domain-typer
import type { Booking, Employee, Service } from "@/lib/types";

// ✅ RIKTIG - Repositories for spesialiserte queries (kun når nødvendig)
import { getBookingsForCalendar } from "@/lib/repositories/bookings";
```

### Page Layout og Actions

**Kritisk regel:** Alle sider som har en "Create" eller "New" knapp skal bruke `PageLayout` med `actions` prop for å plassere knappen på høyre side av tittelen.

```typescript
// ✅ RIKTIG - Knapp på høyre side via actions prop
<PageLayout
  title="Products"
  description="Manage your inventory and products"
  actions={
    <Button onClick={openCreateModal} size="sm">
      <Plus className="h-4 w-4" />
      Create Product
    </Button>
  }
>
  {/* Page content */}
</PageLayout>

// ❌ FEIL - Knapp under tittelen
<PageLayout title="Products" description="...">
  <Button onClick={openCreateModal}>Create Product</Button>
  {/* Page content */}
</PageLayout>
```

**Regel:** 
- Alle "Create", "New", "Add" knapper skal ligge på høyre side av page header
- Bruk `PageLayout` med `actions` prop for konsistent plassering
- Knapper i `actions` skal ha `size="sm"` for konsistent størrelse

### Best practices for UI

1. **Bruk services for all datatilgang**
   ```typescript
   // ✅ RIKTIG
   const { data, error } = await getBookingsForSalon(salonId);
   
   // ❌ FEIL
   const { data } = await supabase.from("bookings").select("*");
   ```

2. **Håndter loading og error states**
   ```typescript
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [data, setData] = useState<Booking[]>([]);
   
   useEffect(() => {
     async function loadData() {
       setLoading(true);
       const { data, error } = await getBookingsForSalon(salonId);
       if (error) {
         setError(error);
       } else {
         setData(data ?? []);
       }
       setLoading(false);
     }
     loadData();
   }, [salonId]);
   ```

3. **Bruk domain-typer, ikke Supabase-raw-typer**
   ```typescript
   // ✅ RIKTIG
   import type { Booking } from "@/lib/types";
   const bookings: Booking[] = [];
   
   // ❌ FEIL
   import type { Database } from "@/lib/supabase-types";
   const bookings: Database["public"]["Tables"]["bookings"]["Row"][] = [];
   ```

---

## Services-lag

### Ansvar

Services skal:
- Håndtere forretningslogikk og validering
- Orkestrere flere repository-kall
- Transformere data mellom lag
- Returnere typed resultater

### Eksempel

```typescript
// ✅ RIKTIG - Service med forretningslogikk
export async function createBooking(
  input: CreateBookingInput
): Promise<{ data: Booking | null; error: string | null }> {
  // Validation
  if (!input.salon_id || !input.employee_id || !input.service_id) {
    return { data: null, error: "Missing required fields" };
  }

  // Business logic
  const startTime = new Date(input.start_time);
  if (startTime < new Date()) {
    return { data: null, error: "Cannot create booking in the past" };
  }

  // Call repository
  return await bookingsRepo.createBooking(input);
}
```

---

## Repositories-lag

### Ansvar

Repositories skal:
- Gjøre rene databaseoperasjoner
- Mappe Supabase-respons til domain-typer
- Håndtere database-errors
- **IKKE** inneholde forretningslogikk

### Eksempel

```typescript
// ✅ RIKTIG - Ren databaseoperasjon
export async function getBookingsForCurrentSalon(
  salonId: string,
  options?: { page?: number; pageSize?: number }
): Promise<{ data: Booking[] | null; error: string | null; total?: number }> {
  try {
    const { data, error, count } = await supabase
      .from("bookings")
      .select("id, start_time, end_time, status, ...", { count: "exact" })
      .eq("salon_id", salonId)
      .order("start_time", { ascending: true });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as Booking[], error: null, total: count ?? undefined };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
```

---

## Type-sikkerhet

### Bruk domain-typer

```typescript
// ✅ RIKTIG
import type { Booking, Employee, Service } from "@/lib/types";

// ❌ FEIL
import type { Database } from "@/lib/supabase-types";
```

### Nullable felter

```typescript
// ✅ RIKTIG - Eksplisitt nullable
email: string | null;

// ❌ FEIL - Optional betyr ikke nullable
email?: string;
```

---

## Error-håndtering

### Services og Repositories

```typescript
// ✅ RIKTIG - Returner { data, error }
export async function getBookings(): Promise<{ data: Booking[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase.from("bookings").select("*");
    if (error) {
      return { data: null, error: error.message };
    }
    return { data: data as Booking[], error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
```

### UI-lag

```typescript
// ✅ RIKTIG - Håndter errors fra services
const { data, error } = await getBookingsForSalon(salonId);
if (error) {
  setError(error);
  return;
}
setBookings(data ?? []);
```

---

## Filnavn og struktur

### Services

- `bookings-service.ts`
- `employees-service.ts`
- `customers-service.ts`
- etc.

### Repositories

- `bookings.ts`
- `employees.ts`
- `customers.ts`
- etc.

### Types

- Alle typer i `src/lib/types.ts`

---

## Naming Conventions

### Funksjoner

- Services: `getBookingsForSalon`, `createBooking`, `updateEmployee`
- Repositories: `getBookingsForCurrentSalon`, `createBooking`, `updateEmployee`

### Variabler

- camelCase: `salonId`, `employeeId`, `bookingData`
- Boolean: `isLoading`, `hasError`, `isActive`

### Types

- PascalCase: `Booking`, `Employee`, `CreateBookingInput`

---

## Kommentarer

### JSDoc for eksporterte funksjoner

```typescript
/**
 * Get all bookings for the current salon with pagination
 * @param salonId - The salon ID
 * @param options - Pagination options
 * @returns Promise with bookings data or error
 */
export async function getBookingsForSalon(
  salonId: string,
  options?: { page?: number; pageSize?: number }
): Promise<{ data: Booking[] | null; error: string | null; total?: number }> {
  // ...
}
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

## Relaterte dokumenter

- `docs/architecture/layers.md` - Detaljert lag-inndeling
- `docs/architecture/service-standards.md` - Service-standarder
- `docs/architecture/repository-standards.md` - Repository-standarder
- `docs/architecture/types.md` - Type-dokumentasjon

