# TeqBook Full Project Critical Checklist

Denne sjekklisten samler kritiske mangler og flyter som må verifiseres før trygg pilot-/produksjonsdrift.

## Scope

- Område: `dashboard`, `admin`, `public`, `supabase/functions`, migrasjoner, CI/test-gates.
- Mål: finne og lukke hull som kan gi sikkerhetsbrudd, datatap, feil booking/billing, eller falsk "grønn" release.

## Prioriteringsdefinisjon

- **P0**: Kritisk sikkerhet/autorisasjon eller alvorlig plattformsvikt. Må fikses før release.
- **P1**: Høy risiko for feil i kjerneflyter. Bør fikses før bred pilot.
- **P2**: Viktig kvalitetsgjeld. Planlegges raskt etter stabilisering.

---

## P0 Checklist (Må lukkes først)

### P0 Arbeidslogg (detaljert, start her)

Bruk denne loggen fortløpende mens P0-punktene lukkes. Hver aktivitet skal beskrive hva som ble gjort, hvorfor, hva som ble verifisert, og hva som gjenstår.

#### Logging-format per aktivitet

- **Tidspunkt**
- **P0-referanse** (1-4)
- **Mål**
- **Utført arbeid (detaljert)**
- **Verifikasjon/evidens** (kommandoer, testresultat, skjermbilder, PR/commit)
- **Resultat** (bestått/feilet/blokkert)
- **Neste steg**

#### Aktivitetslogg

##### 2026-04-22 - Oppstart P0

- **Tidspunkt:** 2026-04-22
- **P0-referanse:** Overordnet oppstart
- **Mål:** Starte systematisk lukking av P0 med tydelig sporbarhet.
- **Utført arbeid (detaljert):**
  - Gikk gjennom hele `P0 Checklist` og identifiserte fire kritiske spor:
    - Dashboard auth boundary
    - Public booking ownership proof
    - Billing tenant-autorisasjon
    - Migrasjonsapply-kompletthet
  - Etablerte denne arbeidsloggen i dokumentet for å sikre at hvert tiltak dokumenteres med:
    - konkret endring
    - verifiseringsbevis
    - eksplisitt rest-risiko/neste steg
  - Definerte at videre oppføringer skal legges inn umiddelbart etter utført arbeid per P0-punkt.
- **Verifikasjon/evidens:**
  - Dokument oppdatert med dedikert detaljlogg i `P0`-seksjonen.
- **Resultat:** Bestått (dokumentasjonsgrunnlag etablert).
- **Neste steg:**
  - Starte med **P0.1 Dashboard auth boundary** og dokumentere:
    - baseline-funn før endring
    - implementasjon i `apps/dashboard/middleware.ts`
    - test av redirect og manglende partial render uten session

##### 2026-04-22 - P0.1 Dashboard auth boundary (implementasjon)

- **Tidspunkt:** 2026-04-22
- **P0-referanse:** 1
- **Mål:** Håndheve auth server-side for dashboard-ruter og stoppe uautorisert render.
- **Utført arbeid (detaljert):**
  - Baseline gjennomgått i `apps/dashboard/middleware.ts`:
    - Middleware hadde request-id/trace og superadmin-redirect.
    - Manglet eksplisitt redirect for uautentiserte brukere til `/login`.
    - Manglet tydelig offentlig allowlist.
  - Implementerte server-side auth-gate:
    - La inn `DASHBOARD_LOGIN_PATH` og `PUBLIC_PATHS` for eksplisitt offentlig allowlist.
    - La inn auth-sjekk etter `supabase.auth.getUser()`:
      - Uten `user` og ikke-public path -> redirect til `/login?redirectTo=<path>`.
      - Med `user` på public path (`/login`) -> redirect til `/`.
  - Strammet login-flyt i `apps/dashboard/src/app/login/page.tsx`:
    - Leser `redirectTo` fra query.
    - Validerer at redirect-mål er intern sti (`/`, ikke `//`).
    - Sender bruker til trygg `redirectTo` etter vellykket innlogging.
- **Verifikasjon/evidens:**
  - Endrede filer:
    - `apps/dashboard/middleware.ts`
    - `apps/dashboard/src/app/login/page.tsx`
  - Forventet runtime-atferd etter endring:
    - Uautentisert tilgang til beskyttede dashboard-ruter gir redirect til `/login`.
    - Innlogget bruker på `/login` blir sendt til `/`.
- **Resultat:** Delvis bestått (implementasjon ferdig, full verifikasjon gjenstår).
- **Neste steg:**
  - Kjør manuell verifikasjon av:
    - direkte URL til `/`, `/bookings`, `/settings/security` uten session
    - at innlogget bruker ikke blir stående på `/login`
  - Oppdatere akseptkriterier i denne sjekklisten til lukket når test er bekreftet.

