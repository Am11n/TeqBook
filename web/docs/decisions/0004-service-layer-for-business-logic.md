# ADR-0004: Service Layer for Business Logic

**Status:** Accepted  
**Date:** 2024-01-15  
**Deciders:** Development Team

## Context

Business logic needs to be separated from UI and data access. We need a place to:
- Validate inputs
- Orchestrate multiple repository calls
- Handle business rules
- Transform data for UI consumption

## Decision

We will use a **Service Layer** (`src/lib/services/`) for all business logic.

Services orchestrate repository calls and contain all business rules. UI components should only call services, never repositories directly.

## Rules

1. **One service per domain** (e.g., `bookings-service.ts`, `employees-service.ts`)
2. **Services call repositories**, never Supabase directly
3. **Services contain validation** and business logic
4. **Services return consistent types** matching repository pattern
5. **No UI-specific logic** in services

## Consequences

### Positive
- Business logic is centralized and reusable
- Easy to test (mock repositories)
- UI components are thin and focused on presentation
- Business rules are documented through code
- Can change UI without affecting business logic

### Negative
- Additional layer adds complexity
- Requires discipline to maintain boundaries

### Mitigation
- Clear documentation in `docs/architecture/service-standards.md`
- Code review process
- Examples in existing services

---

## References

- `docs/architecture/service-standards.md` - Service standards
- `docs/architecture/layers.md` - Layer documentation
- `src/lib/services/` - Implementation examples

