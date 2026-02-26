# Implementerte Sikkerhetsfunksjoner

Dette dokumentet beskriver de sikkerhetsfunksjonene som er implementert i TeqBook.

---

## ✅ Implementerte Funksjoner

### 1. Rate Limiting (Login + API + Edge)

**Status**: ✅ Implementert

**Implementasjon**:
- Policy-matrise i `packages/shared-core/src/rate-limit/policy.ts`
- Server wrapper i `packages/shared/src/services/rate-limit/server.ts`
- Edge håndheving i `supabase/supabase/functions/rate-limit-check/index.ts`
- Edge shared middleware i `supabase/supabase/functions/_shared/rate-limit.ts`
- Integrert i public login + public booking flyt + utvalgte API-ruter i `apps/*/src/app/api/*`

**Funksjonalitet**:
- Sporer forsøk per `identifier` + `identifier_type` + `endpoint_type`
- Returnerer konsistente `429` med `X-RateLimit-*` og `Retry-After`
- Hybrid failure policy:
  - **Fail-closed** for sensitive endepunkter (auth, billing, impersonation, mutations)
  - **Fail-open** kun for lav-risiko public-read (`public-booking-data`)
- Client-side fallback brukes kun når endpoint-policy tillater det

---

### 2. Strukturert Logging med Sentry

**Status**: ✅ Implementert

**Implementasjon**:
- Logger service i `apps/dashboard/src/lib/services/logger.ts`
- Sentry konfigurert for client, server og edge
- Automatisk error tracking
- Security event logging

**Funksjonalitet**:
- `logDebug()` - Debug logging (kun development)
- `logInfo()` - Info logging
- `logWarn()` - Warning logging (sender til Sentry i produksjon)
- `logError()` - Error logging (sender til Sentry i produksjon)
- `logSecurity()` - Security event logging (alltid til Sentry hvis konfigurert)

**Konfigurasjon**:
- `NEXT_PUBLIC_SENTRY_DSN` - Sentry DSN for client-side
- `SENTRY_DSN` - Sentry DSN for server-side
- Konfigurasjonsfiler:
  - `apps/dashboard/sentry.client.config.ts`
  - `apps/dashboard/sentry.server.config.ts`
  - `apps/dashboard/sentry.edge.config.ts`

**Bruk**:
```typescript
import { logSecurity, logError } from "@/lib/services/logger";

// Log security event
logSecurity("Failed login attempt", { email, error });

// Log error
logError("Database error", error, { context });
```

---

### 3. Two-Factor Authentication (2FA)

**Status**: ✅ Implementert

**Implementasjon**:
- 2FA service i `apps/dashboard/src/lib/services/two-factor-service.ts`
- TOTP-basert 2FA via Supabase Auth
- Security settings side: `/settings/security`
- 2FA login side: `/login-2fa`

**Funksjonalitet**:
- **Enable 2FA**: Genererer TOTP secret og QR-kode
- **Verify Enrollment**: Verifiserer TOTP-kode under oppsett
- **Login Flow**: Krever 2FA-kode etter passord-autentisering
- **Disable 2FA**: Mulighet til å deaktivere 2FA

**Flyt**:
1. Bruker logger inn med email/password
2. Hvis 2FA er aktivert, redirecter til `/login-2fa`
3. Bruker skanner QR-kode med authenticator app
4. Bruker oppgir 6-sifret kode
5. Ved vellykket verifisering, redirecter til dashboard

**Sikkerhet**:
- Alle 2FA-operasjoner logges som security events
- Failed 2FA attempts logges
- TOTP secrets håndteres sikkert av Supabase

---

### 4. Session Timeout Management

**Status**: ✅ Implementert

**Implementasjon**:
- Session service i `apps/dashboard/src/lib/services/session-service.ts`
- `useSessionTimeout` hook i `apps/dashboard/src/hooks/use-session-timeout.ts`
- Integrert i `DashboardShell`

