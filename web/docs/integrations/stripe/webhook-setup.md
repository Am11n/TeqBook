# Stripe Webhook Setup - Steg for Steg

Denne guiden viser deg nøyaktig hvilke events du skal velge i Stripe Dashboard.

---

## Steg 1: Gå til Webhooks i Stripe Dashboard

1. Logg inn på [Stripe Dashboard](https://dashboard.stripe.com/)
2. Gå til **Developers** → **Webhooks**
3. Klikk **Add endpoint** (eller **Add webhook endpoint**)

---

## Steg 2: Fyll inn Endpoint URL

I feltet **Endpoint URL**, skriv inn:

```
https://[your-project-ref].supabase.co/functions/v1/billing-webhook
```

**Hvordan finne project-ref:**
- Gå til [Supabase Dashboard](https://app.supabase.com/)
- Velg ditt prosjekt
- I URL-en ser du: `https://app.supabase.com/project/[project-ref]`
- Kopier `[project-ref]` delen

**Eksempel:**
```
https://abcdefghijklmnop.supabase.co/functions/v1/billing-webhook
```

---

## Steg 3: Velg Events

Klikk på **Select events** og velg følgende events:

### Under "Customer" kategorien:
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`

### Under "Invoice" kategorien:
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`

**Tips:** Du kan søke etter events ved å skrive i søkefeltet:
- Skriv "subscription" for å finne subscription events
- Skriv "invoice.payment" for å finne invoice payment events

---

## Steg 4: Klikk "Add endpoint"

Etter at du har valgt alle 5 events, klikk **Add endpoint** nederst på siden.

---

## Steg 5: Kopier Signing Secret

Etter at webhook-endepunktet er opprettet:

1. Klikk på webhook-endepunktet du nettopp opprettet
2. I **Signing secret** seksjonen, klikk **Reveal** eller **Click to reveal**
3. **Kopier signing secret** (starter med `whsec_`)
4. Legg til denne i Supabase Edge Functions secrets som `STRIPE_WEBHOOK_SECRET`

**Hvordan legge til i Supabase:**
1. Gå til Supabase Dashboard → **Project Settings** → **Edge Functions** → **Secrets**
2. Klikk **Add new secret**
3. Key: `STRIPE_WEBHOOK_SECRET`
4. Value: `whsec_xxxxx` (din signing secret)
5. Klikk **Save**

---

## Steg 6: Test Webhook (Anbefalt)

1. I Stripe Dashboard, gå tilbake til webhook-endepunktet
2. Klikk **Send test webhook** (eller **Send test event**)
3. Velg event: `customer.subscription.created`
4. Klikk **Send test webhook**
5. Sjekk Supabase logs for å se om webhook ble mottatt:
   - Gå til Supabase Dashboard → **Edge Functions** → **Logs**
   - Se etter `billing-webhook` function logs

---

## Troubleshooting

### Webhook blir ikke mottatt

- Sjekk at URL-en er riktig (inkluderer `/functions/v1/billing-webhook`)
- Sjekk at Edge Function er deployet
- Sjekk Supabase Edge Functions logs for feilmeldinger

### "Signature verification failed"

- Sjekk at `STRIPE_WEBHOOK_SECRET` er riktig i Supabase secrets
- Sjekk at du kopierte hele signing secret (inkluderer `whsec_`)

### Events blir ikke håndtert

- Sjekk at du har valgt alle 5 events
- Sjekk Supabase logs for å se hvilke events som kommer inn
- Sjekk at Edge Function koden håndterer event-typen

---

## Fullstendig liste over events du trenger

For referanse, her er alle events du skal velge:

1. `customer.subscription.created`
2. `customer.subscription.updated`
3. `customer.subscription.deleted`
4. `invoice.payment_succeeded`
5. `invoice.payment_failed`

**Total: 5 events**

