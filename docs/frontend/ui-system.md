# TeqBook – UI System & Design Tokens

Dette dokumentet beskriver UI-systemet, design tokens og komponentstrukturen i TeqBook.

---

## Design System Oversikt

TeqBook bruker **shadcn/ui** (Radix UI + Tailwind CSS) som grunnlag for UI-komponenter.

**Konfigurasjon:** `components.json`

**Styling:** Tailwind CSS med CSS-variabler for theming

---

## Design Tokens

**📖 Se `docs/frontend/design-tokens.md` for komplett dokumentasjon av alle design tokens (farger, typografi, spacing, shadows, etc.).**

Denne seksjonen gir en kort oversikt. For detaljer, se design-tokens.md.

### Farger

Farger er definert som CSS-variabler i `src/app/globals.css`:

#### Primærfarger

- `--primary` - Hovedfarge for knapper og lenker
- `--primary-foreground` - Tekstfarge på primær bakgrunn
- `--secondary` - Sekundær bakgrunn
- `--secondary-foreground` - Tekstfarge på sekundær bakgrunn

#### Semantiske farger

- `--destructive` - For farlige handlinger (slett, avbryt)
- `--accent` - For fremheving
- `--muted` - For subtil bakgrunn
- `--muted-foreground` - For subtil tekst

#### UI-farger

- `--background` - Hovedbakgrunn
- `--foreground` - Hovedtekst
- `--card` - Kortbakgrunn
- `--card-foreground` - Tekst på kort
- `--border` - Rammer
- `--input` - Input-felter
- `--ring` - Focus-ring

#### Sidebar-farger

- `--sidebar` - Sidebar bakgrunn
- `--sidebar-foreground` - Sidebar tekst
- `--sidebar-primary` - Sidebar primærfarge
- `--sidebar-border` - Sidebar rammer

### Spacing

Bruker Tailwind's standard spacing scale:

- `p-2` = 0.5rem (8px)
- `p-4` = 1rem (16px)
- `p-6` = 1.5rem (24px)
- `gap-2` = 0.5rem (8px)
- `gap-4` = 1rem (16px)

### Typografi

**Fonts:**
- `--font-sans` - Geist Sans (hovedfont)
- `--font-mono` - Geist Mono (monospace)

**Størrelser:**
- `text-xs` - 0.75rem (12px)
- `text-sm` - 0.875rem (14px)
- `text-base` - 1rem (16px)
- `text-lg` - 1.125rem (18px)
- `text-xl` - 1.25rem (20px)

**Vekter:**
- `font-normal` - 400
- `font-medium` - 500
- `font-semibold` - 600

### Border Radius

- `--radius-sm` - calc(var(--radius) - 4px)
- `--radius-md` - calc(var(--radius) - 2px)
- `--radius-lg` - var(--radius) = 0.625rem (10px)
- `--radius-xl` - calc(var(--radius) + 4px)

**Bruk:**
- `rounded-md` - Standard rounded
- `rounded-lg` - Større rounded
- `rounded-xl` - Ekstra stor rounded

---

## Komponentstruktur

### `components/ui/` - Base Components (shadcn/ui)

Disse komponentene er fra shadcn/ui og skal **ikke** endres direkte:

- `avatar.tsx` - Avatar-komponent
- `badge.tsx` - Badge-komponent
- `button.tsx` - Button-komponent
- `card.tsx` - Card-komponent
- `dialog.tsx` - Dialog/Modal-komponent
- `dropdown-menu.tsx` - Dropdown menu
- `input.tsx` - Input-felt
- `popover.tsx` - Popover-komponent
- `skeleton.tsx` - Loading skeleton
- `table.tsx` - Table-komponent
- `tabs.tsx` - Tabs-komponent
- `textarea.tsx` - Textarea-felt
- `tooltip.tsx` - Tooltip-komponent

**Regel:** Disse komponentene skal ikke endres direkte. Hvis du trenger endringer, oppdater dem via shadcn CLI.

### `components/` - Domain Components

Disse komponentene er spesifikke for TeqBook:

#### Layout Components

- `dashboard-shell.tsx` - Hovedlayout for dashboard
  - Sidebar med navigasjon
  - Header med brukerinfo
  - Command palette
  - Notification center
  - Språkvelger

- `form-layout.tsx` - Layout for skjemaer
  - Titel og beskrivelse
  - Form-innhold
  - Footer med handlinger

- `section.tsx` - Seksjon-komponent
  - Titel og beskrivelse
  - Handlinger
  - Innhold

#### Page Components

- `page-header.tsx` - Side-header
  - Titel
  - Beskrivelse (valgfritt)
  - Handlinger (valgfritt)

- `empty-state.tsx` - Tom tilstand
  - Titel
  - Beskrivelse (valgfritt)
  - Handling (valgfritt)

- `stats-grid.tsx` - Grid for statistikk
  - Responsiv grid (1 kolonne mobil, 2 små skjermer, 3 md+)

- `table-toolbar.tsx` - Verktøylinje for tabeller
  - Titel (valgfritt)
  - Innhold (søk, filtre, etc.)
  - Handlinger (valgfritt)

#### Feature Components

- `command-palette.tsx` - Global søk/kommandopalett
  - Søk etter bookings, customers, employees, services
  - Navigasjon
  - Keyboard shortcuts (Cmd/Ctrl + K)

