# Type Errors Fix Plan

## Overview
Dette dokumentet beskriver en systematisk plan for å fikse alle TypeScript type-feil i prosjektet.

## Feil-kategorier og løsninger

### 1. Salon Type Konsolidering (Høy prioritet)

**Problem:**
- `Salon`-typen er definert på flere steder med inkonsistente felter
- `salon-provider.tsx` bruker egen type-definisjon
- `lib/types.ts` har ikke alle felter som brukes (f.eks. `branding_*` felter)

**Løsning:**
1. **Utvid `Salon`-typen i `lib/types.ts`** med alle felter som faktisk brukes:
   - Legg til `branding_primary_color?: string | null`
   - Legg til `branding_secondary_color?: string | null`
   - Legg til `branding_font_family?: string | null`
   - Legg til `branding_logo_url?: string | null`
   - Eller: Bruk `theme` objektet som allerede finnes (anbefalt)

2. **Fjern duplikat type-definisjon** fra `salon-provider.tsx`
   - Importer `Salon` fra `@/lib/types` i stedet

3. **Oppdater alle komponenter** som bruker `branding_*` felter til å bruke `theme` objektet

**Filer som må endres:**
- `web/src/lib/types.ts` - Legg til/fikse Salon type
- `web/src/components/salon-provider.tsx` - Fjern duplikat, importer fra lib/types
- `web/src/lib/hooks/branding/useBranding.ts` - Endre fra `branding_*` til `theme.*`

---

### 2. CalendarBooking Type (Medium prioritet)

**Problem:**
- `useCalendar.ts` bruker `b.employee_id` men `CalendarBooking` har ikke dette feltet
- `CalendarBooking` har `employees: { full_name: string | null } | null` objekt i stedet

**Løsning:**
1. **Oppdater `useCalendar.ts`** til å bruke `employees` objektet:
   ```typescript
   // Før:
   const empId = b.employee_id || "unknown";
   
   // Etter:
   const empId = b.employees?.id || "unknown";
   // ELLER hvis employees ikke har id:
   const empId = b.employees?.full_name || "unknown";
   ```

2. **Sjekk `CalendarBooking` type-definisjon** - Legg til `employee_id` hvis det faktisk finnes i data

**Filer som må endres:**
- `web/src/lib/hooks/calendar/useCalendar.ts` - Fiks employee_id bruk
- `web/src/lib/types.ts` - Sjekk CalendarBooking type

---

### 3. Storage Service Type Mismatch (Medium prioritet)

**Problem:**
- `uploadLogo` og `uploadAvatar` forventer `File` type
- Men koden kaller dem med `string` eller feil type

**Løsning:**
1. **Sjekk faktisk signatur** i `storage-service.ts`
2. **Fiks kallene** i:
   - `web/src/lib/hooks/branding/useBranding.ts` - `handleLogoUpload`
   - `web/src/lib/hooks/profile/useProfile.ts` - `handleAvatarUpload`

**Filer som må endres:**
- `web/src/lib/services/storage-service.ts` - Verifiser signaturer
- `web/src/lib/hooks/branding/useBranding.ts` - Fiks uploadLogo kall
- `web/src/lib/hooks/profile/useProfile.ts` - Fiks uploadAvatar kall

---

### 4. SignupForm onClick Handler (Lav prioritet)

**Problem:**
- `onClick={() => setShowPassword((v) => !v)}` - TypeScript klager på funksjon vs boolean

**Løsning:**
1. **Fiks onClick handlers** i `SignupForm.tsx`:
   ```typescript
   // Før:
   onClick={() => setShowPassword((v) => !v)}
   
   // Etter:
   onClick={() => setShowPassword((prev) => !prev)}
   // ELLER:
   onClick={() => setShowPassword(!showPassword)}
   ```

**Filer som må endres:**
- `web/src/components/signup/SignupForm.tsx` - Fiks onClick handlers (linje 150, 173)

---

### 5. UserMenu getInitials (Lav prioritet)

**Problem:**
- `getInitials(userEmail)` får `string | null` men forventer `string`

**Løsning:**
1. **Legg til null-check** eller default verdi:
   ```typescript
   getInitials(userEmail || "")
   ```

**Filer som må endres:**
- `web/src/components/layout/dashboard/UserMenu.tsx` - Legg til null-check (linje 76)

---

### 6. SalonProvider Type Konflikt (Lav prioritet)

**Problem:**
- `Salon | null` er ikke kompatibel med `Salon | null | undefined`

**Løsning:**
1. **Fjern `undefined` fra type** eller legg til explicit `undefined` check

**Filer som må endres:**
- `web/src/components/salon-provider.tsx` - Fiks type-konflikt (linje 145)

---

## Implementeringsrekkefølge

### Fase 1: Kritiske feil (blokkerer build) ✅ FULLFØRT
1. ✅ Salon Type Konsolidering
   - Lagt til `theme` objekt i `Salon` type i `lib/types.ts`
   - Oppdatert `useBranding.ts` til å bruke `theme.*` i stedet for `branding_*` felter
   - Fjernet duplikat `Salon` import i `salon-provider.tsx`
   - Fikset `default_language` til å tillate `null`
2. ✅ CalendarBooking Type
   - Oppdatert `useCalendar.ts` til å bruke `b.employees?.id` i stedet for `b.employee_id`
3. ✅ Storage Service Type Mismatch
   - Fikset `uploadLogo` kall - riktig rekkefølge: `uploadLogo(file, salonId)`
   - Fikset `uploadAvatar` kall - riktig rekkefølge: `uploadAvatar(file, userId)`
   - Fikset `deleteAvatar` kall - lagt til `url` parameter: `deleteAvatar(avatarUrl, userId)`
4. ✅ SignupForm onClick Handler
   - Endret fra `(prev) => !prev` til `!showPassword` / `!showConfirmPassword`
5. ✅ UserMenu getInitials
   - Lagt til null-check: `getInitials(userEmail || "")`

### Fase 2: Mindre kritiske feil ✅ FULLFØRT
4. ✅ SignupForm onClick Handler
   - Endret fra `(prev) => !prev` til `!showPassword` / `!showConfirmPassword`
5. ✅ UserMenu getInitials
   - Lagt til null-check: `getInitials(userEmail || "")`
6. ✅ SalonProvider Type Konflikt
   - Fikset ved å konsolidere `Salon` type og fjerne duplikater

---

## Testing

Etter hver fase:
1. Kjør `npm run type-check` for å verifisere at feilene er fikset
2. Kjør `npm run build` for å sjekke at build fungerer
3. Test funksjonaliteten manuelt hvis relevant

---

## Akseptansekriterier ✅ ALLE OPPFYLT

- ✅ `npm run type-check` passerer uten feil
- ✅ `npm run build` bygger uten feil
- ✅ Ingen funksjonalitet er ødelagt
- ✅ Alle type-definisjoner er konsistente

## Status: FULLFØRT ✅

Alle type-feil er nå fikset! Prosjektet bygger uten feil og er klart for deployment.

---

## Notater

- **Branding fields**: Vi bør bruke `theme` objektet i stedet for separate `branding_*` felter for bedre struktur
- **CalendarBooking**: Sjekk faktisk data-struktur fra API før vi endrer type
- **Storage services**: Verifiser faktiske signaturer før endringer

