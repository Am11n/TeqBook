# Error Handling Strategy

Dette dokumentet beskriver hvordan feil håndteres i TeqBook frontend.

---

## Oversikt

TeqBook bruker en lagdelt tilnærming til error handling:
- **Error Boundaries** - Fanger React runtime-feil
- **Error Message Components** - Konsistent visning av feilmeldinger
- **Domain Errors** - Type-safe error handling i services
- **Repository Errors** - Standardiserte error-returneringsmønstre

---

## Error Boundaries

### Hva er Error Boundaries?

Error Boundaries er React-komponenter som fanger JavaScript-feil i child-komponenter, logger dem, og viser en fallback UI i stedet for å krasje hele appen.

### Implementasjon

**Fil:** `apps/dashboard/src/components/error-boundary.tsx`

```typescript
import { ErrorBoundary } from "@/components/error-boundary";

// Wrap app eller deler av app
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### Bruk

1. **App-nivå:**
   ```typescript
   // app/layout.tsx
   <ErrorBoundary>
     <SalonProvider>
       {children}
     </SalonProvider>
   </ErrorBoundary>
   ```

2. **Side-nivå:**
   ```typescript
   // app/dashboard/page.tsx
   <ErrorBoundary>
     <DashboardContent />
   </ErrorBoundary>
   ```

3. **Custom fallback:**
   ```typescript
   <ErrorBoundary fallback={<CustomErrorUI />}>
     <YourComponent />
   </ErrorBoundary>
   ```

---

## Error Message Component

### Konsistent feilvisning

**Fil:** `apps/dashboard/src/components/feedback/error-message.tsx`

```typescript
import { ErrorMessage } from "@/components/feedback/error-message";

<ErrorMessage
  title="Error Title"
  message="Error message here"
  onDismiss={() => setError(null)}
  variant="destructive" // or "warning" or "default"
/>
```

### Variants

- **`destructive`** - Rød, for kritiske feil
- **`warning`** - Gul, for advarsler
- **`default`** - Nøytral, for informasjon

---

## Domain Errors

### Type-safe error handling

**Fil:** `apps/dashboard/src/lib/errors/domain-errors.ts`

Domain errors gir type-safe error handling med spesifikke error codes:

```typescript
import { BookingError } from "@/lib/errors/domain-errors";

try {
  await createBooking(input);
} catch (error) {
  if (error instanceof BookingError) {
    switch (error.code) {
      case "BOOKING_CONFLICT":
        showError("This time slot is already booked");
        break;
      case "INVALID_TIME_SLOT":
        showError("Please select a future time");
        break;
      default:
        showError(error.message);
    }
  }
}
```

### Tilgjengelige Error Types

- `BookingError` - Booking-relaterte feil
- `CustomerError` - Customer-relaterte feil
- `EmployeeError` - Employee-relaterte feil
- `ServiceError` - Service-relaterte feil
- `SalonError` - Salon-relaterte feil

Se `apps/dashboard/src/lib/errors/README.md` for full liste.

---

## Service Error Handling

### Standard Pattern

Alle services returnerer konsistent format:

```typescript
Promise<{ data: T | null; error: string | null }>
```

### Eksempel

```typescript
const { data, error } = await createBooking(input);

if (error) {
  setError(error);
  return;
}

// Use data
setBookings([...bookings, data]);
```

---

## UI Error Handling Patterns

### 1. Inline Errors

```typescript
function MyForm() {
  const [error, setError] = useState<string | null>(null);

  return (
    <form>
      {error && (
        <ErrorMessage message={error} onDismiss={() => setError(null)} />
      )}
      {/* Form fields */}
    </form>
  );
}
```

### 2. Toast Notifications

```typescript
// TODO: Implement toast system
// For now, use ErrorMessage component
```

### 3. Full Page Errors

```typescript
if (error) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <ErrorMessage
        title="Failed to load"
        message={error}
      />
    </div>
  );
}
```

### 4. Loading States

```typescript
if (loading) {
  return <LoadingSpinner />;
}

if (error) {
  return <ErrorMessage message={error} />;
}

// Render content
```

---

## Best Practices

1. **Alltid håndter errors**
   - Ikke la errors gå uoppdaget
   - Vis brukervennlige meldinger

2. **Bruk Error Boundaries**
   - Wrap kritiske deler av appen
   - Forhindre hele appen fra å krasje

3. **Konsistent error-visning**
   - Bruk `ErrorMessage` komponent
   - Følg samme pattern overalt

4. **Type-safe errors**
   - Bruk domain errors i services
   - Håndter spesifikke error codes

5. **Log errors**
   - Log alle errors for debugging
   - TODO: Integrer error tracking (Sentry)

---

## Fremtidige Forbedringer

1. **Toast System**
   - Implementer toast notifications
   - For non-blocking error messages

2. **Error Tracking**
   - Integrer Sentry eller lignende
   - Spor errors i produksjon

3. **Error Recovery**
   - Automatisk retry for transient errors
   - Offline error handling

4. **Error Localization**
   - Oversett error messages
   - Bruk i18n system

---

## Referanser

- `apps/dashboard/src/components/error-boundary.tsx` - Error Boundary implementasjon
- `apps/dashboard/src/components/feedback/error-message.tsx` - Error Message komponent
- `apps/dashboard/src/lib/errors/domain-errors.ts` - Domain error types
- `apps/dashboard/src/lib/errors/README.md` - Domain errors dokumentasjon

