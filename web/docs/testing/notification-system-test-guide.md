# Notification System Test Guide

Denne guiden forklarer hvordan du tester notification-systemet som ble implementert i Task Groups 6, 7 og 8.

## Oversikt

Notification-systemet består av:
1. **Email Service** - Sending av emails via Resend
2. **Notification Preferences** - Brukerpreferanser for mottak av notifikasjoner
3. **Booking Reminders** - Automatiske påminnelser 24h og 2h før avtale
4. **Email Logging** - Sporing av email-leveranse

## Forutsetninger

1. **Environment Variables** - Sørg for at følgende er satt i `.env.local`:
   ```bash
   RESEND_API_KEY=re_xxxxx  # Resend API key
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=xxxxx
   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
   ```

2. **Database Migrations** - Kjør følgende migrasjoner i Supabase SQL Editor:
   - `20250105000000_create_email_log.sql`
   - `20250105000001_create_reminders.sql`

3. **Edge Function** - Deploy `process-reminders` Edge Function:
   ```bash
   cd web
   supabase functions deploy process-reminders
   ```

## 1. Test Email Service

### 1.1 Test Booking Confirmation Email

**Via UI:**
1. Logg inn som salon-eier
2. Opprett en ny booking med kundens e-postadresse
3. Sjekk at kunden mottar en bekreftelses-e-post

**Via API/Service:**
```typescript
import { sendBookingConfirmation } from "@/lib/services/email-service";

const result = await sendBookingConfirmation({
  booking: {
    id: "booking-123",
    customer_full_name: "John Doe",
    start_time: "2025-01-15T10:00:00Z",
    end_time: "2025-01-15T11:00:00Z",
    service: { name: "Haircut" },
    employee: { name: "Jane Smith" },
    salon: { name: "Test Salon" },
  },
  recipientEmail: "customer@example.com",
  language: "en",
  salonId: "salon-123",
});

console.log(result); // { error: null } hvis vellykket
```

**Sjekk Email Log:**
```sql
SELECT * FROM email_log 
WHERE email_type = 'booking_confirmation' 
ORDER BY created_at DESC 
LIMIT 10;
```

### 1.2 Test Booking Reminder Email

**Via Service:**
```typescript
import { sendBookingReminder } from "@/lib/services/email-service";

const result = await sendBookingReminder({
  booking: {
    id: "booking-123",
    customer_full_name: "John Doe",
    start_time: "2025-01-15T10:00:00Z",
    end_time: "2025-01-15T11:00:00Z",
    service: { name: "Haircut" },
    employee: { name: "Jane Smith" },
    salon: { name: "Test Salon" },
  },
  recipientEmail: "customer@example.com",
  reminderType: "24h", // eller "2h"
  language: "en",
  salonId: "salon-123",
});
```

### 1.3 Test Payment Failure Email

**Via Service:**
```typescript
import { sendPaymentFailure } from "@/lib/services/email-service";

const result = await sendPaymentFailure({
  salonName: "Test Salon",
  recipientEmail: "owner@example.com",
  failureReason: "Card declined",
  language: "en",
});
```

## 2. Test Notification Preferences

### 2.1 Test Preference Checking

**Via Service:**
```typescript
import { shouldSendNotification } from "@/lib/services/notification-service";

// Sjekk om bruker vil motta booking confirmation emails
const shouldSend = await shouldSendNotification({
  userId: "user-123",
  notificationType: "email",
  emailType: "booking_confirmation",
});

console.log(shouldSend); // true eller false
```

### 2.2 Test Preference Updates

**Via Service:**
```typescript
import { updateNotificationPreferences } from "@/lib/services/notification-service";

// Deaktiver booking reminder emails
const result = await updateNotificationPreferences("user-123", {
  email: {
    bookingReminder: false,
  },
});

console.log(result); // { error: null } hvis vellykket
```

### 2.3 Test Preference Retrieval

**Via Service:**
```typescript
import { getNotificationPreferences } from "@/lib/services/notification-service";

const { data, error } = await getNotificationPreferences("user-123");

console.log(data);
// {
//   email: {
//     bookingConfirmation: true,
//     bookingReminder: false,
//     bookingCancellation: true,
//     newBooking: true,
//     paymentFailure: true,
//     paymentRetry: true,
//     accessRestrictionWarning: true,
//   },
//   sms: { ... },
//   whatsapp: { ... },
// }
```

### 2.4 Test via UI (TODO)

Når UI for notification preferences er implementert:
1. Gå til brukerinnstillinger
2. Endre notification preferences
3. Verifiser at endringer lagres
4. Test at emails ikke sendes når preference er deaktivert

## 3. Test Booking Reminder System

### 3.1 Test Reminder Scheduling

**Når booking opprettes:**
1. Opprett en booking med kundens e-postadresse
2. Systemet skal automatisk opprette to reminders:
   - 24h før avtale
   - 2h før avtale

