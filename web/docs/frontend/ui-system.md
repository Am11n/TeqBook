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

### Variants

```typescript
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

### Sizes

```typescript
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon only</Button>
```

### Eksempler

```typescript
// Primary action
<Button>Create Booking</Button>

// Destructive action
<Button variant="destructive">Delete</Button>

// Secondary action
<Button variant="outline">Cancel</Button>

// With icon
<Button>
  <PlusIcon />
  Add New
</Button>
```

---

## Konsistente Bakgrunner

### Sidebar

```typescript
className="bg-sidebar text-sidebar-foreground"
```

### Cards

```typescript
className="bg-card text-card-foreground border rounded-xl shadow-sm"
```

### Muted Areas

```typescript
className="bg-muted text-muted-foreground"
```

---

## Typografi-konsistens

### Headings

```typescript
// Page title
<h1 className="text-lg font-semibold tracking-tight md:text-xl">
  Bookings
</h1>

// Section title
<h2 className="text-base font-semibold">
  Today's Bookings
</h2>

// Subtitle
<p className="text-sm text-muted-foreground">
  Manage your bookings
</p>
```

### Body Text

```typescript
// Default
<p className="text-sm">Regular text</p>

// Muted
<p className="text-sm text-muted-foreground">Secondary text</p>

// Small
<p className="text-xs text-muted-foreground">Small text</p>
```

---

## Fargebruk per Side

### Dashboard

- Primær: `bg-card` med `text-card-foreground`
- Stats: `bg-muted/20` med border
- Cards: `bg-card` med shadow

### Bookings/Calendar

- Tabeller: `bg-background`
- Status badges: Semantiske farger (yellow, blue, green, red)

### Settings

- Forms: `bg-card` med border
- Inputs: `bg-background` med border

---

## Reusable Layout Components

### PageHeader

```typescript
<PageHeader
  title="Bookings"
  description="Manage your appointments"
  actions={<Button>New Booking</Button>}
/>
```

### EmptyState

```typescript
<EmptyState
  title="No bookings yet"
  description="Create your first booking to get started"
  action={<Button>Create Booking</Button>}
/>
```

### Section

```typescript
<Section
  title="Today's Bookings"
  description="Bookings scheduled for today"
  actions={<Button>View All</Button>}
>
  {/* Content */}
</Section>
```

### FormLayout

```typescript
<FormLayout
  title="Create Employee"
  description="Add a new employee to your salon"
  footer={<Button>Save</Button>}
>
  {/* Form fields */}
</FormLayout>
```

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

