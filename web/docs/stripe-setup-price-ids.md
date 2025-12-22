# Hvordan finne og sette Stripe Price IDs

Feilen "No such price: 'price_pro_monthly'" betyr at du ikke har satt opp de faktiske Stripe price IDs i Supabase secrets.

---

## Steg 1: Finn Price IDs i Stripe Dashboard

1. Gå til [Stripe Dashboard](https://dashboard.stripe.com/)
2. Sørg for at du er i **Test mode** (ikke Live mode)
3. Gå til **Products**
4. For hver plan (Starter, Pro, Business):
   - Klikk på produktet
   - Under **Pricing**, se etter **Price ID**
   - Price ID starter med `price_` (f.eks. `price_1ABC123def456GHI789`)
   - **Kopier hele Price ID-en**

---

## Steg 2: Sett Price IDs i Supabase Secrets

1. Gå til [Supabase Dashboard](https://app.supabase.com/)
2. Velg ditt prosjekt
3. Gå til **Project Settings** → **Edge Functions** → **Secrets**
4. Legg til eller oppdater følgende secrets:

### For Starter Plan:
- **Key:** `STRIPE_PRICE_STARTER`
- **Value:** `price_xxxxx` (din faktiske Stripe price ID for Starter)

### For Pro Plan:
- **Key:** `STRIPE_PRICE_PRO`
- **Value:** `price_xxxxx` (din faktiske Stripe price ID for Pro)

### For Business Plan:
- **Key:** `STRIPE_PRICE_BUSINESS`
- **Value:** `price_xxxxx` (din faktiske Stripe price ID for Business)

5. Klikk **Save** for hver secret

---

## Steg 3: Verifiser

Etter at du har satt secrets:

1. Prøv å opprette en subscription igjen
2. Hvis du fortsatt får feil, sjekk:
   - At Price IDs starter med `price_`
   - At du er i samme Stripe mode (Test/Live) som secrets
   - At Price IDs ikke er deaktivert i Stripe

---

## Eksempel

Hvis din Stripe Price ID for Pro plan er `price_1ABC123def456GHI789`, sett:

```
STRIPE_PRICE_PRO=price_1ABC123def456GHI789
```

**Ikke** bruk placeholder-verdier som:
- ❌ `price_pro_monthly`
- ❌ `price_starter_monthly`
- ❌ `price_business_monthly`

Bruk alltid de faktiske Price IDs fra Stripe Dashboard.

---

## Troubleshooting

### "No such price" feil fortsatt
- Sjekk at Price ID er riktig kopiert (ingen mellomrom)
- Sjekk at du er i riktig Stripe mode (Test vs Live)
- Sjekk at produktet ikke er deaktivert i Stripe

### Price ID finnes ikke
- Opprett produktet i Stripe Dashboard først
- Sørg for at produktet har en aktiv price
- Sjekk at du er i riktig Stripe-konto

---

## Neste Steg

Etter at Price IDs er satt:
1. Test opprettelse av subscription
2. Test oppdatering av plan
3. Verifiser at webhooks fungerer

