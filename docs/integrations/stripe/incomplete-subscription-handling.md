# Håndtering av Incomplete Subscriptions

## Problem

Når en subscription opprettes med `payment_behavior: "default_incomplete"`, blir den i `incomplete` status inntil betalingen er fullført. Stripe tillater **ikke** å oppdatere en subscription i `incomplete` status på en måte som resulterer i en ny invoice eller invoice items.

### Feilmelding

```
You cannot update a subscription in `incomplete` status in a way that results in a new invoice or invoice items. Only minor attributes, like `metadata` or `default_payment_method`, can be updated on such subscriptions.
```

---

## Løsning

### 1. Sjekk Subscription Status Før Oppdatering

Edge Function `billing-update-plan` sjekker nå subscription status før oppdatering:

```typescript
if (subscription.status === "incomplete" || subscription.status === "incomplete_expired") {
  return error("Cannot update incomplete subscription");
}
```

### 2. Håndtering i UI

I `billing/page.tsx`, sjekk subscription status før oppdatering:

```typescript
// Sjekk om subscription er incomplete
if (subscription.status === "incomplete") {
  // Vis melding til bruker
  setError("Please complete payment before changing plans");
  return;
}
```

---

## Hvorfor Skjer Dette?

1. **Subscription opprettes som incomplete:**
   - `billing-create-subscription` bruker `payment_behavior: "default_incomplete"`
   - Dette krever at brukeren fullfører betaling før subscription blir aktiv

2. **Bruker prøver å bytte plan før betaling er fullført:**
   - Subscription er fortsatt i `incomplete` status
   - Stripe tillater ikke plan-endring for incomplete subscriptions

---

## Løsninger

### Løsning 1: Fullfør Betaling Først (Anbefalt)

1. Bruker må fullføre betaling for den første subscription
2. Når subscription blir `active`, kan de bytte plan

**Implementering:**
- Vis klar melding i UI: "Please complete payment before changing plans"
- Redirect til payment form hvis subscription er incomplete

### Løsning 2: Avbryt og Opprett Ny (Alternativ)

1. Avbryt incomplete subscription
2. Opprett ny subscription med ny plan

**Implementering:**
```typescript
// Cancel incomplete subscription
await stripe.subscriptions.cancel(subscriptionId);

// Create new subscription with new plan
await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: newPriceId }],
  // ...
});
```

### Løsning 3: Oppdater Metadata Kun (Midlertidig)

For incomplete subscriptions, kan vi kun oppdatere metadata:

```typescript
if (subscription.status === "incomplete") {
  // Only update metadata, not price
  await stripe.subscriptions.update(subscriptionId, {
    metadata: { plan: newPlan }
  });
  // Update salon.plan in database
  // Note: Actual subscription won't change until payment completes
}
```

**Advarsel:** Dette oppdaterer kun metadata. Subscription vil fortsatt bruke gammel price inntil betaling fullføres.

---

## Best Practice

**Anbefalt flyt:**

1. **Opprett subscription** → `incomplete` status
2. **Vis payment form** → Bruker fullfører betaling
3. **Webhook mottar** `invoice.payment_succeeded` → Subscription blir `active`
4. **Nå kan bruker bytte plan** → Subscription er `active`

---

## Testing

### Test Scenario 1: Incomplete Subscription

1. Opprett subscription (blir `incomplete`)
2. Prøv å bytte plan → Skal gi feilmelding
3. Fullfør betaling i Stripe Dashboard
4. Prøv å bytte plan igjen → Skal fungere

### Test Scenario 2: Active Subscription

1. Opprett subscription og fullfør betaling
2. Subscription blir `active`
3. Bytte plan → Skal fungere

---

## Feilmeldinger i UI

Legg til brukervennlige meldinger:

```typescript
if (error.includes("incomplete")) {
  return "Please complete your payment before changing plans. Go to Stripe Dashboard to complete the payment.";
}
```

---

## Referanser

- [Stripe: Subscription Statuses](https://stripe.com/docs/billing/subscriptions/overview#subscription-statuses)
- [Stripe: Incomplete Subscriptions](https://stripe.com/docs/billing/subscriptions/overview#incomplete-subscriptions)
- `web/supabase/functions/billing-update-plan/index.ts` - Edge Function med status-sjekk

