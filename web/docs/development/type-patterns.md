# Type Safety Patterns

Task Group 27: Type Safety Improvements

This document describes the type safety patterns and best practices used in TeqBook.

## TypeScript Configuration

TeqBook uses strict TypeScript configuration:

```json
{
  "compilerOptions": {
    "strict": true,
    "noEmit": true
  }
}
```

The `strict` flag enables:
- `strictNullChecks`
- `strictFunctionTypes`
- `strictBindCallApply`
- `strictPropertyInitialization`
- `noImplicitAny`
- `noImplicitThis`
- `alwaysStrict`

## Type Definition Patterns

### 1. Domain Types

Location: `src/lib/types.ts`

Define core entity types matching database schema:

```typescript
export type Salon = {
  id: string;
  name: string;
  slug: string | null;
  is_public: boolean;
  plan?: PlanType | null;
  // ...
};

export type Booking = {
  id: string;
  start_time: string;
  end_time: string;
  status: BookingStatus | string;
  // ...
};
```

### 2. Enum Types

Use string literal unions instead of TypeScript enums:

```typescript
// ✅ Good: String literal union
export type BookingStatus = 
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no-show";

// ❌ Avoid: TypeScript enum
enum BookingStatus {
  Pending = "pending",
  // ...
}
```

Benefits:
- Better type inference
- No runtime overhead
- Works with database enum values

### 3. Input/Output Types

Separate types for create/update operations:

```typescript
// Create input - required fields
export type CreateBookingInput = {
  salon_id: string;
  employee_id: string;
  service_id: string;
  start_time: string;
  customer_full_name: string;
  customer_email?: string | null;
};

// Update input - all fields optional
export type UpdateBookingInput = {
  status?: BookingStatus;
  notes?: string | null;
};
```

### 4. API Response Types

Define explicit response types for API calls:

```typescript
interface CreateSubscriptionResponse {
  subscription_id: string;
  plan: string;
  current_period_end: string;
  status: string;
  client_secret?: string;
}

async function safeFetch<T>(
  url: string,
  options: RequestInit
): Promise<{ data: T | null; error: string | null }> {
  // ...
}

// Usage with type parameter
const { data, error } = await safeFetch<CreateSubscriptionResponse>(
  url,
  options
);
```

### 5. Component Props

Use explicit interface definitions:

```typescript
interface DashboardHeaderProps {
  salon: Salon | null;
  profile: Profile | null;
  userRole: string | null;
  locale: string;
  onMobileNavOpen: () => void;
}

export function DashboardHeader({
  salon,
  profile,
  userRole,
  locale,
  onMobileNavOpen,
}: DashboardHeaderProps) {
  // ...
}
```

## Avoiding `any`

### Never Use `any`

```typescript
// ❌ Bad
const data: any = await fetch(url);
const result = response.map((item: any) => item.name);

// ✅ Good
interface ResponseItem {
  name: string;
}
const data: ResponseItem[] = await fetch(url);
const result = response.map((item) => item.name);
```

### Use `unknown` for Unknown Types

```typescript
// ❌ Bad
function processData(data: any) {
  return data.field;
}

// ✅ Good
function processData(data: unknown): string {
  if (isMyType(data)) {
    return data.field;
  }
  throw new Error("Invalid data");
}
```

### Justified Type Assertions

When type assertions are unavoidable (e.g., third-party library limitations):

```typescript
// JUSTIFIED TYPE ASSERTION: Supabase SDK types don't expose 'secret'
// on TOTP enrollment response, but it exists at runtime.
const secret = (totpData as { secret?: string }).secret || "";
```

Always document:
1. Why the assertion is needed
2. What runtime behavior it expects

## Validation Patterns

### Function-Based Validation

Location: `src/lib/validation/`

```typescript
export function validateCreateBooking(
  input: CreateBookingInput
): { valid: boolean; error?: string } {
  if (!input.salon_id || input.salon_id.trim().length === 0) {
    return { valid: false, error: "Salon ID is required" };
  }
  // ...
  return { valid: true };
}
```

### Usage in Services

```typescript
export async function createBooking(input: CreateBookingInput) {
  const validation = validateCreateBooking(input);
  if (!validation.valid) {
    return { data: null, error: validation.error };
  }
  
  // Proceed with database operation
}
```

## Return Type Patterns

### Result Tuple

All async operations return a consistent `{ data, error }` tuple:

```typescript
type Result<T> = {
  data: T | null;
  error: string | null;
};

async function getBooking(id: string): Promise<Result<Booking>> {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) {
      return { data: null, error: error.message };
    }
    
    return { data, error: null };
  } catch (err) {
    return { 
      data: null, 
      error: err instanceof Error ? err.message : "Unknown error" 
    };
  }
}
```

### Usage

```typescript
const { data: booking, error } = await getBooking(id);
if (error) {
  console.error("Failed to get booking:", error);
  return;
}
// booking is now Booking (not null)
```

## Type Guards

### Custom Type Guards

```typescript
function isBooking(value: unknown): value is Booking {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "start_time" in value &&
    "status" in value
  );
}
```

### Discriminated Unions

```typescript
type ApiResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

function handleResponse<T>(response: ApiResponse<T>) {
  if (response.success) {
    // TypeScript knows response.data exists
    return response.data;
  } else {
    // TypeScript knows response.error exists
    throw new Error(response.error);
  }
}
```

## Generics

### Repository Functions

```typescript
async function fetchOne<T>(
  table: string,
  id: string
): Promise<Result<T>> {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("id", id)
    .single();
  
  return { data: data as T | null, error: error?.message || null };
}
```

### Hook Types

```typescript
function useQuery<T>(
  queryFn: () => Promise<Result<T>>,
  deps: unknown[]
): { data: T | null; loading: boolean; error: string | null } {
  // ...
}
```

## Best Practices Summary

1. **Never use `any`** - Use `unknown` or proper types
2. **Define explicit types** - For all function parameters and returns
3. **Use string literal unions** - Instead of TypeScript enums
4. **Separate input/output types** - For create vs update operations
5. **Document justified assertions** - When type assertions are unavoidable
6. **Use consistent patterns** - `{ data, error }` tuple for all async operations
7. **Validate at boundaries** - Input validation before database operations
8. **Use generics** - For reusable utility functions
