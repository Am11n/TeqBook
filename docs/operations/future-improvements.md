# Fremtidige forbedringer (produkt / dashboard)

Kort logg over funksjoner som er **delvis bygget** eller **midlertidig skrudd av**, med peker til kode og hva som gjenstår.

## Salg (gift cards & pakker)

**Status:** Skjult for alle brukere (april 2026).

**Hvorfor:** Sidene under `/sales/gift-cards` og `/sales/packages` finnes, men produktet er ikke ferdigstyrt (UX, plan-gating, økonomi, support).

**Implementasjon i dag:**

- Side meny: `Salg` er fjernet fra `useDashboardMenuItems` (ingen lenke i navigasjon).
- Glob av/på: `apps/dashboard/src/lib/config/dashboard-modules.ts` — `DASHBOARD_SALES_MODULE_ENABLED = false` skjuler full `SalesLayout` (inkl. faner) og viser en kort «ikke tilgjengelig»-tekst med knapp til oversikten.
- Når dere åpner modulen: sett flagget til `true`, verifiser at menypunktet er tilbake (legg inn eventuelt `FeatureGate` / `minPlan` / `GIFT_CARDS` + `PACKAGES` i `plan_features` når nøklene finnes i databasen), og kjør manuell QA på begge undersider og eventuelle API-/RPC-kall.

**Relaterte stier (reference):**

- `apps/dashboard/src/app/sales/layout.tsx`
- `apps/dashboard/src/app/sales/gift-cards/page.tsx`
- `apps/dashboard/src/app/sales/packages/page.tsx`
- `apps/dashboard/src/lib/hooks/dashboard/useDashboardMenuItems.ts`

---

*Legg gjerne til nye seksjoner her for andre «bak feature flag»-områder, med samme mønster: status, hvor i koden, og sjekkliste før aktivering.*
