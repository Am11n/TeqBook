# Troubleshooting: Email Not Sending

Hvis du har opprettet en booking med kundens e-post, men ikke mottar e-post, følg disse stegene:

## 1. Sjekk om RESEND_API_KEY er satt

E-posttjenesten krever en Resend API-nøkkel for å faktisk sende e-post. I development-miljøet simulerer tjenesten sending hvis nøkkelen mangler.

**Sjekk `.env.local`:**
```bash
RESEND_API_KEY=re_xxxxx  # Din Resend API-nøkkel
EMAIL_FROM=noreply@teqbook.app  # E-postadresse som sender
EMAIL_FROM_NAME=TeqBook  # Navn på avsender
```

**Hvis du ikke har en Resend API-nøkkel:**
1. Gå til [Resend.com](https://resend.com) og opprett en konto
2. Opprett en API-nøkkel i dashboardet
3. Legg til nøkkelen i `.env.local`
4. Restart Next.js dev server (`npm run dev`)

## 2. Sjekk email_log tabellen

Alle e-poster som sendes (eller prøves sendt) logges i `email_log`-tabellen.

**I Supabase SQL Editor:**
```sql
SELECT 
  id,
  recipient_email,
  subject,
  email_type,
  status,
  error_message,
  created_at,
  sent_at
FROM email_log
ORDER BY created_at DESC
LIMIT 10;
```

**Status-verdier:**
- `pending` - E-post er opprettet, men ikke sendt ennå
- `sent` - E-post er sendt via Resend
- `failed` - Sending feilet (sjekk `error_message`)
- `delivered` - E-post er levert (oppdateres via webhook)

## 3. Sjekk browser console for feil

Åpne browser console (F12) og se etter:
- Feil fra `/api/bookings/send-notifications` API-routen
- Feil fra `email-service`
- Network-feil

## 4. Sjekk server logs

I terminalen hvor `npm run dev` kjører, se etter:
- `[INFO]` - Suksessfulle operasjoner
- `[WARN]` - Advarsler (f.eks. manglende API-nøkkel)
- `[ERROR]` - Feil

## 5. Test e-post-sending direkte

Du kan teste e-post-sending ved å kalle API-routen direkte:

**I browser console:**
```javascript
fetch('/api/bookings/send-notifications', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    booking: {
      id: 'test-booking-id',
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 3600000).toISOString(),
      customer_full_name: 'Test Customer',
      service: { name: 'Test Service' },
      employee: { name: 'Test Employee' },
      salon: { name: 'Test Salon' },
    },
    customerEmail: 'din-email@example.com',
    salonId: 'din-salon-id',
    language: 'nb',
  }),
})
  .then(res => res.json())
  .then(data => console.log('Result:', data))
  .catch(err => console.error('Error:', err));
```

## 6. Vanlige problemer

### Problem: `RESEND_API_KEY environment variable is not set`
**Løsning:** Legg til `RESEND_API_KEY` i `.env.local` og restart serveren.

### Problem: `Email sending skipped: React Email templates cannot be rendered in browser`
**Løsning:** Dette skal ikke skje lenger - API-routen håndterer dette. Hvis du ser denne feilen, sjekk at API-routen faktisk blir kalt.

### Problem: E-post er i `email_log` med status `pending`
**Løsning:** Dette betyr at e-post ble opprettet, men ikke sendt. Sjekk:
- Er `RESEND_API_KEY` satt?
- Er Resend API-nøkkelen gyldig?
- Er `EMAIL_FROM` en verifisert domene i Resend?

### Problem: E-post er i `email_log` med status `failed`
**Løsning:** Sjekk `error_message`-kolonnen i `email_log` for detaljer om feilen.

## 7. Verifiser Resend-konfigurasjon

1. **Verifiser domene i Resend:**
   - Gå til Resend Dashboard → Domains
   - Legg til og verifiser ditt domene
   - Eller bruk Resend's test-domene for testing

2. **Sjekk API-nøkkel-permisjoner:**
   - Gå til Resend Dashboard → API Keys
   - Sjekk at API-nøkkelen har `email.send`-permission

3. **Test API-nøkkelen:**
   ```bash
   curl -X POST https://api.resend.com/emails \
     -H "Authorization: Bearer re_xxxxx" \
     -H "Content-Type: application/json" \
     -d '{
       "from": "noreply@teqbook.app",
       "to": "din-email@example.com",
       "subject": "Test Email",
       "html": "<p>Test</p>"
     }'
   ```

## 8. Sjekk at API-routen faktisk blir kalt

I `bookings-service.ts` kalles API-routen kun hvis `typeof window !== "undefined"` (dvs. i browser). Sjekk at:
- Booking opprettes fra browser (ikke server-side)
- Fetch-kallet faktisk blir gjort (sjekk Network-tab i browser DevTools)
- API-routen returnerer suksess (status 200)

## 9. Debugging tips

1. **Legg til logging:**
   ```typescript
   // I email-service.ts
   console.log('Sending email:', { to, subject, hasApiKey: !!RESEND_API_KEY });
   ```

2. **Sjekk email_log i real-time:**
   ```sql
   -- I Supabase SQL Editor
   SELECT * FROM email_log 
   WHERE recipient_email = 'din-email@example.com'
   ORDER BY created_at DESC;
   ```

3. **Test med en enkel e-post først:**
   - Opprett en booking med din egen e-post
   - Sjekk at e-post kommer frem
   - Hvis ikke, sjekk spam-mappen

## 10. Hvis ingenting fungerer

1. Sjekk at alle migrasjoner er kjørt (spesielt `20250105000000_create_email_log.sql`)
2. Sjekk at `email_log`-tabellen eksisterer og har riktig struktur
3. Sjekk RLS-policies for `email_log`-tabellen
4. Sjekk at Next.js server er restartet etter endringer i `.env.local`

---

## 11. SMS sendes ikke (Twilio)

Hvis booking sender e-post men ikke SMS:

1. **Sjekk Dashboard env vars**
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_FROM_NUMBER`
   - `SMS_PROVIDER=twilio`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. **Sjekk `sms_log`**
   ```sql
   SELECT
     id,
     recipient_phone,
     sms_type,
     status,
     provider_name,
     provider_message_id,
     error_message,
     created_at,
     sent_at,
     delivered_at
   FROM sms_log
   ORDER BY created_at DESC
   LIMIT 20;
   ```

3. **Vanlige mønstre**
   - `status = pending` lenge: provider-resultat ble ikke persistert eller request stoppet tidlig
   - `status = failed`: se `error_message` (ofte manglende/feil Twilio-credentials)
   - `status = sent` men ingen levering: sjekk callback/webhook

4. **Sjekk nummerformat**
   - Input må kunne normaliseres til E.164 (`+47...`)
   - Ugyldig format blir blokkert før provider-kall

5. **Sjekk webhook og secrets**
   - `sms-status-webhook` må være deployet
   - `TWILIO_STATUS_WEBHOOK_TOKEN` må være satt i Supabase Edge secrets
   - Twilio callback URL må peke til funksjonen

6. **Sjekk overage/hard-cap**
   ```sql
   SELECT
     salon_id,
     period_start,
     period_end,
     included_quota,
     used_count,
     overage_count,
     hard_cap_reached
   FROM sms_usage
   ORDER BY updated_at DESC
   LIMIT 10;
   ```

