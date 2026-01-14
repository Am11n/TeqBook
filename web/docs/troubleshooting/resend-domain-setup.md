# Resend Domain Setup Guide

## Situasjon

Koden bruker `teqbook.app` som standard, men du har lagt til `teqbook.com` i Resend.

## Løsning: Velg ett domene

Du har to alternativer:

### Alternativ 1: Bruk teqbook.com (anbefalt hvis du eier domenet)

1. **Endre `.env.local`:**
   ```bash
   EMAIL_FROM=noreply@teqbook.com
   EMAIL_FROM_NAME=TeqBook
   ```

2. **Verifiser `teqbook.com` i Resend:**
   - Gå til https://resend.com/domains
   - Klikk på `teqbook.com`
   - Følg instruksjonene for å legge til DNS records
   - Vanlige DNS records som trengs:
     - **SPF record**: `v=spf1 include:resend.com ~all`
     - **DKIM record**: (Resend gir deg denne)
     - **DMARC record**: `v=DMARC1; p=none; rua=mailto:dmarc@teqbook.com`

3. **Vent til domenet er verifisert** (kan ta noen minutter til timer)

4. **Restart Next.js serveren:**
   ```bash
   # Stopp serveren (Ctrl+C)
   npm run dev
   ```

### Alternativ 2: Legg til teqbook.app i Resend

1. **Gå til https://resend.com/domains**
2. **Klikk "Add Domain"**
3. **Legg til `teqbook.app`**
4. **Følg instruksjonene for å verifisere domenet** (DNS records)
5. **Vent til domenet er verifisert**

## Hvordan verifisere et domene i Resend

1. **Gå til https://resend.com/domains**
2. **Klikk på domenet du vil verifisere**
3. **Du vil se en liste med DNS records som må legges til:**
   - SPF record
   - DKIM records (flere)
   - DMARC record (valgfritt, men anbefalt)

4. **Legg til DNS records i ditt domene-register:**
   - Logg inn på ditt domene-register (f.eks. Namecheap, GoDaddy, Cloudflare)
   - Gå til DNS settings
   - Legg til hver record som Resend viser
   - **Viktig:** Kopier records nøyaktig som Resend viser dem

5. **Vent på verifisering:**
   - Resend sjekker automatisk om records er lagt til
   - Dette kan ta fra noen minutter til noen timer
   - Du kan klikke "Verify" for å sjekke status

6. **Når domenet er verifisert:**
   - Status endres til "Verified" (grønn)
   - Du kan nå sende e-poster fra dette domenet

## Test etter verifisering

1. **Restart Next.js serveren** (hvis du endret `.env.local`)
2. **Opprett en booking** med en e-postadresse
3. **Sjekk terminalen** - du skal se:
   ```
   [INFO] Email sending result { emailSuccess: true, ... }
   ```
4. **Sjekk Resend dashboard** - gå til https://resend.com/emails
   - Du skal se e-posten i listen
   - Status skal være "Delivered"

## Hvis verifisering feiler

1. **Sjekk at DNS records er lagt til riktig:**
   - Bruk `dig` eller `nslookup` for å sjekke records
   - F.eks.: `dig teqbook.com TXT`

2. **Vent lenger:**
   - DNS records kan ta opptil 48 timer å propagere
   - Prøv å verifisere igjen etter noen timer

3. **Kontakt Resend support:**
   - Hvis problemet vedvarer, kontakt Resend support

## Rask test (utvikling)

Hvis du ikke vil vente på verifisering, kan du bruke Resend's test-domene:

```bash
# I .env.local
EMAIL_FROM=onboarding@resend.dev
EMAIL_FROM_NAME=TeqBook
```

**Merk:** Med test-domene kan du kun sende til e-postadresser du har lagt til i Resend dashboard (Settings → API Keys → Test Email Addresses).

