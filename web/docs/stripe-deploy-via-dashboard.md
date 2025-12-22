# Deploy Edge Functions via Supabase Dashboard

Denne guiden viser deg hvordan du deployer billing Edge Functions direkte fra Supabase web interface.

---

## Steg 1: Gå til Edge Functions

1. Logg inn på [Supabase Dashboard](https://app.supabase.com/)
2. Velg ditt prosjekt
3. I venstre meny, klikk på **Edge Functions** (under "Project" eller "Developers")

---

## Steg 2: Opprett første funksjon - billing-create-customer

1. Klikk **Create a new function** (eller **New Function**)
2. **Function name:** `billing-create-customer`
3. **Copy and paste** hele innholdet fra `web/supabase/functions/billing-create-customer/index.ts`
4. Klikk **Deploy function** (eller **Save**)

---

## Steg 3: Opprett andre funksjoner

Gjenta steg 2 for hver av disse funksjonene:

### billing-create-subscription
- **Function name:** `billing-create-subscription`
- **Kilde:** `web/supabase/functions/billing-create-subscription/index.ts`

### billing-update-plan
- **Function name:** `billing-update-plan`
- **Kilde:** `web/supabase/functions/billing-update-plan/index.ts`

### billing-webhook
- **Function name:** `billing-webhook`
- **Kilde:** `web/supabase/functions/billing-webhook/index.ts`

---

## Steg 4: Verifiser at funksjonene er deployet

Etter at alle funksjonene er deployet, skal du se dem i listen under **Edge Functions**:
- ✅ billing-create-customer
- ✅ billing-create-subscription
- ✅ billing-update-plan
- ✅ billing-webhook

---

## Steg 5: Sett opp Environment Variables (Secrets)

1. I Supabase Dashboard, gå til **Project Settings** → **Edge Functions** → **Secrets**
2. Legg til følgende secrets (hvis du ikke allerede har gjort det):

```
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PRICE_STARTER=price_xxxxx
STRIPE_PRICE_PRO=price_xxxxx
STRIPE_PRICE_BUSINESS=price_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

3. Klikk **Save** for hver secret

---

## Tips

- Du kan redigere funksjoner senere ved å klikke på dem i listen
- Du kan se logs ved å klikke på en funksjon og gå til **Logs**-fanen
- Hvis du gjør endringer, klikk **Deploy** igjen for å oppdatere

---

## Troubleshooting

### Funksjonen vises ikke
- Sjekk at du har klikket **Deploy function** etter å ha lagt inn koden
- Refresh siden og sjekk igjen

### "Function not found" feil
- Sjekk at funksjonsnavnet er nøyaktig riktig (case-sensitive)
- Sjekk at funksjonen faktisk er deployet i listen

### Environment variables fungerer ikke
- Sjekk at secrets er lagt til i **Project Settings** → **Edge Functions** → **Secrets**
- Sjekk at navnene er nøyaktig riktige (case-sensitive)
- Restart funksjonen etter å ha lagt til secrets

