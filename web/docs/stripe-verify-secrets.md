# Verifiser Stripe Secrets i Supabase

Hvis Edge Function fortsatt bruker placeholder-verdier selv om du har satt secrets, følg disse stegene:

---

## Steg 1: Verifiser at Secrets er satt

1. Gå til Supabase Dashboard → **Project Settings** → **Edge Functions** → **Secrets**
2. Sjekk at følgende secrets eksisterer:
   - `STRIPE_PRICE_STARTER`
   - `STRIPE_PRICE_PRO`
   - `STRIPE_PRICE_BUSINESS`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET` (valgfritt for testing)

3. **Viktig:** Sjekk at verdiene:
   - Starter med `price_` (ikke `price_pro_monthly` eller lignende)
   - Er de faktiske Price IDs fra Stripe Dashboard
   - Har ingen mellomrom eller ekstra tegn

---

## Steg 2: Sjekk Secret-navnene

**Viktig:** Secret-navnene må være nøyaktig:
- `STRIPE_PRICE_STARTER` (ikke `STRIPE_PRICE_START` eller `STRIPE_STARTER_PRICE`)
- `STRIPE_PRICE_PRO` (ikke `STRIPE_PRO_PRICE` eller `STRIPE_PRICE_PRO_PLAN`)
- `STRIPE_PRICE_BUSINESS` (ikke `STRIPE_BUSINESS_PRICE`)

---

## Steg 3: Redeploy Edge Functions

Etter å ha satt secrets, må du **redeploye** Edge Functions for at de skal få de nye verdiene:

1. Gå til Supabase Dashboard → **Edge Functions**
2. For hver funksjon (`billing-update-plan`, `billing-create-subscription`):
   - Klikk på funksjonen
   - Klikk **Deploy** eller **Save** (selv om koden ikke er endret)
   - Dette tvinger Edge Function til å laste inn nye secrets

---

## Steg 4: Test med Debug-logging

Du kan legge til debug-logging i Edge Function for å se hva den faktisk henter:

I Edge Function, legg til før price ID-sjekken:
```typescript
console.log("Price IDs from env:", {
  starter: Deno.env.get("STRIPE_PRICE_STARTER"),
  pro: Deno.env.get("STRIPE_PRICE_PRO"),
  business: Deno.env.get("STRIPE_PRICE_BUSINESS"),
});
```

Sjekk deretter logs for å se hva som faktisk hentes.

---

## Steg 5: Slett og opprett Secret på nytt

Hvis det fortsatt ikke fungerer:

1. Slett secret-en i Supabase Dashboard
2. Opprett den på nytt med nøyaktig samme navn
3. Lim inn Price ID-en på nytt (sjekk at det ikke er noen ekstra mellomrom)
4. Redeploy Edge Function

---

## Steg 6: Verifiser Price ID i Stripe

1. Gå til Stripe Dashboard → **Products**
2. Klikk på Pro-produktet
3. Under **Pricing**, se Price ID
4. Kopier hele Price ID-en (f.eks. `price_1ABC123def456GHI789`)
5. Sjekk at denne er identisk med det du har satt i Supabase secrets

---

## Troubleshooting

### Secret vises ikke i Edge Function
- Sjekk at du er i riktig Supabase-prosjekt
- Sjekk at secret-navnet er nøyaktig riktig (case-sensitive)
- Redeploy Edge Function etter å ha satt secret

### Fortsatt placeholder-verdi
- Sjekk at du ikke har en secret med feil navn som overstyrer
- Sjekk at secret-verdien ikke inneholder placeholder-tekst
- Redeploy Edge Function

### Price ID fungerer ikke i Stripe
- Sjekk at Price ID er fra samme Stripe mode (Test vs Live)
- Sjekk at produktet ikke er deaktivert i Stripe
- Sjekk at Price ID faktisk eksisterer i Stripe Dashboard

