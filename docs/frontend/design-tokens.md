# TeqBook – Design Tokens

Dette dokumentet definerer alle design tokens som brukes i TeqBook. Design tokens er de grunnleggende byggeklossene for design-systemet vårt.

---

## Farger

### Primærfarger

```css
--primary: oklch(0.205 0 0);
--primary-foreground: oklch(0.985 0 0);
```

**Bruk:** Hovedknapper, lenker, viktige handlinger

### Sekundærfarger

```css
--secondary: oklch(0.97 0 0);
--secondary-foreground: oklch(0.205 0 0);
```

**Bruk:** Sekundære knapper, bakgrunner

### Accent-farger

```css
--accent: oklch(0.97 0 0);
--accent-foreground: oklch(0.205 0 0);
```

**Bruk:** Fremheving, hover-states

### Muted-farger

```css
--muted: oklch(0.97 0 0);
--muted-foreground: oklch(0.556 0 0);
```

**Bruk:** Subtile bakgrunner, sekundær tekst

### Destructive-farger

```css
--destructive: oklch(0.577 0.245 27.325);
```

**Bruk:** Farlige handlinger (slett, avbryt)

### Bakgrunnsfarger

```css
--background: oklch(1 0 0);
--foreground: oklch(0.145 0 0);
```

**Bruk:** Hovedbakgrunn og tekst

### Surface-farger

```css
--card: oklch(1 0 0);
--card-foreground: oklch(0.145 0 0);
--popover: oklch(1 0 0);
--popover-foreground: oklch(0.145 0 0);
```

**Bruk:** Kort, paneler, popovers

### Border og Input

```css
--border: oklch(0.922 0 0);
--input: oklch(0.922 0 0);
--ring: oklch(0.708 0 0);
```

**Bruk:** Rammer, input-felter, focus-ringer

### Sidebar-farger

```css
--sidebar: oklch(0.985 0 0);
--sidebar-foreground: oklch(0.145 0 0);
--sidebar-primary: oklch(0.205 0 0);
--sidebar-primary-foreground: oklch(0.985 0 0);
--sidebar-accent: oklch(0.97 0 0);
--sidebar-accent-foreground: oklch(0.205 0 0);
--sidebar-border: oklch(0.922 0 0);
--sidebar-ring: oklch(0.708 0 0);
```

**Bruk:** Sidebar-komponenter

### Chart-farger

```css
--chart-1: oklch(0.646 0.222 41.116);
--chart-2: oklch(0.6 0.118 184.704);
--chart-3: oklch(0.398 0.07 227.392);
--chart-4: oklch(0.828 0.189 84.429);
--chart-5: oklch(0.769 0.188 70.08);
```

**Bruk:** Grafer og visualiseringer

---

## Typografi

### Font-familier

```css
--font-sans: var(--font-geist-sans);
--font-mono: var(--font-geist-mono);
```

**Bruk:**
- `--font-sans`: Hovedfont for all tekst
- `--font-mono`: Monospace for kode og tekniske verdier

### Font-størrelser

| Token | Tailwind Class | Rem | Px | Bruk |
|-------|----------------|-----|-----|------|
| `text-xs` | `text-xs` | 0.75rem | 12px | Hjelpetekst, labels |
| `text-sm` | `text-sm` | 0.875rem | 14px | Body tekst, sekundær tekst |
| `text-base` | `text-base` | 1rem | 16px | Standard body tekst |
| `text-lg` | `text-lg` | 1.125rem | 18px | Undertitler, viktig tekst |
| `text-xl` | `text-xl` | 1.25rem | 20px | Seksjon-titler |
| `text-2xl` | `text-2xl` | 1.5rem | 24px | Side-titler |
| `text-3xl` | `text-3xl` | 1.875rem | 30px | Hovedtitler |

### Font-vekter

| Vekt | Tailwind Class | Bruk |
|------|----------------|------|
| 400 | `font-normal` | Standard tekst |
| 500 | `font-medium` | Viktig tekst, labels |
| 600 | `font-semibold` | Titler, overskrifter |
| 700 | `font-bold` | Ekstra viktig tekst |

### Line Height

| Tailwind Class | Verdi | Bruk |
|----------------|-------|------|
| `leading-none` | 1 | Tette titler |
| `leading-tight` | 1.25 | Titler |
| `leading-normal` | 1.5 | Body tekst |
| `leading-relaxed` | 1.75 | Lengre tekst |

---

## Border Radius