**Funksjonalitet**:
- **Default Timeout**: 30 minutter inaktivitet
- **Extended Timeout**: 7 dager (hvis "Keep me logged in" er valgt)
- **Warning**: Viser advarsel 5 minutter før timeout
- **Auto Logout**: Logger automatisk ut når session utløper
- **Activity Tracking**: Sporer brukeraktivitet (mouse, keyboard, scroll, touch)

**Konfigurasjon**:
```typescript
const SESSION_CONFIG = {
  defaultTimeoutMs: 30 * 60 * 1000,      // 30 minutter
  extendedTimeoutMs: 7 * 24 * 60 * 60 * 1000, // 7 dager
  warningThresholdMs: 5 * 60 * 1000,     // 5 minutter
  checkIntervalMs: 60 * 1000,            // Sjekk hvert minutt
};
```

**Bruk**:
```typescript
const { showWarning, timeRemaining, extendSession, logout } = useSessionTimeout();
```

**UI**:
- Viser dialog med advarsel 5 minutter før timeout
- Bruker kan velge å forlenge session eller logge ut
- Automatisk logout hvis ingen aktivitet

---

## 🔧 Konfigurasjon

### Environment Variables

Legg til følgende i `.env.local` (development) og Vercel (production):

```bash
# Sentry (optional - for error tracking)
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
SENTRY_DSN=your_sentry_dsn_here

# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Sentry Setup

**📖 Se [Sentry Setup Guide](./sentry-setup-guide.md) for detaljert steg-for-steg instruksjoner.**

Kort oppsummert:
1. Opprett et Sentry-prosjekt på [sentry.io](https://sentry.io)
2. Finn DSN fra Project Settings → Client Keys (DSN)
3. Legg til DSN i environment variables (`.env.local` og Vercel)
4. Sentry vil automatisk fange opp errors og security events

---

## 📊 Security Events som Logges

Følgende events logges automatisk:

1. **Failed Login Attempts** - Alle mislykkede login-forsøk
2. **Successful Logins** - Alle vellykkede innlogginger
3. **Rate Limit Blocks** - Når en bruker blir blokkert
4. **2FA Events**:
   - Failed 2FA verifications
   - Successful 2FA verifications
   - 2FA enrollment/disenrollment
5. **Session Timeouts** - Når en session utløper
6. **Error Boundary Errors** - Alle errors fanget av ErrorBoundary

---

## 🧪 Testing

### Test Rate Limiting

1. Prøv å logge inn i public app (`apps/public`) med feil passord 5 ganger
2. Du skal se advarsel om gjenværende forsøk
3. Etter 5 forsøk skal du bli blokkert i 30 minutter

### Test Session Timeout

1. Logg inn på dashboard
2. Vent 25 minutter uten aktivitet
3. Du skal se advarsel om at session snart utløper
4. Hvis du ikke forlenger, logges du ut automatisk

### Test 2FA

1. Gå til `/settings/security`
2. Klikk "Enable 2FA"
3. Skann QR-kode med authenticator app
4. Oppgi 6-sifret kode for å verifisere
5. Logg ut og prøv å logge inn igjen
6. Du skal bli bedt om 2FA-kode etter passord

---

## 📝 Notater

### Rate Limiting

- Server-side håndheving er standard for sensitive endepunkter
- Client fallback brukes policy-styrt og logges som degradert modus
- Se runbook: `docs/security/rate-limiting-operations.md`

### Session Timeout

- Session timeout bruker localStorage, som kan manipuleres
- For produksjon, vurder å bruke server-side session management
- "Keep me logged in" funksjonen utvider timeout til 7 dager

### 2FA

- Supabase Auth håndterer TOTP secrets sikkert
- QR-koder vises kun én gang under oppsett
- Backup codes bør implementeres for fremtidig forbedring

### Logging

- Sentry er valgfritt - applikasjonen fungerer uten det
- Security events logges alltid til console
- I produksjon, send alle security events til Sentry

---

**Sist oppdatert**: 2025-01-XX
**Versjon**: 1.0

