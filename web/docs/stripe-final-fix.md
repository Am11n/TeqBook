# Final Fix: Oppgrader til Pro - Steg for Steg

Hvis du fortsatt får "price_pro_monthly" feil, følg disse stegene nøyaktig:

---

## Steg 1: Hent din faktiske Pro Price ID fra Stripe

1. Gå til [Stripe Dashboard](https://dashboard.stripe.com/)
2. Sørg for at du er i **Test mode** (ikke Live)
3. Gå til **Products**
4. Klikk på **Pro**-produktet
5. Under **Pricing**, se etter **Price ID**
6. Price ID ser ut som: `price_1Sh8oe3KznYVwuUGntqGluyp`
7. **Kopier hele Price ID-en** (inkluderer `price_`)

---

## Steg 2: Sett Secret i Supabase

1. Gå til [Supabase Dashboard](https://app.supabase.com/)
2. Velg ditt prosjekt
3. Gå til **Project Settings** → **Edge Functions** → **Secrets**
4. Se etter `STRIPE_PRICE_PRO` i listen
5. **Hvis den ikke eksisterer:**
   - Klikk **Add new secret**
   - Key: `STRIPE_PRICE_PRO` (nøyaktig, case-sensitive)
   - Value: `price_1Sh8oe3KznYVwuUGntqGluyp` (din faktiske Price ID)
   - Klikk **Save**
6. **Hvis den eksisterer:**
   - Klikk på `STRIPE_PRICE_PRO`
   - Klikk **Edit** eller **Delete and recreate**
   - Verifiser at verdien er din faktiske Price ID
   - Sjekk at det ikke er noen mellomrom før eller etter
   - Klikk **Save**

---

## Steg 3: REDEPLOY Edge Function (KRITISK!)

**Dette er det viktigste steget!**

1. Gå til **Supabase Dashboard** → **Edge Functions**
2. Klikk på **`billing-update-plan`**
3. **Klikk på "Deploy" eller "Save"** (selv om du ikke har endret koden!)
4. Vent til deploy er ferdig
5. Du skal se en bekreftelse at funksjonen er deployet

**Merk:** Secrets lastes **kun** når Edge Function starter. Du MÅ redeploye!

---

## Steg 4: Test igjen

1. Gå til `/test-billing` i appen din
2. Klikk "3. Oppgrader til Pro"
3. Det skal nå fungere!

---

## Steg 5: Sjekk Debug-loggene (hvis det fortsatt ikke fungerer)

1. Gå til **Edge Functions** → **`billing-update-plan`** → **Logs**
2. Se etter linjer som:
   ```
   Price IDs from environment: { starter: '...', pro: '...', business: '...' }
   ```
3. Sjekk at `pro:` viser din faktiske Price ID (ikke tom eller `price_pro_monthly`)

---

## Hvis det fortsatt ikke fungerer

### Sjekkliste:

- [ ] `STRIPE_PRICE_PRO` secret er satt i Supabase
- [ ] Secret-verdien er din faktiske Price ID (ikke placeholder)
- [ ] Secret-navnet er nøyaktig `STRIPE_PRICE_PRO` (case-sensitive)
- [ ] Edge Function `billing-update-plan` er **redeployet** etter å ha satt secret
- [ ] Du er i samme Stripe mode (Test/Live) som secrets

### Prøv dette:

1. **Slett secret-en** i Supabase Dashboard
2. **Opprett den på nytt** med nøyaktig samme navn og verdi
3. **Redeploy Edge Function** igjen
4. Test på nytt

---

## Hvor kommer "price_pro_monthly" fra?

`price_pro_monthly` er en **placeholder-verdi** i koden som brukes hvis secret ikke er satt. Jeg har nå endret koden til å bruke tom streng i stedet, så du får en klarere feilmelding hvis secret ikke er satt.

---

## Viktig

**Hver gang du endrer secrets, må du redeploye Edge Function!**

Secrets lastes kun når Edge Function starter, så endringer i secrets krever redeploy.

