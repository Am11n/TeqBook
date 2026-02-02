# i18n Strategy for Monorepo

## Overview

When splitting into multiple apps, we need a strategy for handling translations that:
- Avoids duplication across apps
- Allows app-specific translations
- Maintains consistency

## Structure

### Shared Translations (`packages/shared/src/locales/`)

**Move from `apps/dashboard/src/i18n/`:**
- Translation dictionaries (all locale files: `en.ts`, `nb.ts`, etc.)
- `normalizeLocale.ts` utility
- `translations.ts` type definitions

**Structure:**
```
packages/shared/src/locales/
├── en.ts
├── nb.ts
├── ar.ts
├── ... (all 15 languages)
├── normalizeLocale.ts
└── translations.ts
```

### App-Specific Providers

Each app has its own `LocaleProvider` that:
- Uses shared translation dictionaries
- Handles app-specific locale detection logic
- Manages locale state (cookie, localStorage, etc.)

**Structure:**
```
apps/public/src/providers/locale-provider.tsx
apps/dashboard/src/providers/locale-provider.tsx
apps/admin/src/providers/locale-provider.tsx
```

## Migration Steps

1. **Move translation files to packages/shared:**
   - Copy `apps/dashboard/src/i18n/*.ts` → `packages/shared/src/locales/`
   - Update imports in shared package

2. **Create app-specific providers:**
   - Each app has `apps/*/src/providers/locale-provider.tsx`
   - Imports from `@teqbook/shared/locales`
   - App-specific logic (e.g., public booking uses salon's default language)

3. **Update imports:**
   - Change `@/i18n/translations` → `@teqbook/shared/locales/translations`
   - Change `@/i18n/normalizeLocale` → `@teqbook/shared/locales/normalizeLocale`

## Benefits

- No duplication: translations live in one place
- App flexibility: each app can have different locale detection logic
- Consistency: all apps use same translation dictionaries
