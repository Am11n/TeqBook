# Dashboard i18n: fullføre lav engelsklekkasje (~1,2 %)

## Mål

Per locale (unntatt `en`): maksimalt **~18 / 1443** strenger identisk med engelsk — samme prinsipp som `zh`, `ur`, `hi`. Resten skal være oversatt eller bevisst avvikende (inkl. låneord som må byttes for å unngå ordrett likhet med `en`).

## Rekkefølge (økende arbeidsmengde)

1. `nb` — færrest lekkasjer; pilot for norsk UI og «false friends» (Status, Online, …).
2. `ar`, `tl`, `fa`, `dar`, `ti` — middels volum.
3. `so`
4. `am`
5. `vi`, `pl`, `tr` — størst volum (`tr` gjenstår).

## Etter hvert språk (obligatorisk)

Fra `apps/dashboard/`:

```bash
pnpm exec tsx scripts/report-i18n-english-leaks.ts <locale>
pnpm run test:i18n:all
pnpm exec tsc --noEmit
```

Mål: **18** (±0 uten ny beslutning) identiske strenger som `en` — kun avtalte unntak (e‑postplassholdere, `0` / `0.00` / `500`, SKU, PDF, planavn **Starter/Pro/Business**, `—`, WhatsApp‑eksempel `+47 …`, GDPR‑kolonne, osv.).

## Regler

- **Ikke utvid allowlisten** for å «grønnmale» tall — da mister målingen mening.
- **Plassholdere** (`{name}`, `{count}`, …) må matche `en` nøyaktig (paritetstest).
- **RTL** (`ar`, `fa`, `ur`, `dar`): sjekk lesbarhet og tegnsetting etter oversettelse.
- **Norsk spesielt:** mange korrekte termer er identiske med engelsk (`Status`, `Import`, `Online`). Bytt til synonymer eller utvidet formulering der det trengs for å skille fra `en` uten å ødelegge UX.

## Status (oppdater ved ferdig locale)

| Locale | Lekkasjer | Notat |
|--------|-----------|--------|
| nb     | **13** / 1443 (~0,9 %) | Pilot: mange «false friends» (Status, Online, Import, …) byttet til norske alternativer. Resterende treff = avtalt allowlist (bl.a. GDPR, SKU, 0/500, PDF, planavn, +47 WhatsApp, `—`). |
| ar     | **10** / 1443 (~0,7 %) | Full `calendar.ts`, manglende `settings` (استيراد، غلاف، 2FA، سياسة عدم الحضور)، `dashboard` tomtilstand + أزرار، `waitlistPageOf`. Gjenstående = allowlist (e‑post/0/500/PDF/`—`/prisplassholdere). |
| tl     | **18** / 1443 (~1,2 %) | `calendar` (EN-hale), `dashboard` help-tomtilstand, stor `settings`-blokk (no-show، import، cover، 2FA، sosiale lenker). |
| fa     | **18** / 1443 (~1,2 %) | Samme mønster som tl; `fa/calendar.ts` full persisk hale; `settingsCore` utvidet før billing-merge. |
| dar    | **18** / 1443 (~1,2 %) | `calendar` + `settings` + `dashboard` help; `login.passwordPlaceholder`; `bookings.waitlistPageOf`. |
| ti     | **13** / 1443 (~0,9 %) | `calendar` + `settings` + `dashboard` help; `bookings`/`shifts`/`employees`/`settings` (no-show/add-ons) EN-fikser. |
| so     | **5** / 1443 (~0,3 %) | 2026-04-03: `settings` oo dhan Soomaali + `bookings`/`shifts` buuxa; kale oo fiksan. Gjenstående = allowlist (`—`, PDF, `0`/`0.00`/`500`). |
| am     | **4** / 1443 (~0,3 %) | 2026-04-03: `settings`/`bookings`/`shifts`/`employees`/`customers`/`services` በአማርኛ ተሞልቷል፤ ቀሪ ትዕዛዞች። Gjenstående = allowlist (`—`፣ PDF፣ `0`፣ `500`). |
| vi     | **5** / 1443 (~0,3 %) | 2026-04-03: Full vietnamesisk `settings`/`dashboard`/`bookings` m.m.; resterende = allowlist (`—`, PDF, `0`/`0.00`/`500`). |
| pl     | **5** / 1443 (~0,3 %) | 2026-04-03: Full polsk `settings`/`dashboard`/`bookings` m.m.; resterende = allowlist (`—`, PDF, `0`/`0.00`/`500`). |
| tr     | — | |
