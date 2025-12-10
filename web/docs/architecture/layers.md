# TeqBook – Lag-inndeling og Arkitektur

Dette dokumentet beskriver lag-inndelingen i TeqBook og reglene for hvordan data og logikk flyter gjennom systemet.

---

## Arkitekturprinsipp

TeqBook følger en **lagdelt arkitektur** (layered architecture) med tydelige grenser mellom lag:

```
UI (pages, components)
  ↓
Services (src/lib/services/*)
  ↓
Repositories (src/lib/repositories/*)
  ↓
Supabase Client (src/lib/supabase-client.ts)
```

**Kritisk regel:** Ingen komponent eller page skal importere Supabase-klienten direkte.

---

## Lag-beskrivelse

### 1. UI-lag (Presentation Layer)

**Lokasjon:** `src/app/`, `src/components/`

**Ansvar:**
- Presentasjon av data til brukeren
- Håndtering av brukerinteraksjoner
- Loading states, error states
- Routing og navigasjon

**Regler:**
- ❌ **FORBUDT:** Direkte import av `@/lib/supabase-client`
- ❌ **FORBUDT:** Direkte import av `@supabase/supabase-js`
- ❌ **FORBUDT:** Direkte databasekall (`.from()`, `.rpc()`, `.auth`, etc.)
- ✅ **TILLATT:** Import fra `@/lib/services/*`
- ✅ **TILLATT:** Import fra `@/lib/types` for domain-typer
- ✅ **TILLATT:** Import fra repositories kun hvis det er nødvendig for spesialiserte queries

**Eksempel:**
```typescript
// ❌ FEIL - Direkte Supabase-kall
import { supabase } from "@/lib/supabase-client";
const { data } = await supabase.from("bookings").select("*");

// ✅ RIKTIG - Via service
import { getBookingsForSalon } from "@/lib/services/bookings-service";
const bookings = await getBookingsForSalon(salonId);
```

---

### 2. Services-lag (Business Logic Layer)

**Lokasjon:** `src/lib/services/`

**Ansvar:**
- Forretningslogikk og domeneregler
- Validering av input
- Orkestrering av flere repository-kall
- Transformering av data mellom lag
- Håndtering av sideeffekter

**Regler:**
- ✅ **TILLATT:** Import fra `@/lib/repositories/*`
- ✅ **TILLATT:** Import fra `@/lib/types`
- ❌ **FORBUDT:** Direkte import av `@/lib/supabase-client`
- ❌ **FORBUDT:** UI-spesifikk logikk (toasts, router, redirect)
- ❌ **FORBUDT:** Direkte databasekall

**Eksempel:**
```typescript
// ✅ RIKTIG - Service med forretningslogikk
import { getBookingsForCalendar } from "@/lib/repositories/bookings";
import { getEmployeesForCurrentSalon } from "@/lib/repositories/employees";

export async function getCalendarEntriesForSalon(salonId: string, date: Date) {
  // Validering
  if (!salonId) {
    throw new Error("Salon ID is required");
  }

  // Orkestrering av flere kall
  const [bookings, employees] = await Promise.all([
    getBookingsForCalendar(salonId, { startDate: date }),
    getEmployeesForCurrentSalon(salonId),
  ]);

  // Forretningslogikk
  const availableSlots = calculateAvailableSlots(bookings, employees);

  return { bookings, employees, availableSlots };
}
```

---

### 3. Repository-lag (Data Access Layer)

**Lokasjon:** `src/lib/repositories/`

**Ansvar:**
- Rene databaseoperasjoner
- Mapping mellom Supabase-respons og domain-typer
- Error-håndtering på database-nivå
- Query-optimalisering

**Regler:**
- ✅ **TILLATT:** Import fra `@/lib/supabase-client`
- ✅ **TILLATT:** Import fra `@/lib/types`
- ❌ **FORBUDT:** Forretningslogikk
- ❌ **FORBUDT:** UI-spesifikk logikk
- ❌ **FORBUDT:** Validering av forretningsregler (kun data-validering)

