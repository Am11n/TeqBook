# Pilot Supabase: `db push`, migrasjonsfiks og retrospektiv

Dette dokumentet beskriver **hvorfor** pilot-prosjektet trengte omfattende migrasjonsarbeid, **hva som feilet før**, **hva som ble gjort**, og **hvordan du jobber trygt videre**. Målgruppe: deg som vil lære hele løpet, og team/agenter som skal fortsette uten å gjenta de samme fellene.

---

## 1. Formål

- Få **alle tidsstemplede migrasjoner** i `supabase/supabase/migrations/` (via symlink `supabase/migrations/`) inn på et **nytt eller delvis ferdig** Supabase-prosjekt med `supabase db push`.
- Gjøre migrasjonene **idempotente** der remote allerede hadde objekter uten ren historikk.
- Unngå feilen **`cannot insert multiple commands into a prepared statement`** som oppstår når Supabase CLI sender én «statement» som PostgreSQL oppfatter som flere kommandoer.

---

## 2. Kontekst før prosessen

### 2.1 Ikke en «grønn» database

Pilot-DB var **ikke** tom. Mye av skjemaet fantes allerede (manuelt, eldre flyt, eller tidligere forsøk). Da `db push` kjørte migrasjoner i rekkefølge, traff den:

- `relation already exists`
- `policy ... already exists`
- `cannot change return type of existing function`
- `constraint ... already exists`

**Konklusjon:** Migrasjonene måtte skrives om til **«kjør trygt om igjen»** (`IF NOT EXISTS`, `DROP ... IF EXISTS`, osv.) der det ga mening.

### 2.2 Supabase CLI og «prepared statement»

CLI (typisk via migrasjonsmotor som sender SQL i batches) tåler dårlig:

- **Flere SQL-kommandoer** i det migrasjonsmotoren tror er **én** statement (f.eks. `CREATE FUNCTION ... $$ ... $$;` umiddelbart etterfulgt av `GRANT ...;` i samme «chunk»).
- **Flere `$$`-blokker** i samme fil, der parseren **feiltolker** hvor funksjonskroppen slutter, og **lim** `GRANT` inn i samme statement som funksjonen.

**Symptom:** `ERROR: cannot insert multiple commands into a prepared statement (SQLSTATE 42601)`.

**Praktisk løsning i repoet:**

1. **Én kommando per «chunk»** der det trengs: flytt `GRANT` til egen migrasjon eller pakk flere `GRANT`/`REVOKE`/`COMMENT` i **én** `DO $tag$ BEGIN ... EXECUTE '...'; END; $tag$;`-blokk.
2. Bruk **tagget dollar-quote** (`$bookingfix$` … `$bookingfix$`) i stedet for nakne `$$` når flere funksjoner i samme fil skaper problemer.
3. **Splitt store endringer** i flere filer (f.eks. `DROP FUNCTION` i én fil, `CREATE OR REPLACE` i neste, grants i tredje).

### 2.3 Leksikografisk sortering av filnavn

Migrasjoner kjøres i **streng streng-rekkefølge** på filnavn, ikke «numerisk» dato.

**Feil som oppstod:**

- `202603010000029_...` ble sortert **før** `20260301000002_...` fordi strengen `...000029` er «mindre enn» `...00002` tegn for tegn (kort sagt: `029` vs `02`).

**Konsekvens:** Funksjoner som avhenger av tabeller fra `00002` kunne kjøre for tidlig, og `db push` uten `--include-all` klaget på migrasjoner som skulle «inn før siste versjon på remote».

**Løsning i repoet:** Venteliste-claim ble omdøpt til f.eks. `202603010000020_...`, deretter `021` (grant), `022` (noop for gammel historikk). Venteliste «base» og convert bruker **seks-sifrede** suffikser slik at rekkefølgen blir riktig og unngår kollisjon med CLI-historikk: `018` (generate weekday compat) → `019` (offers/cooldown) → `020`–`022` → `030` (convert kolonner) → `031`–`032` → `04` …

### 2.4 Duplikat tidsstempler

To filer med **samme** prefix `YYYYMMDDHHMMSS` gir uforutsigbar rekkefølge og kluss i historikk. Disse ble gitt **unike** timestamps (omnummerert).

### 2.5 `schema_migrations` / «spøkelsesversjoner»

Etter delvise feil og reparasjoner kan `supabase migration list` vise:

- rader som bare finnes på **remote** (CLI sier «Remote migration versions not found in local»), eller
- behov for `supabase db push --include-all` når nye migrasjoner har «lavere» versjon enn siste kjørte på remote.

