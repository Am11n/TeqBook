# Rate Limiting Operations

Denne runbooken beskriver hvordan rate limiting driftes i TeqBook.

## Policy-matrise

Kildekode:
- App/shared policy: `packages/shared-core/src/rate-limit/policy.ts`
- Edge policy: `supabase/supabase/functions/_shared/rate-limit-config.ts`

Hovedpolicy:
- **Fail-closed**: auth/login, billing, admin impersonation, booking mutations.
- **Fail-open**: kun lav-risiko public-read (`public-booking-data`).

## Headers og blokkering

Ved blokkering returneres:
- `429 Too Many Requests`
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`
- `Retry-After`

## Incident runbook

1. Verifiser om `rate-limit-check` fungerer (`supabase functions list` / invoke test).
2. Sjekk `rate_limit_entries` for blokkeringstopper:

```sql
SELECT endpoint_type, identifier_type, COUNT(*) AS entries
FROM rate_limit_entries
GROUP BY endpoint_type, identifier_type
ORDER BY entries DESC;
```

3. Ved høy fallback-rate:
   - undersøk Edge Function health
   - undersøk DB-feil mot `rate_limit_entries`
4. Ikke bytt sensitive endpoints til fail-open uten eksplisitt risikovurdering.

## Endre policy trygt

1. Oppdater policy i begge matriser (shared-core + edge config).
2. Oppdater/legg til tester for endpointets policy.
3. Oppdater sikkerhetsdokumentasjon ved policy-endring.
