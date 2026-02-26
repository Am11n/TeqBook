# Data Processing Agreement (DPA) Template

Dette er en enkel mal for databehandleravtale mellom:

- **Behandlingsansvarlig (kunde/salong)**, og
- **Databehandler (TeqBook)**.

## 1. Formål

Databehandler behandler personopplysninger kun for å levere booking- og driftsfunksjonalitet i TeqBook.

## 2. Kategorier av data

- Kundedata (kontakt, bookinghistorikk)
- Ansattdata
- Brukerkontoer og tilgangsdata
- Sikkerhets- og driftslogger

## 3. Instrukser og formål

- Databehandler følger dokumenterte instruksjoner fra behandlingsansvarlig.
- Data brukes ikke til uforenlige formål uten gyldig grunnlag.

## 4. Sikkerhetstiltak

- Tilgangsstyring og tenant-isolasjon (RLS)
- Kryptering i transitt
- Rate limiting og sikkerhetsovervåkning

Referanser:
- `docs/security/security-overview.md`
- `docs/security/rate-limiting-operations.md`

## 5. Underdatabehandlere

- Supabase (database/auth)
- Vercel (hosting)
- Stripe (betaling)
- Sentry (feilsporing, hvis aktivert)

## 6. Bistand ved rettighetsforespørsler

Databehandler bistår ved innsyn, retting, sletting, begrensning og dataportabilitet.

## 7. Sletting og tilbakelevering

Ved opphør av avtalen skal data slettes eller tilbakeleveres i henhold til retention-policy og lovkrav.

## 8. Revisjon

Behandlingsansvarlig kan be om rimelig dokumentasjon av sikkerhetskontroller.

## Signaturfelt

- Behandlingsansvarlig: __________________
- Databehandler (TeqBook): __________________
- Dato: __________________
