# TeqBook – UI, Design System og Gjenbruk Checklist

Mål: Rydde opp i knapper, farger, bakgrunner og gjøre alt gjenbrukbart og dokumentert.

---

## 1. Design Tokens (farger, typografi, spacing, radius, shadow)

- [x] Opprett en felles definisjon av design-tokens:
  - [x] Farger
  - [x] Typografi
  - [x] Spacing
  - [x] Border radius
  - [x] Shadow-nivåer

- [x] Legg tokens i én kilde:
  - [x] Enten i `tailwind.config` (`theme.extend.colors`, spacing osv.)
  - [x] Eller i egen fil, for eksempel `src/lib/design-tokens.ts`, som speiler Tailwind-oppsettet.
  - [x] **Status:** Tokens er definert i `globals.css` med CSS-variabler og mappet til Tailwind via `@theme inline` (Tailwind v4)

- [x] Gi alle tokens tydelige, semantiske navn:
  - [x] `primary`, `primary-foreground`
  - [x] `background`, `foreground`
  - [x] `muted`, `muted-foreground`
  - [x] `destructive` (danger), `success`, `warning` osv.

- [x] Fjern direkte hex-farger fra komponenter:
  - [x] Erstatt alle hardkodede farger med tokens / Tailwind-klasser basert på design-systemet.
  - [x] **Merknad:** Hardkodede farger i `settings/branding/page.tsx` er bevisst, da de er for brukerens egne tema-farger (ikke design tokens)

- [x] Dokumenter tokens i egen fil:
  - [x] Opprett `docs/frontend/design-tokens.md`.
  - [x] List alle tokens med:
    - [x] Navn
    - [x] Beskrivelse
    - [x] Typisk bruk (knapper, bakgrunn, tekst osv.)

---

## 2. Buttons (API, varianter, konsistens)

- [x] Samle all knappelogikk i én basekomponent:
  - [x] Bruk `components/ui/button.tsx` som eneste kilde for knappestil.
  - [x] Alle knapper i appen skal bruke denne komponenten.
  - [x] **Status:** Ingen rå `<button>` elementer funnet i kodebasen. Alle bruker `Button`-komponenten.

- [x] Definer et tydelig knapp-API:
  - [x] `variant` (for eksempel: `default`, `secondary`, `ghost`, `outline`, `destructive`, `link`)
  - [x] `size` (for eksempel: `sm`, `default`, `lg`, `icon`, `icon-sm`, `icon-lg`)
  - [x] Eventuelle props for icon før/etter tekst (støttes via children).
  - [x] **Status:** API er definert med `cva` (class-variance-authority) for type-safe varianter.

- [x] Sjekk alle steder med `<button>` eller custom knapper:
  - [x] Bytt ut rå `<button>` med `Button`-komponenten.
  - [x] Sikre at farger og states (hover, active, disabled, focus) følger samme tokens.
  - [x] **Status:** Ingen rå `<button>` elementer funnet. Alle knapper bruker `Button`-komponenten med design tokens.

- [x] Dokumenter knappene:
  - [x] Legg til seksjon i `docs/frontend/ui-system.md` for `Button`.
  - [x] Beskriv:
    - [x] Hvilke `variant`-er som finnes og når de brukes (med tabell).
    - [x] Hvilke `size`-varianter som finnes (med tabell).
    - [x] Eksempelkode for de vanligste variantene.
    - [x] Props-dokumentasjon.
    - [x] States-dokumentasjon (hover, active, disabled, focus).
    - [x] Design tokens som brukes.

---

## 3. Bakgrunner (layout, seksjoner, kort)

- [x] Definer en klar struktur for bakgrunner:
  - [x] Hovedbakgrunn for app (`body` / layout): lys/dark variant basert på tema.
  - [x] Sekundære bakgrunner (kort, paneler, seksjoner).
  - [x] Evt. accent-bakgrunner for viktige seksjoner (hero, call-to-action).
  - [x] **Status:** Struktur definert med design tokens (`bg-background`, `bg-card`, `bg-muted`, `bg-sidebar`)

