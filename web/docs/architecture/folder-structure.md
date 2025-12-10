# TeqBook – Folder Structure

Dette dokumentet beskriver mappestrukturen i TeqBook og hvilke mapper som hører til hvilket lag.

---

## Oversikt

```
web/
├── src/
│   ├── app/                    # UI Layer - Pages (Next.js App Router)
│   ├── components/             # UI Layer - React Components
│   ├── lib/
│   │   ├── services/           # Services Layer - Business Logic
│   │   ├── repositories/       # Repositories Layer - Data Access
│   │   ├── types.ts            # Type Definitions
│   │   └── supabase-client.ts  # Supabase Client (Infrastructure)
│   ├── i18n/                   # Internationalization
│   └── ...
├── docs/                       # Documentation
│   ├── architecture/           # Architecture Documentation
│   ├── backend/                # Backend Documentation
│   └── ...
└── ...
```

---

## UI Layer

### `src/app/`

**Beskrivelse:** Next.js App Router pages

**Eksempler:**
- `app/dashboard/page.tsx` - Dashboard page
- `app/bookings/page.tsx` - Bookings page
- `app/(auth)/login/page.tsx` - Login page

**Regler:**
- ❌ **FORBUDT:** Direkte Supabase-imports
- ✅ **TILLATT:** Import fra `@/lib/services/*`
- ✅ **TILLATT:** Import fra `@/lib/types`

### `src/components/`

**Beskrivelse:** Reusable React components

**Eksempler:**
- `components/dashboard-shell.tsx` - Dashboard layout
- `components/public-booking-page.tsx` - Public booking component
- `components/command-palette.tsx` - Command palette

**Regler:**
- ❌ **FORBUDT:** Direkte Supabase-imports (unntak: `salon-provider.tsx`)
- ✅ **TILLATT:** Import fra `@/lib/services/*`
- ✅ **TILLATT:** Import fra `@/lib/types`

**Unntak:**
- `components/salon-provider.tsx` - Context provider for auth state (akseptabelt unntak)

---

## Services Layer

### `src/lib/services/`

**Beskrivelse:** Business logic layer

**Filer:**
- `bookings-service.ts` - Booking business logic
- `employees-service.ts` - Employee business logic
- `customers-service.ts` - Customer business logic
- `services-service.ts` - Service business logic
- `shifts-service.ts` - Shift business logic
- `salons-service.ts` - Salon business logic
- `profiles-service.ts` - Profile business logic
- `auth-service.ts` - Authentication logic
- `admin-service.ts` - Admin operations
- `onboarding-service.ts` - Onboarding logic
- `search-service.ts` - Search functionality

**Regler:**
- ✅ **TILLATT:** Import fra `@/lib/repositories/*`
- ✅ **TILLATT:** Import fra `@/lib/types`
- ❌ **FORBUDT:** Direkte Supabase-imports
- ❌ **FORBUDT:** UI-spesifikk logikk

---

## Repositories Layer

### `src/lib/repositories/`

**Beskrivelse:** Data access layer

**Filer:**
- `bookings.ts` - Booking database operations
- `employees.ts` - Employee database operations
- `customers.ts` - Customer database operations
- `services.ts` - Service database operations
- `shifts.ts` - Shift database operations
- `salons.ts` - Salon database operations
- `profiles.ts` - Profile database operations
- `types.ts` - Repository types

**Regler:**
- ✅ **TILLATT:** Import fra `@/lib/supabase-client`
- ✅ **TILLATT:** Import fra `@/lib/types`
- ❌ **FORBUDT:** Forretningslogikk
- ❌ **FORBUDT:** UI-spesifikk logikk

---

## Infrastructure

### `src/lib/types.ts`

**Beskrivelse:** Centralized type definitions

**Inneholder:**
- Entity types: `Employee`, `Service`, `Booking`, etc.
- Input types: `CreateEmployeeInput`, `UpdateServiceInput`, etc.
- Enum types: `BookingStatus`, `EmployeeRole`, etc.

### `src/lib/supabase-client.ts`

**Beskrivelse:** Supabase client instance

**Regler:**
- Kun importert av repositories
- Ikke importert av UI eller services

---

## Documentation

### `docs/architecture/`

**Beskrivelse:** Architecture documentation

**Filer:**
- `layers.md` - Layer definitions
- `overview.md` - Architecture overview
- `service-standards.md` - Service standards
- `repository-standards.md` - Repository standards
- `types.md` - Type documentation
- `folder-structure.md` - This file

### `docs/backend/`

**Beskrivelse:** Backend documentation

**Filer:**
- `data-model.md` - Data model documentation
- `supabase-foundation.md` - Supabase foundation

### `docs/coding-style.md`

**Beskrivelse:** Coding style guide

---

## Mapping: Lag → Mapper

| Lag | Mapper |
|-----|--------|
| **UI Layer** | `src/app/`, `src/components/` |
| **Services Layer** | `src/lib/services/` |
| **Repositories Layer** | `src/lib/repositories/` |
| **Infrastructure** | `src/lib/types.ts`, `src/lib/supabase-client.ts` |

---

## Best Practices

### 1. Nye features

Når du legger til nye features:

1. **UI:** Legg til page/component i `src/app/` eller `src/components/`
2. **Business Logic:** Legg til service i `src/lib/services/`
3. **Data Access:** Legg til repository i `src/lib/repositories/`
4. **Types:** Legg til typer i `src/lib/types.ts`

### 2. Filnavn

- **Services:** `{domain}-service.ts` (f.eks. `bookings-service.ts`)
- **Repositories:** `{domain}.ts` (f.eks. `bookings.ts`)
- **Components:** `kebab-case.tsx` (f.eks. `booking-list.tsx`)
- **Pages:** `page.tsx` (Next.js App Router)

### 3. Imports

```typescript
// ✅ RIKTIG - UI importerer fra services
import { getBookingsForSalon } from "@/lib/services/bookings-service";

// ✅ RIKTIG - Service importerer fra repositories
import * as bookingsRepo from "@/lib/repositories/bookings";

// ✅ RIKTIG - Repository importerer Supabase
import { supabase } from "@/lib/supabase-client";
```

---

## Relaterte dokumenter

- `docs/architecture/layers.md` - Detaljert lag-inndeling
- `docs/architecture/overview.md` - Architecture overview
- `docs/coding-style.md` - Kodestilguide