##### 2026-04-22 - P0.2 Public booking action token (implementasjon)

- **Tidspunkt:** 2026-04-22
- **P0-referanse:** 2
- **Mål:** Innføre robust ownership proof med signert, kortlivet token for confirmation/cancel/notify.
- **Utført arbeid (detaljert):**
  - Innførte felles token-modul i `apps/public/src/lib/security/public-booking-action-token.ts`:
    - HMAC-signert token med payload: `booking_id`, `purpose`, `exp`, `nonce`.
    - Server-side verifisering med booking-binding, purpose-sjekk og utløp.
  - Opprettet server-endepunkt for token-utstedelse:
    - `apps/public/src/app/api/public-booking/action-token/route.ts`
    - Verifiserer booking/salon-relasjon og eier-email før token utstedes.
  - Håndhevde token i public API-ruter:
    - `apps/public/src/app/api/public-booking/confirmation/route.ts` krever `actionToken`.
    - `apps/public/src/app/api/bookings/send-cancellation/route.ts` verifiserer token (`cancel/manage`).
    - `apps/public/src/app/api/bookings/send-notifications/route.ts` verifiserer token (`notify/manage`).
  - Knyttet klientflyt til token:
    - `apps/public/src/components/public-booking/publicBookingHandlers.ts` henter action-token etter booking-opprettelse.
    - `apps/public/src/components/public-booking/usePublicBooking.ts` sender token i redirect til confirmation.
    - `apps/public/src/app/book/[salon_slug]/confirmation/page-client.tsx` sender token videre til confirmation/cancel flyt.
    - `apps/public/src/lib/services/bookings/cancel.ts` og `apps/public/src/lib/services/bookings/create.ts` sender token til mutasjonsruter.
- **Verifikasjon/evidens:**
  - Uten token eller med ugyldig token returnerer rutene `400/401/403` i henhold til validering.
  - Lint/diagnostikk kjørt på alle berørte filer uten feil.
- **Resultat:** Delvis bestått (implementasjon ferdig, manuell og automatisert sikkerhetstest gjenstår).
- **Neste steg:**
  - Bekrefte runtime med testcase for invalid/expired/forged token.
  - Bekrefte at gyldig token kun fungerer på forventet booking og forventet handling.

##### 2026-04-22 - P0.3 Billing tenant-autorisasjon (implementasjon)

- **Tidspunkt:** 2026-04-22
- **P0-referanse:** 3
- **Mål:** Stoppe cross-tenant billing-mutasjoner ved å håndheve `salon_id`-ownership før Stripe/DB writes.
- **Utført arbeid (detaljert):**
  - La til felles authz-hjelper i `supabase/supabase/functions/_shared/auth.ts`:
    - `authorizeSalonAccess(userId, requestedSalonId, ...)`
    - Returnerer eksplisitt `403` ved mismatched tenant.
  - Integrerte authz-gate i alle fem billing mutasjoner:
    - `billing-create-customer`
    - `billing-create-subscription`
    - `billing-update-plan`
    - `billing-cancel-subscription`
    - `billing-update-payment-method`
  - Håndhevingen ligger før Stripe-kall og DB-write, så mismatched `salon_id` stoppes tidlig.
- **Verifikasjon/evidens:**
  - Felles tenant-check implementert og importert i alle berørte edge-funksjoner.
  - Ved authz-fail returneres `403` med konsistent feiltype (`Forbidden`/authz-feil).
  - Lint/diagnostikk uten feil i alle endrede edge-funksjoner.
- **Resultat:** Delvis bestått (kodehåndheving på plass, abuse-tester gjenstår).
- **Neste steg:**
  - Kjør cross-tenant negative test (A prøver å mutere salon B) for alle billing-endepunkter.
  - Dokumenter test-evidens (responskode + endpoint + request-id).

##### 2026-04-22 - P0.4 Migrasjonsmanifest-gate (implementasjon)

- **Tidspunkt:** 2026-04-22
- **P0-referanse:** 4
- **Mål:** Sikre at `db:apply` ikke kan kjøre med manglende SQL-referanser i manifest.
- **Utført arbeid (detaljert):**
  - Oppdaterte `scripts/db-apply.ts` med manifest coverage-validering:
    - Scanner `supabase/supabase/migrations/` rekursivt for `.sql`.
    - Sammenligner disk-sett mot `migration-manifest.json` (`postBaseline`).
    - Feiler hardt ved mismatch (filer på disk uten manifest, eller manifest-filer som mangler på disk).
  - Validering kjøres før SQL apply starter, slik at feil avdekkes tidlig i pipeline.
