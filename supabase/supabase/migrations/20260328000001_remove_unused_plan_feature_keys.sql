-- =====================================================
-- Remove plan feature keys not used in product matrix
-- (ONLINE_PAYMENTS, SUPPORT) — see admin matrix allowlist
-- =====================================================

DELETE FROM public.plan_features
WHERE feature_id IN (
  SELECT id FROM public.features WHERE key IN ('ONLINE_PAYMENTS', 'SUPPORT')
);

DELETE FROM public.features
WHERE key IN ('ONLINE_PAYMENTS', 'SUPPORT');
