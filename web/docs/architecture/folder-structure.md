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

## Feature-Based Organization

For større features med flere komponenter, hooks og utilities, følger vi en **feature-based struktur** som grupperer relatert kode sammen.

### Strukturprinsipp

```
web/src/
├── app/
│   └── {feature}/
│       └── page.tsx              # ✅ Bare hovedfil (Next.js page)
│
├── components/
│   └── {feature}/                # ✅ Alle UI-komponenter for featuren
│       ├── ComponentA.tsx
│       ├── ComponentB.tsx
│       └── ComponentDialog.tsx
│
├── lib/
│   ├── hooks/
│   │   └── {feature}/            # ✅ Alle custom hooks for featuren
│   │       ├── useFeature.ts
│   │       └── useFeatureAction.ts
│   │
│   └── utils/
│       └── {feature}/             # ✅ Alle utility-funksjoner for featuren
│           └── feature-utils.ts
```

### Eksempel: Bookings Feature

```
web/src/
├── app/
│   └── bookings/
│       └── page.tsx              # Hovedfil - kun page logic
│
├── components/
│   └── bookings/
│       ├── BookingsTable.tsx      # Desktop table view
│       ├── BookingsCardView.tsx   # Mobile card view
│       ├── CreateBookingDialog.tsx
│       └── CancelBookingDialog.tsx
│
├── lib/
│   ├── hooks/
│   │   └── bookings/
│   │       ├── useBookings.ts    # State management & data loading
│   │       └── useCreateBooking.ts # Create booking logic
│   │
│   └── utils/
│       └── bookings/
│           └── bookings-utils.ts  # formatDate, formatTime, statusColor, etc.
```

### Eksempel: Landing Feature

```
web/src/
├── app/
│   └── landing/
│       └── page.tsx              # Hovedfil - kun page logic
│
├── components/
│   └── landing/
│       ├── LandingHeader.tsx
│       ├── LandingHero.tsx
│       ├── LandingStats.tsx
│       ├── LandingPricing.tsx
│       ├── LandingFAQ.tsx
│       ├── LandingFooter.tsx
│       ├── LandingMobileMenu.tsx
│       ├── landing-copy.ts       # Statisk data/innhold
│       └── constants.ts          # Statiske konstanter
```

### Regler for Feature-Based Organization

#### ✅ Når å bruke feature-based struktur

- **Større features** med flere komponenter (3+ komponenter)
- **Kompleks state management** som krever custom hooks
- **Feature-spesifikke utilities** som ikke er generelle
- **Tett koblede komponenter** som hører sammen logisk

#### ❌ Når IKKE å bruke feature-based struktur

- **Enkle sider** med kun 1-2 komponenter
- **Generelle komponenter** som brukes på tvers av features
- **Shared utilities** som brukes av flere features

### Import Patterns

```typescript
// ✅ RIKTIG - Page importerer fra feature-mapper
import { BookingsTable } from "@/components/bookings/BookingsTable";
import { useBookings } from "@/lib/hooks/bookings/useBookings";
import { formatDate } from "@/lib/utils/bookings/bookings-utils";

// ✅ RIKTIG - Komponenter importerer fra utils/hooks
import { formatDate, statusColor } from "@/lib/utils/bookings/bookings-utils";
import { useCreateBooking } from "@/lib/hooks/bookings/useCreateBooking";

// ❌ FEIL - Relative imports fra app-mappen
import { BookingsTable } from "./components/BookingsTable";
import { useBookings } from "./hooks/useBookings";
```

### Fordeler med Feature-Based Organization

1. **Skalerbarhet:** Enkelt å legge til nye features uten å forstyrre eksisterende
2. **Vedlikeholdbarhet:** Relatert kode er gruppert sammen
3. **Gjenbrukbarhet:** Komponenter og hooks kan gjenbrukes internt i featuren
4. **Klarhet:** Tydelig hva som hører til hvilken feature
5. **Isolasjon:** Endringer i en feature påvirker ikke andre features

---

## Best Practices

### 1. Nye features

Når du legger til nye features:

**For enkle features (1-2 komponenter):**
1. **UI:** Legg til page/component i `src/app/` eller `src/components/`
2. **Business Logic:** Legg til service i `src/lib/services/`
3. **Data Access:** Legg til repository i `src/lib/repositories/`
4. **Types:** Legg til typer i `src/lib/types.ts`

**For større features (3+ komponenter, hooks, utilities):**
1. **Page:** Legg til `src/app/{feature}/page.tsx` (kun hovedfil)
2. **Components:** Legg til alle komponenter i `src/components/{feature}/`
3. **Hooks:** Legg til custom hooks i `src/lib/hooks/{feature}/`
4. **Utils:** Legg til utilities i `src/lib/utils/{feature}/`
5. **Business Logic:** Legg til service i `src/lib/services/` (delt på tvers av features)
6. **Data Access:** Legg til repository i `src/lib/repositories/` (delt på tvers av features)

### 2. Filnavn

- **Services:** `{domain}-service.ts` (f.eks. `bookings-service.ts`)
- **Repositories:** `{domain}.ts` (f.eks. `bookings.ts`)
- **Components:** `PascalCase.tsx` (f.eks. `BookingsTable.tsx`)
- **Hooks:** `use{Feature}.ts` (f.eks. `useBookings.ts`)
- **Utils:** `{feature}-utils.ts` (f.eks. `bookings-utils.ts`)
- **Pages:** `page.tsx` (Next.js App Router)
- **Constants/Data:** `kebab-case.ts` (f.eks. `landing-copy.ts`, `constants.ts`)

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

## Eksempler på Feature-Based Organization

### ✅ God struktur (Bookings)

```
app/bookings/page.tsx                    # 214 linjer - kun page logic
components/bookings/                     # 4 komponenter
lib/hooks/bookings/                      # 2 hooks
lib/utils/bookings/                      # 1 utility fil
```

### ✅ God struktur (Landing)

```
app/landing/page.tsx                     # 136 linjer - kun page logic
components/landing/                      # 8 filer (komponenter + data)
```

### ❌ Dårlig struktur (ikke gjør dette)

```
app/bookings/
  ├── page.tsx
  ├── components/                        # ❌ IKKE i app-mappen
  ├── hooks/                             # ❌ IKKE i app-mappen
  └── lib/                               # ❌ IKKE i app-mappen
```

---

## Relaterte dokumenter

- `docs/architecture/layers.md` - Detaljert lag-inndeling
- `docs/architecture/overview.md` - Architecture overview
- `docs/coding-style.md` - Kodestilguide

