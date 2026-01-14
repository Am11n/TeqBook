-- Sjekk email status for nylige bookinger
-- Kjør denne i Supabase SQL Editor for å se om e-poster ble sendt

-- Se alle e-poster sortert etter nyeste først
SELECT 
  id,
  recipient_email,
  subject,
  email_type,
  status,
  error_message,
  provider_id,
  created_at,
  sent_at,
  delivered_at
FROM email_log
ORDER BY created_at DESC
LIMIT 20;

-- Se kun booking confirmation e-poster
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
LIMIT 10;

-- Se kun feilede e-poster
SELECT 
  id,
  recipient_email,
  subject,
  email_type,
  status,
  error_message,
  created_at
FROM email_log
WHERE status = 'failed'
ORDER BY created_at DESC
LIMIT 10;

-- Se e-poster for en spesifikk mottaker
-- Erstatt 'din-email@example.com' med faktisk e-postadresse
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
WHERE recipient_email = 'din-email@example.com'
ORDER BY created_at DESC;

