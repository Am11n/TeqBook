# Payment Failure Testing Guide - Stripe Test Mode

Denne guiden viser deg hvordan du tester payment failure handling funksjonaliteten med Stripe Test Mode.

---

## Forutsetninger

Før du starter, sørg for at:

- ✅ Stripe Test Mode er aktivert i Stripe Dashboard
- ✅ Alle Edge Functions er deployet (spesielt `billing-webhook`)
- ✅ Stripe secrets er satt i Supabase Edge Functions secrets
- ✅ Webhook er konfigurert i Stripe Dashboard
- ✅ Database migration for payment failure tracking er kjørt
- ✅ Du har en test-salon med aktiv subscription i Stripe Test Mode

---

## Oversikt over Payment Failure Flow

Payment failure handling fungerer slik:

1. **Payment Fails** → Stripe sender `invoice.payment_failed` webhook
2. **First Failure** → `payment_status` settes til `"failed"`, `payment_failure_count` = 1
3. **Retry Attempts** → Automatiske retry hver 24 timer (opptil 3 forsøk)
4. **Grace Period** → 7 dagers grace period starter ved første failure
5. **After 3 Failures** → `payment_status` settes til `"grace_period"` eller `"restricted"`
6. **Payment Succeeds** → `invoice.payment_succeeded` resetter all failure status

---

## Test 1: Simuler Payment Failure via Stripe Dashboard

### Steg 1: Opprett en Test Subscription

1. Gå til Stripe Dashboard → **Customers**
2. Opprett en ny test customer eller bruk eksisterende
3. Gå til **Subscriptions** → **Create subscription**
4. Velg customer og et test product/price
5. **Viktig:** Bruk en payment method som vil feile:
   - **Test Card for Declined Payment:** `4000 0000 0000 0002`
   - Eller legg til en payment method som du kan manuelt sette til "decline"

### Steg 2: Trigger Payment Failure

**Metode A: Bruk Stripe Test Mode Features**

1. Gå til Stripe Dashboard → **Developers** → **Webhooks**
2. Klikk på webhook-endepunktet ditt
3. Klikk **Send test webhook**
4. Velg event: `invoice.payment_failed`
5. Klikk **Send test webhook**

**Metode B: Simuler via Invoice**

1. Gå til Stripe Dashboard → **Customers** → [Din test customer]
2. Gå til **Subscriptions** → [Din subscription]
3. Klikk på **Invoices** tab
4. Finn den neste invoice som skal betales
5. Klikk på invoice → **More actions** → **Mark as uncollectible**
   - Dette simulerer en payment failure

**Metode C: Bruk Stripe CLI (hvis installert)**

```bash
# Login til Stripe
stripe login

# Trigger payment_failed event
stripe trigger invoice.payment_failed
```

### Steg 3: Verifiser Database Oppdateringer

1. Gå til Supabase Dashboard → **Table Editor** → **salons**
2. Finn din test salon (basert på `billing_subscription_id` eller `billing_customer_id`)
3. Sjekk at følgende felter er oppdatert:
   - `payment_status` = `"failed"`
   - `payment_failure_count` = `1`
   - `payment_failed_at` = nåværende timestamp
   - `last_payment_retry_at` = nåværende timestamp

### Steg 4: Sjekk Supabase Logs

1. Gå til Supabase Dashboard → **Edge Functions** → **billing-webhook** → **Logs**
2. Du skal se at webhook ble mottatt og prosessert
3. Se etter loggmeldinger som:
   - `"Payment failure handled"`
   - `"Payment failure count: 1"`

### Steg 5: Verifiser Email Notification

1. Sjekk at payment failure email ble sendt
2. Email skal sendes til salon owner (fra `profiles` tabellen hvor `role = 'owner'`)
3. Sjekk email service logs eller inbox hvis du har test email satt opp

---

## Test 2: Test Multiple Payment Failures (Retry Logic)

### Steg 1: Simuler Første Failure

Følg Test 1 for å triggere første payment failure.

### Steg 2: Simuler Andre Failure (Retry Attempt 2)

**Metode A: Send Test Webhook Igjen**

1. Gå til Stripe Dashboard → **Developers** → **Webhooks**
2. Klikk **Send test webhook**
3. Velg event: `invoice.payment_failed`
4. Klikk **Send test webhook** igjen

**Metode B: Vent 24 Timer (eller endre RETRY_DELAY_HOURS i koden)**

For testing, kan du midlertidig endre `RETRY_DELAY_HOURS` i `billing-service.ts` til f.eks. `1` time for raskere testing.

### Steg 3: Verifiser Retry Count

1. Sjekk database → `salons` tabellen
2. `payment_failure_count` skal nå være `2`
3. `last_payment_retry_at` skal være oppdatert

### Steg 4: Simuler Tredje Failure (Retry Attempt 3)

1. Send `invoice.payment_failed` webhook igjen
2. Verifiser at `payment_failure_count` = `3`
3. Verifiser at `payment_status` er satt til `"grace_period"` (hvis grace period ikke er utløpt)

---

## Test 3: Test Grace Period

### Steg 1: Opprett Subscription med Payment Failure

