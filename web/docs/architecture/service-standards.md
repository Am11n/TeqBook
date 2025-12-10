# Service Standards

Dette dokumentet beskriver standarder og konvensjoner for services i TeqBook.

---

## Filnavn

Services skal ha korte, domain-orienterte navn:

- ✅ `bookings-service.ts`
- ✅ `employees-service.ts`
- ✅ `customers-service.ts`
- ✅ `services-service.ts`
- ✅ `shifts-service.ts`
- ✅ `salons-service.ts`
- ✅ `profiles-service.ts`
- ✅ `auth-service.ts`
- ✅ `admin-service.ts`
- ✅ `onboarding-service.ts`
- ✅ `search-service.ts`

**Ikke** bruk suffix som `-service.ts` - dette er unødvendig siden filene allerede ligger i `services/` mappen.

---

## Ansvar

Services skal:

1. **Håndtere forretningslogikk** - Validering, domeneregler, orkestrering
2. **Kalle repositories** - Ikke direkte Supabase-kall
3. **Transformere data** - Konvertere mellom repository-format og domain-format
4. **Returnere typed resultater** - Konsistent format: `{ data: T | null; error: string | null }`

Services skal **ikke**:

1. ❌ Direkte Supabase-kall
2. ❌ UI-spesifikk logikk (toasts, router, redirect)
3. ❌ Database-operasjoner (skal være i repositories)

---

## Return-typer

Alle service-funksjoner skal returnere en konsistent format:

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
  // Validation
  if (!salonId || !employeeId) {
    return { data: null, error: "Salon ID and Employee ID are required" };
  }

  // Call repository
  return await employeesRepo.getEmployeeById(salonId, employeeId);
}

// Liste med paginering
export async function getEmployeesForSalon(
  salonId: string,
  options?: { page?: number; pageSize?: number }
): Promise<{ data: Employee[] | null; error: string | null; total?: number }> {
  // Validation
  if (!salonId) {
    return { data: null, error: "Salon ID is required" };
  }

  // Call repository
  return await employeesRepo.getEmployeesForCurrentSalon(salonId, options);
}
```

---

## Validering

Services skal validere forretningsregler:

### Input-validering

```typescript
export async function createService(
  input: CreateServiceInput
): Promise<{ data: Service | null; error: string | null }> {
  // Required fields
  if (!input.salon_id || !input.name || !input.duration_minutes || input.price_cents === undefined) {
    return { data: null, error: "All required fields must be provided" };
  }

  // Business rules
  if (input.duration_minutes <= 0) {
    return { data: null, error: "Duration must be greater than 0" };
  }

  if (input.price_cents < 0) {
    return { data: null, error: "Price cannot be negative" };
  }

  // Call repository
  return await servicesRepo.createService(input);
}
```

### Forretningsregler

```typescript
export async function createBooking(
  input: CreateBookingInput
): Promise<{ data: Booking | null; error: string | null }> {
  // Validation
  if (!input.salon_id || !input.employee_id || !input.service_id || !input.start_time || !input.customer_full_name) {
    return { data: null, error: "Missing required booking information." };
  }

  // Business logic: Check if start time is in the future
  const startTime = new Date(input.start_time);
  if (startTime < new Date()) {
    return { data: null, error: "Cannot create booking in the past" };
  }

  // Call repository (which may have additional validation via RPC)
  return await bookingsRepo.createBooking(input);
}
```

---

## Orkestrering

Services kan kombinere data fra flere repositories:

```typescript
export async function getCalendarEntriesForSalon(
  salonId: string,
  date: Date
): Promise<{ data: CalendarEntry[] | null; error: string | null }> {
  // Validation
  if (!salonId) {
    return { data: null, error: "Salon ID is required" };
  }

  // Orchestrate multiple repository calls
  const [bookingsResult, employeesResult] = await Promise.all([
    bookingsRepo.getBookingsForCalendar(salonId, { startDate: date.toISOString() }),
    employeesRepo.getEmployeesForCurrentSalon(salonId),
  ]);

  if (bookingsResult.error || employeesResult.error) {
    return { data: null, error: bookingsResult.error ?? employeesResult.error ?? "Failed to load calendar data" };
  }

  // Business logic: Combine and transform data
  const entries: CalendarEntry[] = (bookingsResult.data ?? []).map((booking) => ({
    ...booking,
    employee: employeesResult.data?.find((e) => e.id === booking.employees?.id),
  }));

  return { data: entries, error: null };
}
```

---

## Error-håndtering

Services skal håndtere errors fra repositories og returnere meningsfulle feilmeldinger:

```typescript
export async function updateEmployee(
  salonId: string,
  employeeId: string,
  input: UpdateEmployeeInput
): Promise<{ data: Employee | null; error: string | null }> {
  // Validation
  if (!salonId || !employeeId) {
    return { data: null, error: "Salon ID and Employee ID are required" };
  }

  // Call repository
  const result = await employeesRepo.updateEmployee(salonId, employeeId, input);

  // Transform error messages if needed
  if (result.error) {
    if (result.error.includes("not found")) {
      return { data: null, error: "Employee not found" };
    }
    if (result.error.includes("duplicate")) {
      return { data: null, error: "An employee with this email already exists" };
    }
  }

  return result;
}
```

---

## Best practices

### 1. Validering før repository-kall

```typescript
// ✅ RIKTIG
export async function createService(input: CreateServiceInput) {
  // Validate first
  if (!input.name) {
    return { data: null, error: "Service name is required" };
  }

  // Then call repository
  return await servicesRepo.createService(input);
}

