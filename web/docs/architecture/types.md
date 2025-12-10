# TeqBook – Type Definitions

Dette dokumentet beskriver alle type-definisjoner i TeqBook og hvordan de relaterer til database-schemaet.

---

## Fil-struktur

Alle typer er definert i `src/lib/types.ts` for sentralisert type-håndtering.

---

## Enum-typer

Disse typene matcher Postgres-enums i databasen:

### `BookingStatus`

```typescript
export type BookingStatus = 
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no-show"
  | "scheduled";
```

**Database:** `booking_status` enum i Postgres  
**Brukes i:** `bookings.status` kolonne

### `EmployeeRole`

```typescript
export type EmployeeRole = 
  | "owner"
  | "manager"
  | "staff";
```

**Database:** `employee_role` enum i Postgres  
**Brukes i:** `employees.role` kolonne (kan også være text for bakoverkompatibilitet)

### `PlanType`

```typescript
export type PlanType = 
  | "starter"
  | "pro"
  | "business";
```

**Database:** `plan_type` enum i Postgres  
**Brukes i:** Fremtidig `organizations.plan_id` eller lignende

### `NotificationType`

```typescript
export type NotificationType = 
  | "sms"
  | "email"
  | "whatsapp";
```

**Database:** `notification_type` enum i Postgres  
**Brukes i:** Fremtidig notifikasjonssystem

### `NotificationStatus`

```typescript
export type NotificationStatus = 
  | "pending"
  | "sent"
  | "failed";
```

**Database:** `notification_status` enum i Postgres  
**Brukes i:** Fremtidig notifikasjonssystem

### `PaymentMethod`

```typescript
export type PaymentMethod = 
  | "in_salon"
  | "online";
```

**Database:** `payment_method` enum i Postgres  
**Brukes i:** Fremtidig betalingssystem

---

## Entity-typer

### `Employee`

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

**Database:** `employees` tabell  
**Notater:**
- `role` kan være enum eller text for bakoverkompatibilitet
- `preferred_language` støtter: 'nb', 'en', 'ar', 'so', 'ti', 'am', 'tr', 'pl', 'vi', 'tl', 'zh', 'fa', 'dar', 'ur', 'hi'

### `Service`

```typescript
export type Service = {
  id: string;
  name: string;
  category: string | null; // 'cut', 'beard', 'color', 'nails', 'massage', 'other'
  duration_minutes: number;
  price_cents: number;
  sort_order: number | null;
  is_active: boolean;
};
```

**Database:** `services` tabell  
**Notater:**
- `category` kan være: 'cut', 'beard', 'color', 'nails', 'massage', 'other'
- `price_cents` er pris i cent (f.eks. 2500 = $25.00)

### `Booking`

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

**Database:** `bookings` tabell  
**Notater:**
- `status` kan være enum eller text for bakoverkompatibilitet
- Relasjoner (`customers`, `employees`, `services`) er nested objects fra Supabase joins

### `CalendarBooking`

```typescript
export type CalendarBooking = {
  id: string;
  start_time: string;
  end_time: string;
  status: BookingStatus | string;
  is_walk_in: boolean;
  customers: { full_name: string | null } | null;
  employees: { id: string; full_name: string | null } | null;
  services: { name: string | null } | null;
};
```

**Database:** `bookings` tabell (med spesifikk select)  
**Notater:**
- Variant av `Booking` spesifikt for kalender-visning
- Inkluderer `employees.id` for kalender-funksjonalitet

### `Customer`

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

**Database:** `customers` tabell

### `Shift`

```typescript
export type Shift = {
  id: string;
  employee_id: string;
  weekday: number; // 0-6 (Sunday-Saturday)
  start_time: string; // HH:mm format
  end_time: string; // HH:mm format
  employee?: {
    full_name: string;
  };
};
```

**Database:** `shifts` tabell  
**Notater:**
- `weekday`: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
- `employee` er optional nested object fra Supabase join

### `Salon`

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

**Database:** `salons` tabell  
**Notater:**
- `salon_type` kan være: 'barber', 'nails', 'massage', 'other'
- `supported_languages` er array av språkkoder
- `default_language` er standard språk for salongen

### `Profile`

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

