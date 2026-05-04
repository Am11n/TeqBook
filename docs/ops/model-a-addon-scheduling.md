# ADR: Modell A — tillegg planlegges til neste fakturaperiode

## Status

Accepted (produktvedtak).

## Kontekst

Tillegg (ekstra ansatte / språk) skal ikke gi kunden opplevelse av mellomfakturering, prorering eller «timing»-rader i hoved-UI. Økt behov registreres som **pending** og **aktiveres samtidig** som Stripe-abonnementets tilleggslinjer ved **neste faktureringshendelse** (typisk `invoice.upcoming` for `subscription_cycle` eller periodeskifte via `customer.subscription.updated`).

**Planbytte** (Starter → Pro osv.) kan gjøres **umiddelbart** (Stripe med ev. prorering som i `billing-update-plan`) eller **planlegges til neste periode** via **`salons.pending_plan`** (ingen Stripe-endring før apply ved periodeskifte; apply i `applyPendingSalonPlanToStripe` med `proration_behavior: none`). Dashboard lar brukeren velge og viser forhåndsvisning for «nå» via `billing-preview-plan-change`.

## Beslutning

1. **`salons.pending_extra_staff` / `pending_extra_languages`**  
   Ikke-negative heltall: ekstra enheter som skal **legges til** Stripe-kvantum ved neste grense-jobb, deretter nullstilles.

2. **`salons.billing_subscription_period_start`**  
   Stripe `subscription.current_period_start` (unix sekunder), sist skrevet av `syncSubscriptionProjection`. Brukes til å oppdage **periodeskifte** (ny `current_period_start` > lagret verdi) som backup dersom `invoice.upcoming` ikke leveres.

3. **Midt i periode: `ensureStripeAddonQuantitiesMatchDb`**  
   - **Senk** Stripe-tillegg når faktisk bruk (`usageDerived`) er lavere enn Stripe-kvantum (synk ned, `proration_behavior: none`).  
   - **Øk ikke** Stripe-tillegg ut fra bruk alene; økning skjer via pending + apply-jobb, eller via **planbytte**-flyt.

4. **Apply**  
   Delt funksjon `applyPendingSalonAddonsToStripe`: leser pending, `subscriptions.update` med nye tilleggskvanta (`proration_behavior: "none"`), nullstiller pending, oppdaterer `addons`/snapshot via eksisterende mønster + `invokeRecomputeProductAccessState`.  
   Triggere: `invoice.upcoming` når `billing_reason === "subscription_cycle"`, og etter periodeskifte i `customer.subscription.updated` (med fresh `subscriptions.retrieve` før `syncSubscriptionProjection`).

5. **Postgres-invariant**  
   Uendret: `allowed = included + addons.qty` (capped). Pending gir **ikke** høyere `allowed` før Stripe er oppdatert og webhook har skrevet `addons`.

6. **Forhåndsvisning**  
   `billing-preview-upcoming-invoice` returnerer pending + period metadata for UI. Hovedtotal følger Stripe `retrieveUpcoming`; kunden skal ikke primært se «timing»-rader (filtreres i dashboard som i dag).

## Konsekvenser

- Dashboard må la eier **sette pending** (ny edge `billing-set-pending-addons`) og vise «aktiv nå» vs «planlagt fra neste periode».  
- Drift mellom bruk og Stripe ved manuell Stripe-endring håndteres som før med `addon_billing_sync_state`; midt-periode **etterspørsel over** Stripe skal ikke forekomme når invariant + pending-UX er på plass.

Se også: `addon-invariant-and-rpc.md`, `addon-write-path-inventory.md`.