```css
--radius-sm: calc(var(--radius) - 4px);  /* 2.5px */
--radius-md: calc(var(--radius) - 2px);  /* 4.5px */
--radius-lg: var(--radius);              /* 10px */
--radius-xl: calc(var(--radius) + 4px);  /* 14px */
```

**Base radius:** `--radius: 0.625rem` (10px)

### Tailwind Classes

| Class | Verdi | Bruk |
|-------|-------|------|
| `rounded-sm` | `--radius-sm` | Små elementer |
| `rounded-md` | `--radius-md` | Standard elementer |
| `rounded-lg` | `--radius-lg` | Kort, paneler |
| `rounded-xl` | `--radius-xl` | Store kort, modaler |

---

## Shadows

### Soft Shadow

```css
shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
```

**Bruk:** Subtile heving, borders

### Medium Shadow

```css
shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
```

**Bruk:** Kort, paneler

### Hard Shadow

```css
shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
```

**Bruk:** Modaler, dropdowns

### Custom Shadow (xs)

```css
shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
```

**Bruk:** Knapper, input-felter

---

## Spacing

### Spacing Scale

| Token | Tailwind Class | Rem | Px | Bruk |
|-------|----------------|-----|-----|------|
| `space-0` | `0` | 0 | 0px | Ingen spacing |
| `space-1` | `0.25rem` | 0.25rem | 4px | Minimal spacing |
| `space-2` | `0.5rem` | 0.5rem | 8px | Tett spacing |
| `space-3` | `0.75rem` | 0.75rem | 12px | Standard spacing |
| `space-4` | `1rem` | 1rem | 16px | Normal spacing |
| `space-6` | `1.5rem` | 1.5rem | 24px | Stor spacing |
| `space-8` | `2rem` | 2rem | 32px | Ekstra stor spacing |

### Padding Patterns

| Pattern | Classes | Bruk |
|---------|---------|------|
| Small | `p-2` | Små elementer |
| Medium | `p-4` | Standard elementer |
| Large | `p-6` | Kort, paneler |
| Extra Large | `p-8` | Store kort |

### Gap Patterns

| Pattern | Classes | Bruk |
|---------|---------|------|
| Small | `gap-2` | Tette lister |
| Medium | `gap-4` | Standard lister |
| Large | `gap-6` | Store lister |

---

## Breakpoints

| Breakpoint | Tailwind Class | Min Width | Bruk |
|------------|----------------|-----------|------|
| `sm` | `sm:` | 640px | Små skjermer |
| `md` | `md:` | 768px | Medium skjermer |
| `lg` | `lg:` | 1024px | Store skjermer |
| `xl` | `xl:` | 1280px | Ekstra store skjermer |
| `2xl` | `2xl:` | 1536px | Veldig store skjermer |

---

## Dark Mode

Alle farger har dark mode-variabler definert i `globals.css`:

```css
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* ... */
}
```

**Bruk:** Automatisk støtte via Tailwind's dark mode variant.

---

## Bruk i Kode

### Farger

```tsx
// ✅ RIKTIG - Bruk design tokens
<div className="bg-card text-card-foreground border rounded-lg p-6">
  <h2 className="text-lg font-semibold text-foreground">Title</h2>
  <p className="text-sm text-muted-foreground">Description</p>
</div>

// ❌ FEIL - Hardkodede farger
<div className="bg-white text-black border rounded-lg p-6">
  <h2 className="text-lg font-semibold text-gray-900">Title</h2>
  <p className="text-sm text-gray-600">Description</p>
</div>
```

### Spacing

```tsx
// ✅ RIKTIG - Bruk spacing scale
<div className="space-y-4 p-6">
  <Card className="p-4">Content</Card>
</div>

// ❌ FEIL - Hardkodede verdier
<div className="space-y-16 p-24">
  <Card className="p-20">Content</Card>
</div>
```

### Typografi

```tsx
// ✅ RIKTIG - Bruk typography scale
<h1 className="text-xl font-semibold tracking-tight">Title</h1>
<p className="text-sm text-muted-foreground">Description</p>

// ❌ FEIL - Hardkodede størrelser
<h1 className="text-[22px] font-bold">Title</h1>
<p className="text-[13px] text-gray-600">Description</p>
```

---

## Relaterte Dokumenter

- `docs/frontend/ui-system.md` - UI system og komponenter
- `docs/frontend/components.md` - Komponentdokumentasjon
- `src/app/globals.css` - CSS-variabler definisjon

