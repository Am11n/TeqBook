# TeqBook Security Overview

Dette dokumentet beskriver sikkerhetsarkitekturen, implementasjoner og best practices for TeqBook.

---

## Innholdsfortegnelse

1. [Sikkerhetsarkitektur](#sikkerhetsarkitektur)
2. [Authentication & Authorization](#authentication--authorization)
3. [Data Protection](#data-protection)
4. [Input Validation & Sanitization](#input-validation--sanitization)
5. [API Security](#api-security)
6. [Frontend Security](#frontend-security)
7. [Environment Variables & Secrets](#environment-variables--secrets)
8. [Error Handling & Logging](#error-handling--logging)
9. [GDPR & Compliance](#gdpr--compliance)
10. [Security Best Practices](#security-best-practices)
11. [Identifiserte Forbedringer](#identifiserte-forbedringer)
12. [Implementerte Funksjoner](./implemented-features.md) - Detaljert oversikt over implementerte sikkerhetsfunksjoner
13. [Sentry Setup Guide](./sentry-setup-guide.md) - Steg-for-steg guide for å sette opp Sentry error tracking

---

## Sikkerhetsarkitektur

### Multi-Layer Security Model

TeqBook bruker en **defense-in-depth** tilnærming med flere sikkerhetslag:

```
┌─────────────────────────────────────────┐
│  Frontend (Next.js)                     │
│  - Client-side validation                │
│  - Route protection                     │
│  - XSS protection                       │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Service Layer                          │
│  - Business logic validation            │
│  - Feature flags                        │
│  - Role-based access control            │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Repository Layer                       │
│  - Input sanitization                   │
│  - Query parameterization               │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Database (Supabase PostgreSQL)         │
│  - Row Level Security (RLS)             │
│  - Foreign key constraints              │
│  - Triggers for data integrity          │
└─────────────────────────────────────────┘
```

### Key Security Components

1. **Supabase Auth** - Håndterer autentisering og session management
2. **Row Level Security (RLS)** - Database-nivå isolasjon for multi-tenant data
3. **Service Layer Validation** - Business logic og input validation
4. **Frontend Route Protection** - Client-side redirect for uautentiserte brukere
5. **Edge Functions** - Sikker server-side prosessering for sensitive operasjoner

---

## Authentication & Authorization

### Authentication

#### Implementasjon

- **Provider**: Supabase Auth
- **Metode**: Email/password authentication
- **Session Management**: Automatisk håndtert av Supabase med JWT tokens
- **Password Policy**: Minimum 6 tegn (se [Forbedringer](#identifiserte-forbedringer))

#### Autentiseringsflyt

```typescript
// 1. User logs in via auth-service.ts
signInWithPassword(email, password)
  ↓
// 2. Supabase validates credentials
  ↓
// 3. JWT token issued and stored in browser
  ↓
// 4. SalonProvider checks authentication status
getCurrentUser() → auth.uid()
  ↓
// 5. Profile loaded with salon_id and role
getProfileForUser(userId)
  ↓
// 6. User redirected to appropriate dashboard
```

#### Beskyttede Ruter

Alle dashboard-ruter krever autentisering:
- `/dashboard`
- `/calendar`
- `/bookings`
- `/customers`
- `/employees`
- `/services`
- `/settings/*`
- `/admin/*` (krever superadmin)

**Implementasjon**: Se `web/src/components/layout/dashboard-shell.tsx` og `web/src/app/calendar/page.tsx` for redirect-logikk.

### Authorization

#### Role-Based Access Control (RBAC)

TeqBook bruker en hierarkisk rollemodell:

```
superadmin > owner > manager > staff
```

**Rolle-definerte rettigheter**:
- **superadmin**: Full tilgang til alle saloner og systeminnstillinger
- **owner**: Full tilgang til sin salon, inkludert billing og settings
- **manager**: Kan administrere bookings, employees, services, men ikke billing
- **staff**: Kan kun se og opprette bookings, ikke administrere

**Implementasjon**: Se `web/src/lib/utils/access-control.ts`

#### Feature-Based Access Control

I tillegg til roller, sjekkes også plan-baserte features:
- Starter plan: Grunnleggende features
- Pro plan: Starter + avanserte features
- Business plan: Alle features

**Implementasjon**: Se `web/src/lib/services/feature-flags-service.ts` og `web/src/lib/hooks/use-features.ts`

#### Multi-Tenant Isolation

**Row Level Security (RLS)** sikrer at brukere kun kan se data for sin egen salon:

```sql
-- Eksempel RLS policy
CREATE POLICY "Users can view data for their salon"
  ON bookings FOR SELECT
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );
```

**Dokumentasjon**: Se `web/docs/backend/rls-strategy.md`

---

## Data Protection

### Row Level Security (RLS)

Alle tenant-tabeller er beskyttet med RLS policies som:
- Filtrerer data basert på `salon_id`
- Bruker `auth.uid()` for å identifisere autentiserte brukere
- Forhindrer cross-tenant data access
- Gir superadmins full tilgang (for support/admin)

**Aktiverte tabeller**:
- `bookings`
- `employees`
- `customers`
- `services`
- `shifts`
- `products`
- `addons`
- `opening_hours`
- `profiles`
- `salons`

**Verifisering**:
```sql
-- Sjekk at RLS er aktivert
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;
```

### Data Encryption

- **In Transit**: HTTPS/TLS (håndtert av Vercel og Supabase)
- **At Rest**: Supabase bruker PostgreSQL encryption
- **Sensitive Fields**: Passwords hashes av Supabase Auth (bcrypt)

### Foreign Key Constraints

Alle relasjoner bruker `ON DELETE CASCADE` for å sikre data integritet:

```sql
ALTER TABLE bookings
ADD CONSTRAINT bookings_salon_id_fkey
FOREIGN KEY (salon_id)
REFERENCES salons(id)
ON DELETE CASCADE;
```

Dette forhindrer:
- Orphaned records
- Data inconsistency
- Uautoriserte slettinger

### Database Triggers

Triggers sikrer business rules:
- **Prevent orphaned salons**: En salon må alltid ha minst én owner
- **Updated_at timestamps**: Automatisk oppdatering av `updated_at` kolonner

**Dokumentasjon**: Se `web/docs/backend/data-integrity-and-triggers.md`

---

## Input Validation & Sanitization

### Client-Side Validation

Alle skjemaer validerer input før sending:

```typescript
// Eksempel fra auth-service.ts
if (!email || !password) {
  return { data: null, error: "Email and password are required" };
}

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  return { data: null, error: "Invalid email format" };
}
```

### Service Layer Validation

Business logic layer validerer alle inputs:

**Valideringsmoduler**:
- `web/src/lib/validation/bookings.ts`
- `web/src/lib/validation/customers.ts`
- `web/src/lib/validation/employees.ts`
- `web/src/lib/validation/services.ts`

**Eksempel**:
```typescript
export function validateCreateBooking(input: CreateBookingInput) {
  if (!input.salon_id || input.salon_id.trim().length === 0) {
    return { valid: false, error: "Salon ID is required" };
  }
  // ... flere valideringer
}
```

### SQL Injection Protection

- **Parameterized Queries**: Supabase client bruker parameterized queries automatisk
- **No Raw SQL**: Ingen raw SQL queries i kodebasen (unntatt migrations)
- **Type Safety**: TypeScript types forhindrer type-mismatch

**Eksempel**:
```typescript
// Sikker - Supabase håndterer parameterisering
const { data } = await supabase
  .from("bookings")
  .select("*")
  .eq("salon_id", salonId); // Automatisk parameterisert
```

### XSS Protection

- **React Escaping**: React escaper automatisk alle verdier i JSX
- **No `dangerouslySetInnerHTML`**: Ingen bruk av `dangerouslySetInnerHTML` i kodebasen
- **Content Security Policy**: Se [Forbedringer](#identifiserte-forbedringer)

---

## API Security

### Edge Functions

Supabase Edge Functions brukes for sensitive operasjoner:

**Aktuelle Edge Functions**:
- `whatsapp-send`: Sender WhatsApp meldinger (krever autentisering)
- `billing-update-plan`: Oppdaterer Stripe subscriptions (krever autentisering)

**Sikkerhetsimplementasjon**:
```typescript
// Authenticate request
const { user, error: authError } = await authenticateRequest(
  req,
  supabaseUrl,
  supabaseAnonKey
);

if (authError || !user) {
  return new Response(
    JSON.stringify({ error: "Unauthorized" }),
    { status: 401, headers: corsHeaders }
  );
}
```

**Dokumentasjon**: Se `web/supabase/functions/_shared/auth.ts`

### CORS Policy

Edge Functions har CORS headers konfigurert:
```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
```

**Note**: I produksjon bør `Access-Control-Allow-Origin` være mer restriktiv.

### Rate Limiting

**Status**: Ikke implementert (se [Forbedringer](#identifiserte-forbedringer))

---

## Frontend Security

### Route Protection

Beskyttede ruter redirecter uautentiserte brukere:

```typescript
// dashboard-shell.tsx
useEffect(() => {
  if (!mounted || loading) return;
  
  const publicRoutes = ["/", "/login", "/signup", "/onboarding", "/landing"];
  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith("/book/");
  
  if (!isPublicRoute && (!user || !isReady)) {
    router.replace("/login");
  }
}, [mounted, loading, user, isReady, pathname, router]);
```

### Environment Variables

**Public Variables** (eksponert i browser):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_APP_URL`

**Private Variables** (kun server-side):
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`

**Best Practice**: Kun `NEXT_PUBLIC_*` variabler er tilgjengelige i browser. Alle secrets er server-side only.

### Error Handling

- **Generic Error Messages**: Ingen sensitive data i error messages
- **Error Boundaries**: React Error Boundaries fanger runtime errors
- **Logging**: Errors logges til console (se [Forbedringer](#identifiserte-forbedringer))

**Eksempel**:
```typescript
// Ikke eksponer sensitive data
catch (err) {
  return {
    data: null,
    error: "An error occurred. Please try again.",
  };
}
```

---

## Environment Variables & Secrets

### Variable Management

**Development**:
- `.env.local` (ikke committet til Git)
- `.env.example` (template for nye utviklere)

**Production**:
- Vercel Environment Variables (konfigurert i Vercel Dashboard)
- Supabase Secrets (for Edge Functions)

### Secret Rotation

**Anbefalinger**:
- Roter secrets minst hver 90. dag
- Bruk separate secrets for dev/staging/prod
- Logg alle secret rotations

### Secret Exposure Prevention

- ✅ `.env.local` i `.gitignore`
- ✅ `.env.example` inneholder kun placeholder verdier
- ✅ Ingen secrets i kode eller commits
- ⚠️ Review alle PRs for secret exposure

---

## Error Handling & Logging

### Error Messages

**Prinsipper**:
- Generiske feilmeldinger for brukere
- Ingen stack traces i produksjon
- Ingen sensitive data i error messages

**Eksempel**:
```typescript
// ❌ Dårlig
return { error: `Database error: ${err.message} - User: ${userId}` };

// ✅ Bra
return { error: "An error occurred. Please try again." };
```

### Logging

**Nåværende Implementasjon**:
- `console.error()` for development
- Ingen strukturert logging i produksjon

**Anbefalinger** (se [Forbedringer](#identifiserte-forbedringer)):
- Implementer strukturert logging (Winston, Pino)
- Send logs til sentralisert service (Sentry, LogRocket)
- Logg security events (failed logins, unauthorized access attempts)

---

## GDPR & Compliance

### Data Minimization

- Kun nødvendig data samles inn
- GDPR consent kreves for kunder
- Data slettes når ikke lenger nødvendig

**Implementasjon**: Se `web/docs/compliance/data-lifecycle.md`

### Right to Access & Deletion

**Implementasjon**:
- Kunder kan be om å se sine data
- Kunder kan be om sletting (anonymisering)
- Saloner kan eksportere data (CSV export)

**Status**: Delvis implementert (se [Forbedringer](#identifiserte-forbedringer))

### Data Retention

- **Bookings**: Beholdes så lenge salonen er aktiv
- **Customers**: Beholdes så lenge salonen er aktiv
- **Deleted Salons**: Data slettes via `ON DELETE CASCADE`

---

## Security Best Practices

### Development

1. **Code Review**: All code må gjennomgås før merge
2. **Dependency Updates**: Hold dependencies oppdatert
3. **Security Scanning**: Bruk `npm audit` regelmessig
4. **Type Safety**: Bruk TypeScript for type safety

### Deployment

1. **HTTPS Only**: All trafikk må være HTTPS
2. **Security Headers**: Se [Forbedringer](#identifiserte-forbedringer)
3. **Environment Separation**: Separate environments for dev/staging/prod
4. **Backup Strategy**: Regelmessige backups av database

### Monitoring

1. **Failed Login Attempts**: Monitor for brute force attacks
2. **Unusual Activity**: Alert på uvanlig access patterns
3. **Error Rates**: Monitor error rates for potensielle angrep

---

## Identifiserte Forbedringer

### ✅ Implementert

1. **Strammere Password Policy**
   - Minimum 8 tegn, minst én stor bokstav, ett tall, ett spesialtegn
   - **Status**: ✅ Implementert

2. **Content Security Policy (CSP)**
   - CSP headers lagt til i `next.config.ts`
   - Forhindrer XSS angrep
   - **Status**: ✅ Implementert

3. **Rate Limiting**
   - Client-side rate limiting for login-endepunkter
   - Maksimalt 5 forsøk per 15 minutter, 30 minutter blokkering
   - **Status**: ✅ Implementert (se [Implemented Features](./implemented-features.md))

4. **Strukturert Logging**
   - Logger service med Sentry-integrasjon
   - Security event logging
   - **Status**: ✅ Implementert (se [Implemented Features](./implemented-features.md))

5. **Security Headers**
   - HSTS, X-Frame-Options, X-Content-Type-Options, CSP, etc.
   - **Status**: ✅ Implementert

6. **Two-Factor Authentication (2FA)**
   - TOTP-basert 2FA via Supabase Auth
   - Full implementasjon med enrollment og login flow
   - **Status**: ✅ Implementert (se [Implemented Features](./implemented-features.md))

7. **Session Management**
   - Session timeout med automatisk logout
   - Warning dialog før timeout
   - Activity tracking
   - **Status**: ✅ Implementert (se [Implemented Features](./implemented-features.md))

8. **API Rate Limiting**
   - Rate limiting for alle API-endepunkter
   - **Status**: 📋 Planlagt

9. **Input Sanitization Library**
   - Bruk et dedikert sanitization library (DOMPurify)
   - **Status**: 📋 Planlagt

10. **Security Audit Logging**
    - Logg alle sensitive operasjoner (slettinger, plan-endringer)
    - **Status**: 📋 Planlagt

### Lav Prioritet

11. **Penetration Testing**
    - Gjennomfør regelmessig penetration testing
    - **Status**: 📋 Planlagt

12. **Dependency Scanning**
    - Automatisk scanning av dependencies for vulnerabilities
    - **Status**: 📋 Planlagt

---

## Security Checklist

### Pre-Deployment

- [ ] Alle secrets er konfigurert i Vercel
- [ ] RLS policies er aktivert på alle tabeller
- [ ] Environment variables er sjekket
- [ ] Security headers er konfigurert
- [ ] Error handling er testet
- [ ] Input validation er testet
- [ ] Authentication flow er testet

### Post-Deployment

- [ ] Monitor error logs
- [ ] Sjekk for failed login attempts
- [ ] Verifiser HTTPS er aktivert
- [ ] Test authentication flow
- [ ] Test authorization (role-based access)

---

## Kontakt

For spørsmål om sikkerhet, kontakt utviklingsteamet eller se:
- `web/docs/backend/rls-strategy.md` - RLS dokumentasjon
- `web/docs/compliance/data-lifecycle.md` - GDPR compliance
- `web/docs/backend/data-integrity-and-triggers.md` - Data integrity

---

**Sist oppdatert**: 2025-01-XX
**Versjon**: 1.0

