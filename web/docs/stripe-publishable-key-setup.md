# Sett opp Stripe Publishable Key

For at betalingsskjemaet skal fungere i test-siden, må du sette opp Stripe Publishable Key.

---

## Steg 1: Hent Publishable Key fra Stripe

1. Gå til [Stripe Dashboard](https://dashboard.stripe.com/)
2. Sørg for at du er i **Test mode** (ikke Live mode)
3. Gå til **Developers** → **API keys**
4. Kopier **Publishable key** (starter med `pk_test_` for test, `pk_live_` for produksjon)

---

## Steg 2: Legg til i .env.local

1. Åpne `web/.env.local` filen
2. Legg til:

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

3. Erstatt `pk_test_xxxxx` med din faktiske Publishable key

---

## Steg 3: Restart Dev Server

Etter å ha lagt til environment variable:

1. Stopp dev serveren (Ctrl+C)
2. Start den på nytt: `npm run dev`
3. Oppdater siden i nettleseren

---

## Test

Etter at du har satt opp Publishable key:

1. Gå til `/test-billing`
2. Klikk "1. Opprett Stripe Customer"
3. Klikk "2. Opprett Subscription (Starter)"
4. Et betalingsskjema skal nå vises automatisk
5. Fyll inn test card: `4242 4242 4242 4242`
6. Bekreft betalingen

---

## Viktig

- Bruk **Test mode** Publishable key (`pk_test_`) for utvikling
- Bruk **Live mode** Publishable key (`pk_live_`) kun i produksjon
- Publishable key er trygg å eksponere i frontend (ikke Secret key!)

