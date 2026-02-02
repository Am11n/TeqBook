# Dashboard-sidestruktur og rød tråd

Dette dokumentet beskriver standardstrukturen for sider i dashboard-appen (`apps/dashboard`) og den **røde tråden** som alle nye sider skal følge. Referansesiden er **Bookinger** (`/bookings`).

---

## 1. Standardstruktur (rød tråd)

Alle nye dashboard-sider skal følge denne rekkefølgen og oppsettet:

### 1.1 Bruk `PageLayout`

- **Ikke** bruk `DashboardShell` + `PageHeader` direkte.
- **Bruk** `PageLayout` fra `@/components/layout/page-layout`. Den gir:
  - Samme header med tittel og undertittel
  - **Mellomrom** (`mt-6`) mellom header-blokken og innholdskortet
  - Ett samlet innholdskort med `rounded-xl border bg-card p-4 shadow-sm` (når `showCard={true}`)

```tsx
import { PageLayout } from "@/components/layout/page-layout";

<PageLayout
  title={t.title}
  description={t.description}
  actions={…}
>
  {/* Alt innhold inni ett kort */}
</PageLayout>
```

### 1.2 Hovedhandlingsknapp øverst til høyre

- Knappen som står **øverst til høyre** i header (f.eks. «Ny booking», «Registrer stempling») skal **alltid** være **svart** (primary).
- **Bruk:** `<Button type="button" size="sm" onClick={…}>` **uten** `variant` (default er `primary` = svart).
- **Ikke bruk:** `variant="outline"` på denne knappen – da blir den hvit/grå.

```tsx
actions={
  <Button type="button" size="sm" onClick={() => setDialogOpen(true)}>
    {t.newBookingButton}
  </Button>
}
```

### 1.3 Mellomrom mellom tittel/undertittel og innhold

- `PageLayout` legger automatisk inn **`mt-6`** mellom header (tittel, undertittel, actions) og innholdskortet.
- Du trenger ikke legge til ekstra margin her – bare bruk `PageLayout` med `showCard={true}` (default).

### 1.4 Innhold inni ett kort

- Alt hovedinnhold (filter, tabell, tom tilstand, etc.) skal ligge **inni** `PageLayout`-children, som rendres i **ett** kort.
- Sekundære knapper (f.eks. «Eksport CSV») kan ha `variant="outline"` og stå sammen med filtre inne i kortet.

---

## 2. Eksempel: Referansestruktur (Bookinger)

- **Tittel:** «Bookinger»
- **Undertittel:** «Liste over alle bookinger …»
- **Øverst til høyre:** Svart knapp «Ny booking» (primary, `size="sm"`)
- **Mellomrom:** Tydelig avstand mellom header og kortet
- **Innholdskort:** Ett kort med toolbar (f.eks. «DINE BOOKINGER»), deretter tabell/tom tilstand

## 3. Eksempel: Personalliste (oppdatert)

- **Tittel:** «Personalliste»
- **Undertittel:** «Lovpålagt dokumentasjon …»
- **Øverst til høyre:** Svart knapp «Registrer stempling» (primary, `size="sm"`)
- **Mellomrom:** Samme `mt-6` via `PageLayout`
- **Innholdskort:** Ett kort med periodefilter (Fra dato, Til dato), «Eksport CSV» (outline), deretter tabell eller tom tilstand

---

## 4. Sjekkliste for nye sider

- [ ] Bruker `PageLayout` (ikke `DashboardShell` + `PageHeader` direkte)
- [ ] Hovedhandling øverst til høyre: `<Button size="sm">` uten `variant` (svart)
- [ ] Mellomrom mellom header og innhold: overlatt til `PageLayout` (`mt-6`)
- [ ] Alt hovedinnhold inni ett kort (children av `PageLayout` med `showCard={true}`)
- [ ] Sekundære knapper (eksport, filter osv.) kan være `variant="outline"` inne i kortet

---

## 5. Komponenter

| Komponent       | Bruk                                                                 |
|-----------------|----------------------------------------------------------------------|
| `PageLayout`    | Standard for alle sider: header + mellomrom + ett innholdskort       |
| `PageHeader`    | Brukes indirekte via `PageLayout`; ikke bruk alene på nye sider     |
| `DashboardShell`| Brukes indirekte via `PageLayout`; ikke wrapp sidene manuelt        |

---

## 6. Relatert kode

- **Layout:** `apps/dashboard/src/components/layout/page-layout.tsx`
- **Referanseside:** `apps/dashboard/src/app/bookings/page.tsx`
- **Etter mønster:** `apps/dashboard/src/app/personalliste/page.tsx`
