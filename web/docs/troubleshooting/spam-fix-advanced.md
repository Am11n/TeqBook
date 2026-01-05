# Avansert fiksing av spam-problemer

## Hvis e-poster fortsatt havner i spam etter alle grunnleggende fikser

### 1. Test e-post deliverability

**Bruk mail-tester.com - Steg-for-steg guide:**

#### Steg 1: Få din unike test-adresse
1. Gå til https://www.mail-tester.com i browseren
2. Du vil se en unik e-postadresse, f.eks.: `test-abc123@mail-tester.com`
3. **Kopier denne e-postadressen** (den er unik for deg)

#### Steg 2: Send en test-e-post fra TeqBook
1. **Metode 1: Opprett en booking med test-adressen**
   - Gå til TeqBook applikasjonen
   - Opprett en booking
   - Bruk mail-tester adressen som `customer_email`
   - F.eks.: `test-abc123@mail-tester.com`
   - Lagre booking

2. **Metode 2: Send direkte via Resend (hvis du har tilgang)**
   - Gå til Resend dashboard
   - Send en test-e-post til mail-tester adressen

#### Steg 3: Sjekk resultatet
1. Gå tilbake til https://www.mail-tester.com
2. Klikk "Then check your score" (eller vent noen sekunder)
3. Du vil se en score fra 0-10
4. **Mål: 8/10 eller høyere**

#### Steg 4: Forstå resultatet
Mail-tester gir deg en detaljert rapport som viser:

**✅ Autentisering (SPF, DKIM, DMARC):**
- SPF record: Skal være "PASS"
- DKIM signature: Skal være "PASS"
- DMARC policy: Skal være "PASS"
- Hvis noen feiler, må du fikse DNS records

**✅ Blacklist status:**
- Sjekker om domenet er på spam blacklists
- Skal være "Not blacklisted"
- Hvis domenet er på blacklist, må du fjerne det

**✅ E-post innhold:**
- Sjekker for spam-triggers i subject og innhold
- F.eks.: Store bokstaver, for mange utropstegn, spam-ord
- Viser hva som kan forbedres

**✅ HTML kvalitet:**
- Sjekker HTML-strukturen
- Sjekker for manglende tekstversjon
- Sjekker for problemer med bilder/lenker

**✅ Reputation:**
- Sjekker sender reputation
- Sjekker om domenet er nytt (kan påvirke score)

#### Steg 5: Fiks problemene
1. **Hvis autentisering feiler:**
   - Gå til Resend dashboard → Domains
   - Sjekk at alle DNS records er lagt til og verifisert
   - Vent på propagering (kan ta opptil 48 timer)

2. **Hvis domenet er på blacklist:**
   - Gå til https://mxtoolbox.com/SuperTool.aspx
   - Skriv inn `teqbook.com`
   - Sjekk hvilke blacklists domenet er på
   - Følg instruksjonene for å fjerne det

3. **Hvis e-post innhold har problemer:**
   - Se hva mail-tester anbefaler
   - F.eks.: "Subject contains too many capital letters"
   - Fiks problemene i e-post templates

4. **Hvis HTML har problemer:**
   - Sjekk at e-poster har tekstversjon
   - Sjekk at HTML er velformatert
   - Fiks eventuelle problemer

#### Steg 6: Test igjen
1. Fiks problemene
2. Send en ny test-e-post til mail-tester
3. Sjekk score igjen
4. Gjenta til du får 8/10 eller høyere

**Eksempel på god score:**
```
Score: 9/10

✅ SPF: PASS
✅ DKIM: PASS
✅ DMARC: PASS
✅ Blacklist: Not blacklisted
✅ Content: Good (no spam triggers)
✅ HTML: Valid
✅ Reputation: Good
```

**Eksempel på dårlig score:**
```
Score: 4/10

❌ SPF: FAIL (missing SPF record)
❌ DKIM: FAIL (missing DKIM record)
❌ DMARC: FAIL (missing DMARC record)
⚠️ Blacklist: Listed on 1 blacklist
⚠️ Content: Subject contains spam words
⚠️ HTML: Missing text version
```

### 2. Sjekk sender reputation

**Bruk MXToolbox:**
1. Gå til https://mxtoolbox.com/SuperTool.aspx
2. Skriv inn `teqbook.com`
3. Sjekk:
   - **Blacklist status** - Domenet skal ikke være på blacklists
   - **SPF record** - Skal være riktig
   - **DMARC record** - Skal være riktig

