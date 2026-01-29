# Supabase UI Usage Audit

Dette dokumentet kartlegger alle filer som bruker Supabase-klienten direkte, og klassifiserer dem etter lag.

**Status:** Oppdatert [dato]

---

## Klassifisering

### UI-lag (Pages) - MÅ REFAKTORERES ❌

Filer i `src/app/` som bruker Supabase direkte:

1. **`src/app/dashboard/page.tsx`**
   - Bruk: `supabase` import (linje 14)
   - Type: Page component
   - Status: ⚠️ Bruker repositories, men har også direkte import

2. **`src/app/admin/page.tsx`**
   - Bruk: `supabase.rpc()` (linje 93)
   - Type: Page component
   - Status: ❌ Direkte RPC-kall

3. **`src/app/(auth)/login/page.tsx`**
   - Bruk: `supabase.auth.signInWithPassword()` (linje 59)
   - Type: Auth page
   - Status: ❌ Direkte auth-kall

4. **`src/app/(auth)/signup/page.tsx`**
   - Bruk: `supabase.auth.signUp()` (linje 78)
   - Type: Auth page
   - Status: ❌ Direkte auth-kall

5. **`src/app/(onboarding)/onboarding/page.tsx`**
   - Bruk: `supabase.rpc()` (linje 66)
   - Type: Onboarding page
   - Status: ❌ Direkte RPC-kall

6. **`src/app/settings/general/page.tsx`**
   - Bruk: `supabase` import
   - Type: Settings page
   - Status: ⚠️ Må verifiseres

### UI-lag (Components) - MÅ REFAKTORERES ❌

Filer i `src/components/` som bruker Supabase direkte:

1. **`src/components/public-booking-page.tsx`**
   - Bruk: `supabase.rpc()` (linje 130, 187)
   - Type: Public booking component
   - Status: ❌ Direkte RPC-kall

2. **`src/components/dashboard-shell.tsx`**
   - Bruk: `supabase.auth.getUser()`, `supabase.auth.signOut()` (linje 107, 123, 155, 198)
   - Type: Layout component
   - Status: ❌ Direkte auth-kall

3. **`src/components/salon-provider.tsx`**
   - Bruk: `supabase.auth.getUser()`, `supabase.auth.onAuthStateChange()` (linje 76, 160)
   - Type: Context provider
   - Status: ⚠️ Auth provider - kan være akseptabelt, men bør vurderes

4. **`src/components/current-salon-badge.tsx`**
   - Bruk: `supabase.auth.getUser()` (linje 21)
   - Type: UI component
   - Status: ❌ Direkte auth-kall

5. **`src/components/current-user-badge.tsx`**
   - Bruk: `supabase.auth.getUser()` (linje 16)
   - Type: UI component
   - Status: ❌ Direkte auth-kall

6. **`src/components/command-palette.tsx`**
   - Bruk: `supabase` import
   - Type: UI component
   - Status: ⚠️ Må verifiseres

### Repository-lag - ✅ OK

Filer i `src/lib/repositories/` som bruker Supabase (dette er forventet):

1. **`src/lib/repositories/bookings.ts`** ✅
2. **`src/lib/repositories/customers.ts`** ✅
3. **`src/lib/repositories/employees.ts`** ✅
4. **`src/lib/repositories/services.ts`** ✅
5. **`src/lib/repositories/shifts.ts`** ✅

### Infrastruktur - ✅ OK

1. **`src/lib/supabase-client.ts`** ✅
   - Dette er definisjonen av Supabase-klienten - skal være her

---

## Oppsummering

### Totalt antall filer som måtte refaktoreres: **11 filer**

- **Pages:** 6 filer ✅
- **Components:** 5 filer ✅

### Status: **FERDIG** ✅

Alle UI-filer har blitt refaktorert til å bruke services i stedet for direkte Supabase-kall.

### Unntak

**salon-provider.tsx** - Context provider for auth state management
- Status: ⚠️ **Akseptabelt unntak**
- Grunn: Context provider som håndterer auth state og onAuthStateChange
- Dokumentasjon: Dette er et infrastruktur-lag komponent som håndterer auth state management, og direkte bruk av Supabase auth er akseptabelt her.

### Prioritering for refaktorering:

1. **Høy prioritet:**
   - `src/app/admin/page.tsx` - Admin-funksjonalitet
   - `src/app/(onboarding)/onboarding/page.tsx` - Kritisk flow
   - `src/components/public-booking-page.tsx` - Public-facing

2. **Medium prioritet:**
   - `src/app/(auth)/login/page.tsx` - Auth flow
   - `src/app/(auth)/signup/page.tsx` - Auth flow
   - `src/components/dashboard-shell.tsx` - Layout component

3. **Lav prioritet:**
   - `src/components/current-salon-badge.tsx` - Liten komponent
   - `src/components/current-user-badge.tsx` - Liten komponent
   - `src/app/dashboard/page.tsx` - Bruker allerede repositories delvis

4. **Spesialtilfelle:**
   - `src/components/salon-provider.tsx` - Context provider, kan være akseptabelt med auth-kall

---

## Neste steg

1. Opprett service-lag for auth-operasjoner
2. Opprett service-lag for admin-operasjoner
3. Opprett service-lag for onboarding-operasjoner
4. Refaktorer hver fil systematisk

