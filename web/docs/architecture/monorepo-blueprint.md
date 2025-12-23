# Monorepo Blueprint

This document outlines the future monorepo structure for TeqBook, describing how the current `web/` application can be refactored into a multi-package monorepo to support multiple applications and shared packages.

## Table of Contents

- [Current Structure](#current-structure)
- [Proposed Monorepo Structure](#proposed-monorepo-structure)
- [Package Breakdown](#package-breakdown)
- [Migration Strategy](#migration-strategy)
- [Refactoring Requirements](#refactoring-requirements)
- [Benefits](#benefits)

---

## Current Structure

```
TeqBook/
├── web/
│   ├── src/
│   │   ├── app/              # Next.js App Router pages
│   │   ├── components/       # React components
│   │   ├── lib/
│   │   │   ├── services/     # Business logic
│   │   │   ├── repositories/ # Data access
│   │   │   ├── types/        # TypeScript types
│   │   │   └── utils/        # Utilities
│   │   └── ...
│   ├── supabase/
│   │   ├── functions/        # Edge Functions
│   │   └── *.sql            # Migrations
│   └── package.json
└── README.md
```

---

## Proposed Monorepo Structure

```
TeqBook/
├── apps/
│   ├── web-admin/            # Admin dashboard (current web app)
│   │   ├── src/
│   │   │   ├── app/          # Next.js pages
│   │   │   └── components/   # App-specific components
│   │   └── package.json
│   ├── web-public/           # Public booking pages (future)
│   │   ├── src/
│   │   │   └── app/
│   │   └── package.json
│   └── mobile/               # React Native app (future)
│       ├── src/
│       └── package.json
├── packages/
│   ├── ui/                   # Shared UI components
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── styles/
│   │   └── package.json
│   ├── core-domain/          # Domain models and business logic
│   │   ├── src/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   ├── types/
│   │   │   └── validation/
│   │   └── package.json
│   ├── supabase-client/     # Supabase client and utilities
│   │   ├── src/
│   │   │   ├── client.ts
│   │   │   ├── types.ts
│   │   │   └── utils.ts
│   │   └── package.json
│   ├── config/               # Shared configs (ESLint, TypeScript, etc.)
│   │   ├── eslint/
│   │   ├── typescript/
│   │   └── package.json
│   └── events/               # Event system (if needed)
│       ├── src/
│       └── package.json
├── supabase/                 # Shared Supabase resources
│   ├── functions/
│   └── migrations/
├── tools/                     # Build tools and scripts
│   └── scripts/
├── package.json              # Root package.json (workspace config)
├── pnpm-workspace.yaml       # pnpm workspace config
└── README.md
```

---

## Package Breakdown

### `apps/web-admin`

**Purpose:** Admin dashboard for salon owners and staff.

**Contains:**
- Next.js App Router pages (`/dashboard`, `/bookings`, `/calendar`, etc.)
- App-specific components (dashboard shell, admin panels)
- App-specific routes and layouts

**Dependencies:**
- `@teqbook/ui` - Shared UI components
- `@teqbook/core-domain` - Business logic and services
- `@teqbook/supabase-client` - Supabase client

**What Moves Here:**
- `web/src/app/` → `apps/web-admin/src/app/`
- `web/src/components/layout/dashboard-shell.tsx` → `apps/web-admin/src/components/`
- App-specific pages and routes

---

### `apps/web-public` (Future)

**Purpose:** Public-facing booking pages (can be separate Next.js app or same app with different routes).

**Contains:**
- Public booking pages (`/book/[slug]`)
- Public-facing components
- SEO-optimized pages

**Dependencies:**
- `@teqbook/ui` - Shared UI components
- `@teqbook/core-domain` - Business logic
- `@teqbook/supabase-client` - Supabase client

**What Moves Here:**
- `web/src/app/book/[salon_slug]/` → `apps/web-public/src/app/book/[salon_slug]/`
- `web/src/components/public-booking-page.tsx` → `apps/web-public/src/components/`

---

### `apps/mobile` (Future)

**Purpose:** React Native mobile app for salon staff.

**Contains:**
- React Native screens and components
- Mobile-specific navigation
- Native integrations (push notifications, etc.)

**Dependencies:**
- `@teqbook/core-domain` - Business logic (shared!)
- `@teqbook/supabase-client` - Supabase client
- React Native UI library (e.g., React Native Paper)

---

### `packages/ui`

**Purpose:** Shared UI components and design system.

**Contains:**
- Reusable React components (buttons, forms, modals, etc.)
- Design tokens (colors, spacing, typography)
- Shared hooks (useFeatures, useCurrentSalon, etc.)
- Theme configuration

**What Moves Here:**
- `web/src/components/ui/` → `packages/ui/src/components/`
- `web/src/components/feedback/` → `packages/ui/src/components/feedback/`
- `web/src/lib/hooks/` → `packages/ui/src/hooks/` (UI-related hooks)
- `web/src/components/salon-provider.tsx` → `packages/ui/src/providers/`
- `web/src/components/locale-provider.tsx` → `packages/ui/src/providers/`

**Dependencies:**
- React
- Shadcn UI components
- Tailwind CSS

---

### `packages/core-domain`

**Purpose:** Core business logic, domain models, and services.

**Contains:**
- Service layer (`services/`)
- Repository layer (`repositories/`)
- Domain types (`types/domain.ts`)
- Validation schemas (`validation/`)
- Business rules and state machines

**What Moves Here:**
- `web/src/lib/services/` → `packages/core-domain/src/services/`
- `web/src/lib/repositories/` → `packages/core-domain/src/repositories/`
- `web/src/lib/types/domain.ts` → `packages/core-domain/src/types/`
- `web/src/lib/validation/` → `packages/core-domain/src/validation/`

**Dependencies:**
- `@teqbook/supabase-client` - For Supabase access
- TypeScript

**No Dependencies On:**
- React (pure TypeScript/JavaScript)
- Next.js
- UI libraries

---

### `packages/supabase-client`

**Purpose:** Supabase client configuration and utilities.

**Contains:**
- Supabase client initialization
- Type generation utilities
- Supabase-specific helpers

**What Moves Here:**
- `web/src/lib/supabase-client.ts` → `packages/supabase-client/src/client.ts`
- Supabase type generation scripts

**Dependencies:**
- `@supabase/supabase-js`

---

### `packages/config`

**Purpose:** Shared configuration files (ESLint, TypeScript, etc.).

**Contains:**
- ESLint configs
- TypeScript configs
- Prettier config
- Shared build tools

**What Moves Here:**
- `web/.eslintrc.json` → `packages/config/eslint/base.json`
- `web/tsconfig.json` → `packages/config/typescript/base.json`

---

## Migration Strategy

### Phase 1: Preparation (Current)

1. ✅ Identify shared vs. app-specific code
2. ✅ Document current structure
3. ✅ Create this blueprint

### Phase 2: Extract Core Domain

1. Create `packages/core-domain/`
2. Move services, repositories, types, validation
3. Update imports in `web/` to use `@teqbook/core-domain`
4. Test that everything still works

### Phase 3: Extract UI Package

1. Create `packages/ui/`
2. Move shared components, hooks, providers
3. Update imports in `web/` to use `@teqbook/ui`
4. Test that everything still works

### Phase 4: Extract Supabase Client

1. Create `packages/supabase-client/`
2. Move Supabase client and utilities
3. Update imports across all packages
4. Test that everything still works

### Phase 5: Create Monorepo Structure

1. Set up pnpm workspace (or npm/yarn workspaces)
2. Move `web/` to `apps/web-admin/`
3. Create root `package.json` with workspace config
4. Update all package.json files
5. Test that everything still works

### Phase 6: Extract Config

1. Create `packages/config/`
2. Move shared configs
3. Update all packages to use shared configs

### Phase 7: Future Apps

1. Create `apps/web-public/` when needed
2. Create `apps/mobile/` when needed
3. Reuse shared packages

---

## Refactoring Requirements

### Code That Needs Refactoring

1. **React-Specific Code in Services:**
   - Some services may have React-specific logic
   - Move React-specific code to UI layer or hooks
   - Keep services pure TypeScript/JavaScript

2. **Direct Supabase Calls in Components:**
   - Components should use services, not repositories directly
   - Move direct Supabase calls to repositories or services

3. **Tight Coupling:**
   - Some components may be too tightly coupled
   - Extract shared logic to hooks or utilities

4. **Import Paths:**
   - Current: `@/lib/services/...`
   - Future: `@teqbook/core-domain/services/...`
   - Use TypeScript path mapping during migration

### Code That's Already Clean

1. ✅ **Service Layer:** Already separated from UI
2. ✅ **Repository Layer:** Already separated from services
3. ✅ **Type Definitions:** Already in separate files
4. ✅ **Validation:** Already in separate files

---

## Benefits

### 1. Code Reusability

- Share business logic across web, mobile, and future apps
- Share UI components across admin and public apps
- Single source of truth for domain models

### 2. Independent Deployment

- Deploy admin app separately from public app
- Deploy mobile app independently
- Update shared packages without breaking apps

### 3. Better Organization

- Clear separation of concerns
- Easier to find and maintain code
- Better scalability

### 4. Team Collaboration

- Teams can work on different apps/packages independently
- Clearer ownership and responsibilities
- Easier code reviews

### 5. Testing

- Test shared packages independently
- Mock packages in app tests
- Better test isolation

---

## Tooling Recommendations

### Package Manager

- **pnpm** (recommended): Fast, efficient, good workspace support
- **npm**: Built-in workspaces (npm 7+)
- **yarn**: Yarn workspaces

### Build Tools

- **Turborepo**: Fast monorepo build system
- **Nx**: Comprehensive monorepo toolkit
- **Simple scripts**: For smaller monorepos

### TypeScript

- Use TypeScript project references
- Shared `tsconfig.base.json`
- Each package has its own `tsconfig.json`

### Example: pnpm Workspace

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

```json
// package.json (root)
{
  "name": "teqbook",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "lint": "pnpm -r lint"
  }
}
```

---

## Timeline

### Short Term (1-2 months)

- Extract `core-domain` package
- Extract `ui` package
- Set up basic monorepo structure

### Medium Term (3-6 months)

- Complete monorepo migration
- Extract `supabase-client` package
- Extract `config` package

### Long Term (6+ months)

- Create `web-public` app (if needed)
- Create `mobile` app (if needed)
- Optimize build and deployment

---

## References

- [Domain Principles](./domain-principles.md)
- [Service Standards](./service-standards.md)
- [Architecture Layers](./layers.md)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Turborepo](https://turborepo.org/)

