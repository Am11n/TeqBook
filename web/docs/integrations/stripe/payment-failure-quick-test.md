# Payment Failure Testing - Quick Start

Kort guide for rask testing av payment failure handling.

---

## Rask Test (5 minutter)

### 1. Trigger Payment Failure via Stripe Dashboard

1. Gå til **Stripe Dashboard** → **Developers** → **Webhooks**
2. Klikk på webhook-endepunktet ditt
3. Klikk **Send test webhook**
4. Velg event: `invoice.payment_failed`
5. Klikk **Send test webhook**

### 2. Verifiser i Database

1. Gå til **Supabase Dashboard** → **Table Editor** → **salons**
2. Finn din test salon
3. Sjekk at:
   - `payment_status` = `"failed"`
   - `payment_failure_count` = `1`
   - `payment_failed_at` er satt

### 3. Test Payment Success (Reset)

1. Gå til **Stripe Dashboard** → **Developers** → **Webhooks**
2. Klikk **Send test webhook**
3. Velg event: `invoice.payment_succeeded`
4. Klikk **Send test webhook`
5. Verifiser at alle payment failure felter er reset i database

---

## Test Scenarios

### Scenario 1: Single Payment Failure
```
1. Send invoice.payment_failed webhook
2. Verifiser: payment_status = "failed", count = 1
3. Send invoice.payment_succeeded webhook
4. Verifiser: All fields reset
```

### Scenario 2: Multiple Failures (3 attempts)
```
1. Send invoice.payment_failed webhook (3 ganger)
2. Verifiser: payment_failure_count = 3
3. Verifiser: payment_status = "grace_period" (hvis ikke utløpt)
```

### Scenario 3: Grace Period Expiration
```
1. Sett payment_failed_at til 8 dager siden i database
2. Kall checkSalonPaymentAccess
3. Verifiser: hasAccess = false
```

---

## Stripe Test Cards

- **Suksess:** `4242 4242 4242 4242`
- **Feilet:** `4000 0000 0000 0002`

---

## SQL for Test Data Setup

```sql
-- Sett salon til payment failed state
UPDATE salons
SET 
  payment_status = 'failed',
  payment_failure_count = 1,
  payment_failed_at = NOW(),
  last_payment_retry_at = NOW()
WHERE id = 'din-salon-id';

-- Reset payment failure status
UPDATE salons
SET 
  payment_status = 'active',
  payment_failure_count = 0,
  payment_failed_at = NULL,
  last_payment_retry_at = NULL
WHERE id = 'din-salon-id';
```

---

## Full Guide

For omfattende testing, se: **[Payment Failure Testing Guide](./payment-failure-testing-guide.md)**

---

## Troubleshooting

**Webhook mottas ikke:**
- Sjekk webhook URL i Stripe Dashboard
- Sjekk `STRIPE_WEBHOOK_SECRET` i Supabase secrets
- Sjekk Supabase Edge Function logs

**Payment status oppdateres ikke:**
- Sjekk at subscription har `metadata.salon_id`
- Sjekk at database migration er kjørt
- Sjekk Supabase logs for feilmeldinger

---

Sist oppdatert: 2025-01-06
