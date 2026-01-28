# Fikse e-post problemer

## Problem 1: RLS Policy Feil

**Feilmelding:**
```
new row violates row-level security policy for table "email_log"
new row violates row-level security policy for table "reminders"
```

**Løsning:**

Kjør denne migrasjonen i Supabase SQL Editor:

1. Gå til Supabase Dashboard → SQL Editor
2. Kopier innholdet fra `web/supabase/migrations/20250105000004_fix_email_log_reminders_rls_for_api_routes.sql`
3. Kjør SQL-en

Eller kjør migrasjonen lokalt:
```bash
cd /Users/aminismail/Documents/GitHub/TeqBook/web
npx supabase migration up
```

## Problem 2: Resend Domain Ikke Verifisert

**Feilmelding:**
```
The teqbook.app domain is not verified. Please, add and verify your domain on https://resend.com/domains
```

**Løsning:**

Du har to alternativer:

### Alternativ 1: Verifiser domenet i Resend (anbefalt for produksjon)

1. Gå til https://resend.com/domains
2. Legg til `teqbook.app` som ditt domene
3. Følg instruksjonene for å verifisere domenet (DNS records)
4. Vent til domenet er verifisert

### Alternativ 2: Bruk Resend's test-domene (for utvikling)

1. Endre `EMAIL_FROM` i `.env.local`:
   ```bash
   EMAIL_FROM=onboarding@resend.dev
   EMAIL_FROM_NAME=TeqBook
   ```

2. Restart Next.js serveren:
   ```bash
   # Stopp serveren (Ctrl+C)
   npm run dev
   ```

**Merk:** `onboarding@resend.dev` er Resend's test-domene som alltid fungerer, men e-poster sendes kun til e-postadresser du har lagt til i Resend dashboard.

## Test etter fiksing

1. **Kjør migrasjonen** (for RLS-fiksen)
2. **Endre EMAIL_FROM** (for Resend-domenet, hvis du ikke vil verifisere)
3. **Restart serveren**
4. **Opprett en booking** med en e-postadresse
5. **Sjekk terminalen** - du skal se:
   ```
   [INFO] Email sending result { emailSuccess: true, ... }
   ```
6. **Sjekk email_log tabellen** i Supabase:
   ```sql
   SELECT * FROM email_log ORDER BY created_at DESC LIMIT 1;
   ```
   - Status skal være `sent` (ikke `failed`)

## Hvis e-posten fortsatt ikke sendes

1. **Sjekk Resend dashboard** - gå til https://resend.com/emails
2. **Sjekk spam-mappen** - e-poster kan havne i spam
3. **Sjekk at e-postadressen er lagt til i Resend** (hvis du bruker test-domene)
4. **Sjekk server logs** for mer informasjon

