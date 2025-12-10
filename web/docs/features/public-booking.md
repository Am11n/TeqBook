# TeqBook – Public Booking Flow

Dette dokumentet beskriver den offentlige booking-flyten i TeqBook, hvor kunder kan booke timer uten å være autentisert.

---

## Oversikt

**Rute:** `/book/[salon_slug]`

**Komponent:** `src/components/public-booking-page.tsx`

**Hensikt:** La kunder booke timer direkte via en offentlig URL uten å måtte logge inn.

**Betaling:** "Betal i salong" - ingen online betaling, kun fysisk betaling ved ankomst.

---

## API Endpoints

Alle API-kall bruker **Supabase anon key** (ingen autentisering påkrevd).

### 1. Hent Salon (Public)

**Service:** `getSalonBySlugForPublic(slug: string)`

**Repository:** `getSalonBySlug(slug: string)`

**Supabase Query:**
```typescript
supabase
  .from("salons")
  .select("id, name, slug, is_public, preferred_language, salon_type, whatsapp_number")
  .eq("slug", slug)
  .eq("is_public", true)
  .maybeSingle()
```

**Krav:**
- Salon må ha `is_public = true`
- Salon må ha en gyldig `slug`

**Returnerer:**
- `id` - Salon ID
- `name` - Salon navn
- `slug` - Salon slug
- `is_public` - Om salongen er offentlig
- `preferred_language` - Foretrukket språk
- `salon_type` - Type salong
- `whatsapp_number` - WhatsApp nummer (valgfritt)

---

### 2. Hent Aktive Tjenester (Public)

**Service:** `getActiveServicesForPublicBooking(salonId: string)`

**Repository:** `getActiveServicesForCurrentSalon(salonId, { pageSize: 1000 })`

**Supabase Query:**
```typescript
supabase
  .from("services")
  .select("id, name")
  .eq("salon_id", salonId)
  .eq("is_active", true)
  .order("name")
  .limit(1000)
```

**Krav:**
- Tjenester må ha `is_active = true`
- Tjenester må tilhøre salongen (`salon_id`)

**Returnerer:**
- Forenklet format: `{ id: string, name: string }[]`

**Merk:** Ingen paginering - henter alle aktive tjenester (opptil 1000).

---

### 3. Hent Aktive Ansatte (Public)

**Service:** `getActiveEmployeesForPublicBooking(salonId: string)`

**Repository:** `getEmployeesForCurrentSalon(salonId, { pageSize: 1000 })`

**Supabase Query:**
```typescript
supabase
  .from("employees")
  .select("id, full_name")
  .eq("salon_id", salonId)
  .eq("is_active", true)
  .order("full_name")
  .limit(1000)
```

**Krav:**
- Ansatte må ha `is_active = true`
- Ansatte må tilhøre salongen (`salon_id`)

**Returnerer:**
- Forenklet format: `{ id: string, full_name: string }[]`

**Merk:** Ingen paginering - henter alle aktive ansatte (opptil 1000).

---

### 4. Hent Ledige Tidslots

**Service:** `getAvailableTimeSlots(salonId, employeeId, serviceId, date)`

**Repository:** `getAvailableSlots(salonId, employeeId, serviceId, date)`

**Supabase RPC:**
```typescript
supabase.rpc("generate_availability", {
  p_salon_id: salonId,
  p_employee_id: employeeId,
  p_service_id: serviceId,
  p_day: date, // Format: "YYYY-MM-DD"
})
```

**Postgres Function:** `generate_availability`

**Funksjonalitet:**
- Beregner ledige tidslots basert på:
  - Ansattes skift (`shifts` tabell)
  - Eksisterende bookinger (`bookings` tabell)
  - Tjenestens varighet (`services.duration_minutes`)
  - Åpningstider (`opening_hours` tabell)

**Returnerer:**
```typescript
{
  slot_start: string; // ISO timestamp
  slot_end: string;   // ISO timestamp
}[]
```

**Eksempel:**
```json
[
  {
    "slot_start": "2024-01-15T10:00:00",
    "slot_end": "2024-01-15T11:00:00"
  },
  {
    "slot_start": "2024-01-15T11:00:00",
    "slot_end": "2024-01-15T12:00:00"
  }
]
```

**Merk:** Tidslots formateres på frontend for å unngå timezone-problemer.

---

### 5. Opprett Booking

**Service:** `createBooking(input: CreateBookingInput)`

**Repository:** `createBooking(input: CreateBookingInput)`

