# Fix: Language Limit Not Updated After Plan Upgrade

Hvis du har oppgradert til Pro-planen (som skal ha 5 språk), men fortsatt får feilmelding om språkgrense, følg disse stegene:

---

## Problem

Etter oppgradering til Pro-planen skal du ha 5 språk, men systemet sjekker fortsatt mot den gamle planen (f.eks. Starter med 2 språk).

---

## Løsning

### Steg 1: Sjekk Database

Kjør denne SQL-en i Supabase Dashboard → SQL Editor for å sjekke planen din:

```sql
SELECT 
  id,
  name,
  plan,
  billing_subscription_id,
  current_period_end
FROM salons
WHERE id = 'din-salon-id'; -- Erstatt med din salon ID
```

**Forventet resultat for Pro-plan:**
- `plan` skal være `"pro"`
- `billing_subscription_id` skal være satt (ikke null)

### Steg 2: Hvis plan ikke er oppdatert

Hvis `plan` ikke er `"pro"` i databasen, oppdater den manuelt:

```sql
UPDATE salons
SET plan = 'pro'
WHERE id = 'din-salon-id';
```

**Viktig:** Dette er en midlertidig løsning. Den riktige løsningen er at `billing-update-plan` Edge Function oppdaterer planen automatisk.

### Steg 3: Sjekk Stripe Subscription

Gå til Stripe Dashboard → Customers → Finn din customer → Subscriptions

Sjekk at:
- Subscription er aktiv
- Plan er "Pro" (eller riktig plan)
- Subscription metadata inneholder `plan: "pro"`

### Steg 4: Refresh Frontend

Etter å ha oppdatert planen i databasen:

1. **Refresh siden** i nettleseren (F5 eller Cmd+R)
2. **Logg ut og inn igjen** hvis nødvendig
3. Prøv å legge til språk igjen

### Steg 5: Verifiser Plan Limits

Kjør denne SQL-en for å sjekke at plan limits er riktige:

```sql
-- Sjekk plan limits for Pro
-- Pro skal ha: employees: 5, languages: 5
SELECT 
  s.id,
  s.name,
  s.plan,
  CASE 
    WHEN s.plan = 'starter' THEN 2
    WHEN s.plan = 'pro' THEN 5
    WHEN s.plan = 'business' THEN NULL -- unlimited
    ELSE 2
  END as language_limit,
  array_length(s.supported_languages, 1) as current_languages_count,
  s.supported_languages
FROM salons s
WHERE s.id = 'din-salon-id';
```

**Forventet resultat for Pro:**
- `language_limit` skal være `5`
- `current_languages_count` skal være mindre enn eller lik `5`

---

## Automatisk Oppdatering

Når du oppgraderer plan via UI:

1. `billing-update-plan` Edge Function oppdaterer:
   - Stripe subscription plan
   - `plan` i `salons` tabellen
   - `current_period_end` i `salons` tabellen

2. Frontend kaller `refreshSalon()` for å hente oppdatert data

3. `updateSalonSettings` bruker `salon.plan` for å sjekke språkgrenser

**Hvis dette ikke fungerer automatisk:**

1. Sjekk at `billing-update-plan` Edge Function er deployet
2. Sjekk Supabase Edge Function logs for feil
3. Sjekk at `plan` faktisk er oppdatert i databasen (se Steg 1)

---

## Debugging

### Sjekk Edge Function Logs

1. Gå til Supabase Dashboard → Edge Functions → billing-update-plan
2. Klikk på "Logs"
3. Se etter feil eller bekreftelse av oppdatering

### Sjekk Frontend Console

1. Åpne Developer Tools (F12)
2. Gå til Console
3. Se etter feilmeldinger når du prøver å legge til språk

### Test Plan Limits Direkte

Du kan teste plan limits direkte i frontend ved å åpne Console og kjøre:

```javascript
// Erstatt med din salon ID og plan
const salonId = 'din-salon-id';
const plan = 'pro';
const currentLanguages = ['en', 'nb', 'ar', 'so', 'ti']; // 5 språk

// Test canAddLanguage
import { canAddLanguage } from '@/lib/services/plan-limits-service';
const result = await canAddLanguage(salonId, plan, currentLanguages);
console.log('Can add language:', result);
```

---

## Plan Limits Oversikt

| Plan | Employees | Languages |
|------|-----------|-----------|
| Starter | 2 | 2 |
| Pro | 5 | 5 |
| Business | Unlimited | Unlimited |

---

## Oppdatert

Sist oppdatert: 2025-01-14
Versjon: 1.0
