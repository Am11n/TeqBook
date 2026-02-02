# Rate Limiting Testing Guide

Denne guiden viser deg hvordan du tester server-side rate limiting implementasjonen.

---

## 1. Unit Tests (Allerede implementert)

Kjør unit tests for rate limiting service:

```bash
cd web
npm run test -- tests/unit/services/rate-limit-service.test.ts
```

**Forventet resultat:** Alle 7 tester skal passere.

---

## 2. Test Edge Function Lokalt

### Forutsetninger

1. Supabase CLI installert og konfigurert
2. Lokal Supabase instans kjørende (hvis du tester lokalt)
3. Environment variables satt opp

### Test Edge Function direkte

#### Via Supabase Dashboard

1. Gå til Supabase Dashboard → Edge Functions
2. Velg `rate-limit-check` funksjonen
3. Gå til **Testing** eller **Invoke** fanen
4. Test med følgende payload:

**Test 1: Check rate limit (første gang)**
```json
{
  "identifier": "test@example.com",
  "identifierType": "email",
  "endpointType": "login",
  "action": "check"
}
```

**Forventet respons:**
```json
{
  "allowed": true,
  "remainingAttempts": 5,
  "resetTime": null,
  "blocked": false
}
```

**Test 2: Increment rate limit**
```json
{
  "identifier": "test@example.com",
  "identifierType": "email",
  "endpointType": "login",
  "action": "increment"
}
```

**Forventet respons (etter første increment):**
```json
{
  "allowed": true,
  "remainingAttempts": 4,
  "resetTime": <timestamp>,
  "blocked": false
}
```

**Test 3: Increment til blocking (5 ganger)**
Kjør increment 5 ganger med samme identifier. Etter 5. increment:

```json
{
  "allowed": false,
  "remainingAttempts": 0,
  "resetTime": <timestamp + 30 minutter>,
  "blocked": true
}
```

**Test 4: Reset rate limit**
```json
{
  "identifier": "test@example.com",
  "identifierType": "email",
  "endpointType": "login",
  "action": "reset"
}
```

**Forventet respons:**
```json
{
  "success": true
}
```

#### Via cURL (fra terminal)

```bash
# Først, få din access token (fra browser console eller Supabase Dashboard)
TOKEN="your-access-token"
SUPABASE_URL="https://your-project.supabase.co"

# Test check
curl -X POST \
  "${SUPABASE_URL}/functions/v1/rate-limit-check" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -d '{
    "identifier": "test@example.com",
    "identifierType": "email",
    "endpointType": "login",
    "action": "check"
  }'

# Test increment
curl -X POST \
  "${SUPABASE_URL}/functions/v1/rate-limit-check" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -d '{
    "identifier": "test@example.com",
    "identifierType": "email",
    "endpointType": "login",
    "action": "increment"
  }'
```

---

## 3. Test i Browser (Login Page)

### Test Scenario 1: Normal Login Flow

1. Gå til `/login` i browseren
2. Prøv å logge inn med feil passord 5 ganger
3. **Forventet:** Etter 5. feil forsøk skal du se:
   - "Too many failed login attempts. Your account has been temporarily blocked."
   - Tid til reset vises
   - Login-knappen er deaktivert

### Test Scenario 2: Rate Limit Reset

1. Vent til rate limit perioden er utløpt (eller reset manuelt i database)
2. Prøv å logge inn igjen
3. **Forventet:** Du kan logge inn igjen

### Test Scenario 3: Successful Login Resets Rate Limit

1. Prøv å logge inn med feil passord 3 ganger
2. Logg inn med riktig passord
3. **Forventet:** Rate limit nullstilles automatisk
4. Logg ut og prøv å logge inn igjen med feil passord
5. **Forventet:** Du har 5 nye forsøk (ikke 2)

### Test Scenario 4: Browser Console Inspection

