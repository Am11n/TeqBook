# Deprecation Tracker

All backward-compatibility re-export shims. These must be removed by the listed date.

| Old path | New import | Status | Remove by |
|---|---|---|---|
| `@/components/error-boundary` (all apps) | `@teqbook/feedback` | re-export shim | 2026-04-01 |
| `@/components/feedback/error-message` (all apps) | `@teqbook/feedback` | re-export shim | 2026-04-01 |
| `@/components/empty-state` (all apps) | `@teqbook/feedback` | re-export shim | 2026-04-01 |
| `@/components/shared/data-table` (dashboard + admin) | `@teqbook/data-table` | re-export shim | 2026-04-01 |
| `@teqbook/shared` (main entry) | `@teqbook/shared-core` + `@teqbook/shared-data` | re-export shim | 2026-04-01 |
| `@teqbook/shared/server` | `@teqbook/shared-data/server` | re-export shim | 2026-04-01 |
