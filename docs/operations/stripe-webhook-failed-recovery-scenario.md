# Stripe billing-webhook: `failed` ledger og retry

**Kildekode:** [`supabase/supabase/functions/billing-webhook/index.ts`](../../supabase/supabase/functions/billing-webhook/index.ts).

## Forventet oppførsel (kort)

1. Ved insert-konflikt (`23505`) på `stripe_webhook_events` leses eksisterende rad.
2. Hvis `processing_status === 'processed'` → returner **200** (idempotent duplicate).
3. Hvis `processing_status === 'processing'` → **200** med duplicate / in-flight (unngå dobbelt arbeid).
4. Hvis `processing_status === 'failed'` → rad resettes til `processing`, handler kjøres på nytt (Stripe-retry eller manuell replay).

## Manuell / testmiljø-simulering

| Steg | Handling | Forventet DB-state |
|------|-----------|-------------------|
| 1 | Send gyldig Stripe-event til webhook; la handler feile etter at rad er `processing` (f.eks. midlertidig feil i projection) slik at rad ender som `failed`. | `stripe_webhook_events.processing_status = 'failed'` |
| 2 | Send **samme** `event.id` igjen (replay). | Rad gjenåpnes: `processing`, deretter `processed` ved suksess, eller `failed` ved ny feil. |
| 3 | Verifiser at `salons` / billing-felter er konsistente etter vellykket recovery (binding mot Stripe customer/subscription). | Ingen orphan eller mismatch mot `validateBillingBinding`. |

## Sluttstatus

- **Recovered:** `processing_status = 'processed'`, konsistent salon-rad.
- **Fortsatt feil:** `failed` igjen — krev operatør / alarm (se [`runbook-critical-alarms.md`](./runbook-critical-alarms.md)).
