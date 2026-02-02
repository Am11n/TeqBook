# Stripe Webhook Security

Denne dokumentasjonen beskriver sikkerhetsimplementasjonen for Stripe webhooks i TeqBook.

---

## Oversikt

Webhook-signaturverifisering er kritisk for å sikre at webhook-events faktisk kommer fra Stripe og ikke fra en tredjepart. TeqBook implementerer flere lag med sikkerhet for å beskytte mot uautorisert tilgang og replay attacks.

---

## Signature Verification

### Hvordan det fungerer

Stripe signerer alle webhook-events med en hemmelig nøkkel (webhook signing secret). Når vi mottar en webhook, verifiserer vi signaturen ved å:

1. **Hente signaturen fra header**: `stripe-signature` header inneholder signaturen
2. **Verifisere med Stripe SDK**: Bruker `stripe.webhooks.constructEvent()` for å verifisere signaturen
3. **Validere timestamp**: Sjekker at webhook ikke er for gammel eller i fremtiden

### Implementasjon

```typescript
// Extract timestamp from signature header
const signatureParts = signature.split(",");
const timestampPart = signatureParts.find((part) => part.startsWith("t="));

if (timestampPart) {
  const timestamp = parseInt(timestampPart.split("=")[1]);
  const currentTime = Math.floor(Date.now() / 1000);
  const age = currentTime - timestamp;
  
  // Reject webhooks older than 5 minutes (300 seconds)
  if (age > 300) {
    return new Response(
      JSON.stringify({ error: "Webhook timestamp too old - possible replay attack" }),
      { status: 400 }
    );
  }
  
  // Reject webhooks with future timestamps
  if (age < -300) {
    return new Response(
      JSON.stringify({ error: "Webhook timestamp in future" }),
      { status: 400 }
    );
  }
}

// Verify signature using Stripe SDK
event = stripe.webhooks.constructEvent(
  body,
  signature,
  stripeWebhookSecret
);
```

**Lokasjon:** `supabase/functions/billing-webhook/index.ts`

---

## Replay Attack Prevention

### Problem

En angriper kan fange opp en gyldig webhook og sende den på nytt (replay attack). Dette kan føre til at samme event blir prosessert flere ganger.

### Løsning

Vi implementerer timestamp-validering for å forhindre replay attacks:

1. **Timestamp-validering**: Webhooks eldre enn 5 minutter avvises
2. **Fremtidig timestamp**: Webhooks med fremtidig timestamp avvises
3. **Stripe SDK validering**: Stripe SDK validerer også timestamp (opptil 5 minutter)

### Tidsgrenser

- **Maksimal alder**: 5 minutter (300 sekunder)
- **Fremtidig timestamp**: Avvises hvis mer enn 5 minutter i fremtiden
- **Stripe SDK**: Validerer også timestamp automatisk

---

## Security Best Practices

### 1. Webhook Secret Management

- ✅ **Ikke commit secrets**: Webhook secrets skal aldri committes til git
- ✅ **Bruk environment variables**: Lagre secrets i Supabase Edge Functions secrets
- ✅ **Separate secrets for test/live**: Bruk forskjellige secrets for test og produksjon
- ✅ **Rotate secrets**: Roter secrets regelmessig

### 2. Signature Verification

- ✅ **Alltid verifiser**: Verifiser ALLE webhooks, aldri skip signature verification
- ✅ **Bruk Stripe SDK**: Bruk `stripe.webhooks.constructEvent()` for verifisering
- ✅ **Valider timestamp**: Sjekk timestamp for å forhindre replay attacks
- ✅ **Håndter feil**: Returner 400 status ved ugyldig signature

### 3. Error Handling

- ✅ **Logg feil**: Logg alle signature verification failures
- ✅ **Ikke eksponer detaljer**: Ikke returner detaljerte feilmeldinger til klienten
- ✅ **Returner 400**: Bruk 400 status for ugyldige signatures (ikke 500)

### 4. Testing

- ✅ **Test valid signatures**: Test at gyldige signatures aksepteres
- ✅ **Test invalid signatures**: Test at ugyldige signatures avvises
- ✅ **Test replay attacks**: Test at gamle webhooks avvises
- ✅ **Test missing signatures**: Test at manglende signatures håndteres