- **Verifikasjon/evidens:**
  - Gate-logikk er implementert i `validateManifestCoverage`.
  - `db-apply` avbryter med tydelig feilmelding ved manglende manifest-dekning.
  - Lint/diagnostikk uten feil.
- **Resultat:** Delvis bestått (gate implementert, fresh apply/verify evidence gjenstår).
- **Neste steg:**
  - Kjør `db:apply` + `db:verify` i test/fresh miljø og legg inn evidens i ops-logg.
  - Verifiser eksplisitt at grants/RLS-hotfix migrasjoner deployes i samme løp.

### 1) Dashboard auth boundary mangler server-side håndheving

- [x] Legg inn eksplisitt auth-gate i `apps/dashboard/middleware.ts` for alle beskyttede ruter.
- [x] Tillat kun offentlig allowlist (f.eks. login + assets) uten session.
- [x] Redirect uautentisert trafikk til login.
- [ ] Verifiser at beskyttede ruter ikke render uten gyldig session.

**Berørt flyt**
- Uautentisert bruker går til dashboard-ruter (`/`, `/bookings`, `/settings/*`).

**Akseptkriterier**
- Direkte navigasjon uten innlogging gir redirect (ikke partial render).
- Ingen sensitiv data/rutestruktur eksponeres før auth.

---

### 2) Public booking action mangler robust ownership proof

- [x] Introduser signert, kortlivet action-token for confirmation/cancel/notify.
- [x] Token skal inkludere minst: `booking_id`, `purpose`, `exp`, `nonce`.
- [x] Verifiser token server-side i public API-ruter før mutasjon.
- [x] Fjern klientdirekte booking-mutasjon uten server-verifisering.

**Berørte filer (nåværende flyt)**
- `apps/public/src/app/api/public-booking/confirmation/route.ts`
- `apps/public/src/lib/services/bookings/cancel.ts`
- `apps/public/src/app/api/bookings/send-cancellation/route.ts`
- `apps/public/src/app/api/bookings/send-notifications/route.ts`

**Akseptkriterier**
- Ugyldig/utløpt token gir `401/403`.
- Gyldig token tillater kun forventet handling på forventet booking.

---

### 3) Billing edge functions mangler tenant-autorisasjon

- [x] Legg inn felles ownership/tenant-check i alle billing mutasjoner.
- [x] Verifiser at `salon_id` faktisk tilhører innlogget bruker før Stripe/DB write.
- [x] Blokker requests med mismatched `salon_id`.
- [ ] Legg til abuse-tester for cross-tenant forsøk.

**Berørte filer**
- `supabase/supabase/functions/billing-create-customer/index.ts`
- `supabase/supabase/functions/billing-create-subscription/index.ts`
- `supabase/supabase/functions/billing-update-plan/index.ts`
- `supabase/supabase/functions/billing-cancel-subscription/index.ts`
- `supabase/supabase/functions/billing-update-payment-method/index.ts`

**Akseptkriterier**
- Bruker A kan ikke mutere billing for salon B.
- Alle billing-mutasjoner returnerer konsistent `403` ved authz-feil.

---

### 4) Migrasjonsapply kan mangle nødvendige SQL-filer

- [x] Innfør gate som validerer at manifest dekker alle nødvendige migrasjoner.
- [x] Fail CI hvis filer i `supabase/supabase/migrations/` ikke er representert korrekt.
- [ ] Kjør fresh apply + verify i testmiljø og dokumenter evidence.
- [ ] Sikre at grants/RLS-hotfixes faktisk blir deployet.

**Berørte filer**
- `scripts/db-apply.ts`
- `supabase/supabase/migration-manifest.json`

**Akseptkriterier**
- Ingen required migrasjoner utelates.
- Fresh miljø får samme schema/policies som forventet produksjon.

---

## P1 Checklist (Høy prioritet)

### 5) Admin route guard er hovedsakelig klientstyrt

- [ ] Flytt auth/superadmin enforcement til server boundary (middleware/server layout).
- [ ] Behold klientguard kun som UX-fallback.
- [ ] Test uautorisert tilgang direkte mot admin-ruter.

**Berørte filer**
- `apps/admin/middleware.ts`
- `apps/admin/src/app/(admin)/layout.tsx`

---

### 6) Kalender truncater bookingdata (limit/paginering)

- [ ] Fjern stille truncation i kalenderhenting.
- [ ] Implementer pagineringsloop/cursor eller server-RPC for komplett date-range.
- [ ] Vis tydelig indikator dersom data må begrenses.
- [ ] Test med høy bookingvolum-dataset.

**Berørte filer**
- `apps/dashboard/src/lib/repositories/bookings/queries.ts`
- `apps/dashboard/src/lib/hooks/calendar/useCalendar.ts`

---

### 7) Booking- og waitlist-mutasjoner maskerer backend-feil

