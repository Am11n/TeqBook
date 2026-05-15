# Supabase Data API og `public`-skjema: full beredskap (etter 30. oktober 2026)

Dette dokumentet er skrevet med **referansedato 1. november 2026**: da er Supabase sin overgang fullt i kraft for **eksisterende** prosjekter — nye tabeller, visninger og lignende objekter i `public` får **ikke** lenger implisitte rettigheter for `anon` / `authenticated` / `service_role` mot **Data API** (PostgREST bak `supabase-js`, `/rest/v1/`, GraphQL).

Målet for TeqBook er **null overraskelser** ved `supabase db push`, nye miljøer, `db reset` og nye Supabase-prosjekter.

---

## 1. Hva som faktisk endret seg

| Før | Etter (gjelder nye objekter i `public`) |
|-----|----------------------------------------|
| Nye tabeller kunne arve mønstre der API-rollene «fikk med seg» tilgang uten at migrasjonen sa det eksplisitt. | **Uten `GRANT`** kan ikke PostgREST utføre operasjonen; klienten får typisk Postgres **`42501`** (insufficient_privilege). |
| Eksisterende tabeller på et allerede kjørende prosjekt beholdt sine grants. | Uendret for **allerede opprettede** tabeller — men **alle nye** objekter må ha eksplisitte grants der de skal nås via Data API. |

**TeqBook er berørt** fordi hele stacken bruker `@supabase/supabase-js` / `@supabase/ssr` mot Supabase URL + nøkler (Data API), ikke bare direkte JDBC mot Postgres.

**TeqBook er ikke «ferdig» bare fordi prod fungerer i dag** — hver **ny** migrasjon som introduserer et objekt i `public` som appen eller edge functions skal nå via API, må inkludere riktige `GRANT` (og RLS/policies som før).

---

## 2. Rollemodell (kort)

- **`anon`**: uinnlogget trafikk (f.eks. offentlig booking der det er tillatt).
- **`authenticated`**: innlogget bruker (JWT).
- **`service_role`**: server-side (service key), må **kun** brukes på server — full tilgang der det er ment, ofte kombinert med RLS som tillater kun `service_role`.

**Grant gir «lov til å forsøke» operasjonen; RLS avgjør hvilke rader som faktisk returneres eller skrives.** Begge deler må stemme.

---

## 3. Standard som gjelder for alle nye migrasjoner

Ved **`CREATE TABLE`**, **`CREATE VIEW`** eller materialisert visning i `public` som skal brukes fra app eller Supabase-klient:

1. **`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`** der det er relevant.
2. **Policies** for `anon` / `authenticated` / `service_role` etter behov.
3. **Eksplisitte `GRANT`** i **samme migrasjon** (anbefalt), eller i en **umiddelbart påfølgende** migrasjon som alltid merges før release (unngå «tomt vindu» i CI).

Eksempel (tilpass til faktiske roller og minste privilegium):

```sql
-- Les for uinnlogget der det er forretningsmessig trygt
GRANT SELECT ON TABLE public.ditt_objekt TO anon;

-- Vanlig app-skjema for innlogget salong
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.ditt_objekt TO authenticated;

-- Bakgrunnsjobber, API-ruter med service key, edge functions som bruker service client
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.ditt_objekt TO service_role;
```

For **kun server-side** tabeller (ingen klient skal noen gang lese):

```sql
REVOKE ALL ON TABLE public.ditt_objekt FROM PUBLIC;
REVOKE ALL ON TABLE public.ditt_objekt FROM anon;
REVOKE ALL ON TABLE public.ditt_objekt FROM authenticated;
GRANT ALL ON TABLE public.ditt_objekt TO service_role;
```

4. **Funksjoner / RPC**: husk `GRANT EXECUTE ON FUNCTION ...` til riktig rolle når de kalles via RPC.

---

## 4. Repo-spesifikke mønstre i TeqBook

### 4.1 Bulk-rettigheter (`pilot_access_recovery`)

Migrasjonen `supabase/supabase/migrations/20260317162000_pilot_access_recovery.sql` samler mange `GRANT` for kjernetabeller. Den er **historisk verdifull** for pilot, men:

