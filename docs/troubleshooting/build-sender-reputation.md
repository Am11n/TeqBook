# Bygge opp sender reputation (få e-poster i innboksen)

## Situasjon: 10/10 på mail-tester, men e-poster havner fortsatt i spam

Hvis du har **10/10 på mail-tester.com**, betyr det at:
- ✅ SPF, DKIM, DMARC er perfekt konfigurert
- ✅ Ingen blacklists
- ✅ E-post innhold er bra
- ✅ HTML er perfekt

**Men e-poster havner fortsatt i spam?** Dette er et **sender reputation** problem.

## Hva er sender reputation?

E-postleverandører (Gmail, Outlook, etc.) bygger opp "tillit" til nye domener over tid. Selv om alt er teknisk perfekt, kan nye domener fortsatt havne i spam fordi:

1. **Domenet er ukjent** - E-postleverandører kjenner ikke domenet ennå
2. **Ingen historikk** - Ingen tidligere e-poster fra domenet
3. **Lav volum** - Få e-poster sendt fra domenet

## Løsning: Bygg opp sender reputation gradvis

### Steg 1: Start med små volum (viktigst!)

**Første uken:**
- Dag 1-2: Send til 5-10 e-postadresser
- Dag 3-4: Send til 10-20 e-postadresser
- Dag 5-7: Send til 20-50 e-postadresser

**Andre uken:**
- Dag 8-14: Send til 50-100 e-postadresser per dag

**Tredje uken og videre:**
- Gradvis øk til normal volum
- Hold volumet konsistent (ikke store spikes)

### Steg 2: Send til engasjerte brukere

**Prioriter:**
- ✅ Brukere som har interagert med appen nylig
- ✅ Brukere som har bekreftet e-postadressen
- ✅ Brukere som har opprettet bookinger før

**Unngå:**
- ❌ Inaktive brukere (ikke logget inn på lenge)
- ❌ E-postadresser som aldri har interagert med appen
- ❌ E-postadresser som har bouncet før

### Steg 3: Merk e-poster som "Not spam"

**Hver gang en e-post havner i spam:**
1. Åpne spam-mappen
2. Åpne e-posten
3. Merk den som "Not spam" / "Ikke spam"
4. Flytt den til innboksen

**Hvorfor dette hjelper:**
- E-postleverandøren lærer at e-postene er legitime
- Algoritmene bygger opp tillit til domenet
- Over tid vil færre e-poster havne i spam

### Steg 4: Monitor bounce rate

**Hold bounce rate lav:**
- Mål: Under 5% bounce rate
- Hvis bounce rate er høy, sjekk e-postadresser før sending
- Fjern ugyldige e-postadresser raskt

**Sjekk bounce rate i Resend:**
1. Gå til https://resend.com/emails
2. Se bounce rate i dashboard
3. Hvis høy, sjekk hvilke e-postadresser som bouncer

### Steg 5: Vær tålmodig

**Sender reputation bygges opp over tid:**
- Første uken: Mange e-poster kan havne i spam
- Etter 2-3 uker: Færre e-poster havner i spam
- Etter 1 måned: De fleste e-poster kommer i innboksen
- Etter 2-3 måneder: Stort sett alle e-poster kommer i innboksen

**Dette er normalt for nye domener!**

## Quick tips for å bygge opp reputation raskere

### 1. Send til e-postadresser du eier
- Send til din egen Gmail, Outlook, etc.
- Merk e-poster som "Not spam" hver gang
- Dette hjelper algoritmene å lære

### 2. Be brukere om å legge til i kontakter
- I e-postene, be brukere om å legge til `support@teqbook.com` i kontakter
- Dette forbedrer deliverability betydelig

### 3. Send konsistent
- Send e-poster regelmessig (ikke store gaps)
- Dette bygger opp konsistent historikk

### 4. Unngå store spikes
- Ikke send 1000 e-poster på en dag hvis du normalt sender 10
- Dette kan trigge spam-filtre

## Hvis problemet vedvarer etter 1 måned

### 1. Kontakt Resend support
- Del mail-tester score (10/10)
- Del bounce rate og delivery stats
- Spør om hjelp med sender reputation

### 2. Vurder dedikert IP
- Resend tilbyr dedikerte IPs for høy volum
- Dette gir bedre kontroll over sender reputation
- Men krever at du bygger opp reputation på nytt

### 3. Implementer double opt-in
- Bekreft e-postadresser før sending
- Dette forbedrer engagement og deliverability

## Checklist for å bygge opp reputation

- [ ] Start med små volum (5-10 e-poster første dag)
- [ ] Øk gradvis hver dag
- [ ] Send til engasjerte brukere
- [ ] Merk e-poster som "Not spam" hver gang
- [ ] Hold bounce rate under 5%
- [ ] Send konsistent (ikke store gaps)
- [ ] Vær tålmodig (tar 2-4 uker)
- [ ] Monitor stats i Resend dashboard

## Forventet tidslinje

**Uke 1:**
- Mange e-poster havner i spam
- Merk e-poster som "Not spam"
- Start med små volum

**Uke 2-3:**
- Færre e-poster havner i spam
- Fortsett å markere som "Not spam"
- Øk volum gradvis

**Uke 4+:**
- De fleste e-poster kommer i innboksen
- Fortsett å markere som "Not spam" hvis noen havner i spam
- Normal volum kan sendes

## Konklusjon

Siden du har **10/10 på mail-tester**, er alt teknisk perfekt. Problemet er sender reputation, som bygges opp over tid. Vær tålmodig, følg guiden over, og e-poster vil gradvis begynne å komme i innboksen.

**Viktigste handlinger:**
1. Start med små volum
2. Merk e-poster som "Not spam" hver gang
3. Vær tålmodig (tar 2-4 uker)

