# Backup and Restore

## Formål

Definere minimumsprosess for backup/restore i drift.

## Nåværende grunnlag

- TeqBook bruker Supabase som dataplattform.
- Operasjonell observability/logging er beskrevet i `docs/ops/observability.md`.

## Minimumskrav

1. Dokumenter backup-frekvens per miljø (prod/staging/dev).
2. Dokumenter RPO/RTO-mål.
3. Test restore jevnlig (minst kvartalsvis).
4. Logg alle restore-operasjoner og avvik.

## Restore-runbook (minimum)

1. Erklær hendelse og frys risikable writes der mulig.
2. Identifiser siste kjente gode backup.
3. Kjør restore i verifiseringsmiljø først.
4. Valider dataintegritet (tenant-isolasjon, nøkkeltabeller).
5. Kjør restore i produksjon med godkjenning.
6. Overvåk feilrater og funksjonelle KPI-er etter restore.

## Status

- Overordnet policy og krav er dokumentert her.
- Miljøspesifikke RPO/RTO-verdier bør fylles ut av driftsteamet.
