# GDPR Data Lifecycle

## Scope

Denne oversikten gjelder behandling av persondata i TeqBook innen EEA/Norden.

## Implementert (bevis)

- GDPR-prinsipper og livssyklus er dokumentert i `docs/compliance/data-lifecycle.md`.
- Multi-tenant databeskyttelse via RLS er dokumentert i `docs/backend/rls-strategy.md`.
- Sikkerhetskontroller er dokumentert i `docs/security/security-overview.md`.

## Planlagt / under avklaring

- Full automatisering av retention-jobber og data subject workflows er delvis planlagt.
- Enkelte API-eksempler i legacy compliance-dokumentasjon er illustrasjoner, ikke ferdig implementerte ruter.

## Operativ bruk

Ved revisjon:

1. Start med `docs/compliance/data-lifecycle.md`.
2. Bekreft sikkerhetstiltak i `docs/security/*`.
3. Bekreft faktisk API/route-støtte i `apps/*/src/app/api/*`.
