# TeqBook – File Size Audit

Generated: 2026-02-20

Target: alle `.tsx` og `.ts` filer over 200 linjer.
i18n-filer er inkludert men markert separat (de er forventet store).

---

## Dashboard App (`apps/dashboard/src/`)

### Page-filer

| Linjer | Fil | Status |
|-------:|------|--------|
| 538 | `app/calendar/page.tsx` | ⚠️ Over 300 |
| 500 | `app/settings/import/page.tsx` | ⚠️ Over 300 |
| 486 | `app/settings/notifications/page.tsx` | ⚠️ Over 300 |
| 435 | `app/customers/[id]/history/page.tsx` | ⚠️ Over 300 |
| 411 | `app/settings/audit-trail/page.tsx` | ⚠️ Over 300 |
| 381 | `app/employees/page.tsx` | ⚠️ Over 300 |
| 356 | `app/shifts/page.tsx` | ⚠️ Over 300 |
| 344 | `app/services/page.tsx` | ⚠️ Over 300 |
| 331 | `app/personalliste/page.tsx` | ⚠️ Over 300 |
| 327 | `app/reports/commissions/page.tsx` | ⚠️ Over 300 |
| 320 | `app/settings/opening-hours/page.tsx` | ⚠️ Over 300 |
| 316 | `app/customers/page.tsx` | ⚠️ Over 300 |
| 305 | `app/bookings/page.tsx` | ⚠️ Over 300 |
| 283 | `app/sales/packages/page.tsx` | ✅ Under 300 |
| 267 | `app/settings/general/page.tsx` | ✅ Under 300 |
| 230 | `app/sales/gift-cards/page.tsx` | ✅ Under 300 |
| 203 | `app/reports/capacity/page.tsx` | ✅ Under 300 |
| 195 | `app/reports/export/page.tsx` | ✅ Under 300 |
| 187 | `app/(onboarding)/onboarding/page.tsx` | ✅ Under 300 |
| 178 | `app/settings/billing/page.tsx` | ✅ Under 300 |
| 171 | `app/help/feedback/page.tsx` | ✅ Under 300 |
| 159 | `app/settings/no-show-policy/page.tsx` | ✅ Under 300 |
| 153 | `app/help/support/page.tsx` | ✅ Under 300 |
| 153 | `app/products/page.tsx` | ✅ Under 300 |
| 145 | `app/bookings/waitlist/page.tsx` | ✅ Under 300 |
| 128 | `app/page.tsx` | ✅ Under 300 |
| 114 | `app/login/page.tsx` | ✅ Under 300 |
| 97 | `app/profile/page.tsx` | ✅ Under 300 |
| 81 | `app/reports/page.tsx` | ✅ Under 300 |
| 69 | `app/settings/branding/page.tsx` | ✅ Under 300 |
| 48 | `app/settings/security/page.tsx` | ✅ Under 300 |

### Komponenter (over 200 linjer)

| Linjer | Fil | Kategori |
|-------:|------|----------|
| 1051 | `components/shifts/CopyShiftsDialog.tsx` | 🔴 Kritisk |
| 821 | `components/shared/data-table.tsx` | 🔴 Kritisk |
| 715 | `components/layout/admin-shell.tsx` | 🔴 Kritisk |
| 666 | `components/calendar/CalendarMobileView.tsx` | 🟠 Stor |
| 430 | `components/forms/BookingForm.tsx` | 🟠 Stor |
| 422 | `components/booking-preview.tsx` | 🟠 Stor |
| 412 | `components/shifts/ShiftsListView.tsx` | 🟠 Stor |
| 385 | `components/customers/ImportCustomersDialog.tsx` | 🟠 Stor |
| 380 | `components/calendar/DayView.tsx` | 🟠 Stor |
| 369 | `_components/FeedbackDetailView.tsx` (help/feedback) | 🟡 Grense |

### Services (over 200 linjer)

| Linjer | Fil | Kategori |
|-------:|------|----------|
| 884 | `lib/services/billing-service.ts` | 🔴 Kritisk |
| 738 | `lib/services/bookings-service.ts` | 🔴 Kritisk |
| 670 | `lib/services/outlook-calendar-service.ts` | 🟠 Stor |
| 659 | `lib/services/google-calendar-service.ts` | 🟠 Stor |
| 580 | `lib/services/email-service.ts` | 🟠 Stor |
| 570 | `lib/services/multi-salon-service.ts` | 🟠 Stor |
| 519 | `lib/services/push-notification-service.ts` | 🟠 Stor |
| 488 | `lib/services/template-service.ts` | 🟠 Stor |
| 487 | `lib/services/rate-limit-service.ts` | 🟠 Stor |
| 449 | `lib/services/unified-notification-service.ts` | 🟠 Stor |
| 443 | `lib/services/employee-performance-service.ts` | 🟠 Stor |
| 441 | `lib/services/forecasting-service.ts` | 🟠 Stor |
| 439 | `lib/services/import-service.ts` | 🟠 Stor |
| 438 | `lib/services/auth-service.ts` | 🟠 Stor |
| 411 | `lib/services/clv-service.ts` | 🟠 Stor |
| 407 | `lib/services/audit-trail-service.ts` | 🟠 Stor |
| 383 | `lib/services/export-service.ts` | 🟡 Grense |
| 382 | `lib/services/performance-service.ts` | 🟡 Grense |
| 376 | `lib/services/cache-service.ts` | 🟡 Grense |
| 376 | `lib/services/admin-service.ts` | 🟡 Grense |
| 372 | `lib/services/permissions-service.ts` | 🟡 Grense |