**Eksempel:**
```typescript
// ✅ RIKTIG - Ren databaseoperasjon
import { supabase } from "@/lib/supabase-client";
import type { Booking } from "@/lib/types";

export async function getBookingsForCalendar(
  salonId: string,
  options: { startDate: Date; endDate?: Date }
): Promise<{ data: Booking[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select("*, customers(*), employees(*), services(*)")
      .eq("salon_id", salonId)
      .gte("start_time", options.startDate.toISOString());

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as Booking[], error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
```

---

### 4. Supabase-klient (Infrastructure Layer)

**Lokasjon:** `src/lib/supabase-client.ts`

**Ansvar:**
- Definisjon av Supabase-klienten
- Konfigurasjon av connection
- Eksponering av klienten til repositories

**Regler:**
- ✅ **TILLATT:** Import av `@supabase/supabase-js`
- ✅ **TILLATT:** Environment-variabler
- ❌ **FORBUDT:** Bruk i UI eller services (kun repositories)

**Eksempel:**
```typescript
// ✅ RIKTIG - Definisjon av klient
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## Dataflyt-eksempel

### Scenario: Hente bookinger for en salon

1. **UI-lag** (`src/app/bookings/page.tsx`):
   ```typescript
   const { data, error } = await getBookingsForCurrentSalon(salonId);
   ```

2. **Service-lag** (`src/lib/services/bookings-service.ts`):
   ```typescript
   export async function getBookingsForCurrentSalon(salonId: string) {
     // Validering
     if (!salonId) throw new Error("Salon ID required");
     
     // Kall repository
     return await getBookingsForCalendar(salonId, { startDate: new Date() });
   }
   ```

3. **Repository-lag** (`src/lib/repositories/bookings.ts`):
   ```typescript
   export async function getBookingsForCalendar(...) {
     const { data, error } = await supabase
       .from("bookings")
       .select("*");
     // ...
   }
   ```

4. **Infrastructure** (`src/lib/supabase-client.ts`):
   ```typescript
   export const supabase = createClient(...);
   ```

---

## Fordeler med denne strukturen

1. **Testbarhet:** Services og repositories kan testes isolert
2. **Vedlikeholdbarhet:** Endringer i database påvirker kun repositories
3. **Gjenbrukbarhet:** Services kan brukes fra flere UI-komponenter
4. **Sikkerhet:** Sentralisert håndtering av databasekall
5. **Skalerbarhet:** Lett å legge til nye features uten å påvirke eksisterende kode

---

## Unntak og spesialtilfeller

### Auth-operasjoner

Auth-operasjoner kan være et unntak, men bør også gå via services når mulig:

- **Akseptabelt:** `salon-provider.tsx` kan bruke `supabase.auth` direkte for auth state management og `onAuthStateChange` events
- **Foretrukket:** Opprett `auth-service.ts` for alle auth-operasjoner (✅ Implementert)
- **Status:** `auth-service.ts` er opprettet og brukes i de fleste komponenter. `salon-provider.tsx` bruker fortsatt Supabase direkte for auth state management, som er akseptabelt for denne type infrastruktur-komponent.

### Edge Cases

Hvis du støter på et edge case hvor du må bryte regelen:
1. Dokumenter hvorfor i en kommentar
2. Vurder om det kan løses på en bedre måte
3. Opprett en issue for fremtidig refaktorering

---

## Verifisering

For å verifisere at arkitekturen følges:

```bash
# Søk etter direkte Supabase-imports i UI
grep -r "from.*supabase-client" src/app/ src/components/

# Søk etter direkte Supabase-kall i UI
grep -r "supabase\\.(from|auth|rpc)" src/app/ src/components/
```

Disse skal returnere tomme resultater (eller kun i spesialtilfeller som er dokumentert).

---

## Oppdateringer

Dette dokumentet skal oppdateres når:
- Nye lag legges til
- Regler endres
- Unntak dokumenteres
- Arkitekturprinsipper endres