1. Åpne browser console (F12)
2. Gå til `/login`
3. Prøv å logge inn med feil passord
4. **Sjekk console:**
   - Skal se rate limit check kall til Edge Function
   - Skal se rate limit status i network tab

---

## 4. Test Public Booking Page

### Test Scenario 1: Rate Limiting på Booking

1. Gå til `/book/[salon-slug]`
2. Fyll ut booking formen
3. Submit booking 5 ganger raskt (med feil data eller samme booking)
4. **Forventet:** Etter 5. forsøk skal du se:
   - "Too many booking attempts. Please try again in X minutes."
   - Booking er blokkert

### Test Scenario 2: Rate Limit per Email/IP

1. Test med forskjellige email-adresser
2. **Forventet:** Hver email har sin egen rate limit counter
3. Test fra forskjellige IP-adresser (hvis mulig)
4. **Forventet:** Hver IP har sin egen rate limit counter

---

## 5. Database Verification

### Sjekk Rate Limit Entries

Kjør følgende SQL i Supabase SQL Editor:

```sql
-- Se alle rate limit entries
SELECT * FROM rate_limit_entries 
ORDER BY created_at DESC 
LIMIT 10;

-- Se entries for en spesifikk email
SELECT * FROM rate_limit_entries 
WHERE identifier = 'test@example.com' 
  AND identifier_type = 'email'
  AND endpoint_type = 'login';

-- Se blocked entries
SELECT * FROM rate_limit_entries 
WHERE blocked_until > NOW()
ORDER BY blocked_until DESC;
```

### Manuell Reset (for testing)

```sql
-- Reset rate limit for en email
DELETE FROM rate_limit_entries 
WHERE identifier = 'test@example.com' 
  AND identifier_type = 'email'
  AND endpoint_type = 'login';
```

---

## 6. Integration Test (E2E)

### Opprett E2E test (valgfritt)

Opprett `tests/e2e/rate-limiting.spec.ts` eller tilsvarende under `apps/dashboard/tests/`:

```typescript
import { test, expect } from "@playwright/test";

test("should block login after 5 failed attempts", async ({ page }) => {
  await page.goto("/login");
  
  // Prøv å logge inn med feil passord 5 ganger
  for (let i = 0; i < 5; i++) {
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "wrong-password");
    await page.click('button[type="submit"]');
    
    // Vent på error message
    await page.waitForSelector('text=/Invalid email or password/i');
  }
  
  // Etter 5. forsøk skal rate limit være aktivert
  await expect(page.locator('text=/Too many failed login attempts/i')).toBeVisible();
  await expect(page.locator('text=/temporarily blocked/i')).toBeVisible();
});

test("should reset rate limit after successful login", async ({ page }) => {
  // Først, trigger rate limit
  await page.goto("/login");
  for (let i = 0; i < 3; i++) {
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "wrong-password");
    await page.click('button[type="submit"]');
    await page.waitForSelector('text=/Invalid/i');
  }
  
  // Logg inn med riktig passord
  await page.fill('input[type="email"]', "test@example.com");
  await page.fill('input[type="password"]', "correct-password");
  await page.click('button[type="submit"]');
  
  // Logg ut
  await page.click('text=/Logout/i');
  
  // Prøv å logge inn igjen med feil passord
  await page.goto("/login");
  await page.fill('input[type="email"]', "test@example.com");
  await page.fill('input[type="password"]', "wrong-password");
  await page.click('button[type="submit"]');
  
  // Skal ha 5 nye forsøk (ikke 2)
  await expect(page.locator('text=/Invalid email or password/i')).toBeVisible();
  await expect(page.locator('text=/4 attempt/i')).toBeVisible();
});
```

Kjør E2E test:

```bash
npm run test:e2e -- tests/e2e/rate-limiting.spec.ts
```

---

## 7. Performance Testing

### Test Rate Limit Response Time

```bash
# Test response time for rate limit check
time curl -X POST \
  "${SUPABASE_URL}/functions/v1/rate-limit-check" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -d '{
    "identifier": "test@example.com",
    "action": "check"
  }'
```