### Repositories / hooks / andre (over 200 linjer)

| Linjer | Fil |
|-------:|------|
| 605 | `lib/repositories/bookings.ts` |
| 458 | `lib/hooks/bookings/useCreateBooking.ts` |
| 425 | `lib/types.ts` |
| 387 | `lib/repositories/products.ts` |
| 387 | `app/api/bookings/send-notifications/route.ts` |
| 373 | `app/api/bookings/send-cancellation/route.ts` |
| 368 | `lib/hooks/shifts/useCopyShifts.ts` |

### i18n-filer (forventet store, ignorer)

| Linjer | Fil |
|-------:|------|
| 1029 | `i18n/translations.ts` |
| 970 | `i18n/nb.ts` |
| 946 | `i18n/en.ts` |
| 698-707 | `i18n/{so,vi,tl,tr,ti,ur,pl,ar,hi,am,fa,dar,zh}.ts` |

---

## Admin App (`apps/admin/src/`)

### Page-filer

| Linjer | Fil | Status |
|-------:|------|--------|
| 458 | `app/(admin)/notifications/page.tsx` | ⚠️ Over 300 |
| 369 | `app/(admin)/plan-features/page.tsx` | ⚠️ Over 300 |
| 318 | `app/(admin)/design-system/page.tsx` | ⚠️ Over 300 |
| 305 | `app/(admin)/page.tsx` | ⚠️ Over 300 |
| 299 | `app/(admin)/audit-logs/page.tsx` | ✅ Under 300 |
| 295 | `app/(admin)/salons/page.tsx` | ✅ Under 300 |
| 268 | `app/(admin)/profile/page.tsx` | ✅ Under 300 |
| 254 | `app/(admin)/analytics/page.tsx` | ✅ Under 300 |
| 246 | `app/login/page.tsx` | ✅ Under 300 |
| 233 | `app/(admin)/users/page.tsx` | ✅ Under 300 |
| 191 | `app/(admin)/onboarding/page.tsx` | ✅ Under 300 |
| 191 | `app/(admin)/data-tools/page.tsx` | ✅ Under 300 |
| 181 | `app/(admin)/security-events/page.tsx` | ✅ Under 300 |
| 179 | `app/(admin)/support/page.tsx` | ✅ Under 300 |
| 162 | `app/(admin)/plans/page.tsx` | ✅ Under 300 |
| 151 | `app/(admin)/feedback/page.tsx` | ✅ Under 300 |
| 148 | `app/(admin)/admins/page.tsx` | ✅ Under 300 |
| 135 | `app/(admin)/system-health/page.tsx` | ✅ Under 300 |
| 132 | `app/(admin)/feature-flags/page.tsx` | ✅ Under 300 |
| 130 | `app/(admin)/incidents/page.tsx` | ✅ Under 300 |
| 126 | `app/(admin)/changelog/page.tsx` | ✅ Under 300 |
| 108 | `app/(admin)/analytics/cohorts/page.tsx` | ✅ Under 300 |

### Komponenter (over 200 linjer)

| Linjer | Fil | Kategori |
|-------:|------|----------|
| 998 | `components/layout/admin-shell.tsx` | 🔴 Kritisk |
| 812 | `components/shared/data-table.tsx` | 🔴 Kritisk |
| 488 | `_components/FeedbackDrawerContent.tsx` (feedback) | 🟠 Stor |
| 460 | `components/notification-center.tsx` | 🟠 Stor |

### Services (over 200 linjer)