### 3. Varm opp e-post adressen (viktig for nye domener)

**Hvis domenet er nytt:**
1. **Start med små volum:**
   - Send til 5-10 e-postadresser første dag
   - Øk gradvis hver dag
   - Maks 50-100 e-poster første uken

2. **Send til engasjerte brukere:**
   - Start med brukere som har interagert med appen
   - Unngå å sende til inaktive e-postadresser
   - Dette bygger "sender reputation"

3. **Monitor bounce rate:**
   - Hold bounce rate under 5%
   - Håndter bounces raskt
   - Fjern ugyldige e-postadresser

### 4. Forbedre DMARC policy

**Gradvis økning:**
1. **Start med `p=none`:**
   ```
   v=DMARC1; p=none; rua=mailto:dmarc@teqbook.com
   ```
   - Dette logger, men blokkerer ikke

2. **Etter 1-2 uker, gå til `p=quarantine`:**
   ```
   v=DMARC1; p=quarantine; rua=mailto:dmarc@teqbook.com
   ```
   - Dette sender e-poster til spam hvis de feiler autentisering

3. **Etter 1 måned, gå til `p=reject`:**
   ```
   v=DMARC1; p=reject; rua=mailto:dmarc@teqbook.com
   ```
   - Dette blokkerer e-poster som feiler autentisering

### 5. Legg til bedre e-post innhold

**Unngå spam-triggers:**
- ❌ Store bokstaver i subject
- ❌ For mange utropstegn (!!!)
- ❌ Ord som "free", "click here", "limited time"
- ❌ For mange lenker
- ❌ For store bilder uten tekst

**Bruk profesjonell tone:**
- ✅ Klar, profesjonell kommunikasjon
- ✅ Personlig tilpasset innhold
- ✅ Balanse mellom tekst og HTML
- ✅ Klar call-to-action

### 6. Sjekk Resend dashboard

**Monitor deliverability:**
1. Gå til https://resend.com/emails
2. Sjekk:
   - **Delivery rate** - Skal være over 95%
   - **Bounce rate** - Skal være under 5%
   - **Spam complaints** - Skal være under 0.1%

**Hvis bounce rate er høy:**
- Sjekk at e-postadresser er gyldige
- Fjern ugyldige e-postadresser
- Implementer double opt-in

### 7. Kontakt Resend support

**Hvis problemet vedvarer:**
1. Kontakt Resend support via dashboard
2. Del:
   - Eksempel på e-post som havner i spam
   - Mail-tester score
   - MXToolbox resultater
   - Bounce rate og delivery stats

### 8. Langsiktige løsninger

**For produksjon:**
1. **Bruk dedikert IP (hvis høy volum):**
   - Resend tilbyr dedikerte IPs
   - Dette gir bedre kontroll over sender reputation

2. **Implementer double opt-in:**
   - Bekreft e-postadresser før sending
   - Dette forbedrer deliverability betydelig

3. **Monitor og optimaliser:**
   - Sjekk deliverability stats ukentlig
   - Juster basert på resultater
   - Hold bounce rate lav

## Quick checklist

- [ ] Testet med mail-tester.com (score 8+/10)
- [ ] Sjekket blacklist status (ikke på blacklists)
- [ ] DMARC policy er satt (start med `p=none`)
- [ ] Sender reputation er bygget opp (varmet opp adressen)
- [ ] Bounce rate er under 5%
- [ ] E-post innhold er profesjonelt (ingen spam-triggers)
- [ ] Resend dashboard viser god deliverability
- [ ] Kontaktet Resend support hvis problemet vedvarer

## Hvis ingenting fungerer

1. **Vent 24-48 timer:**
   - DNS records kan ta tid å propagere
   - Sender reputation bygges opp over tid

2. **Test med flere e-postleverandører:**
   - Gmail
   - Outlook/Hotmail
   - Yahoo
   - Andre leverandører

3. **Merk e-poster som "Not spam":**
   - Dette hjelper e-postleverandøren å lære
   - Gjør dette for hver e-post som havner i spam

4. **Vurder å bruke Resend's test-domene:**
   - `onboarding@resend.dev` fungerer alltid
   - Men kan kun sende til e-postadresser lagt til i Resend dashboard