**Sjekk i database:**
```sql
SELECT 
  r.id,
  r.booking_id,
  r.reminder_type,
  r.scheduled_at,
  r.status,
  b.start_time,
  c.email as customer_email
FROM reminders r
JOIN bookings b ON r.booking_id = b.id
JOIN customers c ON b.customer_id = c.id
WHERE r.status = 'pending'
ORDER BY r.scheduled_at ASC;
```

**Via Service:**
```typescript
import { scheduleReminders } from "@/lib/services/reminder-service";

const result = await scheduleReminders({
  bookingId: "booking-123",
  bookingStartTime: "2025-01-15T10:00:00Z",
  salonId: "salon-123",
  timezone: "Europe/Oslo", // eller undefined for UTC
});

console.log(result); // { error: null } hvis vellykket
```

### 3.2 Test Reminder Cancellation

**Når booking kanselleres:**
1. Kanseller en booking
2. Alle pending reminders for den bookingen skal markeres som "cancelled"

**Sjekk i database:**
```sql
SELECT * FROM reminders 
WHERE booking_id = 'booking-123' 
AND status = 'cancelled';
```

**Via Service:**
```typescript
import { cancelReminders } from "@/lib/services/reminder-service";

const result = await cancelReminders("booking-123");

console.log(result); // { error: null } hvis vellykket
```

### 3.3 Test Reminder Processing (Edge Function)

**Manuell test:**
1. Opprett en booking med `start_time` i nær fremtid (f.eks. 1 time fra nå)
2. Opprett reminders manuelt med `scheduled_at` i fortiden:
   ```sql
   INSERT INTO reminders (booking_id, reminder_type, scheduled_at, status)
   VALUES (
     'booking-123',
     '2h',
     NOW() - INTERVAL '1 hour', -- Scheduled in the past
     'pending'
   );
   ```

3. Kall Edge Function manuelt:
   ```bash
   curl -X POST https://xxxxx.supabase.co/functions/v1/process-reminders \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     -H "Content-Type: application/json"
   ```

4. Sjekk at reminder er markert som "sent":
   ```sql
   SELECT * FROM reminders 
   WHERE id = 'reminder-123';
   -- status skal være 'sent'
   -- sent_at skal være satt
   ```

5. Sjekk email_log:
   ```sql
   SELECT * FROM email_log 
   WHERE booking_id = 'booking-123' 
   AND email_type = 'booking_reminder';
   ```

**Automatisk test (Cron Job):**
1. Sett opp en Supabase cron job:
   ```sql
   SELECT cron.schedule(
     'process-reminders',
     '*/15 * * * *', -- Hver 15. minutt
     $$
     SELECT net.http_post(
       url := 'https://xxxxx.supabase.co/functions/v1/process-reminders',
       headers := jsonb_build_object(
         'Content-Type', 'application/json',
         'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
       )
     ) AS request_id;
     $$
   );
   ```

2. Vent 15 minutter og sjekk at reminders er prosessert

## 4. Test Email Logging

### 4.1 Sjekk Email Log Entries

**Alle emails:**
```sql
SELECT 
  id,
  salon_id,
  booking_id,
  recipient_email,
  subject,
  email_type,
  status,
  provider_id,
  error_message,
  created_at,
  updated_at
FROM email_log
ORDER BY created_at DESC
LIMIT 50;
```

**Failed emails:**
```sql
SELECT * FROM email_log 
WHERE status = 'failed'
ORDER BY created_at DESC;
```

**Pending emails:**
```sql
SELECT * FROM email_log 
WHERE status = 'pending'
ORDER BY created_at DESC;
```

### 4.2 Test Email Status Updates

Når en email sendes via Resend:
1. Email log opprettes med status "pending"
2. Når Resend returnerer success, status oppdateres til "sent"
3. Hvis Resend returnerer error, status oppdateres til "failed"

**Sjekk status flow:**
```sql
-- Se alle status endringer for en email
SELECT 
  id,
  status,
  provider_id,
  error_message,
  created_at,
  updated_at
FROM email_log
WHERE id = 'email-log-123'
ORDER BY updated_at DESC;
```

## 5. Test Timezone Handling

### 5.1 Test med forskjellige timezones

**Opprett booking i Oslo timezone:**
```typescript
await scheduleReminders({
  bookingId: "booking-123",
  bookingStartTime: "2025-06-15T14:00:00Z", // 16:00 Oslo tid (sommer)
  salonId: "salon-123",
  timezone: "Europe/Oslo",
});
```

**Sjekk at reminders er riktig schedulert:**
```sql
SELECT 
  r.reminder_type,
  r.scheduled_at,
  b.start_time,
  -- 24h reminder skal være 24 timer før start_time i Oslo tid
  -- 2h reminder skal være 2 timer før start_time i Oslo tid
FROM reminders r
JOIN bookings b ON r.booking_id = b.id
WHERE r.booking_id = 'booking-123';
```

## 6. Test i18n (Internationalization)

### 6.1 Test Email Templates på forskjellige språk

**Test booking confirmation på norsk:**
```typescript
await sendBookingConfirmation({
  booking: { ... },
  recipientEmail: "customer@example.com",
  language: "nb", // Norsk
  salonId: "salon-123",
});
```

