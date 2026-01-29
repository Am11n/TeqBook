# Form Layout Standards

This document defines the standard for form layouts in TeqBook to ensure consistent spacing, accessibility, and maintainability.

## Overview

All form fields in TeqBook must use the `<Field />` component wrapper to ensure consistent spacing and layout. This prevents UI regressions and makes forms easier to maintain.

## Spacing Tokens

The following spacing tokens are enforced:

- **Label → Input**: `gap-2` (8px)
- **Input → Help text**: `pt-1` (4px)
- **Field → Field**: `space-y-6` (24px) - applied by parent form container

## Field Component

The `Field` component is located at `web/src/components/form/Field.tsx` and provides:

- Consistent label placement (stacked above input by default)
- Automatic spacing between label, input, help text, and error messages
- Required field indicator (asterisk)
- Error message display
- Help text/description support

### Basic Usage

```tsx
import { Field } from "@/components/form/Field";
import { Input } from "@/components/ui/input";

<Field
  label="Salon Name"
  htmlFor="salonName"
  required
  description="This name appears on your booking page"
  error={errors.salonName}
>
  <Input id="salonName" value={salonName} onChange={...} />
</Field>
```

### Form Container

Forms should use `space-y-6` for spacing between fields:

```tsx
<form className="space-y-6">
  <Field label="First Name" htmlFor="firstName" required>
    <Input id="firstName" />
  </Field>
  
  <Field label="Last Name" htmlFor="lastName" required>
    <Input id="lastName" />
  </Field>
</form>
```

## Correct Examples

### ✅ Correct: Using Field Component

```tsx
import { Field } from "@/components/form/Field";
import { Input } from "@/components/ui/input";

function MyForm() {
  return (
    <form className="space-y-6">
      <Field
        label="Email"
        htmlFor="email"
        required
        description="We'll never share your email"
        error={errors.email}
      >
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>
    </form>
  );
}
```

### ✅ Correct: Multiple Fields

```tsx
<form className="space-y-6">
  <Field label="First Name" htmlFor="firstName" required>
    <Input id="firstName" />
  </Field>
  
  <Field label="Last Name" htmlFor="lastName" required>
    <Input id="lastName" />
  </Field>
  
  <Field label="Phone" htmlFor="phone">
    <Input id="phone" type="tel" />
  </Field>
</form>
```

## Incorrect Examples

### ❌ Incorrect: Direct Label Usage

```tsx
// DON'T DO THIS - ESLint will error
<div>
  <label htmlFor="email">Email</label>
  <Input id="email" />
</div>
```

**Why it's wrong:**
- Inconsistent spacing
- No automatic error/help text handling
- Easy to forget spacing tokens

### ❌ Incorrect: Inline Label Layout

```tsx
// DON'T DO THIS - Labels should be stacked above inputs
<div className="flex items-center gap-4">
  <label htmlFor="email" className="w-32">Email</label>
  <Input id="email" />
</div>
```

**Why it's wrong:**
- Breaks the standard stacked layout
- Inconsistent with rest of application
- Harder to maintain

### ❌ Incorrect: Missing Field Wrapper

```tsx
// DON'T DO THIS - Missing Field component
<div className="space-y-2">
  <label htmlFor="email" className="text-sm font-medium">
    Email
  </label>
  <Input id="email" />
</div>
```

**Why it's wrong:**
- Manual spacing management (error-prone)
- No standardized error/help text display
- Inconsistent with codebase

## ESLint Enforcement

The following ESLint rules enforce this standard:

1. **`no-restricted-syntax`**: Prevents direct `<label>` usage in feature code
   - Allowed only in `web/src/components/form/**` and `web/src/components/ui/**`
   - Error message: "Direct <label> usage is not allowed in feature code. Use <Field /> component..."

2. **`no-restricted-imports`**: Prevents Supabase imports in UI layer
   - Allowed only in `web/src/lib/services/**` and `web/src/lib/repositories/**`

## Field Variants

The `Field` component supports two variants:

### Default (Stacked)

```tsx
<Field label="Name" htmlFor="name">
  <Input id="name" />
</Field>
```

Layout: Label above input (default)

### Inline

```tsx
<Field label="Name" htmlFor="name" variant="inline">
  <Input id="name" />
</Field>
```

Layout: Label to the left, input to the right

**Note:** Use inline variant sparingly, only when space is limited or for specific design requirements.

## Error Handling

The `Field` component automatically displays error messages:

```tsx
<Field
  label="Email"
  htmlFor="email"
  error={errors.email}
>
  <Input id="email" />
</Field>
```

Errors are displayed below the input with:
- Red text color (`text-destructive`)
- Small font size (`text-xs`)
- Proper spacing (`pt-1`)

## Help Text

Help text provides additional context:

```tsx
<Field
  label="Password"
  htmlFor="password"
  description="Must be at least 8 characters with uppercase, number, and special character"
>
  <Input id="password" type="password" />
</Field>
```

Help text is displayed below the input with:
- Muted text color (`text-muted-foreground`)
- Small font size (`text-xs`)
- Proper spacing (`pt-1`)

## Required Fields

Required fields show an asterisk:

```tsx
<Field label="Email" htmlFor="email" required>
  <Input id="email" />
</Field>
```

The asterisk appears after the label text in red (`text-destructive`).

## Accessibility

The `Field` component ensures:

- Proper `htmlFor` and `id` connection between label and input
- Semantic HTML structure
- Keyboard navigation support
- Screen reader compatibility

## Migration Guide

If you have existing forms without `Field`:

1. Import `Field` component:
   ```tsx
   import { Field } from "@/components/form/Field";
   ```

2. Wrap your input with `Field`:
   ```tsx
   // Before
   <div>
     <label htmlFor="name">Name</label>
     <Input id="name" />
   </div>
   
   // After
   <Field label="Name" htmlFor="name">
     <Input id="name" />
   </Field>
   ```

3. Remove manual spacing classes:
   ```tsx
   // Before
   <div className="space-y-2">
     <label>...</label>
     <Input />
   </div>
   
   // After
   <Field>...</Field>
   // Field handles spacing internally
   ```

4. Move error messages to `error` prop:
   ```tsx
   // Before
   <div>
     <Input />
     {error && <p className="text-red-500">{error}</p>}
   </div>
   
   // After
   <Field error={error}>
     <Input />
   </Field>
   ```

## Testing

When writing tests, use the `data-testid` prop:

```tsx
<Field label="Email" htmlFor="email" data-testid="email-field">
  <Input id="email" />
</Field>
```

Then in your test:

```tsx
const emailField = screen.getByTestId("email-field");
expect(emailField).toBeInTheDocument();
```

## Summary

- ✅ Always use `<Field />` component for labeled inputs
- ✅ Use `space-y-6` for form containers
- ✅ Never use direct `<label>` in feature code
- ✅ Let `Field` handle spacing, errors, and help text
- ✅ Follow spacing tokens: `gap-2` (label→input), `pt-1` (input→help), `space-y-6` (field→field)

