-- Public booking (anon Supabase client) queries salons with is_public = true.
-- pilot_access_recovery granted SELECT on salons only to authenticated and scoped
-- RLS policies to TO authenticated, so anon had no table privilege →
-- "permission denied for table salons" / failed loads on /book/*.

BEGIN;

GRANT SELECT ON TABLE public.salons TO anon;

DROP POLICY IF EXISTS "Anon can read public salons" ON public.salons;
CREATE POLICY "Anon can read public salons"
  ON public.salons
  FOR SELECT
  TO anon
  USING (is_public IS TRUE);

COMMIT;
