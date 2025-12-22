# Stripe Troubleshooting Guide

## 500 Internal Server Error ved opprettelse av Customer

Hvis du får 500-feil når du prøver å opprette en Stripe customer, sjekk følgende:

### 1. Sjekk Edge Function Logs

1. Gå til Supabase Dashboard → **Edge Functions**
2. Klikk på `billing-create-customer`
3. Gå til **Logs**-fanen
4. Se etter feilmeldinger

Vanlige feil:
- `STRIPE_SECRET_KEY environment variable is not set`
- `Stripe API error: ...`
- `Error updating salon with customer ID: ...`

### 2. Sjekk at Secrets er satt

1. Gå til **Project Settings** → **Edge Functions** → **Secrets**
2. Verifiser at følgende secrets eksisterer:
   - `STRIPE_SECRET_KEY` (skal starte med `sk_test_` eller `sk_live_`)
   - `SUPABASE_SERVICE_ROLE_KEY` (brukes for å oppdatere database)

**Viktig:** `SUPABASE_SERVICE_ROLE_KEY` er automatisk tilgjengelig, men sjekk at Edge Function har tilgang til den.

### 3. Test Edge Function direkte

1. Gå til Supabase Dashboard → **Edge Functions** → `billing-create-customer`
2. Klikk på **Testing** eller **Invoke**-fanen
3. Fyll inn test data:
   ```json
   {
     "salon_id": "din-salon-id-her",
     "email": "test@example.com",
     "name": "Test Salon"
   }
   ```
4. Klikk **Invoke**
5. Se feilmeldingen direkte

### 4. Sjekk Stripe API Key

1. Gå til Stripe Dashboard → **Developers** → **API keys**
2. Sjekk at du bruker **Test mode** (ikke Live mode)
3. Kopier **Secret key** (skal starte med `sk_test_`)
4. Sjekk at denne er satt i Supabase secrets som `STRIPE_SECRET_KEY`

### 5. Sjekk at Edge Function er deployet

1. Gå til Supabase Dashboard → **Edge Functions**
2. Verifiser at `billing-create-customer` er i listen
3. Hvis ikke, deploy den igjen

### 6. Test med curl (alternativ)

Hvis du vil teste direkte fra terminal:

```bash
# Først, få din access token
# (Logg inn i appen, åpne browser console, og kjør:)
# await supabase.auth.getSession()

curl -X POST \
  'https://[your-project-ref].supabase.co/functions/v1/billing-create-customer' \
  -H 'Authorization: Bearer [your-access-token]' \
  -H 'Content-Type: application/json' \
  -H 'apikey: [your-anon-key]' \
  -d '{
    "salon_id": "din-salon-id",
    "email": "test@example.com",
    "name": "Test Salon"
  }'
```

---

## Vanlige Feil og Løsninger

### "STRIPE_SECRET_KEY environment variable is not set"

**Løsning:**
1. Gå til Supabase Dashboard → **Project Settings** → **Edge Functions** → **Secrets**
2. Legg til secret: `STRIPE_SECRET_KEY` med verdien din Stripe secret key
3. Sørg for at navnet er nøyaktig `STRIPE_SECRET_KEY` (case-sensitive)

### "Unauthorized" eller "Invalid token"

**Løsning:**
- Sjekk at du er logget inn i appen
- Sjekk at access token er gyldig
- Prøv å logge ut og inn igjen

### "Error updating salon with customer ID"

**Løsning:**
- Dette er ikke kritisk - customer er opprettet i Stripe
- Sjekk at `SUPABASE_SERVICE_ROLE_KEY` er tilgjengelig for Edge Functions
- Sjekk at salon_id eksisterer i database

### Stripe API errors

**Vanlige Stripe-feil:**
- `Invalid API Key` - Sjekk at Stripe secret key er riktig
- `No such customer` - Customer ble ikke opprettet
- `Rate limit exceeded` - For mange requests, vent litt

**Løsning:**
- Sjekk Stripe Dashboard → **Developers** → **Logs** for detaljer
- Sjekk at du bruker riktig API key (test vs live)

---

## Debug Tips

1. **Aktiver verbose logging:**
   - I Edge Function, legg til `console.log()` statements
   - Se logs i Supabase Dashboard

2. **Test steg for steg:**
   - Test først at Edge Function kan kjøres (uten Stripe)
   - Test deretter Stripe API direkte
   - Test deretter hele flyten

3. **Sjekk browser console:**
   - Åpne Developer Tools (F12)
   - Se Network-fanen for detaljerte feilmeldinger
   - Se Console for JavaScript-feil

---

## Kontakt Support

Hvis ingenting fungerer:
1. Samle alle feilmeldinger fra logs
2. Sjekk Stripe Dashboard for events
3. Sjekk Supabase Dashboard for database-feil
4. Dokumenter hva du har prøvd

