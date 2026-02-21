# Component Registry

All public components in the TeqBook design system. Before creating anything new,
search this file first. If it exists here, use it. If it almost covers your case,
extend it (see build-gate.md).

## @teqbook/page
| Component | Solves | Do NOT create new if... |
|---|---|---|
| ListPage | Full CRUD list page (header, stats, filters, table, states) | You need a page with a table |
| TabbedPage | Route-based tab layout with actions + dirty guard | You need tabs + sub-pages |
| PageLayout | Simple header + content wrapper (no table) | You need title + description + content |
| PageLayoutSimple | Same as PageLayout without card wrapper | You need a flat content area |
| StatsBar | KPI row above content | You need metric cards |
| FilterChips | Toggle-able filter pills | You need inline filters |
| TabToolbar | Tabs-left, actions-right toolbar row | You need a toolbar inside TabbedPage |
| TabActionsProvider | Context for child pages to register tab actions | You need dynamic actions in tabs |
| useDirtyState | Hook for child pages to register dirty state | You need unsaved changes guard |
| renderActions | Renders PageAction[] as buttons | You need to render actions consistently |

## @teqbook/data-table
| Component | Solves | Do NOT create new if... |
|---|---|---|
| DataTable | Sortable, paginated, selectable table with responsive mode | You need any data table |
| DataTableToolbar | Search + columns + views + bulk (desktop) | You need a table toolbar |
| DataTablePagination | Page controls below table | You need pagination |
| useDataTable | Hook for sort, visibility, selection, views state | You need table state management |

## @teqbook/feedback
| Component | Solves | Do NOT create new if... |
|---|---|---|
| ErrorBoundary | Catches render errors, shows retry | You need error handling around a tree |
| ErrorMessage | Alert banner (destructive/warning/default) | You need to show an error or warning |
| EmptyState | Zero-data placeholder with actions + quick-start | You need a "nothing here yet" view |

## @teqbook/layout
| Component | Solves | Do NOT create new if... |
|---|---|---|
| PageHeader | Title + description + actions row | You need a page heading with buttons |
| NavLink | Active-aware sidebar link | You need a nav item |
| SessionTimeoutDialog | Idle session warning | You need session management UI |

## @teqbook/ui
Radix-based primitives: Button, Dialog, Tabs, Popover, Input, Select, Tooltip,
Badge, Card, Table, Checkbox, DropdownMenu, Avatar, Label, Skeleton, Alert.
These are the only allowed base building blocks.
