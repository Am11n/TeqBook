# @teqbook/page

Page-level layout primitives and standardised page patterns for TeqBook apps.

## Quick start

```tsx
import {
  ListPage,
  TabbedPage,
  useTabActions,
  useFilters,
  type PageAction,
  type PageState,
} from "@teqbook/page";
```

## Exports

### `ListPage<T>`

Full CRUD list page: header, stats bar, filter chips, data table, and unified state handling.

```tsx
<DashboardShell>
  <ListPage
    title="Employees"
    description="Manage your team"
    actions={[
      { label: "Add employee", onClick: openCreate, priority: "primary" },
    ]}
    stats={[{ label: "Total", value: 42 }]}
    filterChips={[{ id: "active", label: "Active", count: 38 }]}
    activeFilters={activeFilters}
    onFiltersChange={setActiveFilters}
    tableProps={{ columns, data, rowKey: (e) => e.id }}
    state={
      loading
        ? { status: "loading" }
        : error
          ? { status: "error", message: error, retry: reload }
          : data.length === 0
            ? { status: "empty", title: "No employees yet" }
            : { status: "ready" }
    }
  />
</DashboardShell>
```

Alternatively pass `children` instead of `tableProps` for custom content.

### `TabbedPage`

Route-based tab layout with actions slot and optional dirty-state guard.

```tsx
<DashboardShell>
  <TabbedPage
    title="Bookings"
    tabs={[
      { id: "upcoming", label: "Upcoming", href: "/bookings" },
      { id: "past", label: "Past", href: "/bookings/past" },
    ]}
    guardEnabled={false}
  >
    {children}
  </TabbedPage>
</DashboardShell>
```

Child pages register actions via `useTabActions`:

```tsx
const { setActions } = useTabActions();
useEffect(() => {
  setActions([{ label: "New booking", onClick: open, priority: "primary" }]);
}, [setActions]);
```

### `PageLayout` / `PageLayoutSimple`

Low-level header + content wrapper (no table, no state management). Use `ListPage` or `TabbedPage` instead when possible.

### `StatsBar`

Renders a row of KPI cards. Accepts `StatItem[]`.

### `FilterChips`

Toggle-able filter pills. Accepts `ChipDef[]`, `activeFilters`, `onFiltersChange`.

### `useFilters(storageKey)`

Hook for managing filters with URL query sync and localStorage persistence.

### `useDirtyState(tabId, isDirty)`

Register unsaved changes in a tab. `TabbedPage` with `guardEnabled` will intercept navigation.

### `renderActions(actions: PageAction[])`

Utility to render `PageAction[]` as buttons following placement rules.

## Action model

`PageAction` is the unified action type used across all page patterns:

| Field | Type | Purpose |
|---|---|---|
| `label` | `string` | Button text |
| `icon` | `ComponentType` | Optional icon |
| `onClick` | `() => void` | Click handler (renders as button) |
| `href` | `string` | Navigation target (renders as link) |
| `variant` | `ActionVariant` | `"default"` / `"outline"` / `"destructive"` / `"ghost"` |
| `priority` | `"primary"` / `"secondary"` | Primary = far right, always visible |
| `visible` | `boolean \| () => boolean` | Conditionally hide actions |
| `confirm` | `{ title, description }` | Show confirmation dialog before executing |
| `analyticsId` | `string` | Forwarded to tracking |

## PageState contract

Every `ListPage` handles four states consistently:

- `{ status: "loading" }` -- skeleton UI
- `{ status: "error", message, retry? }` -- error banner with optional retry
- `{ status: "empty", title, description?, action?, quickStart? }` -- empty state with optional quick-start items
- `{ status: "ready" }` -- renders content/table

## Rules

- Apps wrap page components in their shell (`DashboardShell`, `AdminShell`) -- page components never include a shell
- Primary action is always far right
- Secondary actions go left of primary, collapse to dropdown on mobile
- Use `PageState` for all data-fetching pages -- never roll custom loading/error handling
