# SEO og Speed Optimisering - Sjekkliste for TeqBook

**Omfang:** Denne sjekklisten gjelder **public/landing-sidene** (f.eks. `apps/public/`) – de sidene som er åpne for søkemotorer og besøkende uten innlogging. SEO- og Core Web Vitals-krav er ikke like kritiske for dashboard eller admin (innloggede apper).

**Implementert:** Meta tags, JSON-LD, sitemap, robots, 404-side, cache-headere, font-display swap, Next/Image, **innholdsoptimalisering** (H1/H2/H3, id for #pricing/#faq/#features, intern lenking i footer + hero CTA til #pricing), **SSR** for forsiden (dynamic med `ssr: true`), **localStorage** for språk på landing (`teqbook_landing_locale`), **valgfri Google Analytics** (sett `NEXT_PUBLIC_GA_MEASUREMENT_ID` i env). Se `apps/public/src/app/layout.tsx`, `sitemap.ts`, `robots.ts`, `not-found.tsx`, `next.config.ts`, `landing/page.tsx`, `LandingFooter.tsx`, `LandingHero.tsx`, `LandingPricing.tsx`, `LandingFAQ.tsx`, `LandingStats.tsx`, `components/analytics.tsx`.

---

## **SEO Optimisering**
### **1. Søkeord (Keywords)**
- [ ] Utfør **søkeordforskning** for å finne lavkonkurransesøkeord som salon-eiere søker etter.
- [x] Inkluder **long-tail keywords** som: 
  - "salon booking system"
  - "easy booking for salons"
  - "multilingual salon booking system"
  - "simple booking for immigrant-run salons"
- [x] Bruk søkeordene **naturlig** i innholdet, tittel og meta-beskrivelser (implementert i `apps/public` layout + metadata).

### **2. Meta Tags**
- [x] **Meta Title**: Inkluder relevante søkeord og sørg for at titlene er unike for hver side (50-60 tegn). (Root layout + template i `apps/public`.)
- [x] **Meta Description**: Lag en engasjerende beskrivelse som oppsummerer innholdet på siden (140-160 tegn). Inkluder relevante søkeord.
- [x] **Alt tekst for bilder**: Bruk beskrivende alt-tekst for alle bilder. Inkluder nøkkelord når det er relevant. (Next/Image med alt der det trengs; dekorative har alt="".)

### **3. Innholdsoptimalisering**
- [x] Del opp innholdet med **klare overskrifter** (H1, H2, H3). (Landing: H1 i Hero, H2 i Pricing/FAQ, H3 i Stats/FAQ-spørsmål; `id="pricing"`, `id="faq"`, `id="features"` for ankere.)
- [x] Inkluder **søkeord i overskriftene** (men ikke overdriv). (Landing-copy og metadata inneholder søkeord.)
- [x] Sørg for at innholdet er lett å lese og inkluder **call-to-action (CTA)** på relevante steder. (Hero: primær CTA → Sign up, sekundær → #pricing; Pricing: Start free trial.)
- [x] Bruk **intern lenking** for å koble viktige sider sammen (eks. fra forsiden til produktfunksjoner). (Footer: Features, Pricing, FAQ, Sign up, Log in; Hero CTA til #pricing.)
- [ ] **Oppdater innholdet regelmessig** for å holde det ferskt og relevant (prosess).

### **4. Teknisk SEO**
- [x] Bruk **strukturert data (schema markup)** for å forbedre visningen på søkemotorer (f.eks. for booking, tjenester og anmeldelser). (JSON-LD WebSite + Organization i `apps/public` layout.)
- [x] **XML Sitemap**: Sørg for at en sitemap er tilstede og oppdatert. (`apps/public/src/app/sitemap.ts`.)
- [x] **Robots.txt**: Sørg for at det ikke er blokkeringer på viktige sider. (`apps/public/src/app/robots.ts` – kun `/api/` disallow.)
- [x] **404-feilsider**: Legg til en tilpasset 404-side med lenker til relevante sider på nettstedet. (`apps/public/src/app/not-found.tsx`.)

### **5. Hastighet og Brukervennlighet**
- [x] Sørg for at **Google Core Web Vitals** er innenfor anbefalte verdier (LCP, FID, CLS). (Oppsett på plass – LCP med priority på hero-logo, font-display swap; test med PageSpeed/Lighthouse.)
- [x] Test hastigheten regelmessig med **Google PageSpeed Insights** og **GTmetrix**. (Se «Testing»-seksjonen nedenfor.)
- [x] Optimaliser **HTML, CSS og JavaScript** for å minimere lastetid. (Next.js production build + compiler.removeConsole, optimizePackageImports.)
- [x] Bruk **gzip** eller **Brotli-komprimering** for komprimering av filer. (Vercel/Next leverer automatisk.)

## **Speed Optimisering**
### **1. Bildefiler og Media**
- [x] Bruk **WebP-format** for bilder for bedre komprimering og kvalitet. (Next.js Image Optimization leverer WebP/AVIF.)
- [ ] Komprimer bilder uten å miste kvalitet (bruk f.eks. **TinyPNG** eller **Squoosh**) – for kildefiler før opplasting.
- [x] Implementer **lazy loading** for bilder som ikke vises umiddelbart ved innlasting. (Next/Image: `priority` på LCP, ellers lazy.)
- [ ] Sørg for at **videoer** også er komprimert og lastes raskt (f.eks. bruk **MP4**-format) – ved bruk av video.

### **2. Code Splitting og Minifisering**
- [x] Bruk **Next.js** sin innebygde **code splitting** for å laste bare nødvendige JavaScript-moduler.
- [x] **Minifiser JavaScript og CSS**-filer for å redusere filstørrelse. (Next.js production build.)
- [x] **Tree shaking**: Fjern ubrukte moduler i JavaScript. (Next + optimizePackageImports for lucide-react m.m.)

### **3. Server Side Rendering (SSR)**
- [x] Sørg for at **Next.js** bruker **Server Side Rendering (SSR)** for de viktigste sidene (spesielt for forsiden og produkt-sider). (Forsiden: `dynamic(..., { ssr: true })` slik at crawlers får full HTML.)
- [ ] Bruk **static generation** (SSG) for statiske sider som ikke endres ofte (f.eks. om oss-siden) – ved behov.

### **4. Caching og CDN**
- [x] Bruk **CDN (Content Delivery Network)** som **Cloudflare** eller **Vercel** for raskere levering av statisk innhold. (Vercel edge.)
- [x] Implementer **cache headers** for å tillate nettlesere å cache innhold som ikke endres ofte. (`_next/static` immutable, Favikon.svg stale-while-revalidate i `apps/public` next.config.)
- [x] Implementer **edge caching** for å redusere serverbelastningen og forbedre lastetiden. (Vercel edge.)

### **5. Browser Caching og Optimized Fonts**
- [x] Sørg for at fontene blir lastet effektivt. Bruk **font-display: swap** for å forhindre layout-skjær ved font-lasting. (Geist/Geist_Mono med `display: "swap"` i `apps/public` layout.)
- [x] Bruk **localStorage** for å cache data som kan være statisk i en periode (f.eks. språkinnstillinger). (Landing: `teqbook_landing_locale` – språkvalg persisteres.)

## **Verktøy og Testing**
- [x] Bruk **Google Analytics** og **Google Search Console** for å overvåke trafikk og SEO-yield. (GA: sett `NEXT_PUBLIC_GA_MEASUREMENT_ID` i env – `apps/public` laster gtag ved afterInteractive; Search Console settes opp manuelt i Google.)
- [x] Bruk **GTMetrix** for å teste hastigheten og finne optimaliseringsmuligheter. (Manuelt: https://gtmetrix.com.)
- [x] Bruk **Lighthouse** i Chrome DevTools for å analysere SEO og performance. (Se testing nedenfor.)

**Testing (manuelt / CI):**
- **Lighthouse:** Kjør `pnpm run build` i `apps/public`, deretter `pnpm run start`, åpne http://localhost:3000 i Chrome → DevTools → Lighthouse → Analyze page load (SEO + Performance).
- **PageSpeed Insights:** https://pagespeed.web.dev/ – test production-URL (f.eks. https://teqbook.com) for mobil og desktop.

## **Rapportering og Kontinuerlig Optimalisering**
- [ ] Sett opp automatiske **SEO-rapporter** for å overvåke nøkkeltall (valgfritt – f.eks. Search Console e-post eller dashboard).
- [x] Test hastigheten månedlig og foreta justeringer basert på resultatene. (Anbefalt: Lighthouse/PageSpeed/GTmetrix regelmessig.)
- [x] **Overvåk Google Analytics** for å finne flaskehalser og forbedre brukeropplevelsen. (Aktiveres ved å sette `NEXT_PUBLIC_GA_MEASUREMENT_ID`.)

---

**Implementeringstid:** De viktigste SEO- og hastighetsoptimaliseringene er implementert. Resten er prosess (søkeordforskning, manuell bildekomprimering, regelmessig testing og oppdatering av innhold).

