-- Model A: effective add-on capacity for invariant checks includes Stripe-reported
-- quantities plus salon.pending_* (scheduled for next period) so usage can align
-- with dashboard auto-scheduling without mid-cycle Stripe line changes.

CREATE OR REPLACE FUNCTION public.salon_capped_addon_quantity(p_salon_id uuid, p_plan text, p_dim text)
RETURNS integer
LANGUAGE sql
STABLE
AS $$
  SELECT CASE
    WHEN p_plan = 'starter' AND p_dim = 'employees' THEN LEAST(
      COALESCE((SELECT a.qty FROM public.addons a WHERE a.salon_id = p_salon_id AND a.type = 'extra_staff'), 0)
      + COALESCE((SELECT s.pending_extra_staff FROM public.salons s WHERE s.id = p_salon_id), 0),
      20
    )
    WHEN p_plan = 'starter' AND p_dim = 'languages' THEN LEAST(
      COALESCE((SELECT a.qty FROM public.addons a WHERE a.salon_id = p_salon_id AND a.type = 'extra_languages'), 0)
      + COALESCE((SELECT s.pending_extra_languages FROM public.salons s WHERE s.id = p_salon_id), 0),
      8
    )
    WHEN p_dim = 'employees' THEN COALESCE(
      (SELECT a.qty FROM public.addons a WHERE a.salon_id = p_salon_id AND a.type = 'extra_staff'),
      0
    )
    + COALESCE((SELECT s.pending_extra_staff FROM public.salons s WHERE s.id = p_salon_id), 0)
    ELSE COALESCE(
      (SELECT a.qty FROM public.addons a WHERE a.salon_id = p_salon_id AND a.type = 'extra_languages'),
      0
    )
    + COALESCE((SELECT s.pending_extra_languages FROM public.salons s WHERE s.id = p_salon_id), 0)
  END;
$$;
