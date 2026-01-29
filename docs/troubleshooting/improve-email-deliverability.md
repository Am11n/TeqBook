# Forbedre e-post deliverability (få e-poster i innboksen, ikke spam)

## Problem: E-poster havner i spam

Dette er et vanlig problem når man starter med e-post sending. Her er løsningene:

## 1. Verifiser domenet fullt i Resend (viktigst!)

### Steg-for-steg:

1. **Gå til Resend Dashboard:**
   - https://resend.com/domains
   - Klikk på ditt domene (`teqbook.com`)

2. **Sjekk at alle DNS records er lagt til:**
   - **SPF record** - Må være lagt til
   - **DKIM records** - Må være lagt til (flere records)
   - **DMARC record** - Anbefalt (forbedrer deliverability)

3. **Vent på verifisering:**
   - Resend sjekker automatisk om records er riktig
   - Dette kan ta fra noen minutter til noen timer
   - Status skal være "Verified" (grønn) for alle records

4. **Sjekk DNS records:**
   ```bash
   # Sjekk SPF
   dig teqbook.com TXT | grep spf
   
   # Sjekk DKIM
   dig default._domainkey.teqbook.com TXT
   
   # Sjekk DMARC
   dig _dmarc.teqbook.com TXT
   ```

## 2. Forbedre e-post innhold

### Best practices:

1. **Unngå spam-triggere:**
   - Ikke bruk store bokstaver i subject (f.eks. "URGENT!!!")
   - Unngå for mange utropstegn
   - Unngå ord som "free", "click here", "limited time"
   - Bruk profesjonell tone

2. **Legg til tekstversjon:**
   - E-poster har allerede tekstversjon (automatisk generert fra HTML)
   - Dette forbedrer deliverability

3. **Legg til unsubscribe link:**
   - E-poster har nå "List-Unsubscribe" header
   - Dette forbedrer deliverability betydelig

## 3. Forbedre "From" adresse

### Anbefalinger:

1. **Ikke bruk "noreply":**
   - Endre fra `noreply@teqbook.com` til `support@teqbook.com` eller `booking@teqbook.com`
   - Dette forbedrer deliverability

2. **Legg til i `.env.local`:**
   ```bash
   EMAIL_FROM=support@teqbook.com
   EMAIL_FROM_NAME=TeqBook
   EMAIL_REPLY_TO=support@teqbook.com
   EMAIL_UNSUBSCRIBE=unsubscribe@teqbook.com
   ```

3. **Restart serveren** etter endringer

## 4. Varm opp e-post adressen

### Hvis du sender fra nytt domene:

1. **Start med små volum:**
   - Send til noen få e-postadresser først
   - Øk gradvis

2. **Send til engasjerte brukere:**
   - Start med brukere som har interagert med appen
   - Dette forbedrer "sender reputation"

3. **Unngå å sende til inaktive e-postadresser:**
   - Dette kan skade "sender reputation"

## 5. Sjekk spam score

### Verktøy for å teste:

1. **Mail-tester.com:**
   - Send en test-e-post til `test@mail-tester.com`
   - Få en spam score (mål: 10/10)

2. **Sjekk Resend dashboard:**
   - Gå til https://resend.com/emails
   - Se delivery status og bounce rate

## 6. Hvis e-poster fortsatt havner i spam

### Ytterligere tiltak:

1. **Legg til DMARC policy:**
   ```txt
   v=DMARC1; p=quarantine; rua=mailto:dmarc@teqbook.com
   ```
   - Dette forteller e-postleverandører at domenet er autentisert
   - Start med `p=none`, deretter `p=quarantine`, til slutt `p=reject`

2. **Sjekk sender reputation:**
   - Bruk verktøy som https://mxtoolbox.com/SuperTool.aspx
   - Sjekk om domenet er på blacklists

3. **Kontakt Resend support:**
   - Hvis problemet vedvarer, kontakt Resend support
   - De kan hjelpe med deliverability-problemer

## 7. Test deliverability

### Test etter endringer:

1. **Send test-e-post:**
   - Opprett en booking med din egen e-postadresse
   - Sjekk om e-posten kommer i innboksen

2. **Test med flere e-postleverandører:**
   - Gmail
   - Outlook/Hotmail
   - Yahoo
   - Andre leverandører

3. **Sjekk spam-mappen:**
   - Hvis e-posten fortsatt havner i spam, merk den som "Not spam"
   - Dette hjelper e-postleverandøren å lære at e-postene er legitime

## 8. Langsiktige forbedringer

### For produksjon:

1. **Bruk dedikert IP (hvis høy volum):**
   - Resend tilbyr dedikerte IPs for høy volum
   - Dette gir bedre kontroll over sender reputation

2. **Monitor bounce rate:**
   - Sjekk Resend dashboard regelmessig
   - Håndter bounces raskt

3. **Implementer double opt-in:**
   - Bekreft e-postadresser før sending
   - Dette forbedrer deliverability betydelig

## Quick checklist

- [ ] Domenet er verifisert i Resend (SPF, DKIM, DMARC)
- [ ] "From" adresse er ikke "noreply"
- [ ] E-poster har tekstversjon
- [ ] E-poster har "List-Unsubscribe" header
- [ ] E-poster har "Reply-To" header
- [ ] E-post innhold er profesjonelt (ingen spam-triggers)
- [ ] Testet med mail-tester.com (score 8+/10)
- [ ] Testet med flere e-postleverandører