**Test-fil:** `apps/dashboard/tests/integration/billing/webhook-verification.test.ts`

---

## Testing Approach

### Unit Tests

Vi har omfattende unit tests for webhook signature verification:

1. **Valid signature acceptance**: Tester at gyldige signatures aksepteres
2. **Invalid signature rejection**: Tester at ugyldige signatures avvises
3. **Missing signature handling**: Tester at manglende signatures håndteres
4. **Replay attack prevention**: Tester at gamle webhooks avvises
5. **All event types**: Tester alle webhook event types

### Test Setup

```typescript
import Stripe from "stripe";
import crypto from "crypto";

// Generate valid signature for testing
const createValidSignature = (payload: string, secret: string, timestamp?: number): string => {
  const ts = timestamp || Math.floor(Date.now() / 1000);
  const signedPayload = `${ts}.${payload}`;
  const secretKey = secret.replace("whsec_", "");
  const secretBuffer = Buffer.from(secretKey, "base64");
  const hmac = crypto.createHmac("sha256", secretBuffer);
  hmac.update(signedPayload, "utf8");
  const signature = hmac.digest("hex");
  return `t=${ts},v1=${signature}`;
};
```

### Kjør tester

```bash
# Kjør webhook verification tests
npm run test webhook-verification

# Kjør med coverage
npm run test:coverage
```

---

## Event Types

Følgende webhook event types er implementert og verifisert:

1. `customer.subscription.created` - Ny subscription opprettet
2. `customer.subscription.updated` - Subscription oppdatert
3. `customer.subscription.deleted` - Subscription kansellert
4. `invoice.payment_succeeded` - Betaling vellykket
5. `invoice.payment_failed` - Betaling feilet

Alle event types gjennomgår samme signature verification prosess.

---

## Troubleshooting

### "Webhook signature verification failed"

**Mulige årsaker:**
- Webhook secret er feil i Supabase secrets
- Signature header mangler eller er feil formatert
- Payload er endret etter at signaturen ble generert

**Løsning:**
1. Sjekk at `STRIPE_WEBHOOK_SECRET` er riktig i Supabase Edge Functions secrets
2. Sjekk at webhook URL er riktig i Stripe Dashboard
3. Sjekk at du bruker samme secret som ble generert for webhook-endepunktet
4. Sjekk Supabase logs for detaljerte feilmeldinger

### "Webhook timestamp too old"

**Mulige årsaker:**
- Webhook er mer enn 5 minutter gammel (replay attack)
- Klokkesynkronisering mellom servere

**Løsning:**
1. Sjekk server-klokke er synkronisert
2. Hvis dette er en gyldig webhook, sjekk at Stripe sender webhooks raskt nok
3. Vurder å øke tidsgrensen hvis nødvendig (ikke anbefalt)

### "Missing stripe-signature header"

**Mulige årsaker:**
- Webhook sendes ikke fra Stripe
- Proxy eller load balancer fjerner header

**Løsning:**
1. Sjekk at webhook faktisk kommer fra Stripe
2. Sjekk at proxy/load balancer ikke fjerner headers
3. Sjekk Stripe Dashboard for webhook delivery logs

---

## Security Checklist

Før du deployer webhook-endepunktet, sjekk:

- [ ] Webhook secret er satt i Supabase Edge Functions secrets
- [ ] Signature verification er implementert
- [ ] Timestamp validation er implementert
- [ ] Error handling er implementert
- [ ] Tests er skrevet og passerer
- [ ] Logging er implementert for debugging
- [ ] Secrets er ikke committet til git
- [ ] Separate secrets for test/live

---

## Referanser

- [Stripe Webhook Security](https://docs.stripe.com/webhooks/signatures)
- [Stripe Webhook Testing](https://docs.stripe.com/webhooks/test)
- [Stripe Webhook Best Practices](https://docs.stripe.com/webhooks/best-practices)

---

## Oppdatert

Sist oppdatert: 2024-01-XX
Versjon: 1.0