**Test booking reminder på arabisk:**
```typescript
await sendBookingReminder({
  booking: { ... },
  recipientEmail: "customer@example.com",
  reminderType: "24h",
  language: "ar", // Arabisk
  salonId: "salon-123",
});
```

**Støttede språk:**
- `en` - English
- `nb` - Norsk
- `ar` - Arabic
- `so` - Somali
- `ti` - Tigrinya
- `am` - Amharic
- `tr` - Turkish
- `pl` - Polish
- `vi` - Vietnamese
- `zh` - Chinese
- `tl` - Tagalog
- `fa` - Persian
- `dar` - Dari
- `ur` - Urdu
- `hi` - Hindi

## 7. Test Error Handling

### 7.1 Test Missing API Key

Hvis `RESEND_API_KEY` ikke er satt:
- Systemet skal ikke krasje
- Email log skal opprettes med status "failed"
- Error message skal lagres i `error_message`

### 7.2 Test Invalid Email Address

```typescript
const result = await sendEmail({
  to: "invalid-email",
  subject: "Test",
  html: "<p>Test</p>",
});

console.log(result.error); // Skal inneholde feilmelding
```

### 7.3 Test Network Errors

Simuler network error ved å deaktivere internett eller endre Resend URL til en ugyldig URL.

## 8. Test Integration med Booking Service

### 8.1 Test Booking Creation Flow

1. Opprett booking med `customer_email`
2. Verifiser at:
   - Booking confirmation email sendes
   - Reminders (24h og 2h) er schedulert
   - Email log entries er opprettet

**Sjekk:**
```sql
-- Booking
SELECT * FROM bookings WHERE id = 'booking-123';

-- Email log
SELECT * FROM email_log WHERE booking_id = 'booking-123';

-- Reminders
SELECT * FROM reminders WHERE booking_id = 'booking-123';
```

### 8.2 Test Booking Cancellation Flow

1. Kanseller en booking
2. Verifiser at:
   - Reminders er markert som "cancelled"
   - Email log viser cancellation (hvis implementert)

## 9. Test Performance

### 9.1 Test Bulk Reminder Processing

1. Opprett 100 bookings med reminders
2. Kjør `processReminders` Edge Function
3. Sjekk at alle reminders prosesseres innen rimelig tid (< 30 sekunder)

### 9.2 Test Database Queries

Sjekk at queries er optimaliserte:
```sql
-- Sjekk indexes
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('reminders', 'email_log');
```

## 10. Test Security

### 10.1 Test RLS Policies

**Test at brukere kun kan se sine egne salon's email logs:**
```sql
-- Som salon1 user
SELECT * FROM email_log; -- Skal kun vise salon1's emails

-- Som salon2 user
SELECT * FROM email_log; -- Skal kun vise salon2's emails
```

**Test at brukere kun kan se sine egne salon's reminders:**
```sql
-- Som salon1 user
SELECT * FROM reminders; -- Skal kun vise salon1's reminders
```

### 10.2 Test Input Validation

Test at systemet validerer:
- Email addresses
- Booking IDs
- User IDs
- Timezone strings

## 11. Test via Unit Tests

Kjør alle unit tests:
```bash
cd web
npm run test
```

**Relevante testfiler:**
- `tests/unit/services/email-service.test.ts`
- `tests/unit/services/notification-service.test.ts`
- `tests/unit/services/reminder-service.test.ts`

## 12. Troubleshooting

### 12.1 Emails sendes ikke

1. Sjekk `RESEND_API_KEY` er satt
2. Sjekk email_log for feilmeldinger:
   ```sql
   SELECT * FROM email_log 
   WHERE status = 'failed' 
   ORDER BY created_at DESC;
   ```
3. Sjekk Resend dashboard for delivery status

### 12.2 Reminders prosesseres ikke

1. Sjekk at Edge Function er deployet:
   ```bash
   supabase functions list
   ```
2. Sjekk Edge Function logs:
   ```bash
   supabase functions logs process-reminders
   ```
3. Sjekk at cron job er aktivert (hvis brukt)

### 12.3 Timezone issues

1. Verifiser at timezone string er gyldig (f.eks. "Europe/Oslo")
2. Sjekk at `date-fns-tz` er installert:
   ```bash
   npm list date-fns-tz
   ```

## 13. Next Steps

Etter testing, vurder å:
1. Implementere UI for notification preferences
2. Legge til SMS og WhatsApp notifications
3. Implementere email templates for flere event types
4. Legge til retry logic for failed emails
5. Implementere email analytics dashboard

## 14. Test Checklist

- [ ] Booking confirmation emails sendes
- [ ] Booking reminder emails sendes (24h og 2h)
- [ ] Payment failure emails sendes
- [ ] Notification preferences fungerer
- [ ] Reminders scheduleres automatisk ved booking creation
- [ ] Reminders kanselleres ved booking cancellation
- [ ] Edge Function prosesserer reminders
- [ ] Email logging fungerer
- [ ] Timezone handling fungerer
- [ ] i18n fungerer for alle støttede språk
- [ ] Error handling fungerer
- [ ] RLS policies fungerer
- [ ] Unit tests passerer

