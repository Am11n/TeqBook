-- Backfill trial_end for salons that were created before onboarding set trial_end (e.g. RPC not yet deployed),
-- or rows that never received trial_end. Grandfathered long-lived salons (old created_at) are untouched.
--
-- Rule: only rows with NULL trial_end, no Stripe subscription, created in the last 120 days.
-- trial window starts from original signup (created_at), not from backfill time.

UPDATE public.salons s
SET
  trial_end = s.created_at + interval '14 days',
  updated_at = now()
WHERE s.trial_end IS NULL
  AND s.billing_subscription_id IS NULL
  AND s.created_at >= (now() - interval '120 days');