- `public-booking-page.tsx` - Offentlig booking-side
  - Steg-for-steg booking-flow
  - Service/employee/dato-valg
  - Kundeinformasjon

- `notification-center.tsx` - Notifikasjonssenter
  - Vise notifikasjoner
  - Markere som lest

#### Provider Components

- `locale-provider.tsx` - Språkcontext provider
- `salon-provider.tsx` - Salon context provider

#### Badge Components

- `current-user-badge.tsx` - Brukerbadge
- `current-salon-badge.tsx` - Salonbadge

---

## Button API

**Komponent:** `components/ui/button.tsx`

**Regel:** Alle knapper i appen skal bruke `Button`-komponenten. Ingen rå `<button>` elementer skal brukes.

### Variants

Button-komponenten støtter følgende varianter:

| Variant | Beskrivelse | Bruk |
|---------|-------------|------|
| `default` | Primærknapp (standard) | Hovedhandlinger (Create, Save, Submit) |
| `destructive` | Farlig handling | Slett, Avbryt, Destruktive handlinger |
| `outline` | Outline-stil | Sekundære handlinger, Cancel |
| `secondary` | Sekundærknapp | Alternative handlinger |
| `ghost` | Ghost-stil | Subtile handlinger, ikon-knapper |
| `link` | Link-stil | Lenke-lignende knapper |

```typescript
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

### Sizes

Button-komponenten støtter følgende størrelser:

| Size | Beskrivelse | Bruk |
|------|-------------|------|
| `sm` | Liten knapp | Kompakt UI, sekundære handlinger |
| `default` | Standard størrelse | Standard bruk |
| `lg` | Stor knapp | Viktige CTA-knapper |
| `icon` | Ikon-knapp (9x9) | Kun ikon, ingen tekst |
| `icon-sm` | Liten ikon-knapp (8x8) | Kompakt ikon-knapp |
| `icon-lg` | Stor ikon-knapp (10x10) | Stor ikon-knapp |

```typescript
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">
  <PlusIcon />
</Button>
```

### Props

| Prop | Type | Default | Beskrivelse |
|------|------|---------|-------------|
| `variant` | `"default" \| "destructive" \| "outline" \| "secondary" \| "ghost" \| "link"` | `"default"` | Knapp-variant |
| `size` | `"sm" \| "default" \| "lg" \| "icon" \| "icon-sm" \| "icon-lg"` | `"default"` | Knapp-størrelse |
| `asChild` | `boolean` | `false` | Bruk Radix Slot for å wrappe andre komponenter |
| `className` | `string` | - | Ekstra CSS-klasser |
| `disabled` | `boolean` | `false` | Deaktiver knappen |
| `type` | `"button" \| "submit" \| "reset"` | `"button"` | HTML button type |

### Eksempler

```typescript
// Primary action (default variant)
<Button>Create Booking</Button>

// Destructive action
<Button variant="destructive">Delete</Button>

// Secondary action
<Button variant="outline">Cancel</Button>

// With icon (ikon før tekst)
<Button>
  <PlusIcon />
  Add New
</Button>

// Icon-only button
<Button size="icon" variant="ghost">
  <SettingsIcon />
</Button>

// Disabled state
<Button disabled>Saving...</Button>

// As form submit
<Button type="submit">Save Changes</Button>

// Using asChild for custom components
<Button asChild variant="link">
  <Link href="/settings">Go to Settings</Link>
</Button>
```

### States

Button-komponenten håndterer automatisk følgende states:

- **Hover:** Automatisk hover-effekt basert på variant
- **Active:** Automatisk active-state
- **Disabled:** Automatisk opacity og pointer-events håndtering
- **Focus:** Automatisk focus-ring med `focus-visible:ring-ring/50`
- **Invalid:** Automatisk `aria-invalid` støtte med destructive ring

### Design Tokens

Button-komponenten bruker følgende design tokens:

- **Primary:** `bg-primary`, `text-primary-foreground`
- **Destructive:** `bg-destructive`, `text-white`
- **Secondary:** `bg-secondary`, `text-secondary-foreground`
- **Outline:** `border`, `bg-background`, `hover:bg-accent`
- **Ghost:** `hover:bg-accent`, `hover:text-accent-foreground`
- **Link:** `text-primary`, `underline-offset-4`

Alle farger følger design-systemet og støtter dark mode automatisk.

---

## Bakgrunner (Backgrounds)

### Bakgrunnsstruktur

TeqBook bruker en klar hierarki for bakgrunner basert på design tokens:

#### 1. Hovedbakgrunn (App Layout)

**Dashboard og interne sider:**
```typescript
// Root layout - bruker design token
<body className="bg-background text-foreground">
  {/* Dashboard content */}
</body>
```

**Public booking:**
```typescript
// Bruker design token for konsistens
<div className="bg-background">
  {/* Booking content */}
</div>
```

**Marketing-sider (Landing, Login, Signup, Onboarding):**
```typescript
// Spesielle gradienter for markedsføring - bevisst designvalg
// Disse er unike for markedsføring og skal ikke brukes i dashboard
<div className="bg-gradient-to-b from-slate-50 via-blue-50/30 to-blue-50/20">
  {/* Marketing content */}
