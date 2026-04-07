-- Several RLS policies use subqueries against public.profiles (e.g. salon membership).
-- PostgreSQL requires the active role to hold SELECT on tables referenced inside policy
-- expressions. After pilot_access_recovery, anon had no SELECT on profiles, which surfaces
-- as "permission denied for table profiles" when anon invokes PostgREST/RPC paths that
-- evaluate those policies (even when the visible result is empty).
--
-- RLS on profiles remains: only authenticated policies allow row visibility; anon still
-- cannot read profile rows via direct REST — only the privilege needed for policy evaluation.

BEGIN;

GRANT SELECT ON TABLE public.profiles TO anon;

COMMIT;
