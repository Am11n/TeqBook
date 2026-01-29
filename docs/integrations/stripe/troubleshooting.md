# Stripe Troubleshooting Guide

Denne guiden dekker vanlige problemer og løsninger for Stripe-integrasjonen.

---

## Vanlige Problemer

### 1. Secrets lastes ikke (Placeholder-verdier)

**Problem:** Edge Function bruker placeholder-verdier (f.eks. `price_pro_monthly`) selv om secrets er satt.

**Løsning:**
1. **Verifiser secrets i Supabase:**
   - Gå til **Project Settings** → **Edge Functions** → **Secrets**
   - Sjekk at følgende secrets eksisterer:
     - `STRIPE_PRICE_STARTER`
     - `STRIPE_PRICE_PRO`
     - `STRIPE_PRICE_BUSINESS`
     - `STRIPE_SECRET_KEY`
     - `STRIPE_WEBHOOK_SECRET` (valgfritt)

2. **Redeploy Edge Functions (KRITISK!):**
   - Secrets lastes **kun** når Edge Function starter
   - Gå til **Edge Functions** → Klikk på funksjonen → **Deploy** eller **Save**
   - Gjenta for alle billing-funksjoner

3. **Verifiser secret-navnene:**
   - Må være nøyaktig: `STRIPE_PRICE_PRO` (ikke `STRIPE_PRO_PRICE`)
   - Case-sensitive!

4. **Sjekk debug-loggene:**
   - Gå til **Edge Functions** → [Function Name] → **Logs**
   - Se etter: `Price IDs from environment: { starter: '...', pro: '...', business: '...' }`

---

### 2. CORS-feil ved kalling av Edge Functions

**Problem:** CORS-feil når man kaller `billing-cancel-subscription` eller `billing-update-payment-method`.

**Løsning:**
1. **Verifiser at Edge Function er deployet:**
   - Gå til **Edge Functions** og sjekk at funksjonen eksisterer

2. **Redeploy Edge Functions:**
   - Kopier inn hele innholdet fra `web/supabase/functions/[function-name]/index.ts`
   - Klikk **Deploy** eller **Save**

3. **Test Edge Function direkte:**
   ```bash
   curl -X OPTIONS https://[project-ref].supabase.co/functions/v1/billing-cancel-subscription \
     -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -v
   ```

4. **Verifiser CORS-headers i koden:**
   ```typescript
   const corsHeaders = {
     "Access-Control-Allow-Origin": "*",
     "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
     "Access-Control-Allow-Methods": "POST, OPTIONS",
   };
   ```

---

### 3. 500 Internal Server Error ved opprettelse av Customer

**Løsning:**
1. **Sjekk Edge Function Logs:**
   - Gå til **Edge Functions** → `billing-create-customer` → **Logs**
   - Se etter feilmeldinger

2. **Sjekk at Secrets er satt:**
   - `STRIPE_SECRET_KEY` (skal starte med `sk_test_` eller `sk_live_`)
   - `SUPABASE_SERVICE_ROLE_KEY` (automatisk tilgjengelig)

3. **Test Edge Function direkte:**
   - Gå til **Edge Functions** → `billing-create-customer` → **Testing**
   - Fyll inn test data og klikk **Invoke**

4. **Sjekk Stripe API Key:**
   - Gå til Stripe Dashboard → **Developers** → **API keys**
   - Sjekk at du bruker **Test mode** (ikke Live mode)
   - Verifiser at Secret key er satt i Supabase

---

### 4. "No such price" eller Price ID feil

**Løsning:**
1. **Hent faktisk Price ID fra Stripe:**
   - Gå til Stripe Dashboard → **Products**
   - Klikk på produktet (f.eks. Pro)
   - Under **Pricing**, kopier **Price ID** (starter med `price_`)

2. **Sett Secret i Supabase:**
   - Gå til **Project Settings** → **Edge Functions** → **Secrets**
   - Sett `STRIPE_PRICE_PRO` (eller tilsvarende) med din faktiske Price ID
   - Sjekk at det ikke er mellomrom før eller etter

3. **Redeploy Edge Function:**
   - Gå til **Edge Functions** → `billing-update-plan` → **Deploy**

4. **Verifiser i Stripe Dashboard:**
   - Sjekk at Price ID faktisk eksisterer
   - Sjekk at du er i samme mode (Test vs Live)

---

### 5. Webhook feiler med "signature verification failed"

**Løsning:**
1. **Sjekk Webhook Secret:**
   - Gå til Stripe Dashboard → **Developers** → **Webhooks**
   - Klikk på webhook-endpointet
   - Kopier **Signing secret**
   - Sett som `STRIPE_WEBHOOK_SECRET` i Supabase

2. **Redeploy Edge Function:**
   - Gå til **Edge Functions** → `billing-webhook` → **Deploy**

3. **Test Webhook:**
   - Bruk Stripe Dashboard → **Send test webhook**
   - Sjekk logs i Supabase

---

## Debug Tips

1. **Sjekk Edge Function Logs:**
   - Gå til **Edge Functions** → [Function Name] → **Logs**
   - Se etter feilmeldinger eller debug-info

2. **Test med curl:**
   ```bash
   curl -X POST \
     'https://[project-ref].supabase.co/functions/v1/billing-create-customer' \
     -H 'Authorization: Bearer [access-token]' \
     -H 'Content-Type: application/json' \
     -d '{"salon_id": "...", "email": "...", "name": "..."}'
   ```

3. **Legg til debug-logging:**
   ```typescript
   console.log("Price IDs from env:", {
     starter: Deno.env.get("STRIPE_PRICE_STARTER"),
     pro: Deno.env.get("STRIPE_PRICE_PRO"),
     business: Deno.env.get("STRIPE_PRICE_BUSINESS"),
   });
   ```

---

## Sjekkliste

Før du kontakter support, sjekk:

- [ ] Alle secrets er satt i Supabase
- [ ] Secret-navnene er nøyaktig riktige (case-sensitive)
- [ ] Secret-verdiene er faktiske IDs (ikke placeholders)
- [ ] Edge Functions er redeployet etter å ha satt secrets
- [ ] Du er i samme Stripe mode (Test vs Live) som secrets
- [ ] Price IDs eksisterer i Stripe Dashboard
- [ ] Webhook secret er satt hvis du bruker webhooks

---

## Hjelp

Hvis problemet fortsatt oppstår:
1. Sjekk Edge Function logs for detaljerte feilmeldinger
2. Verifiser at alle secrets er satt og redeployet
3. Test Edge Functions direkte fra Supabase Dashboard
4. Sjekk Stripe Dashboard for API-feil

