# Performance Optimization Guide

Dette dokumentet beskriver ytelsesoptimaliseringer som er implementert i TeqBook, og best practices for å holde applikasjonen rask.

**Sist oppdatert:** 2025-01-XX  
**Status:** Aktiv vedlikehold

---

## Oversikt

TeqBook er designet for å være rask og responsiv. Dette dokumentet dokumenterer alle optimaliseringer som er implementert, og gir retningslinjer for fremtidig utvikling.

---

## Implementerte Optimaliseringer

### 1. Client-Side Navigation (Settings Tabs)

**Problem:** Settings-tabbene brukte `window.location.href` som gjorde full page reload ved hver tab-bytt.

**Løsning:** Byttet til Next.js `router.push()` for instant client-side navigation.

**Fil:** `web/src/app/settings/layout.tsx`

**Før:**
```typescript
onValueChange={(value) => {
  if (value === "general") window.location.href = "/settings/general";
  // ...
}}
```

**Etter:**
```typescript
const router = useRouter();
onValueChange={(value) => {
  if (value === "general") router.push("/settings/general");
  // ...
}}
```

**Resultat:** Tab-bytt er nå instant uten page reload.

### 2. Optimalisert Data Refresh (General Settings)

**Problem:** General settings page brukte `window.location.reload()` etter å ha lagret innstillinger, som gjorde full page reload.

**Løsning:** Byttet til `refreshSalon()` fra `SalonProvider` for å oppdatere data uten page reload.

**Fil:** `web/src/app/settings/general/page.tsx`

**Før:**
```typescript
setSaved(true);
window.location.reload(); // ❌ Full page reload
```

**Etter:**
```typescript
const { refreshSalon } = useCurrentSalon();
setSaved(true);
await refreshSalon(); // ✅ Oppdaterer data uten reload
```

**Resultat:** Innstillinger lagres nå raskt uten full page reload.

### 3. Optimalisert Sidebar Navigation

**Problem:** Sidebar-navigasjon kunne være tregere ved bytting mellom sider.

**Løsning:** 
- Lagt til `prefetch={true}` på alle `Link` komponenter i sidebar for å prefetche sider i bakgrunnen
- Brukt `React.memo()` på `NavLink` komponenter for å unngå unødvendig re-rendering
- Optimalisert re-rendering ved å memoize komponenter

**Filer:** 
- `web/src/components/layout/dashboard-shell.tsx`
- `web/src/components/layout/admin-shell.tsx`

**Endringer:**
```typescript
// Prefetch lenker for raskere navigasjon
<Link href={href} prefetch={true} ...>

// Memoize NavLink for å unngå unødvendig re-rendering
const NavLink = memo(function NavLink({ ... }) { ... });
```

**Resultat:** Sidebar-navigasjon er nå raskere med prefetching og optimalisert re-rendering.

### 4. Optimalisert Feature Checks i Sidebar

**Problem:** Sidebar-elementer (products, reports, shifts) forsvant og kom tilbake når brukeren navigerte mellom sider. Dette skjedde fordi feature checks ble gjort på nytt ved hver render.

**Løsning:** 
- Brukt `useMemo` for å memoize sidebar menu items (`overviewItems`, `operationsItems`, `managementItems`, `systemItems`)
- Sjekker `features` array direkte i stedet for å kalle `hasFeature()` funksjonen i array-spredningen
- Venter til `featuresLoading` er `false` før feature-baserte items legges til
- Memoization avhenger kun av faktiske endringer i `features`, `userRole`, `mounted`, og `featuresLoading`

**Filer:** 
- `web/src/components/layout/dashboard-shell.tsx`

**Endringer:**
```typescript
// Før: Array ble bygget på nytt hver render
const managementItems = [
  ...(mounted && hasFeature("INVENTORY") ? [...] : []),
];

// Etter: Memoized basert på faktiske feature-verdier
const managementItems = useMemo(() => {
  const items = [...];
  if (mounted && !featuresLoading && features.length > 0) {
    const hasInventory = features.includes("INVENTORY");
    if (hasInventory) items.push(...);
  }
  return items;
}, [mounted, featuresLoading, features, userRole, ...]);
```

**Resultat:** Sidebar-elementer forblir stabile og forsvinner ikke lenger når brukeren navigerer mellom sider. Feature checks skjer kun én gang når features er lastet.

### 5. Feature Caching for å Unngå Re-loading

**Problem:** `useFeatures` hook lastet features på nytt hver gang brukeren navigerte mellom sider, selv om salon-id var den samme.

**Løsning:** 
- Implementert global cache for features per salon
- Features lastes kun én gang per salon og caches i minnet
- Sjekker cache før ny lasting for å unngå unødvendige API-kall
- Bruker `useRef` for å forhindre samtidige loads for samme salon

**Filer:** 
- `web/src/lib/hooks/use-features.ts`

**Endringer:**
```typescript
// Global cache for features per salon
let globalFeaturesCache: FeaturesCache | null = null;

// Sjekk cache før loading
if (globalFeaturesCache && globalFeaturesCache.salonId === salonId) {
  setFeatures(globalFeaturesCache.features);
  return;
}

// Cache features etter loading
globalFeaturesCache = {
  salonId,
  features: featureKeys,
  loading: false,
  error: null,
};
```

**Resultat:** Features lastes kun én gang per salon-sesjon, og sidebar re-rendres ikke lenger ved navigasjon.

### 6. Memoized DashboardShellContent