| Linjer | Fil | Kategori |
|-------:|------|----------|
| 881 | `lib/services/billing-service.ts` | 🔴 Kritisk |
| 680 | `lib/services/bookings-service.ts` | 🔴 Kritisk |
| 670 | `lib/services/outlook-calendar-service.ts` | 🟠 Stor |
| 659 | `lib/services/google-calendar-service.ts` | 🟠 Stor |
| 580 | `lib/services/email-service.ts` | 🟠 Stor |
| 570 | `lib/services/multi-salon-service.ts` | 🟠 Stor |
| 519 | `lib/services/push-notification-service.ts` | 🟠 Stor |
| 488 | `lib/services/template-service.ts` | 🟠 Stor |
| 487 | `lib/services/rate-limit-service.ts` | 🟠 Stor |
| 443 | `lib/services/employee-performance-service.ts` | 🟠 Stor |
| 441 | `lib/services/forecasting-service.ts` | 🟠 Stor |
| 439 | `lib/services/unified-notification-service.ts` | 🟠 Stor |
| 411 | `lib/services/clv-service.ts` | 🟠 Stor |
| 407 | `lib/services/audit-trail-service.ts` | 🟠 Stor |
| 407 | `lib/services/auth-service.ts` | 🟠 Stor |

### Repositories / hooks (over 200 linjer)

| Linjer | Fil |
|-------:|------|
| 605 | `lib/repositories/bookings.ts` |
| 458 | `lib/hooks/bookings/useCreateBooking.ts` |
| 435 | `lib/hooks/notifications/useNotifications.ts` |
| 387 | `lib/repositories/products.ts` |

---

## Public App (`apps/public/src/`)

### Page-filer

| Linjer | Fil | Status |
|-------:|------|--------|
| 447 | `app/login/page.tsx` | ⚠️ Over 300 |
| 284 | `app/login-admin/page.tsx` | ✅ Under 300 |
| 187 | `app/landing/page.tsx` | ✅ Under 300 |
| 182 | `app/onboarding/page.tsx` | ✅ Under 300 |
| 87 | `app/signup/page.tsx` | ✅ Under 300 |
| 37 | `app/book/[salon_slug]/page.tsx` | ✅ Under 300 |
| 30 | `app/book/[salon_slug]/confirmation/page.tsx` | ✅ Under 300 |
| 19 | `app/login-2fa/page.tsx` | ✅ Under 300 |
| 12 | `app/page.tsx` | ✅ Under 300 |

### Komponenter (over 200 linjer)

| Linjer | Fil | Kategori |
|-------:|------|----------|
| 1648 | `components/landing/landing-copy.ts` | Data-fil |
| 601 | `components/public-booking-page.tsx` | 🔴 Kritisk |
| 332 | `app/book/[salon_slug]/confirmation/page-client.tsx` | ⚠️ Over 300 |

### Services (over 200 linjer)

| Linjer | Fil |
|-------:|------|
| 683 | `lib/services/bookings-service.ts` |
| 580 | `lib/services/email-service.ts` |
| 487 | `lib/services/rate-limit-service.ts` |
| 411 | `lib/services/auth-service.ts` |
| 407 | `lib/services/audit-trail-service.ts` |
| 376 | `lib/services/cache-service.ts` |

### Repositories (over 200 linjer)

| Linjer | Fil |
|-------:|------|
| 605 | `lib/repositories/bookings.ts` |
| 387 | `lib/repositories/products.ts` |
| 349 | `lib/repositories/employees.ts` |
| 323 | `lib/repositories/notifications.ts` |

---

## Oppsummering

### Totalt antall filer per kategori

| Kategori | Terskel | Antall filer |
|----------|---------|:------------:|
| 🔴 Kritisk | 700+ linjer | 10 (ekskl. i18n) |
| 🟠 Stor | 400-699 linjer | ~35 |
| ⚠️ Over 300 | 300-399 linjer | ~20 |
| ✅ OK | Under 300 linjer | resten |

### Mest dupliserte filer på tvers av apper

Disse filene finnes i 2-3 apper med nesten identisk innhold:

| Fil | Dashboard | Admin | Public |
|-----|:---------:|:-----:|:------:|
| `billing-service.ts` | 884 | 881 | — |
| `bookings-service.ts` | 738 | 680 | 683 |
| `data-table.tsx` | 821 | 812 | — |
| `admin-shell.tsx` | 715 | 998 | — |
| `email-service.ts` | 580 | 580 | 580 |
| `bookings.ts` (repo) | 605 | 605 | 605 |
| `outlook-calendar-service.ts` | 670 | 670 | — |
| `google-calendar-service.ts` | 659 | 659 | — |
| `rate-limit-service.ts` | 487 | 487 | 487 |
| `auth-service.ts` | 438 | 407 | 411 |

### Anbefalinger for neste fase

1. **Page-filer over 300 linjer** -- 13 i dashboard, 4 i admin, 1 i public. Samme `_components/`-mønster som allerede utført.
2. **Kritiske komponenter** -- `CopyShiftsDialog` (1051), `data-table` (821/812), `admin-shell` (998/715) bør splittes per plan.
3. **Services over 700 linjer** -- `billing-service` og `bookings-service` bør moduleres til interne mapper med `index.ts` wrapper.
4. **Duplisering** -- 10 filer er nesten identiske på tvers av apper. Kandidater for `packages/shared/`.