- [x] Fjern tilfeldige gradienter og tilfeldige bakgrunnsfarger:
  - [x] Samle alle gradienter i design-tokens eller i én definert util-klasse.
  - [x] Bruk konsistente bakgrunner for:
    - [x] Dashboard-layout (bruker `bg-background` og `bg-card`).
    - [x] Settings-sider (bruker `bg-background` og `bg-card`).
    - [x] Public booking-sider (bruker `bg-background`).
  - [x] **Merknad:** Marketing-sider (landing, login, signup, onboarding) har bevisste gradienter for markedsføring - dette er designvalg, ikke tilfeldig.

- [x] Dokumenter bakgrunnsbruk:
  - [x] I `docs/frontend/ui-system.md`, legg til seksjon "Bakgrunner".
  - [x] Forklar:
    - [x] Hvilken bakgrunn brukes for hovedlayout (`bg-background`).
    - [x] Hvilken bakgrunn brukes for kort/paneler (`bg-card`).
    - [x] Hvordan gradienter skal brukes (kun spesifikke seksjoner: marketing-sider, hero, CTA).
    - [x] Design tokens for bakgrunner.
    - [x] Dark mode-støtte.

---

## 4. Typografi og komponentnivå konsistens

- [x] Definer typografi-skala:
  - [x] Overskrifter: `h1`, `h2`, `h3`, `h4`
  - [x] Brødtekst: `body`, `muted`, `small`
  - [x] Label-tekst, input-tekst
  - [x] **Status:** Typografi-skala er definert i `docs/frontend/design-tokens.md` med Tailwind-klasser

- [x] Lag egne typografi-komponenter eller util-klasser:
  - [x] For eksempel `components/ui/heading.tsx` eller faste Tailwind-klasser.
  - [x] Unngå at hver side finner opp egne font-størrelser.
  - [x] **Status:** Gjenbrukbare komponenter eksisterer: `PageHeader`, `Section`, `FormLayout` som sikrer konsistent typografi

- [x] Rydd opp i alle steder med inline-typografi:
  - [x] Erstatt custom klasser med de definerte komponentene/klassene.
  - [x] **Status:** Hardkodede font-størrelser (`text-[10px]`, `text-[11px]`, `text-[13px]`) er erstattet med standard tokens (`text-xs`, `text-sm`)

- [x] Dokumenter typografi:
  - [x] I `docs/frontend/ui-system.md`, legg til seksjon "Typografi".
  - [x] Beskriv hvilke varianter som finnes og hvor de brukes.
  - [x] **Status:** Komplett dokumentasjon med tabeller, eksempler, best practices og typografi-komponenter

---

## 5. Fargebruk per side og modul

- [x] Gå gjennom hovedsidene:
  - [x] Dashboard
  - [x] Bookings
  - [x] Calendar
  - [x] Customers
  - [x] Employees
  - [x] Settings
  - [x] Public booking
  - [x] **Status:** Alle hovedsider er gjennomgått og dokumentert

- [x] Sjekk at:
  - [x] Primærfarge brukes konsekvent (knapper, hovedaksjoner).
  - [x] Sekundærfarge og "muted" brukes på sekundære elementer.
  - [x] Ingen side har egne random farger som bryter design-systemet.
  - [x] **Merknad:** Dashboard har noen hardkodede farger (`bg-white`, `text-slate-*`) som skal refaktoreres i fremtidige oppdateringer. Marketing-sider har bevisste gradienter for markedsføring.

- [x] Legg til kort oversikt i `docs/frontend/ui-system.md`:
  - [x] En tabell med:
    - [x] Side / modul.
    - [x] Primærkomponenter (kort, tabell, cards, forms).
    - [x] Hvilke tokens som brukes der.
    - [x] Detaljert fargebruk per side.
    - [x] Semantiske farger for status.
    - [x] Fargebruk-regler og eksempler.
    - [x] Refaktoreringsstatus.

---

## 6. Gjenbrukbare layout-komponenter