**Problem:** Hele `DashboardShellContent` komponenten re-rendret når `children` endret seg ved navigasjon.

**Løsning:** 
- Brukt `React.memo()` på `DashboardShellContent` for å unngå unødvendig re-rendering
- Komponenten re-rendres kun når props faktisk endres (ikke bare `children`)

**Filer:** 
- `web/src/components/layout/dashboard-shell.tsx`

**Endringer:**
```typescript
// Memoize for å unngå re-render når bare children endres
const DashboardShellContent = memo(function DashboardShellContent({ children }: DashboardShellProps) {
  // ... komponent logikk
});
```

**Resultat:** Sidebar re-rendres ikke lenger når brukeren navigerer mellom sider.

---

## Best Practices

### Navigation

✅ **Bruk:** `router.push()` for client-side navigation  
❌ **Ikke bruk:** `window.location.href` eller `window.location.reload()` (unntatt når nødvendig)

**Eksempel:**
```typescript
import { useRouter } from "next/navigation";

const router = useRouter();
router.push("/dashboard"); // ✅ Rask, client-side
// window.location.href = "/dashboard"; // ❌ Tregt, full reload
```

### Data Fetching

✅ **Bruk:** React Query eller SWR for caching og revalidation  
✅ **Bruk:** `useEffect` med proper cleanup  
❌ **Ikke bruk:** Unødvendig re-fetching på hver render

### Component Optimization

✅ **Bruk:** `React.memo()` for dyre komponenter  
✅ **Bruk:** `useMemo()` og `useCallback()` for dyre beregninger  
✅ **Bruk:** Code splitting med `next/dynamic` for store komponenter

**Eksempel:**
```typescript
import dynamic from "next/dynamic";

const HeavyComponent = dynamic(() => import("./heavy-component"), {
  loading: () => <Skeleton />,
  ssr: false, // Hvis komponenten ikke trenger SSR
});
```

### Image Optimization

✅ **Bruk:** Next.js `Image` komponent for automatisk optimalisering  
❌ **Ikke bruk:** Vanlige `<img>` tags for bilder fra appen

### Bundle Size

✅ **Bruk:** Tree shaking (automatisk med Next.js)  
✅ **Bruk:** Dynamic imports for store biblioteker  
✅ **Sjekk:** Bundle size regelmessig med `npm run build`

---

## Performance Metrics

### Mål

- **First Contentful Paint (FCP):** < 1.5s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Time to Interactive (TTI):** < 3.5s
- **Cumulative Layout Shift (CLS):** < 0.1
- **First Input Delay (FID):** < 100ms

### Måling

Bruk Chrome DevTools Lighthouse for å måle ytelse:
1. Åpne Chrome DevTools
2. Gå til "Lighthouse" tab
3. Velg "Performance"
4. Klikk "Generate report"

---

## Fremtidige Optimaliseringer

### Prioritet 1 (Høy)

- [ ] Implementer React Query eller SWR for data fetching
- [ ] Legg til service worker for offline support
- [ ] Optimaliser bundle size (sjekk store dependencies)
- [ ] Implementer lazy loading for bilder under fold

### Prioritet 2 (Medium)

- [x] Legg til prefetching for vanlige ruter (✅ Implementert i sidebar)
- [x] Optimaliser font loading (font-display: swap) (✅ Implementert)
- [ ] Implementer virtual scrolling for lange lister
- [x] Legg til compression (gzip/brotli) (✅ Håndteres av Vercel)

### Prioritet 3 (Lav)

- [ ] Implementer code splitting for admin-panel
- [ ] Optimaliser CSS (remove unused styles)
- [x] Legg til resource hints (preconnect, dns-prefetch) (✅ Implementert)

---

## Vedlikehold

### Regelmessige Sjekker

1. **Månedlig:** Kjør Lighthouse audit på alle hovedsider
2. **Ved hver release:** Sjekk bundle size
3. **Ved nye features:** Vurder performance impact

### Checklist for Nye Features

- [ ] Bruker client-side navigation (`router.push()`)
- [ ] Ingen unødvendig re-rendering
- [ ] Bilder bruker Next.js `Image` komponent
- [ ] Store komponenter er code-split
- [ ] Data fetching er optimalisert (caching, deduplication)

---

## Ressurser

- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web Vitals](https://web.dev/vitals/)
- [React Performance](https://react.dev/learn/render-and-commit)

---

## Endringslogg

### 2025-01-XX
- ✅ Implementert client-side navigation for settings tabs (`router.push()` i stedet for `window.location.href`)
- ✅ Optimalisert data refresh i general settings (`refreshSalon()` i stedet for `window.location.reload()`)
- ✅ Optimalisert sidebar navigation med prefetching og `React.memo()`
- ✅ Optimalisert feature checks i sidebar med `useMemo` for å unngå at sidebar-elementer forsvinner ved navigasjon
- ✅ Implementert feature caching i `useFeatures` hook for å unngå re-loading ved navigasjon
- ✅ Memoized `DashboardShellContent` for å unngå unødvendig re-rendering av hele sidebar
- ✅ Opprettet performance optimization guide
- ✅ Optimalisert Next.js config med webpack optimizations og bundle splitting
- ✅ Implementert lazy loading for framer-motion i login/signup sider
- ✅ Optimalisert font loading med `font-display: swap` og preload
- ✅ Lagt til resource hints (preconnect, dns-prefetch) for eksterne domener
- ✅ Fjernet unødvendige imports (framer-motion fra dashboard)
- ✅ Optimalisert package imports med `optimizePackageImports`