</div>
```

#### 2. Sekundære Bakgrunner (Kort, Paneler, Seksjoner)

**Cards:**
```typescript
// Standard kort
<Card className="bg-card text-card-foreground border rounded-xl shadow-sm">
  {/* Card content */}
</Card>
```

**Paneler:**
```typescript
// Paneler og seksjoner
<div className="bg-card text-card-foreground border rounded-lg p-6">
  {/* Panel content */}
</div>
```

**Muted Areas:**
```typescript
// Subtile bakgrunner for sekundært innhold
<div className="bg-muted text-muted-foreground rounded-md p-4">
  {/* Muted content */}
</div>
```

#### 3. Sidebar

```typescript
// Sidebar bruker dedikerte sidebar-tokens
<aside className="bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
  {/* Sidebar content */}
</aside>
```

#### 4. Accent Bakgrunner (Hero, CTA)

**Hero-seksjoner (kun marketing-sider):**
```typescript
// Spesielle gradienter for hero-seksjoner
<div className="bg-gradient-to-br from-blue-100 via-blue-50 to-slate-50">
  {/* Hero content */}
</div>
```

**Call-to-Action:**
```typescript
// CTA-bakgrunner bruker primærfarge
<div className="bg-primary text-primary-foreground rounded-lg p-6">
  {/* CTA content */}
</div>
```

### Bakgrunnsregler

#### ✅ Riktig bruk

```typescript
// Dashboard-sider
<div className="bg-background">
  <Card className="bg-card">Content</Card>
</div>

// Settings-sider
<div className="bg-background">
  <div className="bg-card border rounded-lg p-6">Settings</div>
</div>

// Public booking
<div className="bg-background">
  <div className="bg-card/80 backdrop-blur">Header</div>
</div>
```

#### ❌ Feil bruk

```typescript
// Ikke bruk hardkodede farger
<div className="bg-white text-black">Content</div>

// Ikke bruk tilfeldige gradienter i dashboard
<div className="bg-gradient-to-r from-blue-500 to-purple-500">Content</div>

// Ikke bruk marketing-gradienter i dashboard
<div className="bg-gradient-to-b from-slate-50 via-blue-50/30 to-blue-50/20">
  Dashboard Content
</div>
```

### Gradienter

**Regel:** Gradienter skal kun brukes på:
- Marketing-sider (landing, login, signup, onboarding)
- Hero-seksjoner
- Spesielle CTA-områder

**Ikke bruk gradienter på:**
- Dashboard-sider
- Settings-sider
- Public booking-sider (unntatt brukerens egne tema-farger)

### Design Tokens for Bakgrunner

| Token | Bruk | Eksempel |
|-------|------|----------|
| `bg-background` | Hovedbakgrunn for app | Root layout, page containers |
| `bg-card` | Kort, paneler, seksjoner | Cards, settings panels |
| `bg-muted` | Subtile bakgrunner | Secondary content, disabled states |
| `bg-sidebar` | Sidebar bakgrunn | Dashboard sidebar |
| `bg-primary` | Primær accent | CTA-bakgrunner, highlights |
| `bg-secondary` | Sekundær accent | Alternative highlights |

### Dark Mode

Alle bakgrunner støtter automatisk dark mode via CSS-variabler:

```css
:root {
  --background: oklch(1 0 0); /* Light mode */
  --card: oklch(1 0 0);
}

.dark {
  --background: oklch(0.145 0 0); /* Dark mode */
  --card: oklch(0.205 0 0);
}
```

Bruken av design tokens sikrer automatisk dark mode-støtte uten ekstra kode.

---

## Typografi og komponentnivå konsistens

### Typografi-skala

TeqBook bruker en konsistent typografi-skala basert på design tokens. **Se `docs/frontend/design-tokens.md` for komplett oversikt.**

#### Overskrifter (Headings)

| Nivå | Tailwind Class | Bruk | Eksempel |
|------|----------------|------|----------|
| H1 (Page Title) | `text-lg font-semibold tracking-tight md:text-xl` | Side-titler | PageHeader komponent |
| H2 (Section Title) | `text-sm font-medium tracking-tight` | Seksjon-titler | Section komponent |
| H3 (Subsection) | `text-base font-semibold` | Underseksjoner | Cards, paneler |
| H4 (Small Title) | `text-sm font-semibold` | Små titler | Inline-seksjoner |

#### Brødtekst (Body Text)

| Type | Tailwind Class | Bruk |
|------|----------------|------|
| Body (Standard) | `text-sm` | Standard brødtekst |
| Body (Muted) | `text-sm text-muted-foreground` | Sekundær tekst, beskrivelser |
| Small | `text-xs text-muted-foreground` | Hjelpetekst, labels, metadata |
| Large | `text-base` | Viktig tekst, undertitler |

#### Label-tekst

| Type | Tailwind Class | Bruk |
|------|----------------|------|
| Label | `text-xs font-medium` | Form labels |
| Label (Muted) | `text-xs text-muted-foreground` | Sekundære labels |

#### Input-tekst

Input-felter bruker standard `text-sm` via Input-komponenten.

### Typografi-komponenter

TeqBook har gjenbrukbare komponenter som sikrer konsistent typografi:

#### PageHeader

**Bruk:** Side-titler med beskrivelse og handlinger

```typescript
<PageHeader
  title="Bookings"
  description="Manage your appointments"
  actions={<Button>New Booking</Button>}
