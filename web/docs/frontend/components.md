# TeqBook – Component Documentation

Dette dokumentet dokumenterer alle komponenter i TeqBook med eksempler og bruksanvisninger.

---

## Base Components (`components/ui/`)

### Button

**Lokasjon:** `src/components/ui/button.tsx`

**Beskrivelse:** All-purpose button-komponent med flere varianter og størrelser.

**Bruk:**
```typescript
import { Button } from "@/components/ui/button";

// Primary button
<Button>Save</Button>

// Destructive action
<Button variant="destructive">Delete</Button>

// With icon
<Button>
  <PlusIcon />
  Add New
</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
```

**Variants:** `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`  
**Sizes:** `sm`, `default`, `lg`, `icon`, `icon-sm`, `icon-lg`

---

### Card

**Lokasjon:** `src/components/ui/card.tsx`

**Beskrivelse:** Container-komponent for innhold.

**Bruk:**
```typescript
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Booking Details</CardTitle>
    <CardDescription>View and manage booking information</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter>
    <Button>Save</Button>
  </CardFooter>
</Card>
```

---

### Input

**Lokasjon:** `src/components/ui/input.tsx`

**Beskrivelse:** Input-felt for tekst.

**Bruk:**
```typescript
import { Input } from "@/components/ui/input";

<Input
  type="text"
  placeholder="Enter name"
  value={name}
  onChange={(e) => setName(e.target.value)}
/>
```

---

### Badge

**Lokasjon:** `src/components/ui/badge.tsx`

**Beskrivelse:** Badge-komponent for labels og status.

**Bruk:**
```typescript
import { Badge } from "@/components/ui/badge";

<Badge>Active</Badge>
<Badge variant="destructive">Cancelled</Badge>
<Badge variant="secondary">Pending</Badge>
```

---

### Dialog

**Lokasjon:** `src/components/ui/dialog.tsx`

**Beskrivelse:** Modal dialog-komponent.

**Bruk:**
```typescript
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

<Dialog>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Create Booking</DialogTitle>
      <DialogDescription>Fill in the booking details</DialogDescription>
    </DialogHeader>
    {/* Form content */}
  </DialogContent>
</Dialog>
```

---

### Table

**Lokasjon:** `src/components/ui/table.tsx`

**Beskrivelse:** Table-komponent for data-visning.

**Bruk:**
```typescript
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>john@example.com</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

## Domain Components (`components/`)

### DashboardShell

**Lokasjon:** `src/components/dashboard-shell.tsx`

**Beskrivelse:** Hovedlayout for alle dashboard-sider. Inkluderer sidebar, header, command palette og notification center.

**Bruk:**
```typescript
import { DashboardShell } from "@/components/dashboard-shell";

export default function MyPage() {
  return (
    <DashboardShell>
      <PageHeader title="My Page" />
      {/* Page content */}
    </DashboardShell>
  );
}
```

**Features:**
- Responsiv sidebar med navigasjon
- Header med bruker- og salon-info
- Command palette (Cmd/Ctrl + K)
- Notification center
- Språkvelger
- User menu

---

### PageHeader

**Lokasjon:** `src/components/page-header.tsx`

**Beskrivelse:** Konsistent side-header med tittel, beskrivelse og handlinger.

**Bruk:**
```typescript
import { PageHeader } from "@/components/page-header";

<PageHeader
  title="Bookings"
  description="Manage your appointments"
  actions={<Button>New Booking</Button>}
/>
```

**Props:**
- `title: string` - Side-tittel (påkrevd)
- `description?: string` - Beskrivelse (valgfritt)
- `actions?: ReactNode` - Handlinger (valgfritt)

---

### EmptyState

**Lokasjon:** `src/components/empty-state.tsx`

**Beskrivelse:** Viser tom tilstand med call-to-action.

**Bruk:**
```typescript
import { EmptyState } from "@/components/empty-state";

<EmptyState
  title="No bookings yet"
  description="Create your first booking to get started"
  action={<Button>Create Booking</Button>}
/>
```

**Props:**
- `title: string` - Tittel (påkrevd)
- `description?: string` - Beskrivelse (valgfritt)
- `action?: ReactNode` - Call-to-action (valgfritt)

---

### Section

**Lokasjon:** `src/components/section.tsx`

**Beskrivelse:** Seksjon-komponent med tittel, beskrivelse og handlinger.

**Bruk:**
```typescript
import { Section } from "@/components/section";

<Section
  title="Today's Bookings"
  description="Bookings scheduled for today"
  actions={<Button>View All</Button>}
>
  {/* Content */}
</Section>
```

**Props:**
- `title: string` - Seksjon-tittel (påkrevd)
- `description?: string` - Beskrivelse (valgfritt)
- `actions?: ReactNode` - Handlinger (valgfritt)
- `children: ReactNode` - Innhold (påkrevd)
- `className?: string` - Ekstra CSS-klasser (valgfritt)

---

### FormLayout

**Lokasjon:** `src/components/form-layout.tsx`

**Beskrivelse:** Layout for skjemaer med tittel, beskrivelse og footer.

**Bruk:**
```typescript
import { FormLayout } from "@/components/form-layout";

<FormLayout
  title="Create Employee"
  description="Add a new employee to your salon"
  footer={<Button>Save</Button>}
>
  {/* Form fields */}
