# Stripe Setup Guide

Konsolidert guide for å sette opp Stripe-integrasjonen.

---

## Steg 1: Opprett Stripe-konto og hent API-nøkler

1. Gå til [Stripe Dashboard](https://dashboard.stripe.com/)
2. Opprett en konto eller logg inn
3. Gå til **Developers** → **API keys**
4. Kopier **Secret key** (starter med `sk_test_` for test, `sk_live_` for produksjon)
5. Kopier **Publishable key** (starter med `pk_test_` for test, `pk_live_` for produksjon)

---

## Steg 2: Opprett Products og Prices i Stripe

Du må opprette tre produkter (en for hver plan) med månedlige priser:

### Starter Plan ($25/month)
1. Gå til **Products** → **Add product**
2. Navn: `TeqBook Starter`
3. Beskrivelse: `Starter plan - 2 employees, 2 languages`
4. Legg til **Pricing**:
   - Type: **Recurring**
   - Price: `$25.00`
   - Billing period: **Monthly**
   - Currency: **USD**
5. Klikk **Save product**
6. **Kopier Price ID** (starter med `price_`) - du trenger denne senere

### Pro Plan ($50/month)
1. Gå til **Products** → **Add product**
2. Navn: `TeqBook Pro`
3. Beskrivelse: `Pro plan - 5 employees, 5 languages`
4. Legg til **Pricing**: $50.00, Monthly
5. **Kopier Price ID**

### Business Plan ($75/month)
1. Gå til **Products** → **Add product**
2. Navn: `TeqBook Business`
3. Beskrivelse: `Business plan - Unlimited employees and languages`
4. Legg til **Pricing**: $75.00, Monthly
5. **Kopier Price ID**

---

## Steg 3: Sett opp Environment Variables

### I Supabase (Edge Functions Secrets)

1. Gå til **Project Settings** → **Edge Functions** → **Secrets**
2. Legg til følgende secrets:
   - `STRIPE_SECRET_KEY` = din Secret key fra Stripe
   - `STRIPE_PRICE_STARTER` = din Starter Price ID
   - `STRIPE_PRICE_PRO` = din Pro Price ID
   - `STRIPE_PRICE_BUSINESS` = din Business Price ID
   - `STRIPE_WEBHOOK_SECRET` = webhook signing secret (se Steg 4)

### I Next.js (.env.local)

1. Legg til i `web/.env.local`:
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

2. Restart dev server: `npm run dev`

---

## Steg 4: Sett opp Stripe Webhook

1. Gå til Stripe Dashboard → **Developers** → **Webhooks**
2. Klikk **Add endpoint**
3. **Endpoint URL:** `https://[project-ref].supabase.co/functions/v1/billing-webhook`
4. **Events to send:**
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Klikk **Add endpoint**
6. **Kopier Signing secret** og sett som `STRIPE_WEBHOOK_SECRET` i Supabase

---

## Steg 5: Deploy Edge Functions

### Alternativ 1: Via Supabase Dashboard (Anbefalt)

1. Gå til **Edge Functions** i Supabase Dashboard
2. For hver funksjon:
   - Klikk **Create function** eller åpne eksisterende
   - Kopier innholdet fra `web/supabase/functions/[function-name]/index.ts`
   - Klikk **Deploy**

Funksjoner som må deployes:
- `billing-create-customer`
- `billing-create-subscription`
- `billing-update-plan`
- `billing-webhook`
- `billing-cancel-subscription`
- `billing-update-payment-method`

### Alternativ 2: Via Supabase CLI

```bash
cd web
supabase functions deploy billing-create-customer
supabase functions deploy billing-create-subscription
supabase functions deploy billing-update-plan
supabase functions deploy billing-webhook
supabase functions deploy billing-cancel-subscription
supabase functions deploy billing-update-payment-method
```

**Viktig:** Etter å ha satt secrets, må du **redeploye** Edge Functions for at secrets skal lastes inn!

---

## Steg 6: Test Integrasjonen

Se [testing-guide.md](./testing-guide.md) for detaljert testing.

---

## Neste Steg

- Integrer Stripe i `/settings/billing` siden
- Test i produksjon (se [testing-guide.md](./testing-guide.md))
- Se [integration-guide.md](./integration-guide.md) for fullstendig integrasjonsguide
- Hvis du støter på problemer, se [troubleshooting.md](./troubleshooting.md)

