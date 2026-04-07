/**
 * Feature flags for whole dashboard sections (not plan-matrix features).
 *
 * **Sales** (gift cards, packages under `/sales/*`): routes and APIs exist, but the
 * product is not finalized — navigation is hidden and layouts show a placeholder.
 * Re-enable when ready; see `docs/operations/future-improvements.md`.
 */
export const DASHBOARD_SALES_MODULE_ENABLED = false;