**Supabase RPC:**
```typescript
supabase.rpc("create_booking_with_validation", {
  p_salon_id: input.salon_id,
  p_employee_id: input.employee_id,
  p_service_id: input.service_id,
  p_start_time: input.start_time,
  p_customer_full_name: input.customer_full_name,
  p_customer_email: input.customer_email || null,
  p_customer_phone: input.customer_phone || null,
  p_customer_notes: input.customer_notes || null,
  p_is_walk_in: false, // Alltid false for offentlige bookinger
})
```

**Postgres Function:** `create_booking_with_validation`

**Funksjonalitet:**
1. **Validerer tjeneste:** Sjekker at tjenesten eksisterer og tilhører salongen
2. **Beregner sluttid:** `end_time = start_time + service.duration_minutes`
3. **Sjekker overlapp:** Validerer at tidslotten ikke overlapper med eksisterende bookinger
4. **Oppretter/oppdaterer kunde:** 
   - Hvis kunde med samme email eksisterer → oppdaterer
   - Hvis ikke → oppretter ny kunde
   - Bruker `ON CONFLICT (salon_id, email)` for upsert
5. **Oppretter booking:** 
   - Status: `'confirmed'` (for online bookinger)
   - `is_walk_in: false`

**Returnerer:**
- `Booking` objekt eller `error`

---

## Data Tilgjengelig Uten Auth

Følgende data er tilgjengelig via **Supabase anon key** (ingen autentisering):

### Tabeller med Public Read Access

1. **`salons`**
   - **RLS Policy:** Public kan lese hvis `is_public = true`
   - **Felter:** `id`, `name`, `slug`, `is_public`, `preferred_language`, `salon_type`, `whatsapp_number`

2. **`services`**
   - **RLS Policy:** Public kan lese hvis salon er public
   - **Felter:** `id`, `name`, `duration_minutes`, `price_cents`, `is_active`

3. **`employees`**
   - **RLS Policy:** Public kan lese hvis salon er public
   - **Felter:** `id`, `full_name`, `is_active`

4. **`opening_hours`**
   - **RLS Policy:** Public kan lese hvis salon er public
   - **Felter:** `day_of_week`, `open_time`, `close_time`, `is_closed`

### RPC Functions (Public)

1. **`generate_availability`**
   - **Security:** `SECURITY DEFINER` (kjører med definer-rettigheter)
   - **Access:** Public kan kalle (ingen auth-sjekk)
   - **Input:** `p_salon_id`, `p_employee_id`, `p_service_id`, `p_day`
   - **Output:** Array av ledige tidslots

2. **`create_booking_with_validation`**
   - **Security:** `SECURITY DEFINER` (kjører med definer-rettigheter)
   - **Access:** Public kan kalle (ingen auth-sjekk)
   - **Input:** Booking-detaljer
   - **Output:** Opprettet booking

**Merk:** Selv om RPC-funksjonene er tilgjengelige uten auth, validerer de:
- At salon eksisterer og er public
- At ansatt/tjeneste tilhører salongen
- At tidslotten ikke overlapper med eksisterende bookinger

---

## Booking Flow (Steg-for-Steg)

### Steg 1: Last Initial Data

**Når:** Komponenten monteres (`useEffect`)

**Hva som skjer:**
1. Henter salon via `getSalonBySlugForPublic(slug)`
2. Henter aktive tjenester via `getActiveServicesForPublicBooking(salonId)`
3. Henter aktive ansatte via `getActiveEmployeesForPublicBooking(salonId)`

**Parallell lasting:** Tjenester og ansatte lastes parallelt via `Promise.all()`.

**Feilhåndtering:**
- Hvis salon ikke finnes → viser "Salon ikke tilgjengelig"
- Hvis feil oppstår → viser feilmelding

---

### Steg 2: Velg Service, Ansatt og Dato

**Når:** Brukeren fyller ut skjema

**Validering:**
- Service må være valgt
- Ansatt må være valgt
- Dato må være valgt
- Dato må være i dag eller fremover

**UI:**
- Dropdown for service
- Dropdown for ansatt
- Date input for dato
- "Last ledige tider" knapp (aktiveres når alle felter er fylt)

---

### Steg 3: Last Ledige Tidslots

**Når:** Brukeren klikker "Last ledige tider"

**Hva som skjer:**
1. Kaller `getAvailableTimeSlots(salonId, employeeId, serviceId, date)`
2. Mapper tidslots til visningsformat:
   ```typescript
   {
     start: "2024-01-15T10:00:00",
     end: "2024-01-15T11:00:00",
     label: "10:00 – 11:00"
   }
   ```
