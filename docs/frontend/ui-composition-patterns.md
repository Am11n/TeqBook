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
