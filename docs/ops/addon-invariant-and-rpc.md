# Add-on invariant og RPC (dashboard / Postgres)

## Invariant (ingen grandfathering)

For hver dimensjon (`employees` = aktive ansatte, `languages` = antall `supported_languages`):

- `included` kommer fra `plan_features` (`PLAN_INCLUDED_STAFF` og `MULTILINGUAL.limit_value`), med SQL-fallback til 2/5 om rader mangler. `business` ⇒ ubegrenset (`NULL`).
- `max_addon` = kjøpt `addons.qty` for `extra_staff` / `extra_languages` (Stripe-speil) med **Starter-tak** 20 / 8 på summen (samme som edge `billing.ts`). `salons.pending_target_*` gir **ikke** høyere kapasitet før Stripe er oppdatert.
- `allowed = included + max_addon` (eller `NULL` = ubegrenset).
- **Krav:** `usage <= allowed` etter steg-0. Brudd ⇒ `addon_usage_requires_upgrade` (PostgreSQL `RAISE` med `ERRCODE` `P0001`).

## Primær skrivevei

- **Språk:** dashboard kaller `dashboard_update_salon_supported_languages` (repository `updateSalon` splitter ut `supported_languages` til RPC).
- **Ny ansatt:** `dashboard_create_salon_employee` (repository `createEmployee`).
- **Sikkerhetsnett:** `BEFORE` triggers på `employees` (insert / `is_active` / `salon_id`) og `salons` (`supported_languages`) kaller samme assert.

## Delt TypeScript-kjerne

- `packages/shared-core`: `invariantEval`, `getIncludedInPlan`, `capAddonUnitsForPlan`, `expectedExtraPaidUnits` — skal holdes i tråd med SQL (`addon_included_limit`, `salon_capped_addon_quantity`, `assert_salon_addon_usage`). Kontraktstester: `packages/shared-core/src/billing/invariant-eval.test.ts`.

## Stripe / `expected_extra`

Etter steg-0 skal DB aldri ha `usage > allowed`. Edge fortsetter med `expected_extra = max(0, usage - included)` mot **plan-inkludert** (ikke `allowed`), i tråd med eksisterende `computeExtraQuantity` + sync.

## Modell A (tillegg neste periode)

Økning av tilleggskvantum i Stripe **midt i periode** skjer ikke; se [`model-a-addon-scheduling.md`](./model-a-addon-scheduling.md). `addons.qty` speiler Stripe; `salons.pending_target_*` er absolutt mål for neste grense-apply.

## Steg 0

Migrasjonen kjører én gang: finner salonger (unntatt `business`) over grense, deaktiverer nyeste aktive ansatte ved behov, trimmer språk (bevarer `en` og `preferred_language` først), og legger inn **system**-`notifications` til alle brukere på salongen via `profiles.user_id`.
