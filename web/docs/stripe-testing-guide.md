# Stripe Testing Guide

Denne guiden viser deg hvordan du tester Stripe-integrasjonen etter at alt er satt opp.

---

## Forutsetninger

Før du starter, sørg for at:

- ✅ Alle 4 Edge Functions er deployet i Supabase
- ✅ Stripe secrets er satt i Supabase Edge Functions secrets
- ✅ Stripe produkter og prices er opprettet i Stripe Dashboard
- ✅ Webhook er konfigurert i Stripe Dashboard

---

## Test 1: Test Edge Functions direkte

### Test billing-create-customer

Du kan teste Edge Functions direkte fra Supabase Dashboard eller via curl/Postman.

**Fra Supabase Dashboard:**
1. Gå til **Edge Functions** → **billing-create-customer**
2. Klikk på funksjonen
3. Gå til **Testing**-fanen (eller **Invoke**)
4. Fyll inn:
   ```json
   {
     "salon_id": "din-salon-id-her",
     "email": "test@example.com",
     "name": "Test Salon"
   }
   ```
5. Klikk **Invoke** eller **Test**

**Fra terminal (curl):**
```bash
# Først, få din access token fra Supabase
# Logg inn i appen din og åpne browser console, eller bruk:

curl -X POST \
  'https://[your-project-ref].supabase.co/functions/v1/billing-create-customer' \
  -H 'Authorization: Bearer [your-access-token]' \
  -H 'Content-Type: application/json' \
  -d '{
    "salon_id": "din-salon-id-her",
    "email": "test@example.com",
    "name": "Test Salon"
  }'
```

**Forventet respons:**
```json
{
  "success": true,
  "customer_id": "cus_xxxxx",
  "email": "test@example.com"
}
```

---

## Test 2: Test fra Frontend (React/Next.js)

### Opprett en test-side

Opprett en test-side i Next.js for å teste billing-funksjonene:

**`web/src/app/test-billing/page.tsx`** (midlertidig test-side):

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCurrentSalon } from "@/components/salon-provider";
import { 
  createStripeCustomer, 
  createStripeSubscription,
  updateSubscriptionPlan 
} from "@/lib/services/billing-service";

