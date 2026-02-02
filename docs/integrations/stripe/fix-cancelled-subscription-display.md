# Fix: Subscription Cancelled Display

Hvis subscription er kansellert men informasjonsboksen ikke vises i UI, sjekk følgende:

---

## Problem

Når subscription kanselleres, settes `cancel_at_period_end: true` i Stripe, men `billing_subscription_id` kan fortsatt være satt i database. Dette gjør at `hasSubscription` er `true`, og alert-en vises ikke.

---

## Løsning

### Steg 1: Sjekk Database

Kjør denne SQL-en i Supabase Dashboard → SQL Editor:

```sql
SELECT 
  id,
  name,
  billing_subscription_id,
  current_period_end,
  plan
FROM salons
WHERE current_period_end IS NOT NULL
ORDER BY current_period_end DESC;
```

### Steg 2: Sett billing_subscription_id til null

Hvis subscription er kansellert men `billing_subscription_id` fortsatt er satt, sett den til `null`:

```sql
-- Sett billing_subscription_id til null for kansellerte subscriptions
UPDATE salons
SET billing_subscription_id = NULL
WHERE current_period_end IS NOT NULL
  AND billing_subscription_id IS NOT NULL
  AND current_period_end < NOW(); -- Hvis period end er passert
```

Eller for en spesifikk salon:

```sql
UPDATE salons
SET billing_subscription_id = NULL
WHERE id = 'din-salon-id';
```

### Steg 3: Deploy Oppdatert Edge Function

Sørg for at `billing-cancel-subscription` Edge Function er deployet med den oppdaterte koden som setter `billing_subscription_id` til `null`:

1. Gå til Supabase Dashboard → Edge Functions → billing-cancel-subscription
2. Kopier koden fra `supabase/functions/billing-cancel-subscription/index.ts`
3. Deploy funksjonen

---

## Verifisering

Etter å ha satt `billing_subscription_id` til `null`:

1. Refresh siden i nettleseren
2. Du skal nå se informasjonsboksen med:
   - "Subscription Cancelling" eller "Subscription Cancelled"
   - Dato for når subscription går ut
   - "Forny subscription" eller "Opprett ny subscription" knapp

---

## Automatisk Fix

Den oppdaterte `billing-cancel-subscription` Edge Function setter nå automatisk `billing_subscription_id` til `null` når subscription kanselleres. Dette betyr at:

1. Når du kansellerer subscription i UI
2. Edge Function setter `billing_subscription_id = null` i database
3. Frontend viser automatisk alert-en

Hvis dette ikke skjer, sjekk at Edge Function er deployet med den oppdaterte koden.

---

## Oppdatert

Sist oppdatert: 2025-01-14
Versjon: 1.0