1. Følg Test 1 for å få en subscription med `payment_status = "failed"`

### Steg 2: Vent eller Simuler Grace Period

Grace period er 7 dager. For testing kan du:

**Metode A: Endre Grace Period i Koden (Midlertidig)**

Endre `GRACE_PERIOD_DAYS` i `billing-service.ts` til f.eks. `1` dag for raskere testing.

**Metode B: Manuelt Oppdater Database**

```sql
-- Sett payment_failed_at til 6 dager siden (1 dag før grace period utløper)
UPDATE salons
SET payment_failed_at = NOW() - INTERVAL '6 days'
WHERE id = 'din-salon-id';
```

### Steg 3: Test Access Check

1. Kall `checkSalonPaymentAccess` funksjonen (via API eller test-side)
2. Verifiser at `hasAccess = true` når i grace period
3. Verifiser at `gracePeriodEndsAt` er satt korrekt

### Steg 4: Test Grace Period Expiration

1. Oppdater `payment_failed_at` til mer enn 7 dager siden:
```sql
UPDATE salons
SET payment_failed_at = NOW() - INTERVAL '8 days'
WHERE id = 'din-salon-id';
```

2. Kall `checkSalonPaymentAccess` igjen
3. Verifiser at `hasAccess = false`
4. Verifiser at `payment_status` er satt til `"restricted"` (hvis 3+ failures)

---

## Test 4: Test Payment Success (Reset Failure Status)

### Steg 1: Opprett Subscription med Payment Failure

1. Følg Test 1 for å få en subscription med `payment_status = "failed"`

### Steg 2: Simuler Successful Payment

1. Gå til Stripe Dashboard → **Developers** → **Webhooks**
2. Klikk **Send test webhook**
3. Velg event: `invoice.payment_succeeded`
4. Klikk **Send test webhook**

### Steg 3: Verifiser Reset

1. Sjekk database → `salons` tabellen
2. Følgende felter skal være reset:
   - `payment_status` = `"active"` (eller `null`)
   - `payment_failure_count` = `0`
   - `payment_failed_at` = `null`
   - `last_payment_retry_at` = `null`

### Steg 4: Sjekk Logs

1. Sjekk Supabase logs for `"Payment failure status reset"`

---

## Test 5: Test Retry Payment Function

### Steg 1: Opprett Subscription med Payment Failure

1. Følg Test 1 for å få en subscription med `payment_status = "failed"`

### Steg 2: Test Retry Payment via UI eller API

**Via UI (CurrentPlanCard komponent):**

1. Gå til Settings → Billing i appen
2. Du skal se en "Retry Payment Now" knapp hvis payment har feilet
3. Klikk på knappen
4. Verifiser at `last_payment_retry_at` er oppdatert

**Via API (billing-service.ts):**

```typescript
import { retryFailedPayment } from "@/lib/services/billing-service";

const result = await retryFailedPayment(salonId, subscriptionId);
console.log(result);
```

### Steg 3: Test Retry Limits

1. Prøv å retry payment etter 3 failures
2. Verifiser at du får feilmelding: `"Maximum retry attempts (3) reached"`

### Steg 4: Test Retry Delay

1. Prøv å retry payment innen 24 timer etter siste retry
2. Verifiser at du får feilmelding: `"Please wait X more hour(s) before retrying"`

---

## Test 6: Test UI Komponenter

### Steg 1: Test CurrentPlanCard med Payment Failure

1. Opprett en subscription med payment failure (Test 1)
2. Gå til Settings → Billing i appen
3. Verifiser at du ser:
   - **Alert med "Payment Failed!"** hvis `payment_status = "failed"`
   - **Alert med "Grace Period Active"** hvis `payment_status = "grace_period"`
   - **Alert med "Access Restricted"** hvis `payment_status = "restricted"`
   - **"Retry Payment Now" knapp** når retry er mulig

### Steg 2: Test Payment Status Display

1. Sjekk at `payment_failure_count` vises i UI
2. Sjekk at `last_payment_retry_at` vises i UI
3. Sjekk at grace period end date vises i UI

---

## Test 7: Test Email Notifications

### Steg 1: Test Payment Failure Email

1. Trigger payment failure (Test 1)
2. Verifiser at email ble sendt til salon owner
3. Sjekk email innhold:
   - Subject skal inneholde "Payment Failed"
   - Body skal inneholde salon name og failure reason

### Steg 2: Test Payment Retry Email

1. Trigger payment retry (Test 5)
2. Verifiser at retry email ble sendt (hvis implementert)
3. Sjekk at email inneholder retry attempt number

### Steg 3: Test Payment Warning Email

1. Når grace period nærmer seg utløp
2. Verifiser at warning email ble sendt (hvis implementert)
3. Sjekk at email inneholder days remaining

---

## Test 8: End-to-End Test Scenario

Test hele flyten fra start til slutt:

### Scenario: Full Payment Failure Lifecycle

1. **Opprett Subscription:**
   - Opprett en subscription med test card `4242 4242 4242 4242`
   - Verifiser at subscription er aktiv