/>
```

**Typografi:**
- Title: `text-lg font-semibold tracking-tight md:text-xl`
- Description: `text-xs text-muted-foreground md:text-sm`

#### Section

**Bruk:** Seksjoner med tittel og beskrivelse

```typescript
<Section
  title="Today's Bookings"
  description="Bookings scheduled for today"
  actions={<Button>View All</Button>}
>
  {/* Content */}
</Section>
```

**Typografi:**
- Title: `text-sm font-medium tracking-tight`
- Description: `text-xs text-muted-foreground sm:text-sm`

#### FormLayout

**Bruk:** Skjemaer med tittel og beskrivelse

```typescript
<FormLayout
  title="Create Employee"
  description="Add a new employee to your salon"
  footer={<Button>Save</Button>}
>
  {/* Form fields */}
</FormLayout>
```

**Typografi:**
- Title: `text-lg font-semibold tracking-tight`
- Description: `text-sm text-muted-foreground`

### Typografi-regler

#### ✅ Riktig bruk

```typescript
// Page title (bruk PageHeader)
<PageHeader title="Bookings" />

// Section title (bruk Section)
<Section title="Today's Bookings" />

// Body text
<p className="text-sm">Regular text</p>

// Muted text
<p className="text-sm text-muted-foreground">Secondary text</p>

// Small text
<p className="text-xs text-muted-foreground">Small text</p>

// Labels
<label className="text-xs font-medium">Email</label>
```

#### ❌ Feil bruk

```typescript
// Ikke bruk hardkodede størrelser
<h1 className="text-[22px] font-bold">Title</h1>

// Ikke bruk custom font-størrelser
<p className="text-[13px]">Text</p>

// Ikke finn opp egne størrelser
<h2 className="text-5xl">Title</h2>
```

### Font-familier

**Standard:** `font-sans` (Geist Sans) - brukes automatisk via `body` i layout

**Monospace:** `font-mono` (Geist Mono) - kun for kode og tekniske verdier

### Font-vekter

| Vekt | Tailwind Class | Bruk |
|------|----------------|------|
| 400 (Normal) | `font-normal` | Standard tekst (default) |
| 500 (Medium) | `font-medium` | Viktig tekst, labels, section titles |
| 600 (Semibold) | `font-semibold` | Titler, overskrifter, page headers |
| 700 (Bold) | `font-bold` | Ekstra viktig tekst (bruk sparsomt) |

### Line Height

| Tailwind Class | Verdi | Bruk |
|----------------|-------|------|
| `leading-none` | 1 | Tette titler |
| `leading-tight` | 1.25 | Titler (standard for headings) |
| `leading-normal` | 1.5 | Body tekst (default) |
| `leading-relaxed` | 1.75 | Lengre tekst |

### Tracking (Letter Spacing)

| Tailwind Class | Verdi | Bruk |
|----------------|-------|------|
| `tracking-tight` | -0.025em | Titler (standard for headings) |
| `tracking-normal` | 0 | Standard tekst (default) |
| `tracking-wide` | 0.025em | Uppercase labels, badges |

### Best Practices

1. **Bruk komponenter:** Bruk `PageHeader`, `Section`, `FormLayout` i stedet for å lage egne headings
2. **Følg skalaen:** Bruk `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl` - ikke hardkodede størrelser
3. **Konsistent vekt:** 
   - Titler: `font-semibold` eller `font-medium`
   - Body: `font-normal` (default)
   - Labels: `font-medium`
4. **Muted for sekundær tekst:** Bruk `text-muted-foreground` for beskrivelser og sekundær tekst
5. **Tracking for titler:** Bruk `tracking-tight` på alle headings

---

## Fargebruk per Side og Modul

### Oversikt

| Side / Modul | Primærkomponenter | Design Tokens Brukt | Merknader |
|--------------|-------------------|---------------------|-----------|
| **Dashboard** | Cards, Stats, Charts | `bg-card`, `text-card-foreground`, `bg-muted/20` | Noen hardkodede farger (`bg-white`, `text-slate-*`) finnes fortsatt - skal refaktoreres |
| **Bookings** | Tabeller, Badges, Forms | `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground` | Status badges bruker semantiske farger |
| **Calendar** | Kalender-grid, Bookings | `bg-background`, `bg-card`, `border` | Konsistent med design tokens |
| **Customers** | Tabeller, Forms, Cards | `bg-background`, `bg-card`, `text-foreground` | Konsistent med design tokens |
| **Employees** | Tabeller, Forms, Cards | `bg-background`, `bg-card`, `text-foreground` | Konsistent med design tokens |
| **Services** | Tabeller, Forms, Cards | `bg-background`, `bg-card`, `text-foreground` | Konsistent med design tokens |
| **Shifts** | Tabeller, Forms, Cards | `bg-background`, `bg-card`, `text-foreground` | Konsistent med design tokens |
| **Settings** | Forms, Cards, Tabs | `bg-card`, `bg-background`, `border`, `text-foreground` | Konsistent med design tokens |
| **Public Booking** | Forms, Cards, Buttons | `bg-background`, `bg-card`, `border` | Bruker brukerens tema-farger for primær/seundær |

### Detaljert Fargebruk

#### Dashboard

**Primære komponenter:**
- **Cards:** `bg-white/90` (skal refaktoreres til `bg-card`)
- **Stats:** `bg-slate-50/50` (skal refaktoreres til `bg-muted/20`)
- **Text:** `text-slate-900` (skal refaktoreres til `text-foreground`)
- **Muted text:** `text-slate-500` (skal refaktoreres til `text-muted-foreground`)

**Status:** Noen hardkodede farger finnes fortsatt. Disse skal refaktoreres til design tokens i fremtidige oppdateringer.

#### Bookings

**Primære komponenter:**
- **Tabeller:** `bg-background` med `text-foreground`
- **Cards:** `bg-card` med `text-card-foreground`
- **Status badges:** Semantiske farger (yellow, blue, green, red) for visuell differensiering
- **Forms:** `bg-card` med `border`

**Status:** ✅ Konsistent med design tokens

#### Calendar

**Primære komponenter:**
- **Kalender-grid:** `bg-background`
- **Booking-cards:** `bg-card` med `border`
- **Status indicators:** Semantiske farger

**Status:** ✅ Konsistent med design tokens

#### Customers

**Primære komponenter:**
- **Tabeller:** `bg-background` med `text-foreground`
- **Forms:** `bg-card` med `border`
- **Cards:** `bg-card` med `text-card-foreground`

**Status:** ✅ Konsistent med design tokens

#### Employees

**Primære komponenter:**
- **Tabeller:** `bg-background` med `text-foreground`
- **Forms:** `bg-card` med `border`
- **Cards:** `bg-card` med `text-card-foreground`

**Status:** ✅ Konsistent med design tokens

#### Services

**Primære komponenter:**
- **Tabeller:** `bg-background` med `text-foreground`
- **Forms:** `bg-card` med `border`
- **Cards:** `bg-card` med `text-card-foreground`

**Status:** ✅ Konsistent med design tokens

#### Shifts

**Primære komponenter:**
- **Tabeller:** `bg-background` med `text-foreground`
- **Forms:** `bg-card` med `border`
- **Cards:** `bg-card` med `text-card-foreground`

**Status:** ✅ Konsistent med design tokens

#### Settings

**Primære komponenter:**
- **Forms:** `bg-card` med `border` og `text-card-foreground`
- **Inputs:** `bg-background` med `border`
- **Tabs:** `bg-background` med `border`
- **Cards:** `bg-card` med `text-card-foreground`

**Status:** ✅ Konsistent med design tokens

#### Public Booking

**Primære komponenter:**
- **Hovedbakgrunn:** `bg-background`
- **Header:** `bg-card/80` med `backdrop-blur`
- **Forms:** `bg-card` med `border`
- **Buttons:** Bruker brukerens tema-farger (fra `salon.theme.primary`)

**Status:** ✅ Konsistent med design tokens (unntatt brukerens egne tema-farger)

### Semantiske Farger for Status

Status badges og indikatorer bruker semantiske farger for visuell differensiering:

| Status | Farge | Bruk |
|--------|-------|------|
| **Confirmed** | Green (`bg-green-500`, `text-green-700`) | Bekreftede bookinger |
| **Pending** | Yellow/Amber (`bg-amber-500`, `text-amber-700`) | Ventende bookinger |
| **Cancelled** | Red (`bg-red-500`, `text-red-700`) | Avlyste bookinger |
| **Completed** | Blue (`bg-blue-500`, `text-blue-700`) | Fullførte bookinger |

**Merknad:** Disse semantiske fargene er bevisste designvalg for status-differensiering og er akseptable, selv om de ikke er design tokens.

### Fargebruk-regler

#### ✅ Riktig bruk

```typescript
// Dashboard cards (når refaktorert)
<Card className="bg-card text-card-foreground border rounded-xl shadow-sm">

