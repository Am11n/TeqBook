# @teqbook/layout

Shared layout primitives used across all TeqBook apps.

## Quick start

```tsx
import { PageHeader, NavLink, SessionTimeoutDialog } from "@teqbook/layout";
```

## Exports

### `PageHeader`

Title + description + actions row, used at the top of every page.

```tsx
<PageHeader
  title="Employees"
  description="Manage your team members"
  actions={
    <>
      <Button variant="outline" onClick={openAssign}>Assign services</Button>
      <Button onClick={openCreate}>Add employee</Button>
    </>
  }
/>
```

| Prop | Type | Purpose |
|---|---|---|
| `title` | `string` | Page heading |
| `description` | `string` | Subtitle text |
| `actions` | `ReactNode` | Right-aligned action buttons |
| `className` | `string` | Additional CSS classes |

Typically consumed indirectly through `ListPage` or `TabbedPage` from `@teqbook/page`.

### `NavLink`

Active-aware sidebar navigation link. Highlights when the current route matches.

```tsx
<NavLink href="/employees" icon={<Users />}>
  Employees
</NavLink>
```

| Prop | Type | Purpose |
|---|---|---|
| `href` | `string` | Navigation target |
| `icon` | `ReactNode` | Left icon |
| `children` | `ReactNode` | Link label |
| `exact` | `boolean` | Match href exactly (default: prefix match) |

### `SessionTimeoutDialog`

Dialog shown when user session is about to expire. Prompts to extend or log out.

```tsx
<SessionTimeoutDialog
  warningMinutes={5}
  onExtend={extendSession}
  onLogout={logout}
/>
```

| Prop | Type | Purpose |
|---|---|---|
| `warningMinutes` | `number` | Minutes before expiry to show warning |
| `onExtend` | `() => void` | Handler to extend the session |
| `onLogout` | `() => void` | Handler to log out |

## Rules

- `PageHeader` is the only heading component -- never build custom page titles
- `NavLink` is used exclusively in app shells (`DashboardShell`, `AdminShell`)
- Import from `@teqbook/layout` only -- no deep imports
