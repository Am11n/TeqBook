# Komplett guide: Sett opp Resend med teqbook.com

## Steg 1: Legg til domenet i Resend

1. **Gå til Resend Dashboard:**
   - https://resend.com/domains
   - Logg inn med din nye Resend-bruker

2. **Klikk "Add Domain"**

3. **Skriv inn domenet:**
   - `teqbook.com`
   - Klikk "Add"

4. **Resend vil nå vise deg DNS records som må legges til:**
   - Du vil se en liste med TXT records
   - Disse må legges til i ditt domene-register

## Steg 2: Legg til DNS records i ditt domene-register

Resend trenger følgende DNS records:

### A. SPF Record (TXT)
- **Type:** TXT
- **Name:** `teqbook.com` (eller `@`)
- **Value:** `v=spf1 include:resend.com ~all`
- **TTL:** 3600 (eller standard)

### B. DKIM Records (TXT)
- Resend gir deg 2-3 DKIM records
- **Type:** TXT
- **Name:** F.eks. `resend._domainkey.teqbook.com` (Resend viser deg nøyaktig navn)
- **Value:** Resend gir deg en lang streng (f.eks. `p=MIGfMA0GCSqGSIb3...`)
- **TTL:** 3600

### C. DMARC Record (TXT) - Valgfritt, men anbefalt
- **Type:** TXT
- **Name:** `_dmarc.teqbook.com`
- **Value:** `v=DMARC1; p=none; rua=mailto:dmarc@teqbook.com`
- **TTL:** 3600

## Steg 3: Hvor legger du til DNS records?

Det avhenger av hvor domenet ditt er registrert. Vanlige steder:

### Hvis domenet er hos:
- **Namecheap:** Settings → Advanced DNS
- **GoDaddy:** DNS Management
- **Cloudflare:** DNS → Records
- **Vercel:** (Hvis du bruker Vercel DNS) - Vercel Dashboard → Domains → teqbook.com → DNS

### Eksempel: Legg til TXT record i Namecheap

1. Logg inn på Namecheap
2. Gå til Domain List
3. Klikk "Manage" ved siden av `teqbook.com`
4. Gå til "Advanced DNS" tab
5. Klikk "Add New Record"
6. Velg "TXT Record"
7. Fyll ut:
   - **Host:** `@` (eller `teqbook.com`)
   - **Value:** `v=spf1 include:resend.com ~all`
   - **TTL:** Automatic (eller 3600)
8. Klikk "Save"

Gjenta for hver DNS record som Resend krever.

## Steg 4: Vent på DNS propagering

- DNS records kan ta fra **5 minutter til 48 timer** å propagere
- Vanligvis tar det **15-30 minutter**

## Steg 5: Verifiser domenet i Resend

1. **Gå tilbake til Resend Dashboard:**
   - https://resend.com/domains
   - Klikk på `teqbook.com`

2. **Klikk "Verify"** (eller vent til Resend sjekker automatisk)

3. **Status skal endre seg til "Verified" (grønn)** når alle records er riktig

## Steg 6: Konfigurer .env.local

Sjekk at `.env.local` har riktig konfigurasjon:

```bash
# Resend API Key (fra Resend Dashboard → API Keys)
RESEND_API_KEY=re_xxxxx...

# Email configuration
EMAIL_FROM=noreply@teqbook.com
EMAIL_FROM_NAME=TeqBook
```

## Steg 7: Hent Resend API Key

1. **Gå til Resend Dashboard:**
   - https://resend.com/api-keys

2. **Klikk "Create API Key"**

3. **Gi den et navn:** F.eks. "TeqBook Production"

4. **Kopier API key-en** (du ser den kun én gang!)

5. **Legg den til i `.env.local`:**
   ```bash
   RESEND_API_KEY=re_xxxxx...
   ```

## Steg 8: Test e-post sending

1. **Restart Next.js serveren:**
   ```bash
   # Stopp serveren (Ctrl+C)
   npm run dev
   ```

2. **Opprett en booking** med en e-postadresse

3. **Sjekk terminalen:**
   - Du skal se: `[INFO] Email sending result { emailSuccess: true, ... }`

4. **Sjekk Resend Dashboard:**
   - Gå til https://resend.com/emails
   - Du skal se e-posten i listen
   - Status skal være "Delivered"

5. **Sjekk e-postmappen:**
   - E-posten skal komme frem (sjekk spam hvis ikke)

## Steg 9: Hvis verifisering feiler

### Sjekk at DNS records er lagt til riktig:

1. **Bruk `dig` eller online verktøy:**
   ```bash
   dig teqbook.com TXT
   ```
   Eller bruk: https://mxtoolbox.com/TXTLookup.aspx

2. **Sjekk at alle records vises:**
   - SPF record
   - DKIM records
   - DMARC record (hvis lagt til)

### Vanlige feil:

- **Feil host/name:** Sjekk at host-navnet matcher nøyaktig det Resend viser
- **Feil value:** Kopier value nøyaktig fra Resend (inkludert anførselstegn hvis de er der)
- **DNS ikke propagert:** Vent lenger (opptil 48 timer)

## Steg 10: Test med Resend's test-domene (utvikling)

Hvis du ikke vil vente på verifisering, kan du bruke test-domene:

```bash
# I .env.local
EMAIL_FROM=onboarding@resend.dev
EMAIL_FROM_NAME=TeqBook
```

**Merk:** Med test-domene kan du kun sende til e-postadresser du har lagt til i Resend dashboard (Settings → API Keys → Test Email Addresses).

## Nåværende DNS records (for referanse)

Du har allerede:
- **A record:** `teqbook.com` → `216.198.79.1`
- **CNAME:** `www.teqbook.com` → `7017eca909839e43.vercel-dns-017.com`
- **NS records:** For `vercel.teqbook.com`

Du må legge til:
- **TXT records:** For SPF, DKIM og DMARC (fra Resend)

## Tips

1. **Ikke slett eksisterende DNS records** - legg bare til nye TXT records
2. **Kopier records nøyaktig** fra Resend (inkludert mellomrom og spesialtegn)
3. **Vent på propagering** før du prøver å verifisere
4. **Bruk Resend dashboard** for å se status på verifisering

