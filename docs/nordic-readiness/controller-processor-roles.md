# Controller vs Processor Roles

## Rolleforklaring

- **Behandlingsansvarlig (Controller)**: Salong/kunde som bestemmer formål og midler for behandling av egne kundedata.
- **Databehandler (Processor)**: TeqBook, som behandler data på vegne av behandlingsansvarlig.

## Praktisk modell i TeqBook

- Salongen eier kundedata i sin tenant-kontekst.
- TeqBook leverer plattform, tilgangsstyring og sikkerhetskontroller.
- Tredjeparter (f.eks. Supabase, Vercel, Stripe) opptrer normalt som underdatabehandlere.

## Ansvarsfordeling

- **Controller**:
  - Definerer rettslig grunnlag og behandlingsformål
  - Håndterer kundekommunikasjon og personvernerklæring
- **Processor (TeqBook)**:
  - Implementerer tekniske og organisatoriske sikkerhetstiltak
  - Bistår ved rettighetsforespørsler og hendelser

## Referanser

- `docs/compliance/data-lifecycle.md`
- `docs/nordic-readiness/dpa-template.md`
- `docs/security/security-overview.md`
