# Hvordan se server logs

## Metode 1: Se logs i terminalen (anbefalt)

1. **Åpne en terminal i Cursor/VS Code:**
   - Trykk `Ctrl + ~` (eller `Cmd + ~` på Mac)
   - Eller: View → Terminal

2. **Naviger til prosjektmappen:**
   ```bash
   cd /Users/aminismail/Documents/GitHub/TeqBook/web
   ```

3. **Start serveren:**
   ```bash
   npm run dev
   ```

4. **La terminalen være åpen** - alle logs vil vises her når du oppretter bookinger.

## Metode 2: Se logs i browser console

Server-side logs (fra API-ruten) vises **ikke** i browser console, men du kan se:
- Client-side logs (fra `bookings-service.ts`)
- Network requests (DevTools → Network → `/api/bookings/send-notifications`)

## Metode 3: Sjekk email_log tabellen direkte

Hvis du ikke kan se logs, sjekk databasen direkte:

1. Gå til Supabase Dashboard → SQL Editor
2. Kjør denne spørringen:
   ```sql
   SELECT 
     recipient_email,
     subject,
     status,
     error_message,
     created_at
   FROM email_log
   WHERE email_type = 'booking_confirmation'
   ORDER BY created_at DESC
   LIMIT 5;
   ```

## Hva skal du se i logs?

Når du oppretter en booking, skal du se:

```
[INFO] 2026-01-05T... [correlation-id] send-notifications API route called { bookingId: '...', customerEmail: '...' }
[INFO] 2026-01-05T... [correlation-id] Attempting to send booking confirmation email { ... }
[INFO] 2026-01-05T... [correlation-id] Preparing to send email via Resend { hasClient: true, hasApiKey: true, ... }
[INFO] 2026-01-05T... [correlation-id] Email sending result { emailSuccess: true, ... }
```

## Hvis du ikke ser noen logs

1. **Sjekk at serveren faktisk kjører:**
   ```bash
   ps aux | grep "next dev" | grep -v grep
   ```

2. **Sjekk at du oppretter booking fra browser** (ikke server-side rendering)

3. **Sjekk at `customer_email` er satt** i booking input

4. **Sjekk browser console** (F12) for JavaScript-feil

5. **Sjekk Network-tab** (F12 → Network) for `/api/bookings/send-notifications` request

## Quick test

Test om API-ruten fungerer direkte:

1. Åpne browser console (F12)
2. Kjør denne koden (erstatt med faktiske verdier):
   ```javascript
   fetch('/api/bookings/send-notifications', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       booking: {
         id: 'test-123',
         start_time: new Date().toISOString(),
         end_time: new Date(Date.now() + 3600000).toISOString(),
         status: 'confirmed',
         customer_full_name: 'Test User',
         service: { name: 'Test Service' },
         employee: { name: 'Test Employee' },
         salon: { name: 'Test Salon' }
       },
       customerEmail: 'din-email@example.com',
       salonId: 'din-salon-id',
       language: 'no'
     })
   })
   .then(r => r.json())
   .then(console.log)
   .catch(console.error);
   ```

3. Sjekk terminalen hvor `npm run dev` kjører - du skal se logs der.

