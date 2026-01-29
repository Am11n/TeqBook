# ADR-0002: Supabase as Backend-as-a-Service

**Status:** Accepted  
**Date:** 2024-01-15  
**Deciders:** Development Team

## Context

TeqBook needs a backend solution that provides:
- Authentication
- Database (PostgreSQL)
- Real-time capabilities (future)
- Row Level Security (RLS) for multi-tenancy
- API endpoints

We need to decide between building a custom backend or using a BaaS solution.

## Decision

We will use **Supabase** as our Backend-as-a-Service solution.

## Rationale

1. **Rapid Development**: Supabase provides authentication, database, and RLS out of the box
2. **PostgreSQL**: Full-featured relational database with advanced features
3. **Row Level Security**: Built-in support for multi-tenant data isolation
4. **Type Safety**: Supabase generates TypeScript types from database schema
5. **Cost-Effective**: Free tier suitable for MVP, scales with usage
6. **Open Source**: Can self-host if needed in the future

## Consequences

### Positive
- Fast development velocity
- Built-in authentication and authorization
- Strong multi-tenant support via RLS
- Type-safe database queries
- Real-time capabilities available when needed

### Negative
- Vendor lock-in (mitigated by PostgreSQL standard)
- Less control over infrastructure
- Potential cost scaling concerns at high volume
- Learning curve for RLS policies

### Mitigation
- Use standard PostgreSQL features (not Supabase-specific)
- Document RLS policies thoroughly
- Monitor usage and costs
- Plan migration path if needed

---

## References

- `docs/backend/data-model.md` - Database schema
- `supabase/README.md` - Supabase setup and scripts
- `docs/architecture/overview.md` - Architecture overview

