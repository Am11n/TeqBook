# Edge Functions Setup - Enkel Guide (Uten Mapper)

Siden Supabase Editor ikke støtter mapper, har vi inlinet auth-koden i hver funksjon. Følg disse enkle stegene:

---

## Steg 1: Opprett billing-create-customer

1. I Supabase Dashboard → **Edge Functions** → **Open Editor**
2. Klikk **New function** (eller **Create function**)
3. **Function name:** `billing-create-customer`
4. **Kopier HELE innholdet** fra `supabase/functions/billing-create-customer/index.ts`
5. Klikk **Deploy function**

---

## Steg 2: Opprett billing-create-subscription

1. Klikk **New function** igjen
2. **Function name:** `billing-create-subscription`
3. **Kopier HELE innholdet** fra `supabase/functions/billing-create-subscription/index.ts`
4. Klikk **Deploy function**

---

## Steg 3: Opprett billing-update-plan

1. Klikk **New function**
2. **Function name:** `billing-update-plan`
3. **Kopier HELE innholdet** fra `supabase/functions/billing-update-plan/index.ts`
4. Klikk **Deploy function**

---

## Steg 4: Opprett billing-webhook

1. Klikk **New function**
2. **Function name:** `billing-webhook`
3. **Kopier HELE innholdet** fra `supabase/functions/billing-webhook/index.ts`
4. Klikk **Deploy function**

**Merk:** `billing-webhook` trenger IKKE auth (den bruker Stripe signature i stedet).

---

## Steg 5: Verifiser

Du skal nå ha 4 funksjoner i listen:
- ✅ billing-create-customer
- ✅ billing-create-subscription
- ✅ billing-update-plan
- ✅ billing-webhook

---

## Steg 6: Sett opp Secrets

1. Gå til **Project Settings** → **Edge Functions** → **Secrets**
2. Legg til:

```
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PRICE_STARTER=price_xxxxx
STRIPE_PRICE_PRO=price_xxxxx
STRIPE_PRICE_BUSINESS=price_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

---

## Tips

- Alle funksjonene har nå auth-koden inlinet, så du trenger ikke `_shared` mappen
- Du kan redigere funksjoner senere ved å klikke på dem
- Se logs ved å klikke på en funksjon → **Logs**-fanen

---

## Hvor finner jeg koden?

Åpne filene i prosjektet:
- `supabase/functions/billing-create-customer/index.ts`
- `supabase/functions/billing-create-subscription/index.ts`
- `supabase/functions/billing-update-plan/index.ts`
- `supabase/functions/billing-webhook/index.ts`

Kopier hele innholdet fra hver fil og lim inn i Editor.

