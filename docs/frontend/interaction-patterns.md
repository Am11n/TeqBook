# UI Interaction Patterns

This document catalogs common UI patterns used throughout TeqBook, providing guidelines for consistent user interactions.

## Table of Contents

- [Table Patterns](#table-patterns)
- [Modal Patterns](#modal-patterns)
- [Loading States](#loading-states)
- [Error States](#error-states)
- [Form Patterns](#form-patterns)
- [Navigation Patterns](#navigation-patterns)

---

## Table Patterns

### Basic Table Structure

```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableToolbar } from "@/components/table-toolbar";

<TableToolbar
  title="Bookings"
  actions={<Button>New Booking</Button>}
/>
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Date</TableHead>
      <TableHead>Time</TableHead>
      <TableHead>Service</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {items.map((item) => (
      <TableRow key={item.id}>
        <TableCell>{item.date}</TableCell>
        <TableCell>{item.time}</TableCell>
        <TableCell>{item.service}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Filtering

```tsx
const [filter, setFilter] = useState("");

const filteredItems = useMemo(() => {
  return items.filter((item) =>
    item.name.toLowerCase().includes(filter.toLowerCase())
  );
}, [items, filter]);

<Input
  placeholder="Search..."
  value={filter}
  onChange={(e) => setFilter(e.target.value)}
/>
```

### Sorting

```tsx
type SortField = "date" | "name" | "status";
type SortDirection = "asc" | "desc";

const [sortField, setSortField] = useState<SortField>("date");
const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

const sortedItems = useMemo(() => {
  return [...items].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    const comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    return sortDirection === "asc" ? comparison : -comparison;
  });
}, [items, sortField, sortDirection]);
```

### Pagination

```tsx
const [page, setPage] = useState(1);
const pageSize = 10;

const paginatedItems = useMemo(() => {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}, [items, page]);

<div className="flex items-center justify-between">
  <p className="text-sm text-muted-foreground">
    Showing {start + 1}-{Math.min(start + pageSize, items.length)} of {items.length}
  </p>
  <div className="flex gap-2">
    <Button
      variant="outline"
      size="sm"
      onClick={() => setPage((p) => Math.max(1, p - 1))}
      disabled={page === 1}
    >
      Previous
    </Button>
    <Button
      variant="outline"
      size="sm"
      onClick={() => setPage((p) => p + 1)}
      disabled={page * pageSize >= items.length}
    >
      Next
    </Button>
  </div>
</div>
```

### Responsive Tables

For mobile, use card-based layout:

```tsx
{/* Mobile: Card view */}
<div className="space-y-3 md:hidden">
  {items.map((item) => (
    <div key={item.id} className="rounded-lg border bg-card p-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-medium">{item.name}</div>
          <div className="text-sm text-muted-foreground">{item.description}</div>
        </div>
        <Badge>{item.status}</Badge>
      </div>
    </div>
  ))}
</div>

{/* Desktop: Table view */}
<div className="hidden md:block">
  <Table>
    {/* Table content */}
  </Table>
</div>
```

---

## Modal Patterns

### Basic Modal

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const [open, setOpen] = useState(false);

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Create Booking</DialogTitle>
      <DialogDescription>
        Fill in the details to create a new booking.
      </DialogDescription>
    </DialogHeader>
    
    {/* Form content */}
    
    <DialogFooter>
      <Button variant="outline" onClick={() => setOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleSubmit}>Create</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Confirmation Modal

```tsx
const [confirmOpen, setConfirmOpen] = useState(false);
const [itemToDelete, setItemToDelete] = useState<string | null>(null);

const handleDeleteClick = (id: string) => {
  setItemToDelete(id);
  setConfirmOpen(true);
};

const handleConfirmDelete = async () => {
  if (itemToDelete) {
    await deleteItem(itemToDelete);
    setConfirmOpen(false);
    setItemToDelete(null);
  }
};

<Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogDescription>
        Are you sure you want to delete this item? This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline" onClick={() => setConfirmOpen(false)}>
        Cancel
      </Button>
      <Button variant="destructive" onClick={handleConfirmDelete}>
        Delete
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Focus Management

Modals automatically manage focus:
- Focus moves to the first focusable element when opened
- Focus returns to the trigger when closed
- Focus is trapped within the modal

---

## Loading States

### Skeleton Loading

```tsx
import { Skeleton } from "@/components/ui/skeleton";

{loading ? (
  <div className="space-y-3">
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
  </div>
) : (
  <Table>
    {/* Table content */}
  </Table>
)}
```

### Inline Loading

```tsx
{loading ? (
  <p className="text-sm text-muted-foreground">Loading...</p>
) : (
  <div>{/* Content */}</div>
)}
```

### Button Loading State

```tsx
<Button disabled={loading || saving}>
  {loading || saving ? "..." : "Save"}
</Button>
```

### Full Page Loading

```tsx
{loading ? (
  <div className="flex min-h-screen items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
      <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
) : (
  <div>{/* Content */}</div>
)}
```

---

## Error States

### Inline Error Message

```tsx
import { ErrorMessage } from "@/components/feedback/error-message";

{error && (
  <ErrorMessage
    message={error}
    onDismiss={() => setError(null)}
    variant="destructive"
    className="mb-4"
  />
)}
```

### Empty State

```tsx
import { EmptyState } from "@/components/empty-state";

{items.length === 0 && !loading && (
  <EmptyState
    title="No items found"
    description="Get started by creating your first item."
    action={<Button onClick={handleCreate}>Create Item</Button>}
  />
)}
```

### Error Boundary

```tsx
import { ErrorBoundary } from "@/components/error-boundary";

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### Form Field Errors

```tsx
<div className="space-y-2">
  <label htmlFor="email">Email</label>
  <Input
    id="email"
    type="email"
    aria-invalid={!!fieldError}
    aria-describedby={fieldError ? "email-error" : undefined}
  />
  {fieldError && (
    <p id="email-error" className="text-sm text-destructive">
      {fieldError}
    </p>
  )}
</div>
```

---

## Form Patterns

### Basic Form

```tsx
const [name, setName] = useState("");
const [saving, setSaving] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setSaving(true);
  setError(null);

  const { data, error: submitError } = await createItem({ name });

  if (submitError || !data) {
    setError(submitError ?? "Failed to create item");
    setSaving(false);
    return;
  }

  // Success handling
  setSaving(false);
};

<form onSubmit={handleSubmit} className="space-y-4">
  <div className="space-y-2">
    <label htmlFor="name">Name</label>
    <Input
      id="name"
      value={name}
      onChange={(e) => setName(e.target.value)}
      required
    />
  </div>

  {error && <ErrorMessage message={error} />}

  <Button type="submit" disabled={saving}>
    {saving ? "Saving..." : "Save"}
  </Button>
</form>
```

### Form Validation

```tsx
const [errors, setErrors] = useState<Record<string, string>>({});

const validate = () => {
  const newErrors: Record<string, string> = {};

  if (!name.trim()) {
    newErrors.name = "Name is required";
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    newErrors.email = "Invalid email format";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  
  if (!validate()) {
    return;
  }

  // Submit form
};
```

### Multi-Step Form

```tsx
const [step, setStep] = useState(1);
const totalSteps = 3;

<div>
  <div className="mb-6">
    <div className="flex items-center justify-between">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center">
          <div
            className={`h-8 w-8 rounded-full flex items-center justify-center ${
              s <= step ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}
          >
            {s}
          </div>
          {s < totalSteps && (
            <div
              className={`h-1 w-16 ${
                s < step ? "bg-primary" : "bg-muted"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  </div>

  {step === 1 && <Step1Content />}
  {step === 2 && <Step2Content />}
  {step === 3 && <Step3Content />}

  <div className="flex justify-between mt-6">
    <Button
      variant="outline"
      onClick={() => setStep((s) => Math.max(1, s - 1))}
      disabled={step === 1}
    >
      Previous
    </Button>
    <Button onClick={() => setStep((s) => Math.min(totalSteps, s + 1))}>
      {step === totalSteps ? "Submit" : "Next"}
    </Button>
  </div>
</div>
```

---

## Navigation Patterns

### Breadcrumbs

```tsx
<nav className="flex items-center space-x-2 text-sm text-muted-foreground">
  <Link href="/dashboard">Dashboard</Link>
  <span>/</span>
  <Link href="/bookings">Bookings</Link>
  <span>/</span>
  <span className="text-foreground">View Booking</span>
</nav>
```

### Tab Navigation

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="general">General</TabsTrigger>
    <TabsTrigger value="notifications">Notifications</TabsTrigger>
    <TabsTrigger value="billing">Billing</TabsTrigger>
  </TabsList>
  
  <TabsContent value="general">
    {/* General content */}
  </TabsContent>
  <TabsContent value="notifications">
    {/* Notifications content */}
  </TabsContent>
  <TabsContent value="billing">
    {/* Billing content */}
  </TabsContent>
</Tabs>
```

### Sidebar Navigation

See `dashboard-shell.tsx` for sidebar implementation.

---

## Best Practices

1. **Consistent Spacing**
   - Use Tailwind spacing utilities consistently
   - Follow the design system spacing scale

2. **Accessibility**
   - Always provide labels for form inputs
   - Use semantic HTML
   - Ensure keyboard navigation works
   - Provide ARIA attributes where needed

3. **Responsive Design**
   - Mobile-first approach
   - Test on multiple screen sizes
   - Use responsive utilities (`md:`, `lg:`, etc.)

4. **Loading States**
   - Always show loading states for async operations
   - Use skeletons for better perceived performance
   - Disable buttons during submission

5. **Error Handling**
   - Show user-friendly error messages
   - Provide recovery actions when possible
   - Log errors for debugging

6. **Focus Management**
   - Maintain logical focus order
   - Return focus appropriately after modals/actions
   - Use focus-visible for keyboard navigation

---

## References

- [Shadcn UI Components](https://ui.shadcn.com/)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Error Handling Strategy](../frontend/error-handling.md)

