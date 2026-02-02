# Fikse kalender ytelsesproblemer

## Problem: "Failed to fetch" når du prøver å åpne kalender-siden

Dette kan skyldes flere ting:

### 1. Sjekk server logs

I terminalen hvor `npm run dev` kjører, se etter feilmeldinger når du prøver å åpne kalender-siden.

### 2. Sjekk RLS policies

Kalender-siden henter bookings via `getBookingsForCalendar`. Sjekk at RLS policies tillater dette:

```sql
-- Sjekk RLS policies for bookings
SELECT * FROM pg_policies WHERE tablename = 'bookings';
```

### 3. Sjekk at migrasjonen er kjørt

Kjør migrasjonen for å fikse RLS policies:

```sql
-- I Supabase SQL Editor, kjør:
-- supabase/supabase/migrations/ (eller tilsvarende migrasjon)
```

### 4. Sjekk browser console

Åpne browser console (F12) og se etter JavaScript-feil.

### 5. Restart serveren

Prøv å restart Next.js serveren:

```bash
# Stopp serveren (Ctrl+C)
npm run dev
```

### 6. Sjekk at Supabase er tilgjengelig

Sjekk at Supabase URL og keys er riktig i `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Rask fiks

1. **Restart serveren**
2. **Hard refresh browser:** `Ctrl + Shift + R` (eller `Cmd + Shift + R` på Mac)
3. **Sjekk terminalen** for feilmeldinger
4. **Sjekk browser console** for JavaScript-feil

