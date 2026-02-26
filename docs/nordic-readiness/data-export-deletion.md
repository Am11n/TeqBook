# Data Export and Deletion

## Formål

Beskrive hvordan rettigheter til innsyn, eksport og sletting håndteres.

## Dokumentert grunnlag

- `docs/compliance/data-lifecycle.md` beskriver GDPR-rettigheter.

## Implementert nå

- Generelle mekanismer for datahåndtering og anonymisering er dokumentert.
- Det finnes ikke en komplett, énhetlig suite med alle eksport/slette-endepunkter som i enkelte eldre eksempler.

## Operativ prosess (anbefalt)

1. Identifiser datasubjekt og datadomene (kunde/bruker/salong).
2. Verifiser rettighetsgrunnlag og autentisering.
3. Hent data fra relevante tabeller med tenant-isolasjon.
4. Lever eksport i strukturert format (JSON/CSV) innen frist.
5. Ved sletting: gjennomfør soft-delete/anonymisering/hard-delete etter policy.
6. Logg forespørsel og behandlingstid.

## Status

- Rettighetsprinsipper er dokumentert.
- Full standardisert API/workflow for alle rettigheter er delvis planlagt.