3. Viser tidslots i dropdown

**Tidsformatering:**
- Bruker regex for å ekstrahere tid direkte fra ISO-string
- Unngår timezone-problemer ved å ikke konvertere til Date-objekt
- Format: `HH:MM – HH:MM`

**Feilhåndtering:**
- Hvis ingen ledige tidslots → viser "Ingen ledige tider"
- Hvis feil oppstår → viser feilmelding

---

### Steg 4: Velg Tidslot

**Når:** Brukeren velger tidslot fra dropdown

**Validering:**
- Tidslot må være valgt
- Tidslot må være fra `generate_availability` (ikke manuelt opprettet)

---

### Steg 5: Fyll Ut Kundedetaljer

**Når:** Brukeren fyller ut skjema

**Felter:**
- **Navn** (påkrevd)
- **E-post** (valgfritt)
- **Telefon** (valgfritt)

**Validering:**
- Navn må være fylt ut
- E-post må være gyldig format (hvis oppgitt)
- Telefon må være minst 8 tegn (hvis oppgitt)

---

### Steg 6: Opprett Booking

**Når:** Brukeren klikker "Book time"

**Hva som skjer:**
1. Kaller `createBooking(input)`
2. Input:
   ```typescript
   {
     salon_id: salon.id,
     employee_id: employeeId,
     service_id: serviceId,
     start_time: selectedSlot,
     customer_full_name: customerName,
     customer_email: customerEmail || null,
     customer_phone: customerPhone || null,
     customer_notes: null,
     is_walk_in: false,
   }
   ```
3. Viser suksessmelding: "Booking opprettet! Du betaler i salongen."

**Feilhåndtering:**
- Hvis tidslotten er opptatt → viser "Tidslotten er allerede booket"
- Hvis validering feiler → viser feilmelding
- Hvis feil oppstår → viser generell feilmelding

---

## Time Slot Generering

### Hvordan `generate_availability` Fungerer

**Postgres Function:** `generate_availability`

**Input:**
- `p_salon_id` - Salon ID
- `p_employee_id` - Ansatt ID
- `p_service_id` - Tjeneste ID
- `p_day` - Dato (format: "YYYY-MM-DD")

**Prosess:**

1. **Hent tjeneste-varighet:**
   ```sql
   SELECT duration_minutes FROM services
   WHERE id = p_service_id AND salon_id = p_salon_id
   ```

2. **Hent ansattes skift:**
   ```sql
   SELECT start_time, end_time FROM shifts
   WHERE salon_id = p_salon_id
     AND employee_id = p_employee_id
     AND DATE(start_time) = p_day
     AND is_active = true
   ```

3. **Hent eksisterende bookinger:**
   ```sql
   SELECT start_time, end_time FROM bookings
   WHERE salon_id = p_salon_id
     AND employee_id = p_employee_id
     AND DATE(start_time) = p_day
     AND status NOT IN ('cancelled', 'no-show')
   ```

4. **Hent åpningstider:**
   ```sql
   SELECT open_time, close_time, is_closed FROM opening_hours
   WHERE salon_id = p_salon_id
     AND day_of_week = EXTRACT(DOW FROM p_day::date)
   ```

5. **Generer tidslots:**
   - Start fra `MAX(shift.start_time, opening_hours.open_time)`
   - Slutt ved `MIN(shift.end_time, opening_hours.close_time)`
   - Slot-varighet = `service.duration_minutes`
   - Ekskluder overlappende bookinger
   - Returner array av ledige tidslots

**Output:**
```sql
RETURNS TABLE(slot_start TIMESTAMPTZ, slot_end TIMESTAMPTZ)
```

**Eksempel:**
- Skift: 09:00 - 17:00
- Tjeneste: 60 minutter
- Eksisterende booking: 10:00 - 11:00
- Ledige tidslots:
  - 09:00 - 10:00 ✅
  - 11:00 - 12:00 ✅
  - 12:00 - 13:00 ✅
  - ... (osv)

---

## UX-Regler

### Mobil-Først Design

**Prinsipper:**
- Alle elementer er touch-vennlige (minst 44x44px)
- Dropdowns er store nok for mobil
- Date input bruker native date picker
- Tekst er lesbar uten zoom (minst 16px)
- Spacing er generøs for touch-interaksjon

