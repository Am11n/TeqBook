# Runbook: kritiske alarmer (Stripe + public booking)

**Ansvar:** Sett inn faktisk navn / on-call-kanal i ditt miljø (PagerDuty, Slack, osv.). Denne filen beskriver *hva* som skal overvåkes og *hvordan* dere responderer.

## 1. Stripe webhook-feil (`stripe_webhook_events`)

**Betingelse (SLO terskler):**

- **P1-page:** `failed` >= 5 hendelser per 15 min **eller** `failed_ratio` >= 5% siste 15 min.
- **P2-ticket:** `failed` >= 2 hendelser per 15 min **eller** `failed_ratio` >= 2% siste 15 min.

**Supabase / SQL-eksempel (tilpass skemanavn):**

```sql
select processing_status, count(*) 
from stripe_webhook_events 
where created_at > now() - interval '24 hours'
group by 1;
```

**Respons:**

1. Finn `event_id` / Stripe-dashboard for siste `failed`.
2. Les edge-logg for `billing-webhook`.
3. Ved transient feil: bruk Stripe replay eller manuell re-POST; verifiser at rad går til `processed` (se [`stripe-webhook-failed-recovery-scenario.md`](./stripe-webhook-failed-recovery-scenario.md)).
4. Ved data-mismatch: ikke tvang-oppdater `salons`; eskalér til utvikler.

**Aktivering i produksjon:** Konfigurer alarm i database-overvåkning (Datadog, Grafana/Postgres, Supabase log drains) på feilrate eller scheduled query på `failed`-count.

## 2. Public booking: proof / action-token misbruk eller rate limit

**Betingelse (SLO terskler):** Spike i HTTP **429** eller **403** på:

- `/api/public-booking/request-proof`
- `/api/public-booking/action-token`

- **P1-page:** `429_rate` >= 15% i 15 min **eller** `403_invalid_proof_rate` >= 20% i 15 min.
- **P2-ticket:** `429_rate` >= 8% i 15 min **eller** `403_invalid_proof_rate` >= 12% i 15 min.

**Respons:**

1. Sjekk rate-limit tabell / logger for samme IP eller booking_id-mønster.
2. Ved mistenkt brute force: vurder midlertidig WAF/regel eller strengere policy i [`packages/shared-core/src/rate-limit/policy.ts`](../../packages/shared-core/src/rate-limit/policy.ts) (bevisst endring, ikke hotfix i prod uten review).

**Aktivering:** HTTP-metrikker fra CDN / Vercel / reverse proxy med terskel på 429-rate eller feilrate for disse path-prefixene.

## Verifikasjon

Etter at alarmer er konfigurert: trigge en kontrollert test (f.eks. kjent `failed` replay i staging) og bekreft at varslet kommer frem og at runbook-steg stemmer.

## Dashboard minimumspaneler

- `stripe_webhook_events`: total, failed, failed_ratio (15m rolling).
- Public proof/token: 2xx/4xx/429 for de to rutene over, med 15m rolling rater.
- Link paneler til denne runbooken for on-call-handover.