export default function TestBillingPage() {
  const { salon, isReady } = useCurrentSalon();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreateCustomer = async () => {
    if (!salon?.id) return;
    
    setLoading(true);
    setError(null);
    
    const { data, error: err } = await createStripeCustomer(
      salon.id,
      "test@example.com",
      salon.name || "Test Salon"
    );
    
    if (err) {
      setError(err);
    } else {
      setResult(data);
    }
    
    setLoading(false);
  };

  const handleCreateSubscription = async () => {
    if (!salon?.id || !salon?.billing_customer_id) {
      setError("Du må opprette customer først");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const { data, error: err } = await createStripeSubscription(
      salon.id,
      salon.billing_customer_id,
      "starter" // eller "pro" eller "business"
    );
    
    if (err) {
      setError(err);
    } else {
      setResult(data);
    }
    
    setLoading(false);
  };

  const handleUpdatePlan = async () => {
    if (!salon?.id || !salon?.billing_subscription_id) {
      setError("Du må ha en subscription først");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const { data, error: err } = await updateSubscriptionPlan(
      salon.id,
      salon.billing_subscription_id,
      "pro" // oppgrader til pro
    );
    
    if (err) {
      setError(err);
    } else {
      setResult(data);
    }
    
    setLoading(false);
  };

  if (!isReady) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Test Stripe Billing</h1>
        
        <div className="space-y-4 mb-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Salon ID: {salon?.id}
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              Customer ID: {salon?.billing_customer_id || "Ikke opprettet"}
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              Subscription ID: {salon?.billing_subscription_id || "Ikke opprettet"}
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              Current Plan: {salon?.plan || "Ingen plan"}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={handleCreateCustomer} 
            disabled={loading || !!salon?.billing_customer_id}
          >
            {loading ? "Loading..." : "1. Opprett Stripe Customer"}
          </Button>

          <Button 
            onClick={handleCreateSubscription} 
            disabled={loading || !salon?.billing_customer_id || !!salon?.billing_subscription_id}
          >
            {loading ? "Loading..." : "2. Opprett Subscription (Starter)"}
          </Button>

          <Button 
            onClick={handleUpdatePlan} 
            disabled={loading || !salon?.billing_subscription_id}
          >
            {loading ? "Loading..." : "3. Oppgrader til Pro"}
          </Button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded">
            <p className="text-sm text-destructive">Error: {error}</p>
          </div>
        )}

        {result && (
          <div className="mt-4 p-3 bg-muted rounded">
            <p className="text-sm font-mono text-sm">
              {JSON.stringify(result, null, 2)}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
```

**Gå til:** `http://localhost:3000/test-billing`

---

## Test 3: Test Webhook Events

### Fra Stripe Dashboard

1. Gå til **Developers** → **Webhooks** i Stripe Dashboard
2. Klikk på webhook-endepunktet ditt
3. Klikk **Send test webhook**
4. Velg event: `customer.subscription.created`
5. Klikk **Send test webhook**
6. Sjekk Supabase logs:
   - Gå til **Edge Functions** → **billing-webhook** → **Logs**
   - Du skal se at webhook ble mottatt og prosessert

### Test med Stripe CLI (hvis installert)

```bash
# Login til Stripe
stripe login

# Forward webhooks til lokal server (for lokal testing)
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Send test event
stripe trigger customer.subscription.created
```

---

## Test 4: Test med Stripe Test Cards

Når du oppretter en subscription, må du bekrefte betalingen. Bruk Stripe test cards:

**Suksessfull betaling:**
- Card: `4242 4242 4242 4242`
- Exp: Hvilket som helst fremtidig dato (f.eks. `12/34`)
- CVC: Hvilket som helst 3 sifre (f.eks. `123`)
- ZIP: Hvilket som helst 5 sifre (f.eks. `12345`)

**Feilet betaling:**
- Card: `4000 0000 0000 0002`

**Krever 3D Secure:**
- Card: `4000 0025 0000 3155`

---

## Test 5: Verifiser Database Oppdateringer

Etter hver test, sjekk at database er oppdatert:

1. Gå til Supabase Dashboard → **Table Editor** → **salons**
2. Finn din salon
3. Sjekk at følgende felter er oppdatert:
   - `billing_customer_id` (etter customer opprettelse)
   - `billing_subscription_id` (etter subscription opprettelse)
   - `plan` (etter subscription eller plan update)
   - `current_period_end` (etter subscription opprettelse/update)

---

## Test 6: Full End-to-End Test

Test hele flyten:

1. **Opprett Customer:**
   - Klikk "Opprett Stripe Customer" i test-siden
   - Verifiser at `billing_customer_id` er satt i database

2. **Opprett Subscription:**
   - Klikk "Opprett Subscription"
   - Du får en `client_secret` tilbake
   - **Merk:** Du må implementere Stripe Elements for å bekrefte betalingen
   - Eller bruk Stripe Dashboard → **Customers** → **Add payment method** manuelt

3. **Test Webhook:**
   - Send test webhook fra Stripe Dashboard
   - Verifiser at `billing_subscription_id` og `plan` er oppdatert i database

4. **Oppdater Plan:**
   - Klikk "Oppgrader til Pro"
   - Verifiser at `plan` er oppdatert i database

---

## Troubleshooting

### "STRIPE_SECRET_KEY environment variable is not set"
- Sjekk at secret er lagt til i Supabase → **Project Settings** → **Edge Functions** → **Secrets**
- Sjekk at navnet er nøyaktig `STRIPE_SECRET_KEY` (case-sensitive)

### "Price ID not configured"
- Sjekk at `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_BUSINESS` er satt i secrets
- Sjekk at price IDs starter med `price_`

### "Unauthorized" feil
- Sjekk at du er logget inn i appen
- Sjekk at access token er gyldig
- Sjekk at Edge Function auth-kode fungerer

### Webhook fungerer ikke
- Sjekk at webhook URL er riktig i Stripe Dashboard
- Sjekk at `STRIPE_WEBHOOK_SECRET` er riktig
- Sjekk Supabase logs for feilmeldinger

---

## Neste Steg

Etter testing:
- Implementer Stripe Elements i UI for betalingsbekreftelse
- Legg til subscription management i settings-siden
- Implementer trial period hvis ønskelig
- Legg til email-notifikasjoner for betalingsfeil

