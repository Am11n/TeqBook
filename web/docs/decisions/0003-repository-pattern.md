# ADR-0003: Repository Pattern for Data Access

**Status:** Accepted  
**Date:** 2024-01-15  
**Deciders:** Development Team

## Context

We need a consistent way to access data from Supabase that:
- Abstracts away Supabase-specific details
- Provides type safety
- Makes testing easier
- Enforces consistent error handling

## Decision

We will use the **Repository Pattern** for all data access operations.

All Supabase calls must go through repositories in `src/lib/repositories/`. Services and UI components are forbidden from directly importing or using Supabase client.

## Rules

1. **One repository per domain** (e.g., `bookings.ts`, `employees.ts`)
2. **Consistent return types**:
   - `Promise<{ data: T | null; error: string | null }>`
   - `Promise<{ data: T[] | null; error: string | null; total?: number }>` (with pagination)
   - `Promise<{ error: string | null }>` (for delete operations)
3. **No business logic** in repositories - only data access
4. **Type-safe** - all inputs and outputs are typed

## Consequences

### Positive
- Easy to test (mock repositories in service tests)
- Consistent error handling
- Can swap out Supabase without changing services/UI
- Clear separation of concerns
- Type safety throughout

### Negative
- More boilerplate for simple queries
- Requires discipline to maintain pattern

### Mitigation
- Comprehensive documentation in `docs/architecture/repository-standards.md`
- Code review to catch violations
- ESLint rules (future)

---

## References

- `docs/architecture/repository-standards.md` - Repository standards
- `docs/architecture/layers.md` - Layer documentation
- `src/lib/repositories/` - Implementation examples

