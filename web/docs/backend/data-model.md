# TeqBook – Data Model Documentation

Dette dokumentet beskriver datamodellen i TeqBook og hvordan den mappes til TypeScript-typer.

---

## Oversikt

TeqBook bruker en **salon-basert multi-tenant arkitektur**. Alle funksjonelle tabeller er knyttet til en `salons` tabell via `salon_id` foreign key.

---

## Core Tables

### `salons`

**Beskrivelse:** Hovedtabell for salonger (tenants)

**Kolonner:**
- `id` (UUID, PK) - Unik identifikator
- `name` (TEXT) - Salongnavn
- `slug` (TEXT, nullable) - URL-vennlig identifikator
- `is_public` (BOOLEAN) - Om salongen er tilgjengelig for offentlig booking
- `preferred_language` (TEXT, nullable) - Foretrukket språk
- `salon_type` (TEXT, nullable) - Type salong: 'barber', 'nails', 'massage', 'other'
- `whatsapp_number` (TEXT, nullable) - WhatsApp kontaktnummer
- `supported_languages` (TEXT[]) - Array av støttede språk
- `default_language` (TEXT) - Standard språk

**TypeScript Type:**
```typescript
export type Salon = {
  id: string;
  name: string;
  slug: string | null;
  is_public: boolean;
  preferred_language: string | null;
  salon_type?: string | null;
  whatsapp_number?: string | null;
  supported_languages?: string[];
  default_language?: string;
};
```

---

### `employees`

**Beskrivelse:** Ansatte i en salong

**Kolonner:**
- `id` (UUID, PK)
- `salon_id` (UUID, FK → salons.id) - **Multi-tenant key**
- `full_name` (TEXT)
- `email` (TEXT, nullable)
- `phone` (TEXT, nullable)
- `role` (TEXT, nullable) - 'owner', 'manager', 'staff' (kan også være enum)
- `preferred_language` (TEXT, nullable)
- `is_active` (BOOLEAN)
- `created_at` (TIMESTAMPTZ)

**TypeScript Type:**
```typescript
export type Employee = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: EmployeeRole | string | null;
  preferred_language: string | null;
  is_active: boolean;
};
```

**Relasjoner:**
- Mange-til-mange med `services` via `employee_services` junction table

---

### `services`

**Beskrivelse:** Tjenester som tilbys av en salong

**Kolonner:**
- `id` (UUID, PK)
- `salon_id` (UUID, FK → salons.id) - **Multi-tenant key**
- `name` (TEXT)
- `category` (TEXT, nullable) - 'cut', 'beard', 'color', 'nails', 'massage', 'other'
- `duration_minutes` (INTEGER)
- `price_cents` (INTEGER) - Pris i cent
- `sort_order` (INTEGER, nullable)
- `is_active` (BOOLEAN)
- `created_at` (TIMESTAMPTZ)

**TypeScript Type:**
```typescript
export type Service = {
  id: string;
  name: string;
  category: string | null;
  duration_minutes: number;
  price_cents: number;
  sort_order: number | null;
  is_active: boolean;
};
```

---

### `bookings`

**Beskrivelse:** Bookinger/appointmenter

**Kolonner:**
- `id` (UUID, PK)
- `salon_id` (UUID, FK → salons.id) - **Multi-tenant key**
- `employee_id` (UUID, FK → employees.id)
- `service_id` (UUID, FK → services.id)
- `customer_id` (UUID, FK → customers.id, nullable)
- `start_time` (TIMESTAMPTZ)
- `end_time` (TIMESTAMPTZ)
- `status` (TEXT) - 'pending', 'confirmed', 'completed', 'cancelled', 'no-show', 'scheduled'
- `is_walk_in` (BOOLEAN)
- `notes` (TEXT, nullable)
- `created_at` (TIMESTAMPTZ)

**TypeScript Type:**
```typescript
export type Booking = {
  id: string;
  start_time: string;
  end_time: string;
  status: BookingStatus | string;
  is_walk_in: boolean;
  notes: string | null;
  customers: { full_name: string | null } | null;
  employees: { full_name: string | null } | null;
  services: { name: string | null } | null;
};
```

**Relasjoner:**
- `employee_id` → `employees`
- `service_id` → `services`
- `customer_id` → `customers`

---

### `customers`

**Beskrivelse:** Kunder

**Kolonner:**
- `id` (UUID, PK)
- `salon_id` (UUID, FK → salons.id) - **Multi-tenant key**
- `full_name` (TEXT)
- `email` (TEXT, nullable)
- `phone` (TEXT, nullable)
- `notes` (TEXT, nullable)
- `gdpr_consent` (BOOLEAN)
- `created_at` (TIMESTAMPTZ)

**TypeScript Type:**
```typescript
export type Customer = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  gdpr_consent: boolean;
};
```

---

### `shifts`

**Beskrivelse:** Vakter for ansatte

**Kolonner:**
- `id` (UUID, PK)
- `salon_id` (UUID, FK → salons.id) - **Multi-tenant key**
- `employee_id` (UUID, FK → employees.id)
- `weekday` (INTEGER) - 0-6 (Sunday-Saturday)
- `start_time` (TIME) - HH:mm format
- `end_time` (TIME) - HH:mm format
- `created_at` (TIMESTAMPTZ)

**TypeScript Type:**
```typescript
export type Shift = {
  id: string;
  employee_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
  employee?: {
    full_name: string;
  };
};
```

---

### `employee_services`

**Beskrivelse:** Junction table for mange-til-mange relasjon mellom employees og services

