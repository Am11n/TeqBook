-- Triggers on employees / salons call assert_salon_addon_usage as the session role (authenticated).
-- Step-0 migration revoked PUBLIC but did not grant authenticated, causing
-- "permission denied for function assert_salon_addon_usage" on direct table updates
-- (e.g. toggling is_active).

GRANT EXECUTE ON FUNCTION public.addon_included_limit(public.plan_type, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.salon_capped_addon_quantity(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.assert_salon_addon_usage(uuid, public.plan_type, text, integer) TO authenticated;
