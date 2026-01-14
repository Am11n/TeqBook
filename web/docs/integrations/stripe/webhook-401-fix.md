# Fix: Webhook 401 Unauthorized Error

## Problem

Webhook returnerer `401 Unauthorized` med melding "Missing authorization header" når Stripe sender webhook events.

## Årsak

Supabase Edge Functions kan ha en default auth check som krever `authorization` header, men Stripe webhooks sender ikke dette header. Webhooks bruker i stedet `stripe-signature` header for autentisering.

## Løsning

### Metode 1: Deaktiver Auth for Webhook Function (Anbefalt)

1. Gå til **Supabase Dashboard** → **Edge Functions**
2. Klikk på `billing-webhook` funksjonen
3. Se etter innstillinger som:
   - "Require authentication"
   - "Auth required" 
   - "Enable JWT verification"
4. **Deaktiver** denne innstillingen
5. **Redeploy** funksjonen

### Metode 2: Legg til `apikey` i Webhook URL

Hvis du ikke kan deaktivere auth, legg til `apikey` parameter i webhook URL:

1. Gå til **Stripe Dashboard** → **Developers** → **Webhooks**
2. Klikk på webhook-endepunktet ditt
3. Klikk **Edit** eller **Update endpoint**
4. Endre **Endpoint URL** til:
   ```
   https://[your-project-ref].supabase.co/functions/v1/billing-webhook?apikey=[your-anon-key]
   ```
5. Hvor finner du `anon-key`?
   - Gå til **Supabase Dashboard** → **Project Settings** → **API**
   - Kopier **anon/public** key
6. Klikk **Update endpoint**

### Metode 3: Bruk Service Role Key (Ikke anbefalt for produksjon)

⚠️ **Advarsel:** Dette gir full database access. Bruk kun for testing.

1. Gå til **Supabase Dashboard** → **Project Settings** → **API**
2. Kopier **service_role** key (ikke anon key)
3. Legg til i webhook URL:
   ```
   https://[your-project-ref].supabase.co/functions/v1/billing-webhook?apikey=[service-role-key]
   ```

### Metode 4: Konfigurer Stripe til å sende `apikey` Header

Hvis Stripe Dashboard tillater custom headers:

1. Gå til **Stripe Dashboard** → **Developers** → **Webhooks**
2. Klikk på webhook-endepunktet
3. Se etter "Headers" eller "Custom headers" seksjon
4. Legg til header:
   - **Name:** `apikey`
   - **Value:** `[your-anon-key]`

---

## Verifisering

Etter å ha gjort endringene:

1. Gå til **Stripe Dashboard** → **Developers** → **Webhooks**
2. Klikk på webhook-endepunktet
3. Klikk **Send test webhook**
4. Velg event: `customer.subscription.created`
5. Klikk **Send test webhook**
6. Sjekk **Recent deliveries**:
   - Status skal være **200** (ikke 401)
   - Response skal være `{"received": true, "event_type": "customer.subscription.created"}`

---

## Troubleshooting

### Fortsatt 401 etter endringer

1. **Sjekk at funksjonen er redeployet:**
   - Gå til Supabase Dashboard → Edge Functions → billing-webhook
   - Klikk **Deploy** eller **Redeploy**

2. **Sjekk webhook URL:**
   - Verifiser at URL er riktig i Stripe Dashboard
   - Sjekk at `apikey` parameter er inkludert (hvis du bruker Metode 2)

3. **Sjekk Supabase Logs:**
   - Gå til Supabase Dashboard → Edge Functions → billing-webhook → Logs
   - Se etter feilmeldinger

4. **Test med curl:**
   ```bash
   curl -X POST \
     'https://[your-project-ref].supabase.co/functions/v1/billing-webhook?apikey=[your-anon-key]' \
     -H 'Content-Type: application/json' \
     -H 'stripe-signature: test' \
     -d '{"test": "data"}'
   ```

---

## Best Practice

For produksjon:
- ✅ **Bruk Metode 1** (deaktiver auth) hvis mulig
- ✅ Webhook autentisering skjer via `stripe-signature` header (allerede implementert)
- ✅ Ikke bruk service_role key i webhook URL (sikkerhetsrisiko)

---

Sist oppdatert: 2025-01-13