2. **Trigger First Payment Failure:**
   - Send `invoice.payment_failed` webhook
   - Verifiser: `payment_status = "failed"`, `payment_failure_count = 1`
   - Verifiser at email ble sendt

3. **Trigger Second Payment Failure:**
   - Send `invoice.payment_failed` webhook igjen
   - Verifiser: `payment_failure_count = 2`

4. **Trigger Third Payment Failure:**
   - Send `invoice.payment_failed` webhook igjen
   - Verifiser: `payment_failure_count = 3`, `payment_status = "grace_period"`

5. **Test Grace Period:**
   - Verifiser at salon har access (`checkSalonPaymentAccess`)
   - Vent eller simuler at grace period nærmer seg utløp

6. **Test Payment Success:**
   - Send `invoice.payment_succeeded` webhook
   - Verifiser at all failure status er reset
   - Verifiser at salon har full access

---

## Test 9: Test med Stripe CLI (Avansert)

Hvis du har Stripe CLI installert, kan du teste mer avansert:

### Installer Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Eller last ned fra: https://stripe.com/docs/stripe-cli
```

### Login og Forward Webhooks

```bash
# Login til Stripe
stripe login

# Forward webhooks til Supabase Edge Function
stripe listen --forward-to https://[your-project-ref].supabase.co/functions/v1/billing-webhook \
  --events invoice.payment_failed,invoice.payment_succeeded
```

### Trigger Events

```bash
# Trigger payment_failed event
stripe trigger invoice.payment_failed

# Trigger payment_succeeded event
stripe trigger invoice.payment_succeeded

# Trigger med custom data
stripe trigger invoice.payment_failed --override invoice:subscription=sub_test_123
```

---

## Test 10: Verifiser Unit Tests

Kjør unit tests for payment failure handling:

```bash
cd web
npm run test billing-service
```

Dette kjører tests i `apps/dashboard/tests/unit/services/billing-service.test.ts` som tester:
- Payment failure handling
- Retry logic
- Grace period calculations
- Access checks
- Status resets

---

## Troubleshooting

### Webhook mottas ikke

**Sjekkliste:**
- [ ] Webhook URL er riktig i Stripe Dashboard
- [ ] `STRIPE_WEBHOOK_SECRET` er satt i Supabase secrets
- [ ] Edge Function er deployet
- [ ] Sjekk Supabase logs for feilmeldinger

### Payment status oppdateres ikke

**Sjekkliste:**
- [ ] Webhook event type er `invoice.payment_failed` eller `invoice.payment_succeeded`
- [ ] Subscription har `metadata.salon_id` satt
- [ ] Database migration er kjørt
- [ ] Sjekk Supabase logs for feilmeldinger

### Email sendes ikke

**Sjekkliste:**
- [ ] Email service er konfigurert
- [ ] Salon owner har email i `profiles` tabellen
- [ ] User preferences tillater payment failure emails
- [ ] Sjekk email service logs

### Retry fungerer ikke

**Sjekkliste:**
- [ ] `payment_failure_count < 3`
- [ ] `last_payment_retry_at` er mer enn 24 timer siden (eller `RETRY_DELAY_HOURS`)
- [ ] Subscription ID er riktig
- [ ] Sjekk Supabase logs for feilmeldinger

---

## Test Data Setup

For enklere testing, kan du sette opp test data:

### Opprett Test Salon med Subscription

```sql
-- Sett opp test salon med subscription
UPDATE salons
SET 
  billing_customer_id = 'cus_test_123',
  billing_subscription_id = 'sub_test_123',
  plan = 'starter',
  payment_status = 'active'
WHERE id = 'din-salon-id';
```

### Simuler Payment Failure State

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

### Simuler Grace Period

```sql
-- Sett salon til grace period (6 dager siden failure)
UPDATE salons
SET 
  payment_status = 'grace_period',
  payment_failure_count = 3,
  payment_failed_at = NOW() - INTERVAL '6 days',
  last_payment_retry_at = NOW() - INTERVAL '6 days'
WHERE id = 'din-salon-id';
```

---

## Stripe Test Cards for Payment Failure

Bruk disse test cards i Stripe Test Mode:

| Card Number | Scenario |
|------------|----------|
| `4242 4242 4242 4242` | Suksessfull betaling |
| `4000 0000 0000 0002` | Declined payment (generic decline) |
| `4000 0000 0000 9995` | Insufficient funds |
| `4000 0000 0000 0069` | Expired card |
| `4000 0025 0000 3155` | Requires 3D Secure |

---

## Neste Steg

Etter testing:

- [ ] Verifiser at alle edge cases er testet
- [ ] Test med forskjellige subscription states
- [ ] Test med multiple salons
- [ ] Test email notifications med forskjellige språk
- [ ] Test UI med forskjellige payment statuses
- [ ] Dokumenter eventuelle bugs eller forbedringer

---

## Referanser

- [Stripe Test Mode Documentation](https://stripe.com/docs/testing)
- [Stripe Webhook Testing](https://stripe.com/docs/webhooks/test)
- [Stripe Test Cards](https://stripe.com/docs/testing#cards)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)

---

## Oppdatert

Sist oppdatert: 2025-01-06
Versjon: 1.0