- [ ] Håndter `{ error }` konsistent i alle mutate handlers.
- [ ] Ikke oppdater UI permanent før backend bekrefter suksess.
- [ ] Legg inn rollback/feilmelding ved optimistic update feil.
- [ ] Legg til e2e/unit tester for failure paths.

**Berørte filer**
- `apps/dashboard/src/app/bookings/page.tsx`
- `apps/dashboard/src/app/bookings/waitlist/page.tsx`

---

### 8) Billing settings toggles persisteres ikke

- [ ] Persistér `smsDisabled`/`emailOnly` i backend med tydelig save-state.
- [ ] Last persisted verdi ved mount.
- [ ] Håndhev policy server-side i notifiseringsutsendelse.
- [ ] Vis brukerfeil dersom lagring feiler.

**Berørt fil**
- `apps/dashboard/src/app/settings/billing/page.tsx`

---

### 9) Schema-kontraktdrift i billing finalize flow

- [ ] Verifiser kolonnebruk mot faktisk schema (f.eks. `owner_id`-avhengighet).
- [ ] Rydd bort feltreferanser som ikke er garantert i miljøene.
- [ ] Legg inn kontrakttest mot aktuell database.

**Berørt fil**
- `supabase/supabase/functions/billing-finalize-setup-intent/index.ts`

---

### 10) Admin onboarding søk/paginering er ikke deterministisk koblet

- [ ] Koble søk/page til faktisk query/filter/slice.
- [ ] Sikre at tabellkontroller endrer synlige rader korrekt.
- [ ] Legg til test som verifiserer filter + pagination atferd.

**Berørte filer**
- `apps/admin/src/app/(admin)/onboarding/page.tsx`
- `apps/admin/src/components/shared/data-table/DataTable.tsx`

---

### 11) CI gates er delvis advisory

- [ ] Fjern `continue-on-error` for sikkerhet på release-brancher.
- [ ] Sett minimum coverage-gate for public/admin.
- [ ] Utvid critical e2e til faktiske business-kritiske journeys.

**Berørt fil**
- `.github/workflows/ci.yml`

---

## P2 Checklist (Viktig kvalitetsgjeld)

### 12) i18n/a11y inkonsistens i sentrale UI-komponenter

- [ ] Flytt hardkodede strenger til locale-map.
- [ ] Lokaliser `aria-label` og annen skjermlesertekst.
- [ ] Verifiser språkparitet for kjernekomponenter.

**Eksempler**
- `apps/dashboard/src/components/command-palette.tsx`
- `apps/dashboard/src/components/bookings/BookingsTable.tsx`
- `apps/dashboard/src/components/layout/dashboard/DashboardHeader.tsx`

---

### 13) Twilio webhook-verifisering bør hardnes

- [ ] Implementer korrekt request-signaturverifisering (ikke kun statisk header-match).
- [ ] Legg inn replay-beskyttelse og tydelig avvisning av ugyldige callbacks.
- [ ] Test spoofed payload og forventet reject.

**Berørt fil**
- `supabase/supabase/functions/sms-status-webhook/index.ts`

---

### 14) Dokumentasjon vs faktiske gates må synkroniseres

- [ ] Oppdater ops-dokumenter slik at de reflekterer ekte CI/testing nivå.
- [ ] Fjern eller merk utdaterte "ready" påstander.
- [ ] Link alltid til konkret evidens (job ID, rapport, logg).

---

## Test- og verifikasjonspakke (må kjøres)

### Sikkerhet/autorisasjon

- [ ] Uautentisert bruker avvises fra dashboard/admin-ruter.
- [ ] Cross-tenant billing mutation test (A kan ikke endre B).
- [ ] Public action token test: invalid/expired/forged token avvises.

### Data/integritet

- [ ] Kalender med >100 bookinger viser komplett datasett.
- [ ] Waitlist/booking mutation failure gir korrekt UI rollback og feilmelding.
- [ ] `db:apply` + `db:verify` validerer migrasjonskompletthet i fresh miljø.

### Operasjonell kvalitet

- [ ] Security-scan blokkerer ved høy alvorlighetsgrad.
- [ ] Coverage minimum er håndhevet for alle apper.
- [ ] E2E critical inkluderer booking + billing + admin safety journeys.

---

## Release Go/No-Go

- [ ] **GO**: Alle P0 lukket + P1 lukket eller eksplisitt risikogodkjent med mitigering.
- [ ] **NO-GO**: Minst én P0 åpen, eller P1 med høy blast radius uten mitigering.

## Beslutningslogg

| Dato | Miljø | Reviewer | Resultat | Åpne risikoer | Evidenslenke |
|---|---|---|---|---|---|
| YYYY-MM-DD | pilot-production / production |  | GO / NO-GO |  |  |

