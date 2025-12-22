# CORS Fix for Billing Edge Functions

## Problem
CORS-feil når man prøver å kalle `billing-cancel-subscription` eller `billing-update-payment-method` Edge Functions.

## Løsning

### 1. Verifiser at Edge Function er deployet

Gå til Supabase Dashboard → Edge Functions og sjekk at:
- `billing-cancel-subscription` eksisterer
- `billing-update-payment-method` eksisterer

### 2. Redeploy Edge Functions

**Via Supabase Dashboard:**
1. Gå til Edge Functions
2. Åpne `billing-cancel-subscription`
3. Kopier inn hele innholdet fra `web/supabase/functions/billing-cancel-subscription/index.ts`
4. Klikk "Deploy" eller "Save"
5. Gjenta for `billing-update-payment-method`

**Via CLI (hvis installert):**
```bash
cd web
supabase functions deploy billing-cancel-subscription
supabase functions deploy billing-update-payment-method
```

### 3. Test Edge Function direkte

Test at Edge Function faktisk svarer på OPTIONS-forespørsel:

```bash
curl -X OPTIONS https://qacgwgecrsinwjvuiobd.supabase.co/functions/v1/billing-cancel-subscription \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: authorization,content-type" \
  -v
```

Du skal få en `200 OK` respons med CORS-headers.

### 4. Sjekk Edge Function logs

Gå til Supabase Dashboard → Edge Functions → `billing-cancel-subscription` → Logs
Se om det er noen feilmeldinger når du prøver å kalle funksjonen.

### 5. Verifiser CORS-headers i koden

Sørg for at Edge Function har disse CORS-headers:

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { 
      status: 200,
      headers: corsHeaders 
    });
  }
  // ... rest of code
});
```

## Feilsøking

### Hvis CORS-feilen fortsatt oppstår:

1. **Sjekk at Edge Function faktisk er deployet**
   - Gå til Supabase Dashboard → Edge Functions
   - Se om funksjonen vises i listen
   - Sjekk at den har riktig kode

2. **Sjekk browser console for mer detaljer**
   - Åpne Developer Tools → Network tab
   - Se på OPTIONS-forespørselen
   - Sjekk status code og headers

3. **Test med curl**
   - Bruk kommandoen over for å teste OPTIONS-forespørselen direkte
   - Dette vil vise om problemet er med Edge Function eller browser

4. **Sjekk Supabase Edge Functions logs**
   - Gå til Dashboard → Edge Functions → [Function Name] → Logs
   - Se om det er noen feilmeldinger

5. **Prøv å slette og opprette Edge Function på nytt**
   - Noen ganger kan det hjelpe å slette og opprette funksjonen på nytt
   - Dette sikrer at den er deployet med riktig kode

## Alternativ løsning

Hvis problemet fortsatt oppstår, kan det være at Supabase har en cache eller at Edge Function ikke er deployet riktig. Prøv:

1. Vent noen minutter etter deploy
2. Hard refresh browser (Ctrl+Shift+R eller Cmd+Shift+R)
3. Prøv i incognito/private window
4. Sjekk om andre Edge Functions fungerer (f.eks. `billing-create-customer`)

