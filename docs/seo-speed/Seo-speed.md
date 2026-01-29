# SEO og Speed Optimisering - Sjekkliste for TeqBook

**Omfang:** Denne sjekklisten gjelder **public/landing-sidene** (f.eks. `apps/public/`) – de sidene som er åpne for søkemotorer og besøkende uten innlogging. SEO- og Core Web Vitals-krav er ikke like kritiske for dashboard eller admin (innloggede apper).

---

## **SEO Optimisering**
### **1. Søkeord (Keywords)**
- [ ] Utfør **søkeordforskning** for å finne lavkonkurransesøkeord som salon-eiere søker etter.
- [ ] Inkluder **long-tail keywords** som: 
  - "salon booking system"
  - "easy booking for salons"
  - "multilingual salon booking system"
  - "simple booking for immigrant-run salons"
- [ ] Bruk søkeordene **naturlig** i innholdet, tittel og meta-beskrivelser.

### **2. Meta Tags**
- [ ] **Meta Title**: Inkluder relevante søkeord og sørg for at titlene er unike for hver side (50-60 tegn).
- [ ] **Meta Description**: Lag en engasjerende beskrivelse som oppsummerer innholdet på siden (140-160 tegn). Inkluder relevante søkeord.
- [ ] **Alt tekst for bilder**: Bruk beskrivende alt-tekst for alle bilder. Inkluder nøkkelord når det er relevant.

### **3. Innholdsoptimalisering**
- [ ] Del opp innholdet med **klare overskrifter** (H1, H2, H3).
- [ ] Inkluder **søkeord i overskriftene** (men ikke overdriv).
- [ ] Sørg for at innholdet er lett å lese og inkluder **call-to-action (CTA)** på relevante steder.
- [ ] Bruk **intern lenking** for å koble viktige sider sammen (eks. fra forsiden til produktfunksjoner).
- [ ] **Oppdater innholdet regelmessig** for å holde det ferskt og relevant.

### **4. Teknisk SEO**
- [ ] Bruk **strukturert data (schema markup)** for å forbedre visningen på søkemotorer (f.eks. for booking, tjenester og anmeldelser).
- [ ] **XML Sitemap**: Sørg for at en sitemap er tilstede og oppdatert.
- [ ] **Robots.txt**: Sørg for at det ikke er blokkeringer på viktige sider.
- [ ] **404-feilsider**: Legg til en tilpasset 404-side med lenker til relevante sider på nettstedet.

### **5. Hastighet og Brukervennlighet**
- [ ] Sørg for at **Google Core Web Vitals** er innenfor anbefalte verdier (LCP, FID, CLS).
- [ ] Test hastigheten regelmessig med **Google PageSpeed Insights** og **GTmetrix**.
- [ ] Optimaliser **HTML, CSS og JavaScript** for å minimere lastetid.
- [ ] Bruk **gzip** eller **Brotli-komprimering** for komprimering av filer.

## **Speed Optimisering**
### **1. Bildefiler og Media**
- [ ] Bruk **WebP-format** for bilder for bedre komprimering og kvalitet.
- [ ] Komprimer bilder uten å miste kvalitet (bruk f.eks. **TinyPNG** eller **Squoosh**).
- [ ] Implementer **lazy loading** for bilder som ikke vises umiddelbart ved innlasting.
- [ ] Sørg for at **videoer** også er komprimert og lastes raskt (f.eks. bruk **MP4**-format).

### **2. Code Splitting og Minifisering**
- [ ] Bruk **Next.js** sin innebygde **code splitting** for å laste bare nødvendige JavaScript-moduler.
- [ ] **Minifiser JavaScript og CSS**-filer for å redusere filstørrelse.
- [ ] **Tree shaking**: Fjern ubrukte moduler i JavaScript.

### **3. Server Side Rendering (SSR)**
- [ ] Sørg for at **Next.js** bruker **Server Side Rendering (SSR)** for de viktigste sidene (spesielt for forsiden og produkt-sider).
- [ ] Bruk **static generation** (SSG) for statiske sider som ikke endres ofte (f.eks. om oss-siden).

### **4. Caching og CDN**
- [ ] Bruk **CDN (Content Delivery Network)** som **Cloudflare** eller **Vercel** for raskere levering av statisk innhold.
- [ ] Implementer **cache headers** for å tillate nettlesere å cache innhold som ikke endres ofte.
- [ ] Implementer **edge caching** for å redusere serverbelastningen og forbedre lastetiden.

### **5. Browser Caching og Optimized Fonts**
- [ ] Sørg for at fontene blir lastet effektivt. Bruk **font-display: swap** for å forhindre layout-skjær ved font-lasting.
- [ ] Bruk **localStorage** for å cache data som kan være statisk i en periode (f.eks. språkinnstillinger).

## **Verktøy og Testing**
- [ ] Bruk **Google Analytics** og **Google Search Console** for å overvåke trafikk og SEO-yield.
- [ ] Bruk **GTMetrix** for å teste hastigheten og finne optimaliseringsmuligheter.
- [ ] Bruk **Lighthouse** i Chrome DevTools for å analysere SEO og performance.

## **Rapportering og Kontinuerlig Optimalisering**
- [ ] Sett opp automatiske **SEO-rapporter** for å overvåke nøkkeltall.
- [ ] Test hastigheten månedlig og foreta justeringer basert på resultatene.
- [ ] **Overvåk Google Analytics** for å finne flaskehalser og forbedre brukeropplevelsen.

---

**Implementeringstid:** Dette arbeidet kan være et kontinuerlig prosjekt, men initialt kan det ta 2-3 uker å implementere de viktigste SEO- og hastighetsoptimaliseringene.

