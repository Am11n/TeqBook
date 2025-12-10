# Repository Standards

Dette dokumentet beskriver standarder og konvensjoner for repositories i TeqBook.

---

## Filnavn

Repositories skal ha korte, domain-orienterte navn:

- ✅ `bookings.ts`
- ✅ `employees.ts`
- ✅ `customers.ts`
- ✅ `services.ts`
- ✅ `shifts.ts`
- ✅ `salons.ts`
- ✅ `profiles.ts`

**Ikke** bruk suffix som `-repository.ts` - dette er unødvendig siden filene allerede ligger i `repositories/` mappen.

---

## Return-typer

Alle repository-funksjoner skal returnere en konsistent format:

### Standard format

```typescript
Promise<{ data: T | null; error: string | null }>
```

### Med paginering

```typescript
Promise<{ data: T[] | null; error: string | null; total?: number }>
```

### Eksempler

```typescript
// Enkelt resultat
export async function getEmployeeById(
  salonId: string,
  employeeId: string
): Promise<{ data: Employee | null; error: string | null }> {
  // ...
}

// Liste med paginering
export async function getEmployeesForCurrentSalon(
  salonId: string,
  options?: { page?: number; pageSize?: number }
): Promise<{ data: Employee[] | null; error: string | null; total?: number }> {
  // ...
}

// Kun error (for delete-operasjoner)
export async function deleteEmployee(
  salonId: string,
  employeeId: string
): Promise<{ error: string | null }> {
  // ...
}
```

---

## Error-håndtering

### Standard error-håndtering

```typescript
try {
  const { data, error } = await supabase.from("table").select("*");

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as T, error: null };
} catch (err) {
  return {
    data: null,
    error: err instanceof Error ? err.message : "Unknown error",
  };
}
```

### Viktige regler

1. **Alltid** håndter både Supabase `error` og `catch`-blokker
2. **Alltid** returner `{ data: null, error: string }` ved feil
3. **Ikke** kast exceptions - returner error i resultatet
4. Bruk `error.message` fra Supabase når tilgjengelig
5. Fallback til generisk melding hvis error ikke er en Error-instans

---

## Select-felter

### Eksplisitte select-felter

**✅ RIKTIG:**
```typescript
.select("id, full_name, email, phone, role, is_active")
```

**❌ FEIL:**
```typescript
.select("*")  // Unngå - eksponerer for mye data
```

### Relasjoner

Når du henter relaterte data, bruk Supabase's relasjonssyntaks:

```typescript
.select("id, start_time, end_time, customers(full_name), employees(full_name), services(name)")
```

---

## Input-validering

Repositories skal **ikke** validere forretningsregler, men kan validere grunnleggende data:

```typescript
// ✅ OK - Grunnleggende data-validering
if (!salonId) {
  return { data: null, error: "Salon ID is required" };
}

// ❌ IKKE OK - Forretningsregel (skal være i service)
if (startTime < new Date()) {
  return { data: null, error: "Start time must be in the future" };
}
```

---

## Forbudt i repositories

### ❌ UI-spesifikk logikk

```typescript
// ❌ FEIL
if (error) {
  toast.error("Failed to load data");
  router.push("/error");
  return;
}
```

### ❌ Forretningslogikk

```typescript
// ❌ FEIL - Dette skal være i service
if (booking.start_time < new Date()) {
  return { data: null, error: "Cannot book in the past" };
}
```

### ❌ Direkte Supabase-eksponering

```typescript
// ❌ FEIL - Eksponer ikke rå Supabase-respons
export async function getBookings() {
  return await supabase.from("bookings").select("*");
}
```

---

## Best practices

### 1. Konsistent paginering

```typescript
const page = options?.page ?? 0;
const pageSize = options?.pageSize ?? 50;
const from = page * pageSize;
const to = from + pageSize - 1;

const { data, error, count } = await supabase
  .from("table")
  .select("*", { count: "exact" })
  .range(from, to);
```

### 2. Type-safe casting

```typescript
// ✅ OK - Eksplisitt casting
return { data: data as Employee[], error: null };

// ❌ IKKE OK - Implisitt any
return { data: data, error: null };
```

### 3. maybeSingle() vs single()

```typescript
// ✅ OK - maybeSingle() når data kan mangle
const { data, error } = await supabase
  .from("employees")
  .select("*")
  .eq("id", employeeId)
  .maybeSingle();

// ✅ OK - single() når data må eksistere
const { data, error } = await supabase
  .from("employees")
  .select("*")
  .eq("id", employeeId)
  .single();
```

### 4. Multi-tenant sikkerhet

**Alltid** inkluder `salon_id` i queries:

```typescript
// ✅ OK
.eq("salon_id", salonId)

// ❌ FEIL - Kan eksponere data fra andre salonger
.select("*")
```

---

## Eksempel: Komplett repository

```typescript
// =====================================================
// Employees Repository
// =====================================================
// Centralized data access layer for employees
// Abstracts Supabase calls and provides type-safe API

import { supabase } from "@/lib/supabase-client";
import type { Employee, CreateEmployeeInput, UpdateEmployeeInput } from "@/lib/types";

/**
 * Get all employees for the current salon with pagination
 */
export async function getEmployeesForCurrentSalon(
  salonId: string,
  options?: { page?: number; pageSize?: number }
): Promise<{ data: Employee[] | null; error: string | null; total?: number }> {
  try {
    const page = options?.page ?? 0;
    const pageSize = options?.pageSize ?? 50;
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from("employees")
      .select("id, full_name, email, phone, role, preferred_language, is_active", { count: "exact" })
      .eq("salon_id", salonId)
      .order("created_at", { ascending: true })
      .range(from, to);

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as Employee[], error: null, total: count ?? undefined };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
```

---

## Verifisering

For å verifisere at repositories følger standardene:

```bash
# Sjekk at ingen repositories har UI-logikk
grep -r "router\|toast\|redirect" src/lib/repositories/

# Sjekk at alle repositories bruker konsistent error-håndtering
grep -r "catch (err)" src/lib/repositories/

# Sjekk at alle repositories har eksplisitte select-felter
grep -r '\.select\("\*"' src/lib/repositories/
```

---

## Oppdateringer

Dette dokumentet skal oppdateres når:
- Nye standarder etableres
- Eksisterende standarder endres
- Nye best practices identifiseres

