# API-route auth: standard (dashboard / admin)

## Mål

Nye `route.ts`-handlere under `apps/dashboard` og `apps/admin` skal ikke eksponere sensitive operasjoner uten eksplisitt autentisering og salon-/tenant-sjekk der det trengs.

## Anbefalt mønster (dashboard)

1. **`enforceSameOrigin(request)`** der CSRF-relevant.
2. **`authenticateAndVerifySalon(request, salonId, response, { … })`** for brukerinitierte handlinger knyttet til en salon.

Se [`apps/dashboard/src/lib/api-auth.ts`](../../apps/dashboard/src/lib/api-auth.ts).

## Cron / interne jobber

Ruter som kun skal kalles av cron eller backend (f.eks. `waitlist/process-lifecycle`) skal bruke **hemmelig header** eller lignende (`WAITLIST_CRON_SECRET`, `x-cron-key`), ikke session-cookie alene.

## Verifikasjon i CI

`pnpm run check:dashboard-api-route-auth` sjekker at hver dashboard `route.ts` under `src/app/api` matcher et av de godkjente mønstrene (session auth, cron secret, eller eksplisitt allowlist).

## Public app (`apps/public`)

Offentlige ruter er bevisst åpne der produktet krever det; sikkerhet bygger på rate limits, action tokens og **e-post-OTP** for token-minting (se ADR for public booking OTP).