// Tabeller
<Table className="bg-background">
  <TableRow className="border-b">
    <TableCell className="text-foreground">Content</TableCell>
  </TableRow>
</Table>

// Forms
<div className="bg-card border rounded-lg p-6">
  <Input className="bg-background border" />
</div>

// Muted areas
<div className="bg-muted text-muted-foreground rounded-md p-4">
  Secondary content
</div>
```

#### ❌ Feil bruk

```typescript
// Ikke bruk hardkodede farger
<div className="bg-white text-black">Content</div>

// Ikke bruk tilfeldige farger
<div className="bg-slate-900 text-slate-100">Content</div>

// Ikke bruk marketing-farger i dashboard
<div className="bg-blue-50 text-blue-900">Dashboard Content</div>
```

### Refaktoreringsstatus

**Fullført:**
- ✅ Bookings, Calendar, Customers, Employees, Services, Shifts, Settings, Public Booking bruker design tokens

**Gjenstående:**
- ⚠️ Dashboard (`dashboard/page.tsx`) har hardkodede farger som skal refaktoreres:
  - `bg-white/90` → `bg-card`
  - `text-slate-900` → `text-foreground`
  - `text-slate-500` → `text-muted-foreground`
  - `bg-slate-900` → `bg-primary` eller `bg-foreground`
  - `bg-blue-700` → `bg-primary`
  - `bg-slate-50/50` → `bg-muted/20`
- ⚠️ Dashboard Shell (`dashboard-shell.tsx`) har hardkodede farger som skal refaktoreres:
  - `text-slate-900` → `text-foreground`
  - `bg-white` → `bg-card` eller `bg-background`
  - `text-slate-400` → `text-muted-foreground`
  - `text-slate-500` → `text-muted-foreground`
- ⚠️ Marketing-sider (landing, login, signup, onboarding) har bevisste gradienter og farger for markedsføring - dette er akseptabelt

**Ubrukte komponenter:**
- `current-user-badge.tsx` - ikke importert noen steder (kan fjernes)
- `current-salon-badge.tsx` - ikke importert noen steder (kan fjernes)

---

## Gjenbrukbare Layout-komponenter

TeqBook har et sett med gjenbrukbare layout-komponenter som sikrer konsistent struktur på tvers av alle sider.

### Oversikt

| Komponent | Lokasjon | Bruk | Brukt på |
|-----------|----------|------|----------|
| `DashboardShell` | `components/layout/dashboard-shell.tsx` | Hovedlayout for dashboard | Alle dashboard-sider |
| `PageHeader` | `components/layout/page-header.tsx` | Side-header med tittel, beskrivelse, actions | Bookings, Calendar, Customers, Employees, Services, Shifts |
| `Section` | `components/layout/section.tsx` | Seksjoner med tittel og beskrivelse | Dashboard, Settings |
| `SectionCard` | `components/layout/section.tsx` | Kort med tittel og beskrivelse | Dashboard, Settings |
| `FormLayout` | `components/layout/form-layout.tsx` | Skjemaer med tittel og footer | Settings, Forms |
| `EmptyState` | `components/empty-state.tsx` | Tom tilstand med call-to-action | Bookings, Calendar, Customers, Employees, Services, Shifts |
| `TableToolbar` | `components/table-toolbar.tsx` | Verktøylinje for tabeller | Bookings, Calendar, Customers, Employees, Services, Shifts |

### DashboardShell

**Hensikt:** Hovedlayout for alle dashboard-sider

**Features:**
- Sidebar med navigasjon
- Header med brukerinfo
- Command palette (Cmd/Ctrl + K)
- Notification center
- Språkvelger
- Responsiv design (mobile/desktop)

**Bruk:**
```typescript
<DashboardShell>
  <YourPageContent />
