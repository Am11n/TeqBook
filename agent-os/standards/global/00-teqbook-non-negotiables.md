# TeqBook: Non-negotiables

Kilder i repoet (må følges)
- docs/cursor-rule.md
- docs/coding-style.md
- docs/architecture/layers.md
- docs/architecture/folder-structure.md

## Prosess
- Les krav og standarder før du skriver kode.
- Hvis info mangler, stopp. Spør. Ikke gjett.
- Avvis endringer som bryter disse reglene.
- Velg korrekthet, sikkerhet og vedlikeholdbarhet foran fart.
- Følg eksisterende konvensjoner i prosjektet.
- Ikke legg inn nye biblioteker, verktøy eller patterns uten eksplisitt godkjenning.
- Dokumenter beslutninger som påvirker arkitektur, data eller sikkerhet.
- Hvis et krav ikke kan oppfylles, stopp og forklar hvorfor.

## Struktur og avhengigheter
- Følg feature-basert struktur i docs/architecture/folder-structure.md.
- Aldri lag `components/`, `hooks/` eller `lib/` inni `app/{feature}/`.
- Bruk absolutte imports: `@/components/...`, `@/lib/...`.
- Hold `page.tsx` minimal. Deleger til components/hooks.
- Ingen sirkulære imports.
- Ingen “misc”, “helpers” eller tilfeldige dump-mapper.

## TeqBook-spesifikke regler (kodebase-konvensjoner)
- UI skal aldri importere Supabase direkte.
- UI -> hooks -> services -> repositories -> supabase-client.
- Ikke bruk `<label>` direkte i feature-kode. Bruk form-komponentene.
- TypeScript strict. Ingen `any`. Ingen “midlertidige” snarveier.

## Data og datamodell
- Design datamodell før feature-kode når data påvirkes.
- Ingen dupliserte kilder til sannhet.
- Ingen implisitte relasjoner.

Hver tabell må ha
- Primary key
- Eksplisitte foreign keys
- Indekser
- `created_at` / `updated_at`
- Constraints på DB-nivå
- Unique constraints der det trengs
- Referential integrity
- Definert soft delete-strategi der det passer

Multi-tenancy (hvis brukt)
- Tenant-isolasjon må håndheves i spørringer.
- Ingen cross-tenant lekkasje.

## Personvern (GDPR)
- Anta at GDPR gjelder hvis ikke eksplisitt avklart.
- Samle kun nødvendig data.
- Bruk data kun til definert formål.
- Dokumenter lovlig grunnlag.
- Lagre samtykke der det er relevant.

Brukerrettigheter må støttes
- Innsyn: eksport av brukerdata
- Retting: oppdatering av brukerdata
- Sletting: hard delete eller anonymisering
- Begrensning: stopp/avgrens prosessering
- Portabilitet: eksport i maskinlesbart format

Drift
- Retensjon må være implementert.
- Sletting må propagere korrekt.
- Ingen foreldreløse persondata.
- Logger skal ikke lekke persondata.
- Admin-tilgang til persondata skal kunne auditeres.

Hvis GDPR brytes: stopp.

## Sikkerhet
Auth
- Sikker auth-mekanisme.
- Session/token livsløp er definert.
- Refresh-logikk er definert.

Autorisasjon
- Kun backend-håndhevet autorisasjon.
- RBAC/ABAC må være tydelig.
- Ingen frontend-only “beskyttelse”.
- Admin-ruter skal være strengt beskyttet.

Input/Output
- Valider input server-side.
- Korrekt output-encoding.
- Beskytt mot injeksjon.
- CSRF-beskyttelse hvis cookies brukes.
- Streng CORS.

Operasjonelt
- Secrets kun via environment.
- Ingen secrets i repo.
- Rate limiting.
- Abuse prevention.
- Audit logs for sensitive handlinger.

## Robusthet og feilhåndtering
- Ingen svelgede exceptions.
- Feil håndteres eksplisitt.
- Brukerfeil skal være forståelige.
- Tekniske detaljer skal ikke eksponeres til sluttbruker.
- Degrader kontrollert.
- Retries skal være kontrollert.

## UI, responsivitet, tilgjengelighet
- Mobile-first.
- WCAG 2.1 AA minimum.

Krav
- Tastaturnavigasjon
- Fokus-håndtering
- Korrekte labels for inputs
- Semantisk HTML
- ARIA kun når nødvendig
- Kontrastkrav
- Feil skal annonseres korrekt

## Testing og kvalitet
- Unit tests for kritisk logikk.
- Integration tests for data og API.
- E2E tests for hovedflyter.

Testregler
- Tester skal være deterministiske.
- Ingen skip av tester uten begrunnelse.
- CI skal stoppe ved failing tests.

Pre-commit
- Før commit: `npm run pre-commit`.
- Aldri commit kode som feiler `npm run type-check`.

## CI/CD
- Type-check før build.
- Linting, type-check og tester er påkrevd.
- Build må være reproducerbar.
- Migrasjoner automatiseres.
- Rollback-strategi skal finnes.
- Null-downtime deploy når mulig.

## Dokumentasjon
- Arkitektur er dokumentert.
- Datamodell er dokumentert.
- API-kontrakter er dokumentert.
- Setup-instruksjoner er korrekte.
- Beslutninger logges med “hvorfor”.

## Siste sjekk før implementering
- Krav er oppfylt.
- Ingen konflikt med eksisterende arkitektur.
- Ingen sikkerhetsbrudd.
- Ingen datamodell-snarveier.
- Ingen compliance-brudd.
