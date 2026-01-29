# Payment Failure Testing med Eksisterende Salon

Denne guiden viser deg hvordan du tester payment failure handling med en eksisterende salon i databasen.

---

## Problem

Test webhooks fra Stripe Dashboard har ofte ikke riktig `customer_id` som matcher saloner i databasen. For å teste ordentlig, må du bruke en ekte subscription som er knyttet til en salon.

---

## Løsning: Test med Eksisterende Salon

### Steg 1: Finn din Salon i Database

1. Gå til **Supabase Dashboard** → **Table Editor** → **salons**
2. Finn salonen med `billing_customer_id = 'cus_TeTH10PrvQjqlR'` (eller din customer ID)
3. Noter ned:
   - `id` (salon UUID)
   - `billing_customer_id` (Stripe Customer ID)
   - `billing_subscription_id` (hvis den har en subscription)

### Steg 2: Sjekk Stripe Customer

1. Gå til **Stripe Dashboard** → **Customers**
2. Søk etter `cus_TeTH10PrvQjqlR`
3. Sjekk om customer har en aktiv subscription:
   - Hvis **ja**: Gå til Steg 3
   - Hvis **nei**: Du må opprette en subscription først (se "Opprett Test Subscription" nedenfor)

### Steg 3: Test Payment Failure

**Metode A: Simuler Payment Failure via Stripe Dashboard**

1. Gå til **Stripe Dashboard** → **Customers** → `cus_TeTH10PrvQjqlR`
2. Klikk på **Subscriptions** tab
3. Klikk på subscription-en
4. Gå til **Invoices** tab
5. Finn den neste invoice som skal betales
6. Klikk på invoice → **More actions** → **Mark as uncollectible**
   - Dette simulerer en payment failure
7. Stripe vil automatisk sende `invoice.payment_failed` webhook

**Metode B: Bruk Stripe CLI (hvis installert)**

```bash
# Trigger payment_failed event for en spesifikk customer
stripe trigger invoice.payment_failed \
  --override invoice:customer=cus_TeTH10PrvQjqlR
```

**Metode C: Opprett Test Invoice manuelt**

1. Gå til **Stripe Dashboard** → **Customers** → `cus_TeTH10PrvQjqlR`
2. Klikk **Create invoice**
3. Legg til en invoice item (f.eks. $20.00)
4. Klikk **Finalize invoice**
5. Klikk **More actions** → **Mark as uncollectible**
6. Stripe vil sende `invoice.payment_failed` webhook

### Steg 4: Verifiser Database Oppdatering

1. Gå til **Supabase Dashboard** → **Table Editor** → **salons**
2. Finn salonen med `billing_customer_id = 'cus_TeTH10PrvQjqlR'`
3. Sjekk at følgende felter er oppdatert:
   - `payment_status` = `"failed"`
   - `payment_failure_count` = `1`
   - `payment_failed_at` = nåværende timestamp
   - `last_payment_retry_at` = nåværende timestamp

### Steg 5: Sjekk Supabase Logs

1. Gå til **Supabase Dashboard** → **Edge Functions** → **billing-webhook** → **Logs**
2. Du skal se loggmeldinger som:
   - `"Processing invoice.payment_failed event"`
   - `"Found salon directly via customer_id: [salon-id]"`
   - `"Updated salon [salon-id] with failure count 1"`

---

## Opprett Test Subscription (hvis nødvendig)

Hvis salonen ikke har en subscription ennå, kan du opprette en:

### Metode 1: Via Stripe Dashboard

1. Gå til **Stripe Dashboard** → **Customers** → `cus_TeTH10PrvQjqlR`
2. Klikk **Create subscription**
3. Velg et test product/price
4. **Viktig:** Legg til metadata:
   - `salon_id`: [din salon UUID fra database]
   - `plan`: `starter` (eller `pro`/`business`)
5. Klikk **Create subscription**

### Metode 2: Via Edge Function (anbefalt)

Bruk `billing-create-subscription` Edge Function:

```bash
curl -X POST https://[your-project-ref].supabase.co/functions/v1/billing-create-subscription \
  -H "Authorization: Bearer [your-jwt-token]" \
  -H "Content-Type: application/json" \
  -d '{
    "salon_id": "[din-salon-uuid]",
    "customer_id": "cus_TeTH10PrvQjqlR",
    "plan": "starter"
  }'
```

Dette vil:
- Opprette subscription i Stripe med `salon_id` i metadata
- Oppdatere salonen i database med `billing_subscription_id`

---

## Test Payment Success (Reset)

For å teste at payment success resetter status:

1. Gå til **Stripe Dashboard** → **Customers** → `cus_TeTH10PrvQjqlR`
2. Gå til **Invoices** tab
3. Finn invoice-en som feilet
4. Klikk **More actions** → **Mark as paid**
5. Stripe vil sende `invoice.payment_succeeded` webhook
6. Verifiser at alle payment failure felter er reset i database:
   - `payment_status` = `"active"`
   - `payment_failure_count` = `0`
   - `payment_failed_at` = `null`
   - `last_payment_retry_at` = `null`

---

## Troubleshooting

### Webhook finner ikke salon

**Sjekkliste:**
- [ ] Salonen har `billing_customer_id` satt til riktig Stripe Customer ID
- [ ] Customer ID i webhook matcher `billing_customer_id` i database
- [ ] Sjekk Supabase logs for feilmeldinger

### Subscription mangler salon_id i metadata

Hvis subscription ikke har `salon_id` i metadata:

1. Gå til **Stripe Dashboard** → **Subscriptions** → [din subscription]
2. Klikk **Edit metadata**
3. Legg til:
   - Key: `salon_id`
   - Value: [din salon UUID]
4. Klikk **Save**

Eller bruk Stripe CLI:

```bash
stripe subscriptions update sub_xxx \
  --metadata[salon_id]=[din-salon-uuid]
```

---

## SQL for Verifisering

```sql
-- Finn salon med customer ID
SELECT 
  id,
  name,
  billing_customer_id,
  billing_subscription_id,
  payment_status,
  payment_failure_count,
  payment_failed_at,
  last_payment_retry_at
FROM salons
WHERE billing_customer_id = 'cus_TeTH10PrvQjqlR';

-- Sjekk alle saloner med payment failures
SELECT 
  id,
  name,
  billing_customer_id,
  payment_status,
  payment_failure_count,
  payment_failed_at
FROM salons
WHERE payment_status IN ('failed', 'grace_period', 'restricted')
ORDER BY payment_failed_at DESC;
```

---

## Neste Steg

Etter testing:
- [ ] Test multiple payment failures (3 forsøk)
- [ ] Test grace period (7 dager)
- [ ] Test payment success reset
- [ ] Verifiser email notifications
- [ ] Test UI med forskjellige payment statuses

---

## Oppdatert

Sist oppdatert: 2025-01-14
Versjon: 1.0