**Viktig:** `supabase migration repair --status reverted <versjon>` på versjoner som **faktisk** er korrekt brukt, kan gjøre situasjonen verre. Bruk repair **målrettet** etter å ha lest CLI-feilmeldingen og `migration list`.

### 2.6 Duplikat versjonsnøkkel (`…00001` vs `…000001` i historikken)

På pilot oppstod det **to** historikkrader for «samme» logiske versjon: én som matcher filprefikset og én **kort** rad som CLI ikke kobler til lokale filer. Da feiler `supabase db push` med *Remote migration versions not found in local migrations directory*, og `migration list` viser **remote-only** linjer (tom første kolonne).

**Varig løsning i repo (2026-03-29):** omdøp migrasjonene til **unike, lengre** tidsstempler som ikke overlapper med den korte nøkkelen:

| Gammelt prefiks | Nytt prefiks |
|-----------------|--------------|
| `20260301000001_` (generate weekday compat) | `202603010000018_` |
| `20260301000002_` (waitlist offers/cooldown) | `202603010000019_` |
| `20260301000003_` (convert + priority columns) | `202603010000030_` |
| `20260313000001_` (booking overlap / gist) | `202603130000010_` |

Deretter: `supabase migration repair --status reverted` på de **gamle** versjonsstrengene CLI peker på (f.eks. `20260301000001`, `00002`, `00003`, `13000001`), og `supabase db push --yes --include-all` én gang for å registrere de nye filene. Etterpå skal **`supabase db push --yes`** uten `--include-all` gi *Remote database is up to date* og ingen remote-only spøkelser i `migration list`.

---

## 3. Hovedmønstre vi innførte (gjelder fremover)

| Problem | Tiltak |
|--------|--------|
| Policy finnes | `DROP POLICY IF EXISTS "navn" ON schema.tabell;` før `CREATE POLICY` |
| Trigger finnes | `DROP TRIGGER IF EXISTS ...` før `CREATE TRIGGER` |
| Funksjon finnes med annen signatur/returtype | `DROP FUNCTION IF EXISTS navn(argtyper...);` før ny `CREATE` |
| Indeks / constraint | `IF NOT EXISTS` eller drop før add |
| Enum / type duplicate | `DO $$ ... duplicate_object ... $$` der relevant |
| `CREATE FUNCTION` + `GRANT` i samme «chunk» | Splitt filer eller `DO`-blokk med `EXECUTE` for grants |
| Flere `$$` i én fil | Tagget `$tag$` eller flytt tunge funksjoner til egen fil med én `$$`-par |

---

## 4. Vesentlige fil- og temagrupper (høy nivå)

Dette er ikke en full `git log`, men et **læringskart** over hva som typisk ble rørt:

- **Booking / atomiske RPC-er:** `create_booking_atomic`, `update_booking_atomic`, deling av grants, tagged dollar-quotes, duplikat-migrasjoner erstattet med noop der nødvendig.
- **Varsler / admin RPC-er:** `COMMENT ON FUNCTION` med full signatur, `DROP FUNCTION` før endret returtype, policy-drops.
- **Venteliste (mars 2026):** tabeller, `claim_waitlist_offer_atomic`, `convert_waitlist_entry_to_booking_atomic`, split av grant-filer, ambiguitetsfiks (`w.*` alias), `fix_convert_waitlist_entry_ambiguity` uten trailing `GRANT` (grant allerede i egen fil).
- **RLS ventelistetabeller:** `DROP POLICY IF EXISTS` før policies på `waitlist_policies`, `waitlist_offers`, `waitlist_lifecycle_events`.
- **Stripe webhook:** `DROP CONSTRAINT IF EXISTS` før `ADD CONSTRAINT` på `stripe_webhook_events`.
- **Booking overlap / gist:** `202603130000010_*` begrenset til extension + exclude constraint; `015` drop funksjon, `016` create, `017` grants/comment i `DO`.
- **Produkt-tilgang RPC-er:** `20260329140100` uten inline `GRANT`; `20260329140101` samler grants i `DO ... EXECUTE`.

**Nye hjelpefiler (eksempler):**

- `202603010000020_claim_waitlist_offer_atomic.sql`
- `202603010000021_claim_waitlist_offer_atomic_grant.sql`
- `202603010000022_claim_waitlist_offer_atomic_grant_legacy_noop.sql`
- `202603010000031_convert_waitlist_entry_to_booking_atomic.sql`
- `202603010000032_convert_waitlist_entry_to_booking_grant.sql`
- `202603130000015_drop_update_booking_atomic.sql`
- `202603130000016_create_update_booking_atomic.sql`
- `202603130000017_update_booking_atomic_grants.sql`
- `20260329140101_rpc_product_access_grants.sql`

