# Plan and Feature Model

Dette dokumentet beskriver hvordan planer og features fungerer i TeqBook.

---

## Oversikt

TeqBook bruker et fleksibelt system for å håndtere SaaS-pakker (planer) og funksjoner:

- **Planer** (`plan_type` enum) - Starter, Pro, Business
- **Features** - Moduler/områder i systemet (BOOKINGS, CALENDAR, SHIFTS, etc.)
- **Plan Features** - Mapper planer til features med eventuelle limits

---

## Datamodell

### `salons.plan` (eksisterende)

Saloner har en `plan` kolonne som bruker `plan_type` enum:
- `starter` - Starter plan ($25/month)
- `pro` - Pro plan ($50/month)
- `business` - Business plan ($75/month)

### `features` tabell (ny)

Definerer alle tilgjengelige features i systemet:

```sql
CREATE TABLE features (
  id UUID PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,  -- e.g., "BOOKINGS", "CALENDAR"
  name TEXT NOT NULL,         -- Display name
  description TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### `plan_features` tabell (ny)

Mapper planer til features med eventuelle limits:

```sql
CREATE TABLE plan_features (
  id UUID PRIMARY KEY,
  plan_type plan_type NOT NULL,  -- starter, pro, business
  feature_id UUID REFERENCES features(id),
  limit_value NUMERIC,            -- Optional limit (e.g., max employees)
  UNIQUE(plan_type, feature_id)
);
```

`limit_value` brukes også for SMS:
- For `SMS_NOTIFICATIONS` tolkes `limit_value` som inkludert SMS-kvote per periode.
- Denne kvoten snapshots inn i `sms_usage` ved periodeopprettelse/bruk.

---

## Feature Keys

Alle tilgjengelige features:

- `BOOKINGS` - Create and manage customer bookings
- `CALENDAR` - View bookings in calendar format
- `SHIFTS` - Plan and manage employee shifts
- `ADVANCED_REPORTS` - Detailed revenue and capacity reports
- `MULTILINGUAL` - Support for multiple languages
- `SMS_NOTIFICATIONS` - Send SMS reminders and notifications
- `EMAIL_NOTIFICATIONS` - Send email reminders and notifications
- `WHATSAPP` - WhatsApp support and notifications
- `INVENTORY` - Lightweight inventory for products
- `BRANDING` - Customize booking page with branding
- `ROLES_ACCESS` - Advanced role-based access control
- `EXPORTS` - Export data to CSV and other formats
- `CUSTOMER_HISTORY` - View customer booking history
- `ONLINE_PAYMENTS` - Accept online payments from customers

---

## Plan vs Feature vs Role - Understanding the Hierarchy

### Plan (Organization Level)
**Plan** bestemmer hvilke features en organisasjon (salon) har tilgang til.

- Plans are defined by the `salons.plan` enum: `starter`, `pro`, `business`
- Each plan has a set of features mapped in the `plan_features` table
- When a salon upgrades/downgrades their plan, their available features change automatically
- Plans are managed via Stripe subscriptions (see `docs/backend/billing-and-plans.md`)

### Features (Module Level)
**Features** representerer modulene/områdene i systemet (booking, calendar, shifts, reports, osv.).

- Features are defined in the `features` table with a unique `key` (e.g., "BOOKINGS", "CALENDAR", "SHIFTS")
- Features can have limits (e.g., maximum number of languages, employees)
- Features are enabled/disabled based on the salon's plan
- Examples:
  - `BOOKINGS` - Core booking functionality (available in all plans)
  - `SHIFTS` - Employee shift management (pro+ plans)
  - `ADVANCED_REPORTS` - Detailed analytics (pro+ plans)
  - `INVENTORY` - Product/inventory management (pro+ plans)

### Roles (User Level)
**Roller** (user roles) bestemmer hva en spesifikk bruker i org kan gjøre på en feature.

- Roles are defined in the `profiles.role` field: `owner`, `manager`, `staff`, `superadmin`
- Role hierarchy: `superadmin` > `owner` > `manager` > `staff`
- Roles determine permissions within features:
  - **Owner**: Full access to all features available in the plan
  - **Manager**: Can manage employees, services, shifts, view reports
  - **Staff**: Can view own bookings, limited access
  - **Superadmin**: Access to everything (bypasses plan restrictions)

### Example: Combining Plan, Feature, and Role

```typescript
// Check if user can access SHIFTS feature
const { hasFeature } = await hasFeatureForUser(userId, "SHIFTS", "manager");

// This checks:
// 1. Does the salon's plan include SHIFTS? (plan → feature)
// 2. Does the user's role have permission? (role → permission)
// Returns true only if BOTH conditions are met
```

### Access Control Flow

```
User Request
    ↓