</DashboardShell>
```

**Status:** ✅ Brukt på alle dashboard-sider

### PageHeader

**Hensikt:** Konsistent side-header med tittel, beskrivelse og handlinger

**Props:**
- `title: string` - Side-tittel (required)
- `description?: string` - Beskrivelse (optional)
- `actions?: ReactNode` - Handlinger/knapper (optional)

**Bruk:**
```typescript
<PageHeader
  title="Bookings"
  description="Manage your appointments"
  actions={<Button>New Booking</Button>}
/>
```

**Typografi:**
- Title: `text-lg font-semibold tracking-tight md:text-xl`
- Description: `text-xs text-muted-foreground md:text-sm`

**Status:** ✅ Brukt på Bookings, Calendar, Customers, Employees, Services, Shifts

### Section

**Hensikt:** Seksjoner med tittel, beskrivelse og handlinger

**Props:**
- `title?: string` - Seksjon-tittel (optional)
- `description?: string` - Beskrivelse (optional)
- `actions?: ReactNode` - Handlinger (optional)
- `children: ReactNode` - Innhold (required)
- `className?: string` - Ekstra klasser (optional)

**Bruk:**
```typescript
<Section
  title="Today's Bookings"
  description="Bookings scheduled for today"
  actions={<Button>View All</Button>}
>
  {/* Content */}
</Section>
```

**Typografi:**
- Title: `text-sm font-medium tracking-tight`
- Description: `text-xs text-muted-foreground sm:text-sm`

**Status:** ✅ Brukt på Dashboard, Settings

### SectionCard

**Hensikt:** Kort med tittel og beskrivelse

**Props:**
- `title?: string` - Kort-tittel (optional)
- `description?: string` - Beskrivelse (optional)
- `children: ReactNode` - Innhold (required)
- `className?: string` - Ekstra klasser (optional)

**Bruk:**
```typescript
<SectionCard
  title="STATISTICS"
  description="Weekly overview"
>
  {/* Content */}
</SectionCard>
```

**Styling:**
- `rounded-xl border bg-card p-4 shadow-sm sm:p-5`

**Status:** ✅ Brukt på Dashboard, Settings

### FormLayout

**Hensikt:** Skjemaer med tittel, beskrivelse og footer

**Props:**
- `title: string` - Form-tittel (required)
- `description?: string` - Beskrivelse (optional)
- `children: ReactNode` - Form-felter (required)
- `footer?: ReactNode` - Footer med handlinger (optional)

**Bruk:**
```typescript
<FormLayout
  title="Create Employee"
  description="Add a new employee to your salon"
  footer={<Button>Save</Button>}
>
  {/* Form fields */}
</FormLayout>
```

**Styling:**
- `rounded-2xl border bg-card p-6 shadow-sm`

**Status:** ✅ Brukt på Settings, Forms

### EmptyState

**Hensikt:** Vis tom tilstand med call-to-action

**Props:**
- `title: string` - Tittel (required)
- `description?: string` - Beskrivelse (optional)
- `action?: ReactNode` - Call-to-action knapp (optional)

**Bruk:**
```typescript
<EmptyState
  title="No bookings yet"
  description="Create your first booking to get started"
  action={<Button>Create Booking</Button>}
