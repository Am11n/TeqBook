# Logging and Monitoring

## Formål

Sikre sporbarhet for sikkerhet, drift og compliance.

## Implementert (bevis)

- Security logging med app-logger og Sentry er dokumentert i:
  - `docs/security/implemented-features.md`
  - `docs/security/security-overview.md`
- Observability-prinsipper finnes i `docs/ops/observability.md`.
- Rate limiting-operasjoner og hendelser finnes i `docs/security/rate-limiting-operations.md`.

## Minimumsstandard

- Loggnivåer: info, warn, error, security.
- Kontekst: app/funksjon, correlation-id, tenant/salong der relevant.
- Ingen sensitive secrets i logglinjer.

## Overvåkning

- Mål på:
  - feilrate per app
  - 429-rate per endpoint-type
  - auth-feil og mistenkelige mønstre
- Definer alarmer for unormale topper.

## Status

- Grunnlag for logging/monitorering er implementert.
- Full sentralisert policy for alle miljøer er delvis planlagt.
