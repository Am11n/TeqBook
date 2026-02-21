# @teqbook/feedback

UI feedback components for error handling and empty states.

## Quick start

```tsx
import { ErrorBoundary, ErrorMessage, EmptyState } from "@teqbook/feedback";
```

## Exports

### `ErrorBoundary`

React error boundary that catches render errors and shows a fallback UI with optional retry.

```tsx
<ErrorBoundary
  onError={(error, errorInfo) => logToSentry(error, errorInfo)}
  retry={() => window.location.reload()}
>
  <MyComponent />
</ErrorBoundary>
```

| Prop | Type | Purpose |
|---|---|---|
| `children` | `ReactNode` | Content to wrap |
| `onError` | `(error, errorInfo) => void` | Error logging callback |
| `retry` | `() => void` | Retry handler shown in fallback UI |
| `fallback` | `ReactNode` | Custom fallback (optional) |

### `ErrorMessage`

Alert banner for displaying errors or warnings.

```tsx
<ErrorMessage
  message="Failed to load employees"
  variant="destructive"
  retry={() => refetch()}
/>
```

| Prop | Type | Purpose |
|---|---|---|
| `message` | `string` | Error text |
| `variant` | `"destructive" \| "warning" \| "default"` | Alert style |
| `retry` | `() => void` | Optional retry button |
| `className` | `string` | Additional CSS classes |

### `EmptyState`

Zero-data placeholder with actions and optional quick-start suggestions.

```tsx
<EmptyState
  title="No employees yet"
  description="Add your first team member to get started"
  icon={<Users className="h-12 w-12" />}
  primaryAction={{ label: "Add employee", onClick: openCreate }}
  quickStartItems={[
    { label: "Import from CSV", onClick: openImport },
    { label: "Add manually", onClick: openCreate },
  ]}
/>
```

| Prop | Type | Purpose |
|---|---|---|
| `title` | `string` | Main heading |
| `description` | `string` | Subtext |
| `icon` | `ReactNode` | Illustration/icon |
| `primaryAction` | `{ label, onClick }` | Primary CTA button |
| `secondaryAction` | `{ label, onClick }` | Secondary link/button |
| `quickStartItems` | `{ label, onClick }[]` | Quick-start suggestion list |

## Rules

- Use `ErrorBoundary` at page and section boundaries -- not around individual components
- Use `ErrorMessage` for API/data errors -- not for validation (use form errors instead)
- Use `EmptyState` via `ListPage`'s `PageState` when possible, rather than rendering it directly
- Import from `@teqbook/feedback` only -- no deep imports
