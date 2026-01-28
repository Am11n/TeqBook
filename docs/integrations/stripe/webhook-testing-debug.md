# Webhook Testing - Debug Guide

## Problem: Webhook blir ikke mottatt

### Sjekkliste

#### 1. Sjekk Webhook URL i Stripe Dashboard

1. Gå til **Stripe Dashboard** → **Developers** → **Webhooks**
2. Klikk på webhook-endepunktet ditt ("dynamic-inspiration")
3. Sjekk at **Endpoint URL** er riktig:
   ```
   https://[your-project-ref].supabase.co/functions/v1/billing-webhook
   ```
4. Sjekk at webhook er **Active** (ikke disabled)

#### 2. Sjekk at Events er valgt

I webhook-detaljene, sjekk at følgende events er valgt:
- ✅ `invoice.payment_failed`
- ✅ `invoice.payment_succeeded`
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`

#### 3. Sjekk Webhook Secret

1. I webhook-detaljene, finn **Signing secret**
2. Kopier secret (starter med `whsec_`)
3. Gå til **Supabase Dashboard** → **Project Settings** → **Edge Functions** → **Secrets**
4. Sjekk at `STRIPE_WEBHOOK_SECRET` er satt og matcher

#### 4. Sjekk Webhook Delivery i Stripe Dashboard

1. Gå til webhook-endepunktet i Stripe Dashboard
2. Scroll ned til **Recent deliveries** eller **Webhook attempts**
3. Se etter nylige webhook attempts
4. Klikk på en attempt for å se:
   - Status code (200 = success, 4xx/5xx = error)
   - Request body
   - Response body
   - Error message (hvis noen)

#### 5. Sjekk Supabase Edge Function Logs

1. Gå til **Supabase Dashboard** → **Edge Functions** → **billing-webhook**
2. Klikk på **Logs** tab
3. Se etter nylige requests
4. Sjekk for feilmeldinger

---

## Problem: Webhook mottas, men database oppdateres ikke

### Mulige årsaker:

#### 1. Subscription mangler `salon_id` i metadata

Webhook handleren trenger `subscription.metadata.salon_id` for å finne salongen.

**Sjekk:**
- Gå til Stripe Dashboard → **Customers** → [Din customer] → **Subscriptions**
- Klikk på subscription
- Scroll ned til **Metadata**
- Sjekk at `salon_id` er satt

**Løsning:**
Hvis subscription mangler `salon_id`, må du:
1. Opprette subscription via din app (som setter metadata)
2. Eller manuelt legge til metadata i Stripe Dashboard

#### 2. Subscription ID matcher ikke

**Sjekk:**
- Gå til Supabase → **Table Editor** → **salons**
- Finn din salon
- Sjekk `billing_subscription_id`
- Sjekk at denne matcher subscription ID i Stripe

---

## Hvordan teste riktig

### Metode 1: Bruk faktisk subscription (Anbefalt)

1. **Opprett en faktisk subscription via din app:**
   - Dette setter `metadata.salon_id` automatisk
   - Subscription vil ha riktig kobling til salon

2. **Trigger payment failure:**
   - Gå til Stripe Dashboard → **Customers** → [Din customer]
   - Gå til **Subscriptions** → [Din subscription]
   - Gå til **Invoices** tab
   - Finn en invoice som skal betales
   - Klikk på invoice → **More actions** → **Mark as uncollectible**
   - Dette triggerer `invoice.payment_failed` webhook

### Metode 2: Bruk Stripe CLI med webhook forwarding

```bash
# 1. Start webhook forwarding
stripe listen --forward-to https://[your-project-ref].supabase.co/functions/v1/billing-webhook

# 2. I en annen terminal, trigger event
stripe trigger invoice.payment_failed
```

**Merk:** Dette krever at du har en subscription med `salon_id` i metadata.

### Metode 3: Manuelt oppdater database for testing

Hvis du bare vil teste UI/logikken uten faktisk webhook:

```sql
-- Sett salon til payment failed state
UPDATE salons
SET 
  payment_status = 'failed',
  payment_failure_count = 1,
  payment_failed_at = NOW(),
  last_payment_retry_at = NOW()
WHERE id = 'din-salon-id';
```

---

## Debug: Sjekk webhook payload

1. Gå til Stripe Dashboard → **Developers** → **Webhooks**
2. Klikk på webhook-endepunktet
3. Scroll ned til **Recent deliveries**
4. Klikk på en delivery
5. Se **Request** body
6. Sjekk at `data.object.subscription` er satt
7. Sjekk at subscription har `metadata.salon_id`

---

## Test med faktisk subscription

### Steg-for-steg:

1. **Opprett subscription via app:**
   - Gå til din app → Settings → Billing
   - Opprett en subscription
   - Dette setter `metadata.salon_id` automatisk

2. **Trigger payment failure:**
   - Gå til Stripe Dashboard → **Customers**
   - Finn customer som ble opprettet
   - Gå til **Subscriptions**
   - Klikk på subscription
   - Gå til **Invoices** tab
   - Finn en invoice
   - Klikk **More actions** → **Mark as uncollectible**

3. **Verifiser:**
   - Sjekk Stripe Dashboard → Webhooks → Recent deliveries
   - Se at webhook ble sendt (status 200)
   - Sjekk Supabase → salons tabellen
   - Verifiser at `payment_status` er oppdatert

---

## Troubleshooting

### "Webhook signature verification failed"

- Sjekk at `STRIPE_WEBHOOK_SECRET` er riktig i Supabase secrets
- Sjekk at du kopierte hele secret (inkluderer `whsec_`)
- Redeploy Edge Function etter å ha satt secret

### "Subscription missing salon_id in metadata"

- Subscription må ha `metadata.salon_id` satt
- Opprett subscription via din app (ikke manuelt i Stripe Dashboard)
- Eller legg til metadata manuelt i Stripe Dashboard

### Webhook returnerer 400/500

- Sjekk Supabase Edge Function logs
- Sjekk at alle secrets er satt
- Sjekk at Edge Function er deployet

---

Sist oppdatert: 2025-01-06
