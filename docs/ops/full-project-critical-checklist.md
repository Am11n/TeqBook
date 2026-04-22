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

### 1) Dashboard auth boundary mangler server-side håndheving

- [ ] Legg inn eksplisitt auth-gate i `apps/dashboard/middleware.ts` for alle beskyttede ruter.
- [ ] Tillat kun offentlig allowlist (f.eks. login + assets) uten session.
- [ ] Redirect uautentisert trafikk til login.
- [ ] Verifiser at beskyttede ruter ikke render uten gyldig session.

**Berørt flyt**
- Uautentisert bruker går til dashboard-ruter (`/`, `/bookings`, `/settings/*`).

**Akseptkriterier**
- Direkte navigasjon uten innlogging gir redirect (ikke partial render).
- Ingen sensitiv data/rutestruktur eksponeres før auth.

---

### 2) Public booking action mangler robust ownership proof

- [ ] Introduser signert, kortlivet action-token for confirmation/cancel/notify.
- [ ] Token skal inkludere minst: `booking_id`, `purpose`, `exp`, `nonce`.
- [ ] Verifiser token server-side i public API-ruter før mutasjon.
- [ ] Fjern klientdirekte booking-mutasjon uten server-verifisering.

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

- [ ] Legg inn felles ownership/tenant-check i alle billing mutasjoner.
- [ ] Verifiser at `salon_id` faktisk tilhører innlogget bruker før Stripe/DB write.
- [ ] Blokker requests med mismatched `salon_id`.
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

- [ ] Innfør gate som validerer at manifest dekker alle nødvendige migrasjoner.
- [ ] Fail CI hvis filer i `supabase/supabase/migrations/` ikke er representert korrekt.
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

