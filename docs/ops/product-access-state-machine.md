# Product access state (salons.product_access_state)

## Source of truth

- **Stripe** is authoritative for billing and subscription facts.
- **`salons` projection** (`billing_subscription_id`, `current_period_end`, `payment_status`, `billing_inconsistent_reason`, …) is updated by webhooks and the **`billing-reconcile-salons`** Edge Function (cron with `TEQBOOK_CRON_SECRET`).
- **`product_access_state`** is **only** written by `public.recompute_product_access_state(uuid)` (see migration `20260501120000_product_access_state.sql`). Direct updates to the column are blocked except inside that function (session setting `teqbook.recompute_access_state = '1'`).

## States

| State | `salon_product_access_granted` |
|--------|----------------------------------|
| `legacy_exempt` | yes |
| `trial` | yes |
| `active` | yes |
| `grace` | yes |
| `suspended` | no |
| `expired` | no |
| `inconsistent_billing` | no |

## Priority (projection vs webhook)

- Webhooks apply the fast path when events arrive.
- **Reconcile** re-fetches Stripe and runs the same projection sync; use it when webhooks are delayed or `billing_inconsistent_reason` is set.

## Transitions

Recompute is **idempotent**: it derives state from current projection columns. There is no separate transition table; allowed changes are whatever recompute outputs when projection changes (e.g. `invoice.payment_succeeded` → `payment_status` active → typically `active`; failed payment + time → `grace` or `suspended`; non-empty `billing_inconsistent_reason` → `inconsistent_billing`).

## Ops

- **Reconcile:** invoke `billing-reconcile-salons` on a schedule (e.g. hourly) with `Authorization: Bearer $TEQBOOK_CRON_SECRET`.
- **Logs:** Postgres `RAISE LOG` on `product_access_state` changes (trigger `trg_log_product_access_state_transition`).
- **Runbook:** if many salons show `inconsistent_billing`, check Stripe webhook delivery and subscription metadata `salon_id`, then run reconcile.
