# Page Size Compliance Report

## Regel
**Ingen `page.tsx` bør være > 400 linjer uten grunn.**

## Status

### ✅ Fullført (under 400 linjer)

| Fil | Linjer | Status |
|-----|--------|--------|
| `bookings/page.tsx` | 214 | ✅ Refaktorert (957→214) |
| `shifts/page.tsx` | 182 | ✅ Refaktorert (762→182) |
| `landing/page.tsx` | 136 | ✅ Refaktorert (902→136) |
| `customers/page.tsx` | 380 | ✅ OK |
| `settings/general/page.tsx` | 366 | ✅ OK |
| `login/page.tsx` | 386 | ✅ OK |
| `admin/page.tsx` | 367 | ✅ OK |
| `settings/notifications/page.tsx` | 226 | ✅ OK |

### ✅ Alle refaktorert!

Alle `page.tsx` filer er nå under 400 linjer og følger feature-based organization mønsteret.

| Fil | Før | Etter | Status |
|-----|-----|-------|--------|
| `settings/billing/page.tsx` | 701 | 161 | ✅ |
| `onboarding/page.tsx` | 701 | 182 | ✅ |
| `dashboard/page.tsx` | 657 | 122 | ✅ |
| `reports/page.tsx` | 606 | 89 | ✅ |
| `settings/security/page.tsx` | 575 | 48 | ✅ |
| `employees/page.tsx` | 480 | 113 | ✅ |
| `services/page.tsx` | 452 | 119 | ✅ |
| `calendar/page.tsx` | 434 | 116 | ✅ |
| `profile/page.tsx` | 434 | 97 | ✅ |
| `signup/page.tsx` | 428 | 87 | ✅ |
| `settings/branding/page.tsx` | 438 | 66 | ✅ |
| `products/page.tsx` | 421 | 145 | ✅ |
| `test-billing/page.tsx` | 403 | 86 | ✅ |

## Refactoring Plan

Alle filer over 400 linjer skal refaktoreres etter **feature-based organization** mønsteret:

```
app/{feature}/page.tsx              # ✅ ONLY the main page file
components/{feature}/                # ✅ All UI components
lib/hooks/{feature}/                 # ✅ All custom hooks
lib/utils/{feature}/                 # ✅ All utility functions
```

### Eksempel: Hvordan refaktorere

1. **Identifiser komponenter** som kan ekstraheres
2. **Identifiser hooks** for state management og data loading
3. **Identifiser utilities** for formatering og hjelpefunksjoner
4. **Flytt til riktige mapper** etter feature-based struktur
5. **Oppdater imports** i page.tsx
6. **Verifiser** at page.tsx er < 400 linjer

## Dokumentasjon

- Se `docs/architecture/folder-structure.md` for detaljert struktur
- Se `docs/cursor-rule.md` for utviklingsstandarder

