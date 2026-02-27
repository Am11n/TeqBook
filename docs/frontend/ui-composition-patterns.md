# UI Composition Patterns (Dashboard)

Dette dokumentet definerer gjenbrukbare **komponent-komposisjoner** (ikke enkeltkomponenter).
Målet er konsistent spacing, padding og struktur på tvers av dashboard-sider.

## 1) Standard tabell-blokk (obligatorisk mønster)

Når en side skal "se ut som de andre tabellene", bruk alltid denne pakken samlet:

1. **Kort-wrapper** rundt tabellen  
   `rounded-xl border bg-card p-4 shadow-sm`
2. **DataTable inni kortet** (`DataTable` fra `@teqbook/data-table` eller prosjektets wrapper)
3. **Søkefelt i toolbar** (inne i tabellblokken)
4. **Høyre side i toolbar**:
   - lagrede views (bookmark)
   - toggle columns

### Referanse-snippet

```tsx
<div className="rounded-xl border bg-card p-4 shadow-sm">
  <DataTable
    columns={columns}
    data={rows}
    rowKey={(row) => row.id}
    searchQuery={searchQuery}
    onSearchChange={setSearchQuery}
    searchPlaceholder="Search..."
    storageKey="some-stable-key"
  />
</div>
```

## 2) Eksterne controls vs tabellblokk

- **Tilhører tabellen**: søk + lagre view + toggle columns (inne i tabellblokken)
- **Kan ligge utenfor kortet**: side-spesifikke handlinger som "Showing X of Y" og "Export CSV"
- Primær handling utenfor kort bruker normal primary-knapp (`variant="default"`).

## 3) Filterkort (når brukt)

- Filterkort kan ligge over tabellblokken.
- Hvis filterkort er kollapsbart, skal default være **lukket** når siden åpnes.
- Filterkort skal ikke duplisere søk hvis tabelltoolbar allerede har søk.

## 4) Ikke gjør dette

- Ikke rendér rå `<Table>` direkte på nye sider når DataTable-mønsteret er riktig valg.
- Ikke bland ulike kort-spacings på lignende lister (unngå ad-hoc padding/margin).
- Ikke legg custom "table actions" tilfeldig utenfor mønsteret.

## 5) Bruk dette ved nye sider/refactors

Før ferdigstilling av en ny tabellside:

- Sammenlign visuelt med `employees`-siden.
- Verifiser at wrapper, toolbar og spacing matcher standardmønsteret.
- Behold samme struktur med mindre produktkrav eksplisitt sier noe annet.

## 6) Responsive lister (mobilkort + desktop-tabell)

Bruk denne komposisjonen for entitetslister som skal funke godt på mobil:

- **Mobil**: card/list-visning med `md:hidden`
- **Desktop**: tabellvisning med `hidden md:block` + `DataTable`
- Begge visninger skal bruke samme underliggende data og handlinger

Typiske steder:

- `apps/dashboard/src/app/employees/page.tsx`
- `apps/dashboard/src/app/services/page.tsx`
- `apps/dashboard/src/app/bookings/page.tsx`

## 7) Liste med dialog-flyt (create + detail/edit)

Standard flyt for CRUD-lister:

- Én listeside (ListPage eller PageLayout)
- Create-dialog som sibling til listen
- Detail/Edit-dialog styrt av side-state (ikke inne i tabellceller)
- Etter create/update/delete: reload av liste-data

Typiske steder:

- `apps/dashboard/src/app/customers/page.tsx`
- `apps/dashboard/src/app/employees/page.tsx`
- `apps/dashboard/src/app/services/page.tsx`

## 8) Tabbed section-layout

For seksjoner med undersider (settings/reports/bookings):

- `DashboardShell` + `TabbedPage`
- Tabs definert i `layout.tsx` (id/label/href/visibility)
- Innhold renderes i tab-content, ikke med egne nested page-shells

Typiske steder:

- `apps/dashboard/src/app/settings/layout.tsx`
- `apps/dashboard/src/app/reports/layout.tsx`
- `apps/dashboard/src/app/bookings/layout.tsx`

## 9) Settings-form komposisjon

Når siden er en innstillingsside med lagre-flyt:

- `SettingsGrid` (main + optional aside/footer)
- `SettingsSection` for delseksjoner
- `StickySaveBar` for save/discard/retry
- Dirty-state skal knyttes til tab-guard når siden ligger i settings-tabs

Typiske steder:

- `apps/dashboard/src/app/settings/general/page.tsx`
- `apps/dashboard/src/app/settings/notifications/page.tsx`
- `apps/dashboard/src/app/settings/security/page.tsx`

## 10) Filter + summary + hovedinnhold (+ valgfri sidebar)

For operasjonssider som bookings:

- Filterstrip øverst
- Valgfri summary-blokk under filter
- Hovedinnhold i standard content-card
- Valgfri høyre sidebar på større skjerm

Typisk sted:

- `apps/dashboard/src/app/bookings/page.tsx`

## 11) Primærknapper (tekst-only regel)

For konsistent UI i TeqBook:

- **Primærknapper med tekst skal ikke ha ledende `+`-ikon**
- Eksempler: `New`, `Create`, `Add`, `Invite` vises som ren tekst i primary-knappen
- Dette gjelder både `PageHeader` actions, `ListPage` actions og primary CTA i empty states

Begrunnelse:

- Mindre visuell støy på tvers av sider
- Mer konsekvent med eksisterende tabell- og side-mønstre

## 12) Globalt tabellsøk (obligatorisk)

For alle tabeller med søk i TeqBook skal søk være globalt for hele datasettet, ikke bare aktiv side.

- Hvis tabellen er paginert med backend-data, bruk **server-side søk** (query/RPC) og reset til side 1 ved nytt søk.
- Ikke bruk lokal filtrering på kun nåværende side når `totalCount` er større enn antall rader i viewet.
- For paginerte tabeller skal søkefeltet alltid være koblet til datakilden (DB/API), slik at treff kan finnes på tvers av alle sider.
- Kun tabeller som laster hele datasettet i klienten kan bruke ren lokal filtrering.

## 13) Standard paginering (obligatorisk)

For lesbarhet skal tabeller bruke korte sider:

- Maks **10 rader per side** i tabellvisning.
- Ved mer enn 10 rader skal tabellen pagineres til neste side.
- Under tabellen skal navigasjon alltid vise:
  - **Previous** på venstre side
  - **Next** på høyre side
