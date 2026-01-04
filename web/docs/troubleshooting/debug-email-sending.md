# Debug Email Sending

## Steg-for-steg debugging guide

### 1. Sjekk at API-routen blir kalt

1. Åpne browser DevTools (F12)
2. Gå til **Network**-tab
3. Opprett en booking med en e-postadresse
4. Filtrer på `/api/bookings/send-notifications`
5. Sjekk om kallet blir gjort og hva responsen er

**Forventet resultat:**
- Status: 200 OK
- Response body: `{ email: { data: {...}, error: null }, reminders: {...} }`

### 2. Sjekk server logs

I terminalen hvor `npm run dev` kjører, se etter:
- `[INFO] send-notifications API route called`
- `[INFO] Attempting to send booking confirmation email`
- `[INFO] Email sending result`

**Hvis du ikke ser disse loggene:**
- API-routen blir ikke kalt
- Sjekk at booking faktisk opprettes fra browser (ikke server-side)

### 3. Sjekk email_log tabellen

Kjør denne SQL-spørringen i Supabase SQL Editor:

```sql
SELECT 
  id,
  recipient_email,
  subject,
  status,
  error_message,
  created_at,
  sent_at
FROM email_log
WHERE email_type = 'booking_confirmation'
ORDER BY created_at DESC
LIMIT 5;
```

**Forventet resultat:**
- Minst én rad med `status = 'sent'` eller `status = 'pending'`
- Hvis `status = 'failed'`, sjekk `error_message`

### 4. Test Resend API key direkte

Kjør denne kommandoen i terminalen (erstatt med din faktiske API key):

```bash
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer re_Yw8mo7K5_8Nj8cDquLR9if1z7YskF2LiG" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "noreply@teqbook.app",
    "to": "din-email@example.com",
    "subject": "Test Email",
    "html": "<p>Test email fra TeqBook</p>"
  }'
```

**Forventet resultat:**
- Status: 200 OK
- Response: `{ "id": "..." }`

**Hvis du får feil:**
- API key er ugyldig eller utløpt
- Domene `teqbook.app` er ikke verifisert i Resend

### 5. Sjekk at customer_email faktisk sendes

I browser console, etter å ha opprettet en booking:

```javascript
// Sjekk den siste booking-en
fetch('/api/bookings/send-notifications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    booking: { id: 'test', start_time: new Date().toISOString(), customer_full_name: 'Test' },
    customerEmail: 'din-email@example.com',
    salonId: 'din-salon-id',
    language: 'no'
  })
}).then(r => r.json()).then(console.log);
```

### 6. Vanlige problemer og løsninger

#### Problem: Ingen logg i email_log
**Løsning:** 
- Sjekk at migrasjon `20250105000000_create_email_log.sql` er kjørt
- Sjekk RLS policies for `email_log` tabellen

#### Problem: Status = 'failed' i email_log
**Løsning:**
- Sjekk `error_message` kolonnen
- Vanlige feil:
  - `Invalid API key` → Sjekk at `RESEND_API_KEY` er riktig
  - `Domain not verified` → Verifiser domene i Resend dashboard
  - `Invalid email address` → Sjekk at e-postadressen er gyldig

#### Problem: Status = 'pending' men ingen e-post
**Løsning:**
- E-posten kan være i spam-mappen
- Sjekk at Resend faktisk sendte e-posten (sjekk Resend dashboard)
- Sjekk at `provider_id` er satt i `email_log` (betyr at Resend aksepterte e-posten)

#### Problem: API-routen blir ikke kalt
**Løsning:**
- Sjekk at booking opprettes fra browser (ikke server-side)
- Sjekk at `customer_email` faktisk er satt i booking input
- Sjekk browser console for JavaScript-feil

### 7. Debug logging i koden

Alle viktige steg logger nå til console:
- `[INFO] send-notifications API route called`
- `[INFO] Attempting to send booking confirmation email`
- `[INFO] Email sending result`
- `[INFO] Preparing to send email via Resend`
- `[WARN] Resend client is null` (hvis API key mangler)

Sjekk server logs (terminal hvor `npm run dev` kjører) for disse meldingene.