**Kolonner:**
- `id` (UUID, PK)
- `salon_id` (UUID, FK → salons.id) - **Multi-tenant key**
- `employee_id` (UUID, FK → employees.id)
- `service_id` (UUID, FK → services.id)
- `created_at` (TIMESTAMPTZ)
- UNIQUE(employee_id, service_id)

**TypeScript Type:**
```typescript
export type EmployeeService = {
  employee_id: string;
  service_id: string;
  services: { id: string; name: string } | null;
};
```

---

### `opening_hours`

**Beskrivelse:** Åpningstider for salonger

**Kolonner:**
- `id` (UUID, PK)
- `salon_id` (UUID, FK → salons.id) - **Multi-tenant key**
- `day_of_week` (INTEGER) - 0-6 (Sunday-Saturday)
- `open_time` (TIME) - HH:mm format
- `close_time` (TIME) - HH:mm format
- `created_at` (TIMESTAMPTZ)

**TypeScript Type:**
```typescript
export type OpeningHours = {
  day: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
};
```

---

### `profiles`

**Beskrivelse:** Brukerprofiler (knytter brukere til salonger)

**Kolonner:**
- `user_id` (UUID, PK, FK → auth.users.id)
- `salon_id` (UUID, FK → salons.id, nullable)
- `is_superadmin` (BOOLEAN)
- `role` (TEXT, nullable) - 'owner', 'manager', 'staff', 'superadmin'
- `user_preferences` (JSONB, nullable) - Brukerpreferanser
- `preferred_language` (TEXT, nullable)

**TypeScript Type:**
```typescript
export type Profile = {
  user_id: string;
  salon_id: string | null;
  is_superadmin: boolean;
  role?: string | null;
  user_preferences?: {
    sidebarCollapsed?: boolean;
    [key: string]: unknown;
  } | null;
  preferred_language?: string | null;
};
```

---

## Postgres Enums

### `booking_status`

```sql
CREATE TYPE booking_status AS ENUM (
  'pending',
  'confirmed',
  'completed',
  'cancelled',
  'no-show',
  'scheduled'
);
```

**TypeScript Type:**
```typescript
export type BookingStatus = 
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no-show"
  | "scheduled";
```

### `employee_role`

```sql
CREATE TYPE employee_role AS ENUM (
  'owner',
  'manager',
  'staff'
);
```

**TypeScript Type:**
```typescript
export type EmployeeRole = 
  | "owner"
  | "manager"
  | "staff";
```

---

## Input Types

Alle input-typer for å opprette eller oppdatere entities er definert i `src/lib/types.ts`:

- `CreateEmployeeInput`
- `UpdateEmployeeInput`
- `CreateServiceInput`
- `UpdateServiceInput`
- `CreateBookingInput`
- `CreateShiftInput`
- `CreateCustomerInput`

---

## Multi-Tenant Architecture

Alle funksjonelle tabeller har `salon_id` som foreign key:

- ✅ `employees.salon_id`
- ✅ `bookings.salon_id`
- ✅ `services.salon_id`
- ✅ `customers.salon_id`
- ✅ `shifts.salon_id`
- ✅ `opening_hours.salon_id`
- ✅ `employee_services.salon_id`

**Foreign Key Constraint:**
```sql
FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE
```

Dette sikrer at når en salong slettes, slettes all relatert data automatisk.

---

## Type Mapping Summary

| Database Table | TypeScript Type | Location |
|---------------|----------------|----------|
| `salons` | `Salon` | `src/lib/types.ts` |
| `employees` | `Employee` | `src/lib/types.ts` |
| `services` | `Service` | `src/lib/types.ts` |
| `bookings` | `Booking`, `CalendarBooking` | `src/lib/types.ts` |
| `customers` | `Customer` | `src/lib/types.ts` |
| `shifts` | `Shift` | `src/lib/types.ts` |
| `employee_services` | `EmployeeService` | `src/lib/types.ts` |
| `opening_hours` | `OpeningHours` | `src/lib/types.ts` |
| `profiles` | `Profile` | `src/lib/types.ts` |

---

## Relasjoner

### One-to-Many

- `salons` → `employees` (1:N)
- `salons` → `services` (1:N)
- `salons` → `bookings` (1:N)
- `salons` → `customers` (1:N)
- `salons` → `shifts` (1:N)
- `employees` → `bookings` (1:N)
- `employees` → `shifts` (1:N)
- `services` → `bookings` (1:N)
- `customers` → `bookings` (1:N)

### Many-to-Many

- `employees` ↔ `services` (via `employee_services`)

---

## Indexes

For optimal ytelse er følgende indekser opprettet:

- `idx_bookings_salon_start_time` - Bookings per salong og tid
- `idx_bookings_salon_employee_start` - Bookings per salong, ansatt og tid
- `idx_employees_salon_id` - Ansatte per salong
- `idx_customers_salon_id` - Kunder per salong
- `idx_services_salon_id` - Tjenester per salong
- `idx_shifts_salon_id` - Vakter per salong
- `idx_shifts_salon_employee_start` - Vakter per salong, ansatt og tid
- `idx_opening_hours_salon_id` - Åpningstider per salong
- `idx_employee_services_salon_id` - Employee-services per salong

---

## Relaterte dokumenter

- `docs/architecture/types.md` - Detaljert type-dokumentasjon
- `docs/backend/supabase-foundation.md` - Supabase foundation dokumentasjon
- `docs/architecture/layers.md` - Arkitektur og lag-inndeling

