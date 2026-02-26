# Incident Response

## Formål

Standardisere håndtering av sikkerhets- og driftsavvik.

## Kilder

- `docs/security/security-overview.md`
- `docs/security/rate-limiting-operations.md`
- `docs/ops/observability.md`

## Klassifisering

- **Sev1**: Kritisk nedetid eller mulig databrudd
- **Sev2**: Betydelig funksjonssvikt uten bekreftet databrudd
- **Sev3**: Begrenset påvirkning

## Runbook

1. Oppdagelse: registrer tidspunkt, symptom, berørte tjenester.
2. Triage: klassifiser alvorlighet og sett incident owner.
3. Inneslutning: stopp/isolér påvirkning (f.eks. sperr endpoint, øk beskyttelse).
4. Utrydding/retting: deploy fix, patch konfig, gjenopprett data ved behov.
5. Verifisering: bekreft normal drift med tekniske og funksjonelle kontroller.
6. Etterarbeid: postmortem med tiltak, eiere og tidsfrister.

## Varsling og logging

- Logg alle beslutninger og tidslinje i incident-notat.
- Ved persondataavvik: vurder meldeplikt og juridiske frister (GDPR).

## Status

- Prosessramme er dokumentert.
- Kanaler, kontaktpunkter og vaktplan er miljøspesifikt og må vedlikeholdes av driftsteamet.
