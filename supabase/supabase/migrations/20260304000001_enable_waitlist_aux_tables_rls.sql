-- Enable RLS for waitlist auxiliary tables exposed through PostgREST.

ALTER TABLE IF EXISTS public.waitlist_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.waitlist_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.waitlist_lifecycle_events ENABLE ROW LEVEL SECURITY;

-- Waitlist policy visibility:
-- - authenticated users can read global defaults (salon_id IS NULL)
-- - authenticated users can read/write policies only for their own salons
DROP POLICY IF EXISTS "Users can view waitlist policies for their salon" ON public.waitlist_policies;
CREATE POLICY "Users can view waitlist policies for their salon"
  ON public.waitlist_policies FOR SELECT
  USING (
    salon_id IS NULL
    OR salon_id IN (
      SELECT salon_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert waitlist policies for their salon" ON public.waitlist_policies;
CREATE POLICY "Users can insert waitlist policies for their salon"
  ON public.waitlist_policies FOR INSERT
  WITH CHECK (
    salon_id IN (
      SELECT salon_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update waitlist policies for their salon" ON public.waitlist_policies;
CREATE POLICY "Users can update waitlist policies for their salon"
  ON public.waitlist_policies FOR UPDATE
  USING (
    salon_id IN (
      SELECT salon_id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    salon_id IN (
      SELECT salon_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Waitlist offers are salon-scoped.
DROP POLICY IF EXISTS "Users can view waitlist offers for their salon" ON public.waitlist_offers;
CREATE POLICY "Users can view waitlist offers for their salon"
  ON public.waitlist_offers FOR SELECT
  USING (
    salon_id IN (
      SELECT salon_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert waitlist offers for their salon" ON public.waitlist_offers;
CREATE POLICY "Users can insert waitlist offers for their salon"
  ON public.waitlist_offers FOR INSERT
  WITH CHECK (
    salon_id IN (
      SELECT salon_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update waitlist offers for their salon" ON public.waitlist_offers;
CREATE POLICY "Users can update waitlist offers for their salon"
  ON public.waitlist_offers FOR UPDATE
  USING (
    salon_id IN (
      SELECT salon_id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    salon_id IN (
      SELECT salon_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Lifecycle events are append-only from server-side automation.
-- Authenticated users can read events for their own salons.
DROP POLICY IF EXISTS "Users can view waitlist lifecycle events for their salon" ON public.waitlist_lifecycle_events;
CREATE POLICY "Users can view waitlist lifecycle events for their salon"
  ON public.waitlist_lifecycle_events FOR SELECT
  USING (
    salon_id IN (
      SELECT salon_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );
