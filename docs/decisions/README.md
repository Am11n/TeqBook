# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) for TeqBook.

## What are ADRs?

ADRs document important architectural decisions made during the development of TeqBook. They capture:
- **Context**: Why the decision was needed
- **Decision**: What was decided
- **Consequences**: Positive and negative impacts

## ADR Format

Each ADR follows this structure:
- **Status**: Proposed, Accepted, Deprecated, Superseded
- **Date**: When the decision was made
- **Deciders**: Who made the decision
- **Context**: Background and problem statement
- **Decision**: The chosen solution
- **Consequences**: Positive and negative impacts

## Current ADRs

- [ADR-0001: Layered Architecture Pattern](./0001-layered-architecture.md)
- [ADR-0002: Supabase as Backend-as-a-Service](./0002-supabase-as-backend.md)
- [ADR-0003: Repository Pattern for Data Access](./0003-repository-pattern.md)
- [ADR-0004: Service Layer for Business Logic](./0004-service-layer-for-business-logic.md)

## Adding New ADRs

When making a significant architectural decision:

1. Create a new file: `000X-short-description.md`
2. Use the template above
3. Update this README with the new ADR
4. Discuss with the team before marking as "Accepted"

## References

- [Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [ADR Template](https://github.com/joelparkerhenderson/architecture-decision-record)

