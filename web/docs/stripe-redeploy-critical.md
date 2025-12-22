# KRITISK: Redeploy Edge Function etter å ha satt Secrets

Hvis du fortsatt får "Current value: price_pro_monthly" selv om du har satt secret, betyr det at Edge Function ikke har lastet inn den nye verdien.

---

## ⚠️ VIKTIG: Secrets lastes kun når Edge Function starter

Edge Functions laster secrets **kun én gang** når de starter. Hvis du setter eller endrer en secret, må du **redeploye** Edge Function for at den skal laste inn den nye verdien.

---

## Steg-for-steg løsning

### Steg 1: Verifiser at Secret er satt riktig

1. Gå til **Supabase Dashboard** → **Project Settings** → **Edge Functions** → **Secrets**
2. Se etter `STRIPE_PRICE_PRO` i listen
3. **Klikk på secret-en** for å se verdien
4. Verifiser at verdien er din faktiske Price ID (f.eks. `price_1Sh8oe3KznYVwuUGntqGluyp`)
5. **Sjekk at det ikke er noen mellomrom** før eller etter

### Steg 2: REDEPLOY Edge Function (DETTE ER KRITISK!)

1. Gå til **Supabase Dashboard** → **Edge Functions**
2. Klikk på **`billing-update-plan`**
3. **Klikk på "Deploy" eller "Save"** (selv om du ikke har endret koden!)
4. Vent til deploy er ferdig (du skal se en bekreftelse)

**Merk:** Du må redeploye **hver gang** du endrer secrets!

### Steg 3: Sjekk Debug-loggene

Etter redeploy, prøv å oppgradere til Pro igjen, og sjekk logs:

1. Gå til **Edge Functions** → **`billing-update-plan`** → **Logs**
2. Se etter linjer som:
   ```
   Price IDs from environment: { starter: '...', pro: '...', business: '...' }
   ```
3. Sjekk at `pro:` viser din faktiske Price ID (ikke `price_pro_monthly`)

---

## Hvis det fortsatt ikke fungerer

### Alternativ 1: Slett og opprett Secret på nytt

1. Gå til **Secrets**
2. **Slett** `STRIPE_PRICE_PRO` (klikk på den og velg "Delete")
3. **Opprett på nytt:**
   - Key: `STRIPE_PRICE_PRO` (nøyaktig, case-sensitive)
   - Value: `price_1Sh8oe3KznYVwuUGntqGluyp` (din faktiske Price ID)
4. **Redeploy** Edge Function

### Alternativ 2: Sjekk at alle secrets er satt

Sett også de andre:
- `STRIPE_PRICE_STARTER=price_xxxxx`
- `STRIPE_PRICE_BUSINESS=price_xxxxx`

---

## Vanlige feil

### Secret-navnet er feil
- Må være nøyaktig: `STRIPE_PRICE_PRO`
- Ikke: `STRIPE_PRO_PRICE` eller `STRIPE_PRICE_PRO_PLAN`
- Case-sensitive!

### Secret-verdien er feil
- Må være din faktiske Price ID fra Stripe
- Ikke: `price_pro_monthly` eller andre placeholder-verdier
- Starter med `price_` etterfulgt av faktiske tegn

### Edge Function er ikke redeployet
- **Dette er den vanligste feilen!**
- Du MÅ redeploye etter å ha satt secrets
- Secrets lastes kun når Edge Function starter

---

## Sjekkliste

- [ ] Secret `STRIPE_PRICE_PRO` er satt i Supabase
- [ ] Secret-verdien er din faktiske Price ID (ikke placeholder)
- [ ] Edge Function `billing-update-plan` er **redeployet** etter å ha satt secret
- [ ] Debug-loggene viser riktig Price ID

---

## Test

Etter redeploy:
1. Prøv å oppgradere til Pro igjen
2. Hvis det fortsatt ikke fungerer, sjekk logs for debug-info
3. Se etter "Price IDs from environment:" i logs

