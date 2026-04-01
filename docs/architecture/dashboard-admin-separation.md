# Dashboard og admin: separasjon

## Mål

Superadmin-brukere (`profiles.is_superadmin`) skal **ikke** bruke salon-dashboard-appen (`apps/dashboard`). De skal kun bruke admin-konsollen (`apps/admin`), som har egen cookie (`sb-admin-auth-token`, jf. prosjektregler).

## Hva som er implementert

1. **Middleware (`apps/dashboard/middleware.ts`)**  
   For innloggede brukere (Supabase session i dashboard-cookies) hentes `is_superadmin` fra `profiles`. Er den sann, redirectes det til Admin-appens innlogging (`NEXT_PUBLIC_ADMIN_APP_URL` + `/login`).  
   **Unntak:** `/api/*` redirectes ikke (unngår HTML-redirect på API-kall); API-ruter bruker `verifySalonAccess` uten superadmin-unntak.

2. **SalonProvider (klient)**  
   Dersom middleware ikke har fanget opp (navigasjonskanttilfeller), avbrytes lasting etter profil og nettleseren sendes til samme Admin sign-in-URL. Mangler `NEXT_PUBLIC_ADMIN_APP_URL`, vises en kort feilmelding om å sette variabelen.

3. **`verifySalonAccess` (`apps/dashboard/src/lib/api-auth.ts`)**  
   Superadmin får **ikke** lenger automatisk tilgang til alle salonger via dashboard-API. Tilgang følger `salon_ownerships` / `profiles.salon_id` som for vanlige brukere.

4. **Feature flags (`hasFeatureForUser`)**  
   Superadmin-unntak er fjernet; dashboard forutsetter at superadmin ikke bruker appen.

5. **UI / død kode**  
   - Fjernet «Admin»-menypunkt og relatert dashboard-spesifikk admin-i18n.  
   - Fjernet ubrukt `admin-command-palette.tsx` og duplikat `lib/services/admin*` / `lib/repositories/admin.ts` (admin-appen har egen kopi).

## Konfigurasjon

| Variabel | App | Formål |
|----------|-----|--------|
| `NEXT_PUBLIC_ADMIN_APP_URL` | Dashboard | Base-URL til Admin Next-deploy (lokalt f.eks. `http://localhost:3003`). Påkrevd for at superadmin-redirect skal fungere. |

Root-malen `import.env.example` beskriver også `ADMIN_APP_URL` for public/rewrites; dashboard trenger eksplisitt **`NEXT_PUBLIC_**`-varianten** slat den er tilgjengelig i middleware (Edge) og på klienten.

## Se også

- `docs/migration/admin-app-migration-summary.md` — hvor admin-ruter og app lever.
- RLS i databasen kan fortsatt ha superadmin-overstyr; det påvirker ikke dashboard-UI så lenge superadmin ikke bruker dashboard-session der.

## Dato

2026-03-31
