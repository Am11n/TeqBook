# Payment Failure Debug Checklist

Hvis salonen ikke oppdateres etter payment failure, følg denne sjekklisten:

---

## Steg 1: Sjekk om Webhook ble sendt fra Stripe

1. Gå til **Stripe Dashboard** → **Developers** → **Webhooks**
2. Klikk på webhook-endepunktet ditt
3. Scroll ned til **Recent deliveries** eller **Webhook attempts**
4. Se etter nylige `invoice.payment_failed` events
5. Klikk på den nyeste attempt-en

**Sjekk:**
- ✅ **Delivery status** skal være `Delivered` (ikke `Failed`)
- ✅ **HTTP status code** skal være `200` (ikke `4xx` eller `5xx`)
- ✅ **Response body** skal inneholde `"received": true`

**Hvis status er `Failed`:**
- Sjekk **Error message** i delivery details
- Sjekk **Request body** for å se hva som ble sendt

---

## Steg 2: Sjekk Supabase Edge Function Logs

1. Gå til **Supabase Dashboard** → **Edge Functions** → **billing-webhook**
2. Klikk på **Logs** tab
3. Se etter nylige requests (sortert etter tid, nyeste først)

**Se etter disse loggmeldingene:**

### ✅ Suksessfull prosessering:
```
Processing invoice.payment_failed event: { invoice_id: ..., customer_id: ... }
Found salon directly via customer_id: [salon-id]
Updated salon [salon-id] with failure count 1
```

### ❌ Problemer å se etter:

**1. "Could not find salon by customer_id":**
```
Could not find salon by customer_id: { customer_id: 'cus_xxx', ... }
```
**Løsning:** Verifiser at `billing_customer_id` i database matcher customer_id fra webhook

**2. "Cannot process payment failure - no salon_id found":**
```
Cannot process payment failure - no salon_id found: { customer_id: 'cus_xxx', ... }
```
**Løsning:** Customer ID-en finnes ikke i database, eller matcher ikke

**3. "Error updating salon payment failure status":**
```
Error updating salon payment failure status: { error: ..., salonId: ..., ... }
```
**Løsning:** Database-feil, sjekk error-meldingen

**4. "Webhook signature verification failed":**
```
Webhook signature verification failed: ...
```
**Løsning:** `STRIPE_WEBHOOK_SECRET` er feil eller mangler

---

## Steg 3: Verifiser Customer ID Match

Kjør denne SQL-en i Supabase Dashboard → SQL Editor:

```sql
-- Sjekk om customer_id finnes i database
SELECT 
  id,
  name,
  billing_customer_id,
  billing_subscription_id,
  payment_status
FROM salons
WHERE billing_customer_id = 'cus_TeTH10PrvQjqlR';
```

**Forventet resultat:**
- Du skal se én rad med salonen din
- `billing_customer_id` skal være `cus_TeTH10PrvQjqlR`

**Hvis ingen rad:**
- Customer ID-en i Stripe matcher ikke `billing_customer_id` i database
- Du må oppdatere salonen med riktig customer ID

---

## Steg 4: Sjekk Invoice Customer ID

1. Gå til **Stripe Dashboard** → **Customers** → `cus_TeTH10PrvQjqlR`
2. Gå til **Invoices** tab
3. Klikk på invoice-en du opprettet
4. Se etter **Customer** feltet

**Sjekk:**
- ✅ Customer skal være `cus_TeTH10PrvQjqlR`
- ✅ Invoice skal ha status `open` eller `uncollectible`

**Hvis customer ID er annerledes:**
- Invoice-en er knyttet til feil customer
- Opprett invoice på nytt for riktig customer

---

## Steg 5: Test Webhook Manuelt

Hvis webhook-en ikke ble sendt automatisk, kan du sende den manuelt:

1. Gå til **Stripe Dashboard** → **Developers** → **Webhooks**
2. Klikk på webhook-endepunktet ditt
3. Klikk **Send test webhook**
4. Velg event: `invoice.payment_failed`
5. **Viktig:** I **Request body**, endre `customer` feltet til `cus_TeTH10PrvQjqlR`
6. Klikk **Send test webhook**

**Merk:** Test webhooks har ofte ikke riktig customer ID, så du må manuelt endre det.

---

## Steg 6: Verifiser Edge Function er Deployet

1. Gå til **Supabase Dashboard** → **Edge Functions** → **billing-webhook**
2. Sjekk at funksjonen er **Active** (ikke disabled)
3. Sjekk **Last deployed** timestamp (skal være nylig)

**Hvis funksjonen ikke er deployet:**
- Deploy funksjonen på nytt
- Kopier koden fra `supabase/functions/billing-webhook/index.ts`

---

## Steg 7: Sjekk Webhook Secret

1. Gå til **Stripe Dashboard** → **Developers** → **Webhooks**
2. Klikk på webhook-endepunktet ditt
3. Kopier **Signing secret** (starter med `whsec_`)
4. Gå til **Supabase Dashboard** → **Project Settings** → **Edge Functions** → **Secrets**
5. Sjekk at `STRIPE_WEBHOOK_SECRET` er satt og matcher

**Hvis secret er feil:**
- Oppdater secret i Supabase
- Redeploy Edge Function

---

## Vanlige Problemer og Løsninger

### Problem 1: "Could not find salon by customer_id"

**Årsak:** Customer ID i webhook matcher ikke `billing_customer_id` i database

**Løsning:**
```sql
-- Oppdater salonen med riktig customer ID
UPDATE salons
SET billing_customer_id = 'cus_TeTH10PrvQjqlR'
WHERE id = '[din-salon-id]';
```

### Problem 2: Webhook sendes ikke automatisk

**Årsak:** "Mark as uncollectible" sender ikke alltid webhook automatisk

**Løsning:**
- Bruk Stripe CLI: `stripe trigger invoice.payment_failed --override invoice:customer=cus_TeTH10PrvQjqlR`
- Eller send test webhook manuelt fra Stripe Dashboard

### Problem 3: Invoice har ikke subscription

**Årsak:** Invoice-en er ikke knyttet til en subscription

**Løsning:**
- Webhook handleren håndterer dette nå (finner salon via customer_id)
- Men sjekk at customer_id faktisk matcher

---

## SQL for Debugging

```sql
-- Se alle saloner med payment failures
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
WHERE payment_status IN ('failed', 'grace_period', 'restricted')
   OR payment_failure_count > 0
ORDER BY payment_failed_at DESC NULLS LAST;

-- Se alle saloner med customer ID
SELECT 
  id,
  name,
  billing_customer_id,
  billing_subscription_id
FROM salons
WHERE billing_customer_id IS NOT NULL
ORDER BY name;

-- Reset payment failure status (for testing)
UPDATE salons
SET 
  payment_status = 'active',
  payment_failure_count = 0,
  payment_failed_at = NULL,
  last_payment_retry_at = NULL
WHERE billing_customer_id = 'cus_TeTH10PrvQjqlR';
```

---

## Neste Steg

Etter debugging:
1. Noter ned hva du fant i hvert steg
2. Sjekk Supabase logs for spesifikke feilmeldinger
3. Test igjen med riktig customer ID
4. Verifiser at database oppdateres

---

## Oppdatert

Sist oppdatert: 2025-01-14
Versjon: 1.0