// ❌ FEIL - Validering i repository
export async function createService(input: CreateServiceInput) {
  // Repository should not handle business validation
  return await servicesRepo.createService(input);
}
```

### 2. Ikke eksponer repository-detaljer

```typescript
// ✅ RIKTIG - Service abstraherer repository
export async function getEmployeesForSalon(salonId: string) {
  return await employeesRepo.getEmployeesForCurrentSalon(salonId);
}

// ❌ FEIL - Eksponerer repository-navn
export { getEmployeesForCurrentSalon } from "@/lib/repositories/employees";
```

### 3. Transformere data når nødvendig

```typescript
// ✅ RIKTIG - Service transformerer data
export async function getEmployeeWithServices(salonId: string, employeeId: string) {
  const result = await employeesRepo.getEmployeeWithServices(salonId, employeeId);
  
  if (result.data) {
    // Transform for UI consumption
    return {
      data: {
        employee: result.data.employee,
        services: result.data.services.map(s => ({ ...s, displayName: `${s.name} (${s.duration_minutes}min)` })),
      },
      error: null,
    };
  }
  
  return result;
}
```

### 4. Konsistent navngiving

```typescript
// ✅ RIKTIG - Konsistent navngiving
export async function getEmployeesForSalon(...)
export async function getServicesForSalon(...)
export async function getBookingsForSalon(...)

// ❌ FEIL - Inkonsistent navngiving
export async function getEmployeesForSalon(...)
export async function fetchServices(...)
export async function loadBookings(...)
```

---

## Eksempel: Komplett service

```typescript
// =====================================================
// Employees Service
// =====================================================
// Business logic layer for employees
// Orchestrates repository calls and handles domain rules

import * as employeesRepo from "@/lib/repositories/employees";
import type { Employee, CreateEmployeeInput, UpdateEmployeeInput } from "@/lib/types";

/**
 * Get all employees for the current salon with pagination
 */
export async function getEmployeesForSalon(
  salonId: string,
  options?: { page?: number; pageSize?: number }
): Promise<{ data: Employee[] | null; error: string | null; total?: number }> {
  // Validation
  if (!salonId) {
    return { data: null, error: "Salon ID is required" };
  }

  // Call repository
  return await employeesRepo.getEmployeesForCurrentSalon(salonId, options);
}

/**
 * Create a new employee with business logic
 */
export async function createEmployee(
  input: CreateEmployeeInput
): Promise<{ data: Employee | null; error: string | null }> {
  // Validation
  if (!input.salon_id || !input.full_name) {
    return { data: null, error: "Salon ID and full name are required" };
  }

  // Business rules
  if (input.email && !isValidEmail(input.email)) {
    return { data: null, error: "Invalid email format" };
  }

  // Call repository
  return await employeesRepo.createEmployee(input);
}

/**
 * Update an employee with business logic
 */
export async function updateEmployee(
  salonId: string,
  employeeId: string,
  input: UpdateEmployeeInput
): Promise<{ data: Employee | null; error: string | null }> {
  // Validation
  if (!salonId || !employeeId) {
    return { data: null, error: "Salon ID and Employee ID are required" };
  }

  // Business rules
  if (input.email && !isValidEmail(input.email)) {
    return { data: null, error: "Invalid email format" };
  }

  // Call repository
  return await employeesRepo.updateEmployee(salonId, employeeId, input);
}

// Helper function (business logic)
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

---

## Relaterte dokumenter

- `docs/architecture/layers.md` - Arkitektur og lag-inndeling
- `docs/architecture/repository-standards.md` - Repository-standarder
- `docs/architecture/types.md` - Type-definisjoner

