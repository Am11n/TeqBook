# RLS (Row Level Security) Strategy

Dette dokumentet beskriver RLS-strategien for TeqBook og hvordan multi-tenant isolasjon sikres.

---

## Oversikt

TeqBook bruker Supabase Row Level Security (RLS) for å sikre at:
- Brukere kun kan se og modifisere data for sin egen salon
- Multi-tenant isolasjon er garantert på database-nivå
- Alle tenant-data er beskyttet mot uautorisert tilgang

---

## Arkitektur

### Multi-Tenant Modell

TeqBook bruker en **salon-basert multi-tenant arkitektur**:
- Alle funksjonelle tabeller har `salon_id` som foreign key
- Brukere knyttes til saloner via `profiles` tabellen
- RLS policies sikrer at brukere kun ser data for sin egen salon

### Tabellstruktur

```
profiles (user_id, salon_id, role, ...)
    ↓
salons (id, name, ...)
    ↓
┌─────────────┬─────────────┬─────────────┬─────────────┐
│  bookings   │  employees  │  customers  │  services   │
│  shifts     │  addons     │  products   │  ...        │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

Alle tabeller under `salons` har `salon_id` foreign key med `ON DELETE CASCADE`.

---

## RLS Policies

### Standard Policy Pattern

Alle tenant-tabeller følger samme pattern:

```sql
-- Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- SELECT policy: Users can only see data for their salon
CREATE POLICY "Users can view data for their salon"
  ON table_name
  FOR SELECT
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- INSERT policy: Users can only insert data for their salon
CREATE POLICY "Users can insert data for their salon"
  ON table_name
  FOR INSERT
  WITH CHECK (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- UPDATE policy: Users can only update data for their salon
CREATE POLICY "Users can update data for their salon"
  ON table_name
  FOR UPDATE
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- DELETE policy: Users can only delete data for their salon
CREATE POLICY "Users can delete data for their salon"
  ON table_name
  FOR DELETE
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );
```

---

## Tabeller med RLS

### Tenant-tabeller (har `salon_id`)

Alle disse tabellene har RLS aktivert:

1. **`bookings`**
   - Policy: Users can only access bookings for their salon
   - Foreign key: `salon_id` → `salons(id) ON DELETE CASCADE`

2. **`employees`**
   - Policy: Users can only access employees for their salon
   - Foreign key: `salon_id` → `salons(id) ON DELETE CASCADE`

3. **`customers`**
   - Policy: Users can only access customers for their salon
   - Foreign key: `salon_id` → `salons(id) ON DELETE CASCADE`

4. **`services`**
   - Policy: Users can only access services for their salon
   - Foreign key: `salon_id` → `salons(id) ON DELETE CASCADE`

5. **`shifts`**
   - Policy: Users can only access shifts for their salon
   - Foreign key: `employee_id` → `employees(id) ON DELETE CASCADE`
   - Indirekte: `employees.salon_id` sikrer isolasjon

6. **`addons`**
   - Policy: Users can only access addons for their salon
   - Foreign key: `salon_id` → `salons(id) ON DELETE CASCADE`

7. **`products`**
   - Policy: Users can only access products for their salon
   - Foreign key: `salon_id` → `salons(id) ON DELETE CASCADE`

8. **`booking_products`**
   - Policy: Users can only access booking_products for their salon
   - Foreign key: `booking_id` → `bookings(id) ON DELETE CASCADE`
   - Indirekte: `bookings.salon_id` sikrer isolasjon

9. **`employee_services`**
   - Policy: Users can only access employee_services for their salon
   - Foreign key: `employee_id` → `employees(id) ON DELETE CASCADE`
   - Indirekte: `employees.salon_id` sikrer isolasjon

10. **`opening_hours`**
    - Policy: Users can only access opening_hours for their salon
    - Foreign key: `salon_id` → `salons(id) ON DELETE CASCADE`

### System-tabeller (metadata)

11. **`features`**
    - Policy: Anyone can view (public metadata)
    - Policy: Only superadmins can modify

12. **`plan_features`**
    - Policy: Anyone can view (public metadata)
    - Policy: Only superadmins can modify

### Bruker-tabeller

13. **`profiles`**
    - Policy: Users can view their own profile
    - Policy: Users can update their own profile
    - Policy: Superadmins can view all profiles

14. **`salons`**
    - Policy: Users can view salons they belong to
    - Policy: Users can update salons they belong to
    - Policy: Superadmins can view all salons

---

## Bruker-tilknytning

### Hvordan brukere knyttes til saloner

1. **Via `profiles` tabell:**
   ```sql
   profiles (
     user_id UUID PRIMARY KEY REFERENCES auth.users(id),
     salon_id UUID REFERENCES salons(id),
     role TEXT,
     is_superadmin BOOLEAN
   )
   ```

2. **RLS policy bruker:**
   ```sql
   SELECT salon_id FROM profiles WHERE user_id = auth.uid()
   ```

3. **`auth.uid()`** returnerer den autentiserte brukerens ID fra Supabase Auth

### Superadmin-tilgang

Superadmins (`is_superadmin = true`) har spesialtilgang:
- Kan se alle saloner
- Kan se alle profiler
- Kan modifisere system-tabeller (features, plan_features)

---

## Verifisering

### Sjekk at RLS er aktivert

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;
```

### Sjekk policies

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Test isolasjon

```sql
-- Som en vanlig bruker, prøv å hente data fra annen salon
-- Dette skal returnere tom resultat
SELECT * FROM bookings WHERE salon_id != (
  SELECT salon_id FROM profiles WHERE user_id = auth.uid()
);
```

---

## Best Practices

1. **Alltid aktivere RLS** på tenant-tabeller
2. **Bruk samme policy-pattern** for konsistens
3. **Test isolasjon** regelmessig
4. **Dokumenter unntak** (f.eks. superadmin-tilgang)
5. **Verifiser foreign keys** sikrer cascade-delete

---

## Fremtidige Forbedringer

1. **Service Role Bypass**
   - Edge Functions kan bruke service role key for å bypass RLS
   - Dette er nødvendig for system-operasjoner

2. **Audit Logging**
   - Logg alle RLS policy violations
   - Spor uautorisert tilgangsforsøk

3. **Performance**
   - Indexer `profiles.salon_id` for raskere policy-evaluering
   - Vurder materialized views for komplekse queries

---

## Referanser

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- `web/supabase/add-addons-and-plan-limits.sql` - Eksempel på RLS policies
- `web/supabase/add-features-system.sql` - System-tabell RLS policies
- `web/supabase/onboarding-schema-update.sql` - Profiles RLS policies