/>
```

**Styling:**
- `rounded-lg border border-dashed bg-muted/20 px-4 py-6`

**Status:** ✅ Brukt på Bookings, Calendar, Customers, Employees, Services, Shifts

### TableToolbar

**Hensikt:** Verktøylinje for tabeller med søk, filtre og handlinger

**Props:**
- `title?: string` - Toolbar-tittel (optional)
- `children?: ReactNode` - Innhold (søk, filtre) (optional)
- `actions?: ReactNode` - Handlinger (optional)

**Bruk:**
```typescript
<TableToolbar
  title="BOOKINGS"
  children={<Input placeholder="Search..." />}
  actions={<Button>New Booking</Button>}
/>
```

**Styling:**
- `border-b pb-3` med flex layout

**Status:** ✅ Brukt på Bookings, Calendar, Customers, Employees, Services, Shifts

### Layout-mønstre

#### Standard Side-struktur

```typescript
<DashboardShell>
  <PageHeader
    title="Page Title"
    description="Page description"
    actions={<Button>Action</Button>}
  />
  <div className="mt-6">
    <TableToolbar
      title="TABLE"
      children={<Input placeholder="Search..." />}
      actions={<Button>New</Button>}
    />
    {/* Table or Content */}
  </div>
</DashboardShell>
```

#### Side med Seksjoner

```typescript
<DashboardShell>
  <PageHeader title="Dashboard" />
  <div className="mt-6 space-y-6">
    <Section
      title="Section 1"
      description="Description"
      actions={<Button>Action</Button>}
    >
      {/* Content */}
    </Section>
    <Section title="Section 2">
      {/* Content */}
    </Section>
  </div>
</DashboardShell>
```

#### Side med Forms

```typescript
<DashboardShell>
  <PageHeader title="Settings" />
  <div className="mt-6">
    <FormLayout
      title="Form Title"
      description="Form description"
      footer={<Button>Save</Button>}
    >
      {/* Form fields */}
    </FormLayout>
  </div>
</DashboardShell>
```

### Best Practices

1. **Bruk DashboardShell:** Alle dashboard-sider skal wrappes i `DashboardShell`
2. **Bruk PageHeader:** Alle sider skal ha `PageHeader` for konsistent struktur
3. **Bruk EmptyState:** Vis `EmptyState` når lister er tomme
4. **Bruk TableToolbar:** Alle tabeller skal ha `TableToolbar` for søk/filtre
5. **Bruk Section:** Grupper relatert innhold i `Section`-komponenter
6. **Konsistent spacing:** Bruk `mt-6` mellom PageHeader og innhold

---

## Komponent-dokumentasjon

### DashboardShell

**Hensikt:** Hovedlayout for alle dashboard-sider

**Bruk:**
```typescript
<DashboardShell>
  <YourPageContent />
</DashboardShell>
```

**Features:**
- Sidebar med navigasjon
- Header med brukerinfo
- Command palette (Cmd/Ctrl + K)
- Notification center
- Språkvelger
- Responsiv design

### CommandPalette

**Hensikt:** Global søk og navigasjon

**Bruk:**
```typescript
<CommandPalette open={isOpen} onClose={() => setIsOpen(false)} />
```

**Features:**
- Søk etter bookings, customers, employees, services
- Navigasjon til sider
- Keyboard shortcuts

### PageHeader

**Hensikt:** Konsistent side-header

**Bruk:**
```typescript
<PageHeader
  title="Bookings"
  description="Manage appointments"
  actions={<Button>New</Button>}
/>
```

### EmptyState

**Hensikt:** Vis tom tilstand med call-to-action

**Bruk:**
```typescript
<EmptyState
  title="No bookings"
  description="Create your first booking"
  action={<Button>Create</Button>}
/>
```

### StatsGrid

**Hensikt:** Responsiv grid for statistikk

**Bruk:**
```typescript
<StatsGrid>
  <StatCard />
  <StatCard />
  <StatCard />
</StatsGrid>
```

**Responsive:**
- 1 kolonne på mobil
- 2 kolonner på små skjermer
- 3 kolonner på md+ skjermer

---

## Retningslinjer for Nye Sider

Når du lager en ny side i TeqBook, følg disse retningslinjene for å sikre konsistens med design-systemet.

### 1. Struktur

Alle nye dashboard-sider skal følge denne strukturen:

```typescript
<DashboardShell>
  <PageHeader
    title="Page Title"
    description="Page description"
    actions={<Button>Action</Button>}
  />
  <div className="mt-6">
    {/* Page content */}
  </div>
</DashboardShell>
```

### 2. Bakgrunnsvalg

**Dashboard-sider:**
- Bruk `bg-background` for hovedbakgrunn
- Bruk `bg-card` for kort og paneler
- Bruk `bg-muted` for subtile bakgrunner

**Ikke bruk:**
- Hardkodede farger (`bg-white`, `bg-slate-50`, etc.)
- Gradienter (unntatt marketing-sider)
- Tilfeldige farger som bryter design-systemet

**Eksempel:**
```typescript
// ✅ Riktig
<div className="bg-background">
  <Card className="bg-card">
    <div className="bg-muted p-4">Content</div>
  </Card>
</div>

// ❌ Feil
<div className="bg-white">
  <div className="bg-slate-50">Content</div>