**Database:** `profiles` tabell  
**Notater:**
- `user_preferences` er JSONB i databasen, kan inneholde vilkårlige nøkler
- `role` kan være: 'owner', 'manager', 'staff', 'superadmin'

### `OpeningHours`

```typescript
export type OpeningHours = {
  day: number; // 0-6 (Sunday-Saturday)
  isOpen: boolean;
  openTime: string; // HH:mm format
  closeTime: string; // HH:mm format
};
```

**Database:** `opening_hours` tabell  
**Notater:**
- Brukes for å definere åpningstider per dag
- `day`: 0 = Sunday, 1 = Monday, ..., 6 = Saturday

### `EmployeeService`

```typescript
export type EmployeeService = {
  employee_id: string;
  service_id: string;
  services: { id: string; name: string } | null;
};
```

**Database:** `employee_services` junction table  
**Notater:**
- Mange-til-mange relasjon mellom employees og services
- `services` er nested object fra Supabase join

---

## Input-typer

Disse typene brukes for å opprette eller oppdatere entities:

### `CreateEmployeeInput`

```typescript
export type CreateEmployeeInput = {
  salon_id: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  preferred_language?: string;
  service_ids?: string[];
};
```

**Notater:**
- `service_ids` brukes for å knytte ansatte til tjenester via `employee_services` tabell

### `UpdateEmployeeInput`

```typescript
export type UpdateEmployeeInput = {
  full_name?: string;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  preferred_language?: string;
  is_active?: boolean;
  service_ids?: string[];
};
```

### `CreateServiceInput`

```typescript
export type CreateServiceInput = {
  salon_id: string;
  name: string;
  category?: string | null;
  duration_minutes: number;
  price_cents: number;
  sort_order?: number;
};
```

### `UpdateServiceInput`

```typescript
export type UpdateServiceInput = {
  name?: string;
  category?: string | null;
  duration_minutes?: number;
  price_cents?: number;
  sort_order?: number;
  is_active?: boolean;
};
```

### `CreateBookingInput`

```typescript
export type CreateBookingInput = {
  salon_id: string;
  employee_id: string;
  service_id: string;
  start_time: string;
  customer_full_name: string;
  customer_email?: string | null;
  customer_phone?: string | null;
  customer_notes?: string | null;
  is_walk_in?: boolean;
};
```

**Notater:**
- Brukes med `create_booking_with_validation` RPC-funksjon
- Oppretter automatisk customer hvis den ikke eksisterer

### `CreateShiftInput`

```typescript
export type CreateShiftInput = {
  salon_id: string;
  employee_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
};
```

### `CreateCustomerInput`

```typescript
export type CreateCustomerInput = {
  salon_id: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  gdpr_consent: boolean;
};
```

---

## Type-sikkerhet og best practices

### 1. Bruk enum-typer der mulig

```typescript
// ✅ RIKTIG
const status: BookingStatus = "confirmed";

// ⚠️ OK (for bakoverkompatibilitet)
const status: BookingStatus | string = "confirmed";
```

### 2. Nullable felter

Alle nullable felter i databasen skal være `| null` i TypeScript:

```typescript
// ✅ RIKTIG
email: string | null;

// ❌ FEIL
email?: string; // Dette betyr "optional", ikke "nullable"
```

### 3. Nested objects fra Supabase

Når Supabase returnerer relaterte data via joins, brukes nested objects:

```typescript
// Fra Supabase select: "customers(full_name)"
customers: { full_name: string | null } | null;
```

### 4. Input-typer vs Entity-typer

- **Input-typer** (`CreateXInput`, `UpdateXInput`): Brukes for å opprette/oppdatere
- **Entity-typer** (`Employee`, `Service`, etc.): Brukes for å representere eksisterende data

---

## Oppdateringer

Dette dokumentet skal oppdateres når:
- Nye typer legges til
- Eksisterende typer endres
- Nye enum-verdier legges til
- Database-schema endres

---

## Relaterte dokumenter

- `docs/architecture/layers.md` - Arkitektur og lag-inndeling
- `docs/architecture/repository-standards.md` - Repository-standarder
- `docs/backend/supabase-foundation.md` - Database-schema dokumentasjon

