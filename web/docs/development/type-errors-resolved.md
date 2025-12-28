# Type Error Summary

## Rotårsak
`Salon`-typen er definert på 3 forskjellige steder med **inkonsekvente** definisjoner:

1. **`web/src/components/salon-provider.tsx`** - `supported_languages?: string[] | null`
2. **`web/src/lib/types.ts`** - `supported_languages?: string[]` (mangler `| null`)
3. **`web/src/lib/types/domain.ts`** - `supported_languages?: string[] | null`

Dette skaper type-inkompatibilitet når komponenter bruker `useCurrentSalon()` som returnerer typen fra `salon-provider.tsx`, men andre komponenter forventer typen fra `lib/types.ts`.

## Løsning

**Vi skal bruke `lib/types.ts` som den autoritative kilden for alle typer.**

### Endringer som må gjøres:

1. **Oppdater `web/src/lib/types.ts`** - Legg til `| null` for `supported_languages`
2. **Fjern duplikat type-definisjon** fra `salon-provider.tsx` - Bruk import fra `lib/types.ts`
3. **Konsolider alle Salon-typer** - Sørg for at alle bruker samme type

Dette vil fikse alle type-feilene relatert til `Salon` på én gang.

## Status
- ✅ `web/src/lib/types.ts` - Allerede oppdatert med `| null`
- ✅ `web/src/lib/types/domain.ts` - Allerede oppdatert med `| null`
- ⏳ `web/src/components/salon-provider.tsx` - Trenger å importere fra `lib/types.ts`