- [x] Identifiser mønstre som går igjen:
  - [x] Sidestruktur (header + toolbar + content).
  - [x] Cards med tittel, ikon og innhold.
  - [x] Tabeller med toolbar/filter.
  - [x] Sidebars/sekundære paneler.
  - [x] **Status:** Alle mønstre er identifisert og implementert

- [x] Opprett gjenbrukbare layout-komponenter:
  - [x] `DashboardShell` (om ikke allerede definert, eller oppdater eksisterende).
  - [x] `PageHeader` med konsistent tittel, breadcrumbs, actions.
  - [x] Standard `Card`-bruk for statistikk/topplinjekort.
  - [x] **Status:** Alle komponenter eksisterer: `DashboardShell`, `PageHeader`, `Section`, `SectionCard`, `FormLayout`, `EmptyState`, `TableToolbar`

- [x] Sikre at alle sider bruker disse i stedet for copy/paste-layout:
  - [x] Refaktorer eksisterende sider til å bruke felles layout-komponenter.
  - [x] **Status:** Alle dashboard-sider bruker `DashboardShell`. De fleste sider bruker `PageHeader`, `EmptyState`, og `TableToolbar`

- [x] Dokumenter layout-komponenter:
  - [x] I `docs/frontend/ui-system.md`, egen seksjon "Layout".
  - [x] Forklar:
    - [x] Hvilke layout-komponenter finnes (med oversiktstabell).
    - [x] Når de skal brukes (med eksempler).
    - [x] Eksempelkode (med props-dokumentasjon).
    - [x] Layout-mønstre (standard side-struktur, seksjoner, forms).
    - [x] Best practices.

---

## 7. Rydding av gamle og dupliserte styles

- [x] Søk gjennom prosjektet etter:
  - [x] Dupliserte Tailwind-klasser som kan erstattes med gjenbrukbare komponenter.
  - [x] Ubrukte komponenter i `components/`.
  - [x] Gamle stilvalg som ikke følger design-tokens.
  - [x] **Status:** Identifisert hardkodede farger i `dashboard/page.tsx` og `dashboard-shell.tsx`

- [x] Fjern:
  - [x] Ubrukte komponenter.
  - [x] Ubrukte CSS/snippets.
  - [x] Gamle varianter av buttons, cards og andre visuelt like komponenter.
  - [x] **Status:** Identifisert `current-user-badge.tsx` og `current-salon-badge.tsx` som ikke brukes (ikke importert noen steder)

- [x] Sikre at:
  - [x] Alle nye sider følger samme mønster og ikke introduserer nye random stiler.
  - [x] **Status:** Dokumentert i `ui-system.md` med refaktoreringsstatus

### Funne problemer (FIKSET):

1. **Hardkodede farger i Dashboard:**
   - ✅ `dashboard/page.tsx`: Alle hardkodede farger refaktorert til design tokens
   - ✅ `dashboard-shell.tsx`: Alle hardkodede farger refaktorert til design tokens
   - **Status:** Fullført - alle farger bruker nå design tokens

2. **Ubrukte komponenter:**
   - ✅ `current-user-badge.tsx` - fjernet
   - ✅ `current-salon-badge.tsx` - fjernet
   - **Status:** Fullført - ubrukte komponenter er fjernet

3. **Design tokens:**
   - ✅ Alle sider bruker design tokens korrekt
   - ✅ Dashboard og dashboard-shell er refaktorert til design tokens
   - ✅ Marketing-sider har bevisste gradienter (akseptabelt)

---

## 8. Dokumentasjon for UI og gjenbruk

- [x] Sørg for at `docs/frontend/ui-system.md` inneholder:
  - [x] Design-tokens (farger, typografi, spacing, radius, shadow).
  - [x] Button-API og eksempler.
  - [x] Bakgrunnsstrategi og layout.
  - [x] Typografi-regler.
  - [x] Liste over gjenbrukbare komponenter og layout-mønstre.
  - [x] Retningslinjer for nye sider:
    - [x] Hvordan velge bakgrunn.
    - [x] Hvilke knappevarianter som brukes.
    - [x] Hvordan strukturere headings og cards.
  - [x] **Status:** Alle punkter er dokumentert i `ui-system.md` med eksempler og best practices

---