---

## 5. Legacy-filer som Supabase CLI **hopper over**

CLI krever mønster **`YYYYMMDDHHMMSS_navn.sql`**. Følgende filer i `supabase/supabase/migrations/` **kjøres ikke** av `supabase db push`:

- `add-addons-and-plan-limits.sql`
- `add-billing-fields.sql`
- `add-branding-theme.sql`
- `add-features-system.sql`
- `add-multilingual-support.sql`
- `add-products-table.sql`
- `add-profile-fields.sql`
- `add-superadmin.sql`
- `add-user-preferences.sql`
- `add-whatsapp-number.sql`
- `add-whatsapp-to-onboarding-rpc.sql`
- `create-storage-buckets.sql`
- `create-superadmin.sql`
- `onboarding-schema-update.sql`
- `opening-hours-schema.sql`
- `operations-module-enhancements.sql`
- `prevent-orphaned-salons.sql`
- `reports-rpc-functions.sql`
- `supabase-foundation-complete.sql`

**Anbefaling:** Hvis noe her fortsatt trengs i **nye** miljøer, bør innholdet **konsolideres** inn i nye tidsstemplede migrasjoner (eller inn i baseline/manifest-flyten som `pnpm run db:apply` bruker — se `scripts/README.md`). Ellers: dokumenter at historisk innhold allerede er dekket av nyere migrasjoner.

---

## 6. Kommandoer du bør kjenne

Fra repo-rot (lenket prosjekt):

```bash
supabase migration list
supabase db push --yes
supabase db push --yes --include-all
supabase migration repair --status reverted <versjon> ...
supabase migration repair --status applied <versjon> ...
```

- Bruk **`--include-all`** når CLI sier at lokale filer skal inn **før** siste remote migrasjon.
- **Ikke** committ hemmeligheter; `.env.pilot` / `.env.local` forblir lokale.

**Verifikasjon (anbefalt etter push):**

```bash
pnpm run db:manifest:verify   # sjekker manifest + checksums
pnpm run db:verify            # SQL verification pack (krever riktig DB-URL / miljø)
```

---

## 7. Seed, `.env.pilot` og deploy (sjekkliste)

Dette fullfører «operasjonell» pilot uten å lagre hemmeligheter i git:

1. **Oppdater `.env.pilot` (lokalt)** med URL og nøkler for det nye Supabase-prosjektet (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, evt. `SUPABASE_DB_URL` for skript).
2. **Kopier til aktiv env** når du jobber: `cp .env.pilot .env.local` (eller last inn på annen måte).
3. **Seed (valgfritt, typisk dev/staging):** `pnpm run seed` — krever service role; se `scripts/README.md`.
4. **Redeploy** dashboard/admin/public i hosting med oppdaterte build-time env-variabler for pilot.
5. **Smoke-test** (manuelt): innlogging, en booking-flyt, ventelisteknapper hvis relevant — ikke dekket av denne dokumentasjonen alene.

---

## 8. Hva du bør gjøre når nettverk/CLI feiler

Under dokumentasjon av dette arbeidet oppstod midlertidig:

- `503` / timeout mot Supabase ved `db push` (upstream).

Da: prøv igjen, sjekk prosjektstatus, oppdater CLI (`supabase` v2.84+ anbefales ift. eldre 2.75), og kjør `migration list` før du gjør repair.

---

## 9. Daglig dokumentasjon (vaner)

For å ikke miste denne typen kunnskap:

- Når du eller en agent gjør **migrasjoner, `db push`, repair eller RLS/RPC-endringer**, append til **`docs/operations/CHANGELOG-ops.md`** (daglig). Utvid dette dokumentet ved nye feiltyper. Cursor-regel: `.cursor/rules/daily-ops-documentation.mdc` (valgfri `@`-referanse); hovedregelen `supabase-migrations.mdc` minner om changelog etter migrasjonsarbeid.
- Målet er én sann kilde: *hva ble gjort, hvorfor, hvilken kommando, hvilket miljø*.

---

## 10. Kort oppsummering

**Før:** Pilot-DB + streng CLI-parsing + duplikater + feil filrekkefølge gjorde `db push` ustabilt.

**Etter:** Migrasjoner er i stor grad **idempotente**, **splittet** der CLI krever én kommando om gangen, og **filnavn** er ordnet slik at leksikografisk rekkefølge matcher ønsket logikk. Legacy `*.sql` uten timestamp må fortsatt bevisst håndteres eller konsolideres.

**Gjenstående eierskap hos deg:** holde `.env.pilot` oppdatert, kjøre verify/seed etter behov, redeploy apper, og fortsette med korte daglige notater når databasen røres.
