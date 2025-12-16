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

- [ ] Samle all knappelogikk i én basekomponent:
  - [ ] Bruk `components/ui/button.tsx` som eneste kilde for knappestil.
  - [ ] Alle knapper i appen skal bruke denne komponenten.

- [ ] Definer et tydelig knapp-API:
  - [ ] `variant` (for eksempel: `primary`, `secondary`, `ghost`, `outline`, `destructive`, `link`)
  - [ ] `size` (for eksempel: `sm`, `md`, `lg`, `icon`)
  - [ ] Eventuelle props for icon før/etter tekst.

- [ ] Sjekk alle steder med `<button>` eller custom knapper:
  - [ ] Bytt ut rå `<button>` med `Button`-komponenten.
  - [ ] Sikre at farger og states (hover, active, disabled, focus) følger samme tokens.

- [ ] Dokumenter knappene:
  - [ ] Legg til seksjon i `docs/frontend/ui-system.md` for `Button`.
  - [ ] Beskriv:
    - [ ] Hvilke `variant`-er som finnes og når de brukes.
    - [ ] Hvilke `size`-varianter som finnes.
    - [ ] Eksempelkode for de vanligste variantene.

---

## 3. Bakgrunner (layout, seksjoner, kort)

- [ ] Definer en klar struktur for bakgrunner:
  - [ ] Hovedbakgrunn for app (`body` / layout): lys/dark variant basert på tema.
  - [ ] Sekundære bakgrunner (kort, paneler, seksjoner).
  - [ ] Evt. accent-bakgrunner for viktige seksjoner (hero, call-to-action).

- [ ] Fjern tilfeldige gradienter og tilfeldige bakgrunnsfarger:
  - [ ] Samle alle gradienter i design-tokens eller i én definert util-klasse.
  - [ ] Bruk konsistente bakgrunner for:
    - [ ] Dashboard-layout.
    - [ ] Settings-sider.
    - [ ] Public booking-sider.

- [ ] Dokumenter bakgrunnsbruk:
  - [ ] I `docs/frontend/ui-system.md`, legg til seksjon "Bakgrunner".
  - [ ] Forklar:
    - [ ] Hvilken bakgrunn brukes for hovedlayout.
    - [ ] Hvilken bakgrunn brukes for kort/paneler.
    - [ ] Hvordan gradienter skal brukes (kun spesifikke seksjoner).

---

## 4. Typografi og komponentnivå konsistens

- [ ] Definer typografi-skala:
  - [ ] Overskrifter: `h1`, `h2`, `h3`, `h4`
  - [ ] Brødtekst: `body`, `muted`, `small`
  - [ ] Label-tekst, input-tekst

- [ ] Lag egne typografi-komponenter eller util-klasser:
  - [ ] For eksempel `components/ui/heading.tsx` eller faste Tailwind-klasser.
  - [ ] Unngå at hver side finner opp egne font-størrelser.

- [ ] Rydd opp i alle steder med inline-typografi:
  - [ ] Erstatt custom klasser med de definerte komponentene/klassene.

- [ ] Dokumenter typografi:
  - [ ] I `docs/frontend/ui-system.md`, legg til seksjon "Typografi".
  - [ ] Beskriv hvilke varianter som finnes og hvor de brukes.

---

## 5. Fargebruk per side og modul

- [ ] Gå gjennom hovedsidene:
  - [ ] Dashboard
  - [ ] Bookings
  - [ ] Calendar
  - [ ] Customers
  - [ ] Employees
  - [ ] Settings
  - [ ] Public booking

- [ ] Sjekk at:
  - [ ] Primærfarge brukes konsekvent (knapper, hovedaksjoner).
  - [ ] Sekundærfarge og "muted" brukes på sekundære elementer.
  - [ ] Ingen side har egne random farger som bryter design-systemet.

- [ ] Legg til kort oversikt i `docs/frontend/ui-system.md`:
  - [ ] En tabell med:
    - [ ] Side / modul.
    - [ ] Primærkomponenter (kort, tabell, cards, forms).
    - [ ] Hvilke tokens som brukes der.

---

## 6. Gjenbrukbare layout-komponenter

- [ ] Identifiser mønstre som går igjen:
  - [ ] Sidestruktur (header + toolbar + content).
  - [ ] Cards med tittel, ikon og innhold.
  - [ ] Tabeller med toolbar/filter.
  - [ ] Sidebars/sekundære paneler.

- [ ] Opprett gjenbrukbare layout-komponenter:
  - [ ] `DashboardShell` (om ikke allerede definert, eller oppdater eksisterende).
  - [ ] `PageHeader` med konsistent tittel, breadcrumbs, actions.
  - [ ] Standard `Card`-bruk for statistikk/topplinjekort.

- [ ] Sikre at alle sider bruker disse i stedet for copy/paste-layout:
  - [ ] Refaktorer eksisterende sider til å bruke felles layout-komponenter.

- [ ] Dokumenter layout-komponenter:
  - [ ] I `docs/frontend/ui-system.md`, egen seksjon "Layout".
  - [ ] Forklar:
    - [ ] Hvilke layout-komponenter finnes.
    - [ ] Når de skal brukes.
    - [ ] Eksempelkode.

---

## 7. Rydding av gamle og dupliserte styles

- [ ] Søk gjennom prosjektet etter:
  - [ ] Dupliserte Tailwind-klasser som kan erstattes med gjenbrukbare komponenter.
  - [ ] Ubrukte komponenter i `components/`.
  - [ ] Gamle stilvalg som ikke følger design-tokens.

- [ ] Fjern:
  - [ ] Ubrukte komponenter.
  - [ ] Ubrukte CSS/snippets.
  - [ ] Gamle varianter av buttons, cards og andre visuelt like komponenter.

- [ ] Sikre at:
  - [ ] Alle nye sider følger samme mønster og ikke introduserer nye random stiler.

---

## 8. Dokumentasjon for UI og gjenbruk

- [ ] Sørg for at `docs/frontend/ui-system.md` inneholder:
  - [ ] Design-tokens (farger, typografi, spacing, radius, shadow).
  - [ ] Button-API og eksempler.
  - [ ] Bakgrunnsstrategi og layout.
  - [ ] Typografi-regler.
  - [ ] Liste over gjenbrukbare komponenter og layout-mønstre.
  - [ ] Retningslinjer for nye sider:
    - [ ] Hvordan velge bakgrunn.
    - [ ] Hvilke knappevarianter som brukes.
    - [ ] Hvordan strukturere headings og cards.

---
