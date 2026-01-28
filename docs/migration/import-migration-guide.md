# Import Migration Guide

## Status

Vi har migrert alle routes til separate apper, men imports bruker fortsatt lokale paths. Dette dokumentet beskriver hvordan vi gradvis oppdaterer imports til å bruke packages.

## Strategi

### Fase 1: Supabase Clients (Høy prioritet)
- ✅ `packages/shared` har allerede standardiserte Supabase clients
- ⏳ Oppdater apper til å bruke `@teqbook/shared` for Supabase clients
- ⏳ Fjern lokale Supabase client implementasjoner når alle er oppdatert

### Fase 2: UI Components (Medium prioritet)
- ⏳ Identifiser delte UI-komponenter
- ⏳ Flytt til `packages/ui`
- ⏳ Oppdater imports i alle apper

### Fase 3: Utilities og Types (Lav prioritet)
- ⏳ Identifiser delte utilities
- ⏳ Flytt til `packages/shared`
- ⏳ Oppdater imports

## Supabase Client Migration

### Før (lokalt)
```typescript
// apps/public/src/lib/supabase-client.ts
import { createClient } from "@/lib/supabase/client";
export const supabase = createClient();
```

### Etter (shared package)
```typescript
// I repositories og services
import { getBrowserSupabaseClient } from "@teqbook/shared";
const supabase = getBrowserSupabaseClient();
```

### Server Components
```typescript
// Før
import { createClient } from "@/lib/supabase/server";
const supabase = await createClient();

// Etter
import { createServerSupabaseClient } from "@teqbook/shared";
const supabase = await createServerSupabaseClient();
```

### API Routes
```typescript
// Før
import { createClientForRouteHandler } from "@/lib/supabase/server";
const supabase = createClientForRouteHandler(request, response);

// Etter
import { createServerSupabaseClientForRouteHandler } from "@teqbook/shared";
const supabase = createServerSupabaseClientForRouteHandler(request, response);
```

## Oppdateringsrekkefølge

1. **Repositories** - Oppdater alle repositories først (de bruker mest Supabase)
2. **Services** - Oppdater services som bruker Supabase direkte
3. **Components** - Oppdater komponenter som bruker Supabase
4. **Fjern lokale filer** - Når alle er oppdatert, fjern lokale Supabase client filer

## Testing

Etter hver oppdatering:
- [ ] Kjør type-check (`npm run type-check`)
- [ ] Test at appen bygger (`npm run build`)
- [ ] Test at appen kjører (`npm run dev`)

## Notater

- Behold lokale filer inntil alle imports er oppdatert
- Test grundig etter hver endring
- Dokumenter breaking changes hvis noen