**Layout:**
- En kolonne på mobil
- Max-width: `max-w-xl` (672px)
- Padding: `px-4 sm:px-6`
- Gap mellom seksjoner: `gap-4`

---

### Minimal Friksjon

**Prinsipper:**
1. **Få steg som mulig:**
   - Steg 1-3: Service, ansatt, dato (ett skjema)
   - Steg 4: Velg tidslot (samme skjema)
   - Steg 5-6: Kundedetaljer og book (ett skjema)

2. **Validering i sanntid:**
   - Knapper deaktiveres hvis validering feiler
   - Feilmeldinger vises umiddelbart
   - Suksessmeldinger vises tydelig

3. **Ingen unødvendige felter:**
   - E-post er valgfritt
   - Telefon er valgfritt
   - Kun navn er påkrevd

4. **Tydelig feedback:**
   - Loading states på alle knapper
   - Feilmeldinger med `aria-live="polite"`
   - Suksessmeldinger med grønn tekst

5. **Ingen popups/modaler:**
   - Alt skjer på samme side
   - Ingen ekstra klikk for å bekrefte

---

### Språkstøtte

**Språkvelger:**
- Plassert i header
- Støtter alle språk fra i18n-systemet
- Endrer umiddelbart alle tekster på siden

**Støttede språk:**
- Norsk (nb)
- English (en)
- العربية (ar)
- Soomaali (so)
- ትግርኛ (ti)
- አማርኛ (am)
- ... (og flere)

**Lokalisering:**
- Alle tekster hentes fra `translations[locale].publicBooking`
- Datoformatering følger locale
- Tidsformatering følger locale

---

### Betalingsinformasjon

**Tydelig kommunikasjon:**
- Badge: "Betal i salong" / "Pay at salon"
- Tekst: "Du betaler i salongen ved ankomst"
- Ingen online betalingsmuligheter
- Ingen kredittkort-felter

**Plassering:**
- Badge i header
- Informasjon i footer av booking-skjemaet

---

## Feilhåndtering

### Vanlige Feil

1. **Salon ikke funnet:**
   - **Årsak:** Ugyldig slug eller `is_public = false`
   - **Løsning:** Viser "Salon ikke tilgjengelig"

2. **Ingen ledige tidslots:**
   - **Årsak:** Alle tidslots er booket eller ingen skift
   - **Løsning:** Viser "Ingen ledige tider for denne datoen"

3. **Tidslot allerede booket:**
   - **Årsak:** Race condition (to brukere booker samtidig)
   - **Løsning:** Viser "Tidslotten er allerede booket. Velg en annen tid."

4. **Validering feiler:**
   - **Årsak:** Ugyldig input (f.eks. dato i fortiden)
   - **Løsning:** Viser spesifikk feilmelding

5. **Nettverksfeil:**
   - **Årsak:** Supabase er nede eller nettverksproblemer
   - **Løsning:** Viser generell feilmelding med "Prøv igjen"

---

## Sikkerhet

### RLS Policies

**Public Read Access:**
- `salons`: Hvis `is_public = true`
- `services`: Hvis salon er public
- `employees`: Hvis salon er public
- `opening_hours`: Hvis salon er public

**Public Write Access:**
- `bookings`: Via `create_booking_with_validation` RPC
- `customers`: Via `create_booking_with_validation` RPC (auto-upsert)

**Validering:**
- Alle RPC-funksjoner validerer at data tilhører salongen
- Overlappende bookinger forhindres
- Tidslots valideres mot skift og åpningstider

---

## Testing

### Manuell Testing

1. **Test med gyldig salon:**
   - Gå til `/book/example-salon`
   - Verifiser at salon lastes
   - Verifiser at tjenester og ansatte lastes

2. **Test booking-flow:**
   - Velg service, ansatt, dato
   - Last ledige tidslots
   - Velg tidslot
   - Fyll ut kundedetaljer
   - Opprett booking
   - Verifiser suksessmelding

3. **Test feilhåndtering:**
   - Test med ugyldig slug
   - Test med ingen ledige tidslots
   - Test med overlappende booking

### E2E Testing

**Playwright test:** `tests/e2e/public-booking.spec.ts`

**Scenarios:**
- Full booking flow
- Feilhåndtering
- Validering
- Språkbytte

---

## Relaterte Dokumenter

- `docs/backend/supabase-foundation.md` - Supabase foundation
- `docs/frontend/components.md` - Komponentdokumentasjon
- `docs/frontend/i18n.md` - Internasjonalisering
- `supabase/README.md` - SQL scripts og RPC functions

