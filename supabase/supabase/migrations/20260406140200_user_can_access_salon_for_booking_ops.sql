CREATE OR REPLACE FUNCTION public.user_can_access_salon_for_booking_ops(p_salon_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL
    AND (
      EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.salon_id = p_salon_id)
      OR EXISTS (SELECT 1 FROM public.salon_ownerships so WHERE so.user_id = auth.uid() AND so.salon_id = p_salon_id)
    );
$$;
