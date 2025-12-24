# Sentry Setup Guide

Steg-for-steg guide for å sette opp Sentry error tracking i TeqBook.

---

## Steg 1: Opprett Sentry-konto

1. Gå til [https://sentry.io](https://sentry.io)
2. Klikk på **"Get Started"** eller **"Sign Up"**
3. Velg en av følgende metoder for å registrere deg:
   - **GitHub** (anbefalt - raskest)
   - **Google**
   - **Email** (opprett konto med email/password)

---

## Steg 2: Opprett et nytt prosjekt

1. Etter innlogging, klikk på **"Create Project"** eller **"Projects"** → **"Create Project"**
2. Velg plattform:
   - Søk etter eller velg **"Next.js"**
   - Klikk på **"Next.js"** kortet
3. Konfigurer prosjektet:
   - **Project Name**: `teqbook` (eller hva du foretrekker)
   - **Team**: Velg ditt team (eller opprett nytt)
   - **Platform**: Next.js (skal være valgt automatisk)
4. Klikk **"Create Project"**

---

## Steg 3: Finn DSN (Data Source Name)

Etter at prosjektet er opprettet, vil Sentry vise deg en konfigurasjonsside. DSN finner du på flere måter:

### Metode 1: Fra konfigurasjonssiden (første gang)

1. På konfigurasjonssiden ser du en kodeblokk som starter med:
   ```javascript
   Sentry.init({
     dsn: "https://xxxxx@xxxxx.ingest.sentry.io/xxxxx",
   ```
2. DSN-en er verdien i `dsn`-feltet
3. Kopier hele DSN-strengen (inkludert `https://`)

### Metode 2: Fra Project Settings

1. Gå til **"Projects"** i venstre sidebar
2. Klikk på ditt prosjekt (`teqbook`)
3. Gå til **"Settings"** → **"Projects"** → **"Client Keys (DSN)"**
4. Du vil se en liste over DSN-er
5. Kopier **"DSN"**-verdien (den som starter med `https://`)

### Metode 3: Fra Project Overview

1. Gå til ditt prosjekt
2. I **"Project Settings"** (øverst til høyre), klikk på **"Settings"**
3. I venstre meny, klikk på **"Client Keys (DSN)"**
4. Kopier DSN-verdien

---

## Steg 4: DSN-format

DSN-en ser ut som dette:
```
https://[PUBLIC_KEY]@[ORGANIZATION_ID].ingest.sentry.io/[PROJECT_ID]
```

Eksempel:
```
https://abc123def456@123456.ingest.sentry.io/789012
```

**Viktig**: 
- DSN-en er **offentlig** og kan brukes i frontend-kode
- Den er designet for å være trygg å eksponere i browser
- Den gir kun tilgang til å sende events til Sentry, ikke lese data

---

## Steg 5: Legg til DSN i Environment Variables

### Development (.env.local)

1. Opprett eller åpne filen `web/.env.local` i prosjektet ditt
2. Legg til følgende linjer:

```bash
# Sentry Error Tracking
NEXT_PUBLIC_SENTRY_DSN=https://[din-dsn-her]@[org-id].ingest.sentry.io/[project-id]
SENTRY_DSN=https://[din-dsn-her]@[org-id].ingest.sentry.io/[project-id]
```

**Eksempel**:
```bash
# Sentry Error Tracking
NEXT_PUBLIC_SENTRY_DSN=https://abc123def456@123456.ingest.sentry.io/789012
SENTRY_DSN=https://abc123def456@123456.ingest.sentry.io/789012
```

3. Lagre filen

### Production (Vercel)

1. Gå til [Vercel Dashboard](https://vercel.com/dashboard)
2. Velg ditt TeqBook-prosjekt
3. Gå til **"Settings"** → **"Environment Variables"**
4. Legg til følgende variabler:

**For Production**:
- **Name**: `NEXT_PUBLIC_SENTRY_DSN`
- **Value**: `https://[din-dsn-her]@[org-id].ingest.sentry.io/[project-id]`
- **Environment**: Production (og Preview hvis ønskelig)

- **Name**: `SENTRY_DSN`
- **Value**: `https://[din-dsn-her]@[org-id].ingest.sentry.io/[project-id]`
- **Environment**: Production (og Preview hvis ønskelig)

5. Klikk **"Save"**

**For Preview/Development** (valgfritt):
- Du kan legge til samme variabler for Preview og Development environments

---

## Steg 6: Verifiser at Sentry fungerer

### Test i Development

1. Start development server:
   ```bash
   cd web
   npm run dev
   ```

2. Åpne applikasjonen i browser
3. Åpne browser console (F12)
4. Du skal se Sentry initialisert (ingen feilmeldinger)

### Test Error Tracking

1. Gå til en side i applikasjonen
2. Åpne browser console
3. Kjør denne kommandoen for å teste:
   ```javascript
   // Test Sentry error tracking
   import('@sentry/nextjs').then(Sentry => {
     Sentry.captureException(new Error('Test error from TeqBook'));
   });
   ```

4. Gå tilbake til Sentry Dashboard
5. Du skal se en ny error i **"Issues"**-seksjonen
6. Klikk på error-en for å se detaljer

### Test Security Event Logging

1. Prøv å logge inn med feil passord flere ganger
2. Gå til Sentry Dashboard
3. I **"Issues"**, søk etter "Security Event"
4. Du skal se security events logget

---

## Steg 7: Konfigurer Sentry (Valgfritt)

### Alert Rules

1. Gå til **"Alerts"** i Sentry
2. Klikk **"Create Alert Rule"**
3. Konfigurer alerts for:
   - **New Issues**: Få varsel når nye errors oppstår
   - **High Volume**: Få varsel når error rate er høy
   - **Security Events**: Få varsel på security events

### Integrasjoner

1. Gå til **"Settings"** → **"Integrations"**
2. Legg til integrasjoner du trenger:
   - **Slack**: Få varsler i Slack
   - **Email**: Få varsler på email
   - **Discord**: Få varsler i Discord

### Release Tracking

1. Gå til **"Releases"** i Sentry
2. Konfigurer release tracking for å se hvilken versjon som har errors
3. Dette hjelper med å identifisere når errors ble introdusert

---

## Troubleshooting

### Sentry vises ikke i Issues

1. Sjekk at DSN er riktig i `.env.local`
2. Sjekk at `NEXT_PUBLIC_SENTRY_DSN` starter med `https://`
3. Restart development server etter å ha lagt til environment variables
4. Sjekk browser console for feilmeldinger

### Errors sendes ikke til Sentry

1. Sjekk at Sentry er konfigurert i `sentry.client.config.ts`
2. Sjekk at logger service bruker Sentry riktig
3. Sjekk at du er i production mode (Sentry sender kun i production per default)
4. For å teste i development, endre `logger.ts` til å sende også i development

### DSN ikke funnet

1. Sjekk at du er logget inn på riktig Sentry-konto
2. Sjekk at du har tilgang til prosjektet
3. Sjekk at prosjektet er aktivt (ikke slettet)
4. Prøv å opprette et nytt prosjekt hvis problemet vedvarer

---

## Neste Steg

Etter at Sentry er satt opp:

1. **Monitor Errors**: Sjekk Sentry Dashboard regelmessig for nye errors
2. **Fix Critical Issues**: Prioriter å fikse kritiske errors
3. **Set Up Alerts**: Konfigurer alerts for viktige errors
4. **Review Security Events**: Gå gjennom security events regelmessig

---

## Ytterligere Ressurser

- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Dashboard](https://sentry.io/organizations/)
- [Sentry Best Practices](https://docs.sentry.io/product/best-practices/)

---

**Sist oppdatert**: 2025-01-XX
**Versjon**: 1.0

