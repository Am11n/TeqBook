# Fikse Price ID Problem - Steg for Steg

Hvis du fortsatt får "Current value: price_pro_monthly" selv om du har satt secret, følg disse stegene nøyaktig:

---

## Steg 1: Sjekk at Secret er satt riktig

1. Gå til **Supabase Dashboard** → **Project Settings** → **Edge Functions** → **Secrets**
2. Se etter `STRIPE_PRICE_PRO` i listen
3. **Klikk på secret-en** for å se verdien
4. Verifiser at verdien er: `price_1Sh8oe3KznYVwuUGntqGluyp` (din faktiske Price ID)
5. **Hvis verdien er feil:**
   - Klikk **Edit** eller **Delete** og opprett på nytt
   - Lim inn Price ID-en: `price_1Sh8oe3KznYVwuUGntqGluyp`
   - Sjekk at det ikke er noen mellomrom før eller etter
   - Klikk **Save** price_1Sh8p43KznYVwuUGmR3iTNRf

---

## Steg 2: REDEPLOY Edge Function (KRITISK!)

**Dette er det viktigste steget!** Edge Functions laster kun secrets når de starter, så du MÅ redeploye:

1. Gå til **Supabase Dashboard** → **Edge Functions**
2. Klikk på **`billing-update-plan`**
3. Klikk på **Deploy**-knappen (eller **Save** hvis du er i Editor)
4. Vent til deploy er ferdig

**Merk:** Selv om du ikke har endret koden, må du redeploye for at secrets skal lastes inn på nytt.

---

## Steg 3: Sjekk Debug-loggene

Etter redeploy, prøv å oppgradere til Pro igjen, og sjekk logs:

1. Gå til **Edge Functions** → **`billing-update-plan`** → **Logs**
2. Se etter linjer som:
   ```
   Price IDs from environment: { starter: '...', pro: '...', business: '...' }
   ```
3. Sjekk at `pro:` viser din faktiske Price ID (`price_1Sh8oe3KznYVwuUGntqGluyp`)

---

## Steg 4: Hvis det fortsatt ikke fungerer

### Alternativ 1: Slett og opprett Secret på nytt

1. Gå til **Secrets**
2. **Slett** `STRIPE_PRICE_PRO`
3. **Opprett på nytt:**
   - Key: `STRIPE_PRICE_PRO`
   - Value: `price_1Sh8oe3KznYVwuUGntqGluyp`
4. **Redeploy** Edge Function

### Alternativ 2: Sjekk at alle secrets er satt

Sett også de andre:
- `STRIPE_PRICE_STARTER=price_xxxxx` (din Starter Price ID)
- `STRIPE_PRICE_BUSINESS=price_xxxxx` (din Business Price ID)

---

## Steg 5: Verifiser i Stripe Dashboard

1. Gå til **Stripe Dashboard** → **Products**
2. Klikk på Pro-produktet
3. Under **Pricing**, verifiser at Price ID er `price_1Sh8oe3KznYVwuUGntqGluyp`
4. Sjekk at du er i **Test mode** (ikke Live mode)

---

## Troubleshooting

### Secret vises ikke i Edge Function
- Sjekk at du er i riktig Supabase-prosjekt
- Sjekk at secret-navnet er nøyaktig `STRIPE_PRICE_PRO` (case-sensitive, ingen mellomrom)
- Redeploy Edge Function

### Fortsatt placeholder-verdi etter redeploy
- Sjekk at secret-verdien faktisk er din Price ID (ikke `price_pro_monthly`)
- Sjekk at det ikke er noen ekstra mellomrom i verdien
- Prøv å slette og opprette secret på nytt

### Price ID fungerer ikke i Stripe
- Sjekk at Price ID er fra samme Stripe mode (Test vs Live)
- Sjekk at produktet ikke er deaktivert
- Sjekk at Price ID faktisk eksisterer i Stripe Dashboard

---

## Viktig: Redeploy er nødvendig!

**Husk:** Hver gang du endrer secrets, må du **redeploye** Edge Function for at endringene skal tre i kraft!