**Forventet:** Response time < 200ms

---

## 8. Edge Cases Testing

### Test 1: Concurrent Requests

Test om rate limiting håndterer concurrent requests korrekt:

```bash
# Send 10 concurrent requests
for i in {1..10}; do
  curl -X POST "${SUPABASE_URL}/functions/v1/rate-limit-check" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -H "apikey: ${SUPABASE_ANON_KEY}" \
    -d '{"identifier": "test@example.com", "action": "increment"}' &
done
wait
```

**Forventet:** Rate limit counter skal være korrekt (ikke race conditions)

### Test 2: Window Expiration

1. Trigger rate limit (5 increments)
2. Vent 16 minutter (lengre enn 15 minutter window)
3. Prøv å increment igjen
4. **Forventet:** Window skal være reset, ny window starter

### Test 3: Block Expiration

1. Trigger blocking (5 increments)
2. Vent 31 minutter (lengre enn 30 minutter block duration)
3. Prøv å increment igjen
4. **Forventet:** Block skal være utløpt, ny window starter

---

## 9. Security Testing

### Test 1: Bypass Prevention

1. Prøv å cleare localStorage i browser
2. Prøv å logge inn igjen
3. **Forventet:** Server-side rate limiting skal fortsatt blokkere

### Test 2: Different Identifiers

1. Test med forskjellige emails
2. **Forventet:** Hver email har sin egen rate limit

### Test 3: SQL Injection (Edge Function)

Test om Edge Function er beskyttet mot SQL injection:

```json
{
  "identifier": "test@example.com'; DROP TABLE rate_limit_entries; --",
  "action": "check"
}
```

**Forventet:** Skal håndtere input sikkert (ingen SQL injection)

---

## 10. Monitoring og Logging

### Sjekk Sentry Logs

1. Gå til Sentry Dashboard
2. Sjekk for rate limit events
3. **Forventet:** Rate limit violations skal logges

### Sjekk Database Logs

```sql
-- Se rate limit activity
SELECT 
  identifier,
  endpoint_type,
  attempts,
  blocked_until,
  created_at,
  updated_at
FROM rate_limit_entries
ORDER BY updated_at DESC
LIMIT 20;
```

---

## Troubleshooting

### Problem: Rate limit fungerer ikke

1. **Sjekk:** Er Edge Function deployet?
   ```bash
   supabase functions list
   ```

2. **Sjekk:** Er database migration kjørt?
   ```sql
   SELECT EXISTS (
     SELECT FROM information_schema.tables 
     WHERE table_name = 'rate_limit_entries'
   );
   ```

3. **Sjekk:** Er environment variables satt?
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (i Edge Function secrets)

### Problem: Rate limit blokkerer for lenge

1. **Sjekk:** Er `blocked_until` timestamp korrekt?
2. **Sjekk:** Er system clock synkronisert?

### Problem: Rate limit resetter ikke

1. **Sjekk:** Kjøres `resetRateLimit()` ved successful login?
2. **Sjekk:** Er cleanup function kjørt?
   ```sql
   SELECT cleanup_old_rate_limit_entries();
   ```

---

## Quick Test Checklist

- [ ] Unit tests passerer
- [ ] Edge Function kan invokes fra Dashboard
- [ ] Login page blokkerer etter 5 feil forsøk
- [ ] Rate limit vises i UI
- [ ] Successful login resetter rate limit
- [ ] Public booking page har rate limiting
- [ ] Database entries opprettes korrekt
- [ ] Rate limit resetter etter timeout
- [ ] Concurrent requests håndteres korrekt
- [ ] Client-side bypass forhindres

---

## Neste Steg

Etter testing, vurder:
1. Deploy Edge Function til produksjon
2. Sett opp monitoring/alerts for rate limit violations
3. Dokumenter rate limit policies for brukere
4. Vurder å justere rate limit thresholds basert på testing

