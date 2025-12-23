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

1. Kjør SQL-migrasjon: `web/supabase/add-features-system.sql`
2. Dette oppretter:
   - `features` tabell
   - `plan_features` tabell
   - Seed-data for alle features og plan mappings
   - RLS policies

Se `web/supabase/add-features-system.sql` for detaljer.