1. Check user's role (from profile)
    ↓
2. Check if salon has feature (from plan → plan_features → features)
    ↓
3. Check if role has permission for feature action
    ↓
Access Granted/Denied
```

## Plan Features Mapping

### Starter Plan
- `BOOKINGS` (unlimited)
- `CALENDAR` (unlimited)
- `MULTILINGUAL` (limit: 2 languages)
- `WHATSAPP` (unlimited)

### Pro Plan
Includes all Starter features, plus:
- `SHIFTS` (unlimited)
- `ADVANCED_REPORTS` (unlimited)
- `EMAIL_NOTIFICATIONS` (unlimited)
- `SMS_NOTIFICATIONS` (unlimited)
- `INVENTORY` (unlimited)
- `BRANDING` (unlimited)
- `MULTILINGUAL` (limit: 5 languages)

### Business Plan
Includes all Pro features, plus:
- `ROLES_ACCESS` (unlimited)
- `EXPORTS` (unlimited)
- `CUSTOMER_HISTORY` (unlimited)
- `MULTILINGUAL` (unlimited)

Note on SMS limits:
- Tabellen over viser feature-tilgang. Faktisk sendebehavior og kvoter håndteres av SMS policy/service-laget.
- Se [`docs/backend/sms-architecture.md`](./sms-architecture.md) for runtime policy, usage og hard cap-flow.

---

## Skille mellom Plan/Feature og Roller

### Plan/Feature
- **Bestemmer hvilke features en salon har tilgang til**
- Basert på salons abonnement (plan)
- Features representerer modulene/områdene i systemet

### Roller (User Roles)
- **Bestemmer hva en spesifikk bruker kan gjøre**
- Basert på brukerens rolle i salonen
- Eksempler:
  - `owner` - Full tilgang til alle features
  - `manager` - Kan konfigurere og bruke features
  - `staff` - Kan kun bruke features (ikke konfigurere)

### Kombinasjon
For å sjekke om en bruker kan gjøre noe:
1. Sjekk om salonen har feature (`hasFeature(salonId, featureKey)`)
2. Sjekk om brukeren har rolle (`hasPermission(userRole, requiredRole)`)

---

## Bruk i Kode

### Service Layer

```typescript
import * as featureFlagsService from "@/lib/services/feature-flags-service";

// Sjekk om salon har feature
const { hasFeature: canUseShifts } = await featureFlagsService.hasFeature(
  salonId,
  "SHIFTS"
);

// Hent alle features for salon
const { features } = await featureFlagsService.getFeaturesForSalon(salonId);

// Hent feature limit
const { limit } = await featureFlagsService.getFeatureLimit(
  salonId,
  "MULTILINGUAL"
);
```

### React Hook

```typescript
import { useFeatures } from "@/lib/hooks/use-features";

function MyComponent() {
  const { features, hasFeature, loading } = useFeatures();

  if (loading) return <div>Loading...</div>;

  if (hasFeature("SHIFTS")) {
    return <ShiftsComponent />;
  }

  return <div>Shifts not available in your plan</div>;
}
```

### Access Control

```typescript
import { hasPermission } from "@/lib/utils/access-control";
import { useFeatures } from "@/lib/hooks/use-features";

function SettingsPage() {
  const { hasFeature } = useFeatures();
  const { userRole } = useSalon();

  // Sjekk både feature og rolle
  const canManageShifts = 
    hasFeature("SHIFTS") && hasPermission(userRole, "manager");

  return (
    <>
      {canManageShifts && <ShiftsSettings />}
    </>
  );
}
```

---

## Fremtidige Forbedringer

### Custom Feature Overrides

For spesialkunder kan vi legge til `custom_feature_overrides` (JSONB) i `salons` tabell:

```sql
ALTER TABLE salons ADD COLUMN custom_feature_overrides JSONB;
```

Eksempel:
```json
{
  "ADVANCED_REPORTS": true,
  "EXPORTS": true
}
```

Dette vil overstyre plan-features for denne spesifikke salongen.

### Billing Integration

Når en salon oppgraderer/downgrader plan via Stripe:
1. Stripe webhook mottar subscription update
2. Edge function oppdaterer `salons.plan`
3. Features oppdateres automatisk basert på ny plan

---

## Migrasjon

For å sette opp features-systemet:

1. Kjør SQL-migrasjon: `supabase/add-features-system.sql`
2. Dette oppretter:
   - `features` tabell
   - `plan_features` tabell
   - Seed-data for alle features og plan mappings
   - RLS policies

Se `supabase/add-features-system.sql` for detaljer.

