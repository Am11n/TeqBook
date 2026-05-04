# ADR: Modell A — tillegg planlegges til neste fakturaperiode

## Status

Accepted (produktvedtak).

## Kontekst

Tillegg (ekstra ansatte / språk) skal ikke gi kunden opplevelse av mellomfakturering, prorering eller «timing»-rader i hoved-UI. Økt behov registreres som **pending** og **aktiveres samtidig** som Stripe-abonnementets tilleggslinjer ved **neste faktureringshendelse** (typisk `invoice.upcoming` for `subscription_cycle` eller periodeskifte via `customer.subscription.updated`).

**Planbytte** (Starter → Pro osv.) kan gjøres **umiddelbart** (Stripe med ev. prorering som i `billing-update-plan`) eller **planlegges til neste periode** via **`salons.pending_plan`** (ingen Stripe-endring før apply ved periodeskifte; apply i `applyPendingSalonPlanToStripe` med `proration_behavior: none`). Dashboard lar brukeren velge og viser forhåndsvisning for «nå» via `billing-preview-plan-change`.

## Beslutning

1. **`salons.pending_target_extra_staff` / `pending_target_extra_languages`**  
   Ikke-negative heltall: **absolutt** ønsket antall betalte ekstra-enheter (per dimensjon) etter neste apply mot Stripe. Nullstilles etter vellykket apply. Erstatter tidligere delta-felt `pending_extra_*`.

2. **`salons.billing_subscription_period_start`**  
   Stripe `subscription.current_period_start` (unix sekunder), sist skrevet av `syncSubscriptionProjection`. Brukes til å oppdage **periodeskifte** (ny `current_period_start` > lagret verdi) som backup dersom `invoice.upcoming` ikke leveres.

3. **Midt i periode: `ensureStripeAddonQuantitiesMatchDb`**  
   Kaller **ikke** `subscriptions.update` på tilleggslinjer. Ved avvik mellom bruksavledet mål og Stripe: oppdater `pending_target_*`, logg drift / `addon_billing_sync_state`; ingen umiddelbar Stripe-endring (unntak nødreparasjon).

4. **Apply**  
   Delt funksjon `applyPendingSalonAddonsToStripe`: leser pending, `subscriptions.update` med nye tilleggskvanta (`proration_behavior: "none"`), nullstiller pending, oppdaterer `addons`/snapshot via eksisterende mønster + `invokeRecomputeProductAccessState`.  
   Triggere: `invoice.upcoming` når `billing_reason === "subscription_cycle"`, og etter periodeskifte i `customer.subscription.updated` (med fresh `subscriptions.retrieve` før `syncSubscriptionProjection`).

5. **Postgres-invariant**  
   `allowed = included + addons.qty` (capped). **`pending_target_*` teller ikke** i `salon_capped_addon_quantity`. Inkludert kapasitet følger DB-plan umiddelbart etter vellykket planbytte i dashboard (se produktregler for plan vs tillegg).

6. **Forhåndsvisning**  
   `billing-preview-upcoming-invoice` returnerer pending + period metadata for UI. Hovedtotal følger Stripe `retrieveUpcoming`; kunden skal ikke primært se «timing»-rader (filtreres i dashboard som i dag).

## Konsekvenser

- Dashboard må la eier **sette pending** (ny edge `billing-set-pending-addons`) og vise «aktiv nå» vs «planlagt fra neste periode».  
- Drift mellom bruk og Stripe ved manuell Stripe-endring håndteres som før med `addon_billing_sync_state`; midt-periode **etterspørsel over** Stripe skal ikke forekomme når invariant + pending-UX er på plass.

Se også: `addon-invariant-and-rpc.md`, `addon-write-path-inventory.md`.