</div>
```

### 3. Knappevarianter

Bruk følgende varianter basert på kontekst:

| Variant | Bruk | Eksempel |
|---------|------|----------|
| `default` | Primære handlinger | "Save", "Create", "Submit" |
| `destructive` | Farlige handlinger | "Delete", "Cancel" |
| `outline` | Sekundære handlinger | "Cancel", "Back" |
| `ghost` | Tertiære handlinger | "Edit", "View" |
| `link` | Navigasjon | "Learn more", "View all" |

**Eksempel:**
```typescript
// Primær handling
<Button variant="default">Create Booking</Button>

// Farlig handling
<Button variant="destructive">Delete</Button>

// Sekundær handling
<Button variant="outline">Cancel</Button>
```

### 4. Headings og Cards

**Headings:**
- Bruk `PageHeader` for side-tittel
- Bruk `Section` for seksjon-titler
- Følg typografi-skalaen (se "Typografi-regler")

**Cards:**
- Bruk `Card` komponent fra `components/ui/card.tsx`
- Bruk `SectionCard` for kort med tittel
- Bruk `bg-card` for bakgrunn

**Eksempel:**
```typescript
// Side-header
<PageHeader
  title="Bookings"
  description="Manage your appointments"
/>

// Seksjon
<Section
  title="Today's Bookings"
  description="Bookings scheduled for today"
>
  {/* Content */}
</Section>

// Card
<Card className="bg-card">
  <CardHeader>
    <CardTitle>Statistics</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### 5. Tabeller

Alle tabeller skal ha:
- `TableToolbar` for søk og filtre
- `EmptyState` når listen er tom
- Konsistent styling med design tokens

**Eksempel:**
```typescript
<TableToolbar
  title="BOOKINGS"
  children={<Input placeholder="Search..." />}
  actions={<Button>New Booking</Button>}
/>
{bookings.length === 0 ? (
  <EmptyState
    title="No bookings"
    description="Create your first booking"
    action={<Button>Create Booking</Button>}
  />
) : (
  <Table>
    {/* Table content */}
  </Table>
)}
```

### 6. Forms

Bruk `FormLayout` for skjemaer:

```typescript
<FormLayout
  title="Create Employee"
  description="Add a new employee to your salon"
  footer={
    <>
      <Button variant="outline">Cancel</Button>
      <Button variant="default">Save</Button>
    </>
  }
>
  {/* Form fields */}
</FormLayout>
```

### 7. Spacing

Følg konsistent spacing:
- `mt-6` mellom `PageHeader` og innhold
- `gap-4` eller `gap-6` for grid-spacing
- `p-4` eller `p-6` for padding i kort

### 8. Farger

**Bruk design tokens:**
- `text-foreground` for hovedtekst
- `text-muted-foreground` for sekundær tekst
- `bg-card` for kort
- `bg-background` for bakgrunn
- `border` for rammer

**Ikke bruk:**
- Hardkodede farger (`text-slate-900`, `bg-white`, etc.)
- Tilfeldige farger som bryter design-systemet

### 9. Responsiv Design

- Bruk Tailwind's responsive breakpoints (`sm:`, `md:`, `lg:`)
- Test på mobil, tablet og desktop
- Følg eksisterende responsive patterns

### 10. Checklist for Nye Sider

Før du pusher en ny side, sjekk at:

- [ ] Side er wrappet i `DashboardShell`
- [ ] Side har `PageHeader`
- [ ] Alle farger bruker design tokens
- [ ] Knapper bruker riktig variant
- [ ] Tabeller har `TableToolbar` og `EmptyState`
- [ ] Forms bruker `FormLayout`
- [ ] Spacing er konsistent
- [ ] Responsiv design fungerer
- [ ] Ingen hardkodede farger
- [ ] Ingen console errors eller warnings

---

## Best Practices

### 1. Bruk design tokens

```typescript
// ✅ RIKTIG
<div className="bg-card text-card-foreground border rounded-xl p-6">

// ❌ FEIL
<div className="bg-white text-black border rounded-lg p-6">
```

### 2. Konsistent spacing

```typescript
// ✅ RIKTIG
<div className="space-y-4">
  <Card className="p-6">
    <h2 className="text-lg font-semibold mb-2">Title</h2>
  </Card>
</div>

// ❌ FEIL
<div className="space-y-8">
  <Card className="p-10">
    <h2 className="text-xl font-bold mb-4">Title</h2>
  </Card>
</div>
```

### 3. Semantiske farger

```typescript
// ✅ RIKTIG - Destructive action
<Button variant="destructive">Delete</Button>

// ✅ RIKTIG - Primary action
<Button>Save</Button>

// ✅ RIKTIG - Secondary action
<Button variant="outline">Cancel</Button>
```

### 4. Responsiv design

```typescript
// ✅ RIKTIG - Responsive classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// ❌ FEIL - Fixed width
<div className="grid grid-cols-3 gap-4">
```

---

## Fjern gamle/dupliserte stiler

### Sjekkliste

- [ ] Søk etter hardkodede farger (`bg-white`, `text-black`, etc.)
- [ ] Erstatt med design tokens (`bg-card`, `text-foreground`, etc.)
- [ ] Fjern dupliserte komponenter
- [ ] Konsolider lignende komponenter

---

## Relaterte dokumenter

- `docs/architecture/folder-structure.md` - Filstruktur
- `docs/coding-style.md` - Kodestandarder
- [shadcn/ui Documentation](https://ui.shadcn.com/)