- Tabeller opprettet **etter** tidsstempelet til den filen er **ikke** automatisk med.
- Nye tabeller skal **ikke** forventes å bli lagt inn der manuelt på sikt — preferer **inline grants** i migrasjonen som oppretter objektet, eller en **liten dedikert** `*_table_grants.sql` rett etter.

### 4.2 Etablerte «grant-rett»-mønstre i repoet

- `20260407105000_booking_reschedule_table_grants.sql` — tabeller opprettet uten grant i forrige fil.
- `20260326101000_fix_announcements_table_grants.sql` — samme idé for `announcements`.
- `20260502120000_addon_billing_sync_state.sql` — `REVOKE` + kun `service_role` for sensitiv projeksjonstabell.

Bruk samme stil når nye «kun service»-ledger-tabeller introduseres.

---

## 5. Verifikasjon (gjør dette regelmessig)

| Aktivitet | Hvorfor |
|-----------|---------|
| **`supabase db reset` lokalt** (eller ny tom branch-database) og røyktest av dashboard + public booking | Avdekker manglende `GRANT` som bare vises på «frisk» rekkefølge av migrasjoner. |
| **Supabase Dashboard → Security Advisor** | Fanger RLS av, manglende policies, og relevante sikkerhetsanbefalinger. |
| **Staging `db push`** før prod | Samme migrasjonsrekkefølge som prod. |
| **Overvåk 42501** i API-logger / Sentry etter deploy | Supabase kan returnere hint om hvilken `GRANT` som mangler. |

---

## 6. Feilsøking

| Symptom | Typisk årsak |
|---------|----------------|
| `42501` / `permission denied for table` fra `supabase-js` | Manglende `GRANT` til rollen som nøkkelen representerer (`anon` vs `authenticated` vs `service_role`). |
| `401` / RLS-feil der radene «forsvinner» | Grant OK, men policy mangler eller `USING` / `WITH CHECK` for snav. |
| Fungerer i prod, feiler i nytt miljø | Gammel manuell SQL utenfor migrasjoner, eller migrasjon som aldri fikk grant i repo. |

---

## 7. Leveranser som holder prosjektet «oppdatert» (status per 2026-11-01)

Følgende er **implementert i repo** for å tette kjente hull der tabeller ble opprettet uten at Data API-rollene fikk eksplisitt tabelltilgang i migrasjonskjeden:

- **`20261101090000_data_api_grants_service_only_ledgers.sql`** — eksplisitte `GRANT` / `REVOKE` for:
  - `public.stripe_webhook_events` (kun `service_role` via eksisterende RLS-policy)
  - `public.public_booking_action_proofs` (kun `service_role`, i tråd med kommentarer i skjema)
  - `public.public_booking_used_action_token_nonces` (samme)

**Utrullet på teqbook-pilot** (`mdqnburqfzvzhvsicdyo`, 2026-05-15): `db push` bekreftet at `20261101090000` er på remote; tabell-grants verifisert (`service_role` only for de tre ledger-tabellene).

---

## 8. PR-sjekkliste (copy-paste for reviewer)

- [ ] Ny `public`-tabell / view: `GRANT` for alle roller som faktisk skal bruke Data API mot objektet.
- [ ] RLS på + policies testet med både `anon` og `authenticated` der det er relevant.
- [ ] Ingen ny `service_role`-kun tabell uten `REVOKE` fra `anon`/`authenticated` om den ikke skal eksponeres.
- [ ] RPC: `GRANT EXECUTE` der det trengs.
- [ ] Lokal **`db reset`** eller tilsvarende røyktest kjørt ved skjemendringer.

---

## 9. Referanser

- Supabase: endring i standardtilgang for `public` via Data API (e-post / changelog 2026).
- Intern migrasjonsdisiplin: `.cursor/rules/supabase-migrations.mdc` (alltid `db push` etter vesentlige migrasjoner der CLI er tilgjengelig).
- Operasjonslogg: `docs/operations/CHANGELOG-ops.md` (kort linje ved utrulling av denne typen migrasjon).
