# Edge Functions Setup - Steg for Steg

Følg disse stegene for å opprette alle billing Edge Functions i Supabase Dashboard.

---

## Steg 1: Opprett _shared/auth.ts (Først!)

Alle funksjonene trenger denne filen. Du må opprette den først.

1. I Supabase Dashboard → **Edge Functions**, klikk **Open Editor**
2. Klikk **New folder** eller **Create folder**
3. Navn: `_shared`
4. Klikk inn i `_shared` mappen
5. Klikk **New file**
6. Filnavn: `auth.ts`
7. Kopier inn hele innholdet fra `web/supabase/functions/_shared/auth.ts`
8. Klikk **Save** eller **Deploy**

---

## Steg 2: Opprett billing-create-customer

1. Gå tilbake til **Edge Functions** hovedside
2. Klikk **Open Editor**
3. Klikk **New function** (eller **Create function**)
4. **Function name:** `billing-create-customer`
5. **Kopier inn hele koden** fra `web/supabase/functions/billing-create-customer/index.ts`
6. Klikk **Deploy function** (eller **Save**)

---

## Steg 3: Opprett billing-create-subscription

1. Klikk **New function** igjen
2. **Function name:** `billing-create-subscription`
3. **Kopier inn hele koden** fra `web/supabase/functions/billing-create-subscription/index.ts`
4. Klikk **Deploy function**

---

## Steg 4: Opprett billing-update-plan

1. Klikk **New function**
2. **Function name:** `billing-update-plan`
3. **Kopier inn hele koden** fra `web/supabase/functions/billing-update-plan/index.ts`
4. Klikk **Deploy function**

---

## Steg 5: Opprett billing-webhook

1. Klikk **New function**
2. **Function name:** `billing-webhook`
3. **Kopier inn hele koden** fra `web/supabase/functions/billing-webhook/index.ts`
4. Klikk **Deploy function**

---

## Steg 6: Verifiser at alt er på plass

Du skal nå ha følgende struktur:

```
Edge Functions/
├── _shared/
│   └── auth.ts
├── billing-create-customer
├── billing-create-subscription
├── billing-update-plan
└── billing-webhook
```

---

## Steg 7: Sett opp Environment Variables (Secrets)

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

- Du kan redigere funksjoner senere ved å klikke på dem
- Se logs ved å klikke på en funksjon → **Logs**-fanen
- Hvis du gjør endringer, klikk **Deploy** igjen

---

## Troubleshooting

### "Cannot find module '../_shared/auth.ts'"
- Sjekk at `_shared/auth.ts` er opprettet først
- Sjekk at filnavnet er nøyaktig `auth.ts` (ikke `auth.js`)

### Funksjonen vises ikke
- Sjekk at du klikket **Deploy function** etter å ha lagt inn koden
- Refresh siden

### Environment variables fungerer ikke
- Sjekk at secrets er lagt til i **Project Settings** → **Edge Functions** → **Secrets**
- Sjekk at navnene er nøyaktig riktige (case-sensitive)

