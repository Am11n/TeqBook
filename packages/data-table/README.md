# @teqbook/data-table

Sortable, paginated, selectable data table with responsive mobile support.

## Quick start

```tsx
import { DataTable, useDataTable, type ColumnDef } from "@teqbook/data-table";

const columns: ColumnDef<Employee>[] = [
  { id: "name", header: "Name", accessorFn: (r) => r.name, sortable: true },
  { id: "role", header: "Role", accessorFn: (r) => r.role },
];

<DataTable
  columns={columns}
  data={employees}
  rowKey={(e) => e.id}
  searchable
  searchPlaceholder="Search employees..."
/>;
```

## Exports

### `DataTable<T>`

The main table component. Key props:

| Prop | Type | Purpose |
|---|---|---|
| `columns` | `ColumnDef<T>[]` | Column definitions |
| `data` | `T[]` | Row data |
| `rowKey` | `(row: T) => string` | Unique key per row |
| `loading` | `boolean` | Shows skeleton rows |
| `searchable` | `boolean` | Enables search bar in toolbar |
| `searchPlaceholder` | `string` | Search input placeholder |
| `pageSize` | `number` | Rows per page (default 10) |
| `density` | `"default" \| "compact"` | Row height |
| `selectable` | `boolean` | Enables row checkboxes |
| `onRowClick` | `(row: T) => void` | Row click handler |
| `getRowActions` | `(row: T) => RowAction[]` | Kebab menu actions per row |
| `getRowClassName` | `(row: T) => string` | Conditional row styling |
| `toolbarEndContent` | `ReactNode` | Extra content in toolbar |
| `headerContent` | `ReactNode` | Content above the table (below toolbar) |
| `mobileRow` | `MobileRowContract<T>` | Mobile card layout (see below) |

### `DataTableToolbar`

Search, column visibility toggles, saved views, bulk action bar. Rendered automatically by `DataTable`.

### `DataTablePagination`

Page controls. Rendered automatically by `DataTable`.

### `useDataTable(options)`

Hook managing sort state, column visibility, selection, and saved views. Used internally by `DataTable` but available for custom compositions.

## Mobile row contract

When `mobileRow` is provided, `DataTable` renders a card-based layout on mobile (`< md`) instead of the table:

```tsx
<DataTable
  columns={columns}
  data={employees}
  rowKey={(e) => e.id}
  mobileRow={{
    title: (row) => row.name,
    subtitle: (row) => row.role,
    meta: (row) => [
      { label: "Status", value: row.active ? "Active" : "Inactive" },
      { label: "Started", value: row.startDate },
    ],
    actions: (row) => [
      { label: "Edit", onClick: () => edit(row.id) },
      { label: "Delete", onClick: () => remove(row.id), variant: "destructive" },
    ],
  }}
/>
```

This replaces the need for per-page `*CardView.tsx` components.

## Types

- `ColumnDef<T>` -- column definition with `id`, `header`, `accessorFn`, `sortable`, `cell` render
- `RowAction` -- row-level action (kebab menu item)
- `BulkAction` -- action on selected rows
- `SavedView` -- persisted column/sort configuration
- `MobileRowContract<T>` -- mobile card layout definition
- `DataTableProps<T>` -- full props for `DataTable`

## Rules

- Row actions are always in a kebab menu -- never inline buttons in table cells
- Bulk actions appear in the selection bar below the toolbar
- Use `mobileRow` instead of building custom card views
- Import from `@teqbook/data-table` only -- no deep imports