</FormLayout>
```

**Props:**
- `title: string` - Form-tittel (påkrevd)
- `description?: string` - Beskrivelse (valgfritt)
- `children: ReactNode` - Form-innhold (påkrevd)
- `footer?: ReactNode` - Footer med handlinger (valgfritt)

---

### StatsGrid

**Lokasjon:** `src/components/stats-grid.tsx`

**Beskrivelse:** Responsiv grid for statistikk-kort.

**Bruk:**
```typescript
import { StatsGrid } from "@/components/stats-grid";

<StatsGrid>
  <Card>Stat 1</Card>
  <Card>Stat 2</Card>
  <Card>Stat 3</Card>
</StatsGrid>
```

**Responsive:**
- 1 kolonne på mobil
- 2 kolonner på små skjermer (xs+)
- 3 kolonner på medium+ skjermer (md+)

---

### TableToolbar

**Lokasjon:** `src/components/table-toolbar.tsx`

**Beskrivelse:** Verktøylinje for tabeller med søk, filtre og handlinger.

**Bruk:**
```typescript
import { TableToolbar } from "@/components/table-toolbar";

<TableToolbar
  title="Bookings"
  actions={<Button>New Booking</Button>}
>
  <Input placeholder="Search..." />
</TableToolbar>
```

**Props:**
- `title?: string` - Tittel (valgfritt)
- `children?: ReactNode` - Innhold (søk, filtre, etc.) (valgfritt)
- `actions?: ReactNode` - Handlinger (valgfritt)

---

### CommandPalette

**Lokasjon:** `src/components/command-palette.tsx`

**Beskrivelse:** Global søk og navigasjon med keyboard shortcuts.

**Bruk:**
```typescript
import { CommandPalette } from "@/components/command-palette";

<CommandPalette open={isOpen} onClose={() => setIsOpen(false)} />
```

**Features:**
- Åpnes med Cmd/Ctrl + K
- Søk etter bookings, customers, employees, services
- Navigasjon til sider
- Keyboard navigation

**Props:**
- `open: boolean` - Om paletten er åpen (påkrevd)
- `onClose: () => void` - Callback når paletten lukkes (påkrevd)

---

### PublicBookingPage

**Lokasjon:** `src/components/public-booking-page.tsx`

**Beskrivelse:** Offentlig booking-side for kunder.

**Bruk:**
```typescript
import { PublicBookingPage } from "@/components/public-booking-page";

<PublicBookingPage salonSlug="example-salon" />
```

**Features:**
- Steg-for-steg booking-flow
- Service/employee/dato-valg
- Ledige tidslots
- Kundeinformasjon
- Mobil-vennlig

**Props:**
- `salonSlug: string` - Salon slug (påkrevd)

---

### NotificationCenter

**Lokasjon:** `src/components/notification-center.tsx`

**Beskrivelse:** Notifikasjonssenter for å vise og håndtere notifikasjoner.

**Bruk:**
```typescript
import { NotificationCenter } from "@/components/notification-center";

<NotificationCenter />
```

**Features:**
- Vise notifikasjoner
- Markere som lest
- Slette notifikasjoner

---

### CurrentUserBadge

**Lokasjon:** `src/components/current-user-badge.tsx`

**Beskrivelse:** Badge som viser nåværende bruker.

**Bruk:**
```typescript
import { CurrentUserBadge } from "@/components/current-user-badge";

<CurrentUserBadge />
```

---

### CurrentSalonBadge

**Lokasjon:** `src/components/current-salon-badge.tsx`

**Beskrivelse:** Badge som viser nåværende salon.

**Bruk:**
```typescript
import { CurrentSalonBadge } from "@/components/current-salon-badge";

<CurrentSalonBadge />
```

---

## Provider Components

### LocaleProvider

**Lokasjon:** `src/components/locale-provider.tsx`

**Beskrivelse:** Context provider for språkvalg.

**Bruk:**
```typescript
import { LocaleProvider, useLocale } from "@/components/locale-provider";

// In root layout
<LocaleProvider>
  <App />
</LocaleProvider>

// In components
function MyComponent() {
  const { locale, setLocale } = useLocale();
  // ...
}
```

---

### SalonProvider

**Lokasjon:** `src/components/salon-provider.tsx`

**Beskrivelse:** Context provider for salon-data og autentisering.

**Bruk:**
```typescript
import { SalonProvider, useCurrentSalon } from "@/components/salon-provider";

// In root layout
<SalonProvider>
  <App />
</SalonProvider>

// In components
function MyComponent() {
  const { salon, loading, error, isReady } = useCurrentSalon();
  // ...
}
```

---

## Best Practices

### 1. Bruk riktig komponent

```typescript
// ✅ RIKTIG - Bruk PageHeader for side-header
<PageHeader title="Bookings" />

// ❌ FEIL - Hardkodet header
<h1 className="text-xl font-bold">Bookings</h1>
```

### 2. Konsistent spacing

```typescript
// ✅ RIKTIG - Bruk Section for konsistent spacing
<Section title="Today's Bookings">
  {/* Content */}
</Section>

// ❌ FEIL - Manuell spacing
<div className="mb-6">
  <h2 className="mb-2">Today's Bookings</h2>
  {/* Content */}
</div>
```

### 3. Semantiske komponenter

```typescript
// ✅ RIKTIG - Bruk EmptyState for tom tilstand
<EmptyState title="No data" action={<Button>Create</Button>} />

// ❌ FEIL - Hardkodet tom tilstand
<div className="text-center py-8">
  <p>No data</p>
  <Button>Create</Button>
</div>
```

---

## Relaterte dokumenter

- `docs/frontend/ui-system.md` - Design system og tokens
- `docs/architecture/folder-structure.md` - Filstruktur
- `docs/coding-style.md` - Kodestandarder

