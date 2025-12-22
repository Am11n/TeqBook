# Stripe Integration Guide for TeqBook

Denne guiden viser deg hvordan du setter opp Stripe-integrasjonen for TeqBook steg for steg.

> **💡 Tips:** Du kan deploye Edge Functions direkte fra Supabase Dashboard uten å bruke CLI. Se [stripe-deploy-via-dashboard.md](./stripe-deploy-via-dashboard.md) for detaljert guide.

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
   - Currency: **USD** (eller din valuta)
5. Klikk **Save product**
6. **Kopier Price ID** (starter med `price_`) - du trenger denne senere

### Pro Plan ($50/month)

1. Gå til **Products** → **Add product**
2. Navn: `TeqBook Pro`
3. Beskrivelse: `Pro plan - 5 employees, 5 languages`
4. Legg til **Pricing**:
   - Type: **Recurring**
   - Price: `$50.00`
   - Billing period: **Monthly**
5. Klikk **Save product**
6. **Kopier Price ID**

### Business Plan ($75/month)

1. Gå til **Products** → **Add product**
2. Navn: `TeqBook Business`
3. Beskrivelse: `Business plan - Unlimited employees and languages`
4. Legg til **Pricing**:
   - Type: **Recurring**
   - Price: `$75.00`
   - Billing period: **Monthly**
5. Klikk **Save product**
6. **Kopier Price ID**

---

## Steg 3: Konfigurer Supabase Edge Functions Environment Variables

1. Gå til [Supabase Dashboard](https://app.supabase.com/)
2. Velg ditt prosjekt
3. Gå til **Project Settings** → **Edge Functions** → **Secrets**
4. Legg til følgende secrets:

```
STRIPE_SECRET_KEY=sk_test_xxxxx (din Stripe secret key)
STRIPE_PRICE_STARTER=price_xxxxx (Price ID for Starter)
STRIPE_PRICE_PRO=price_xxxxx (Price ID for Pro)
STRIPE_PRICE_BUSINESS=price_xxxxx (Price ID for Business)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx (vil bli generert i neste steg)
```

**Merk:** For produksjon, bruk `sk_live_` og `pk_live_` keys.

---

## Steg 4: Sett opp Stripe Webhook

1. Gå til **Developers** → **Webhooks** i Stripe Dashboard
2. Klikk **Add endpoint**
3. **Endpoint URL:** 
   ```
   https://[your-project-ref].supabase.co/functions/v1/billing-webhook
   ```
   (Erstatt `[your-project-ref]` med ditt Supabase project reference)
4. Velg følgende events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Klikk **Add endpoint**
6. **Kopier Signing secret** (starter med `whsec_`)
7. Legg til denne i Supabase Edge Functions secrets som `STRIPE_WEBHOOK_SECRET`

---

## Steg 5: Deploy Edge Functions

Du har to alternativer for å deploye Edge Functions:

### Alternativ 1: Via Supabase Dashboard (Anbefalt - Enklest)

1. Gå til [Supabase Dashboard](https://app.supabase.com/)
2. Velg ditt prosjekt
3. Gå til **Edge Functions** i venstre meny
4. Klikk **Create a new function** (eller **New Function**)
5. For hver funksjon:
   - **Function name:** `billing-create-customer` (eller `billing-create-subscription`, etc.)
   - **Copy and paste** innholdet fra filene:
     - `web/supabase/functions/billing-create-customer/index.ts`
     - `web/supabase/functions/billing-create-subscription/index.ts`
     - `web/supabase/functions/billing-update-plan/index.ts`
     - `web/supabase/functions/billing-webhook/index.ts`
   - Klikk **Deploy function**

**Tips:** Du kan åpne filene i din editor og kopiere hele innholdet, eller bruke `cat` kommandoen:
```bash
cat web/supabase/functions/billing-create-customer/index.ts
```

### Alternativ 2: Via Supabase CLI

Hvis du foretrekker å bruke kommandolinjen:

```bash
# Fra web/ mappen
cd supabase/functions

# Deploy hver funksjon
supabase functions deploy billing-create-customer
supabase functions deploy billing-create-subscription
supabase functions deploy billing-update-plan
supabase functions deploy billing-webhook
```

Eller deploy alle på en gang:

```bash
supabase functions deploy
```

**Merk:** Du må ha Supabase CLI installert og være logget inn:
```bash
npm install -g supabase
supabase login
supabase link --project-ref [your-project-ref]
```

---

## Steg 6: Test Webhook (valgfritt)

1. I Stripe Dashboard, gå til **Developers** → **Webhooks**
2. Klikk på webhook-endepunktet du opprettet
3. Klikk **Send test webhook**
4. Velg en event (f.eks. `customer.subscription.created`)
5. Klikk **Send test webhook**
6. Sjekk Supabase logs for å se om webhook ble mottatt

---

## Steg 7: Test i Development

### Test med Stripe Test Mode

1. Sørg for at du bruker **Test mode** i Stripe Dashboard
2. Bruk test credit card: `4242 4242 4242 4242`
3. Hvilket som helst fremtidig exp date og CVC
4. Test hele flyten:
   - Opprett customer
   - Opprett subscription
   - Oppdater plan
   - Test webhook events

---

## Steg 8: Frontend Integration

Se `web/src/lib/services/billing-service.ts` for eksempel på hvordan du kaller Edge Functions fra frontend.

---

## Troubleshooting

### Webhook feiler med "signature verification failed"

- Sjekk at `STRIPE_WEBHOOK_SECRET` er riktig i Supabase secrets
- Sjekk at webhook URL er riktig i Stripe Dashboard
- Sjekk at du bruker samme secret som ble generert for webhook-endepunktet

### Price ID ikke funnet

- Sjekk at `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO`, og `STRIPE_PRICE_BUSINESS` er satt i Supabase secrets
- Sjekk at Price IDs starter med `price_`

### Subscription opprettes ikke

- Sjekk at `STRIPE_SECRET_KEY` er satt i Supabase secrets
- Sjekk Stripe Dashboard → **Logs** for feilmeldinger
- Sjekk Supabase Edge Functions logs

---

## Produksjon

Når du er klar for produksjon:

1. Bytt til **Live mode** i Stripe Dashboard
2. Oppdater alle secrets i Supabase med live keys:
   - `STRIPE_SECRET_KEY` → `sk_live_...`
   - Oppdater Price IDs hvis du har opprettet nye produkter i live mode
3. Opprett ny webhook-endepunkt i live mode
4. Oppdater `STRIPE_WEBHOOK_SECRET` med ny signing secret
5. Test grundig før du går live!

---

## Neste Steg

- Implementer frontend-integrasjon (se `billing-service.ts`)
- Legg til betalingsbekreftelse i UI
- Legg til subscription management i settings
- Implementer trial period hvis ønskelig

