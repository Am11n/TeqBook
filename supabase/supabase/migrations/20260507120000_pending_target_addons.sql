-- Pending target model (absolute desired paid extras at next billing boundary).
-- Replaces delta columns pending_extra_staff / pending_extra_languages.
-- salon_capped_addon_quantity counts only addons table (Stripe mirror), not pending targets.

ALTER TABLE public.salons
  ADD COLUMN IF NOT EXISTS pending_target_extra_staff integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pending_target_extra_languages integer NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.salons.pending_target_extra_staff IS
  'Absolute desired extra_staff addon quantity on Stripe after next billing boundary apply.';
COMMENT ON COLUMN public.salons.pending_target_extra_languages IS
  'Absolute desired extra_languages addon quantity on Stripe after next billing boundary apply.';

-- Backfill absolute targets from current Stripe mirror + legacy pending deltas (starter caps 20 / 8).
UPDATE public.salons AS s
SET
  pending_target_extra_staff = sub.t_staff,
  pending_target_extra_languages = sub.t_lang
FROM (
  SELECT
    s2.id,
    LEAST(
      CASE WHEN s2.plan::text = 'starter' THEN 20 ELSE 2147483647 END,
      COALESCE(es.qty, 0) + COALESCE(s2.pending_extra_staff, 0)
    ) AS t_staff,
    LEAST(
      CASE WHEN s2.plan::text = 'starter' THEN 8 ELSE 2147483647 END,
      COALESCE(el.qty, 0) + COALESCE(s2.pending_extra_languages, 0)
    ) AS t_lang
  FROM public.salons s2
  LEFT JOIN public.addons es ON es.salon_id = s2.id AND es.type = 'extra_staff'
  LEFT JOIN public.addons el ON el.salon_id = s2.id AND el.type = 'extra_languages'
) AS sub
WHERE s.id = sub.id;

ALTER TABLE public.salons DROP COLUMN IF EXISTS pending_extra_staff;
ALTER TABLE public.salons DROP COLUMN IF EXISTS pending_extra_languages;

CREATE OR REPLACE FUNCTION public.salon_capped_addon_quantity(p_salon_id uuid, p_plan text, p_dim text)
RETURNS integer
LANGUAGE sql
STABLE
AS $$
  SELECT CASE
    WHEN p_plan = 'starter' AND p_dim = 'employees' THEN LEAST(
      COALESCE((SELECT a.qty FROM public.addons a WHERE a.salon_id = p_salon_id AND a.type = 'extra_staff'), 0),
      20
    )
    WHEN p_plan = 'starter' AND p_dim = 'languages' THEN LEAST(
      COALESCE((SELECT a.qty FROM public.addons a WHERE a.salon_id = p_salon_id AND a.type = 'extra_languages'), 0),
      8
    )
    WHEN p_dim = 'employees' THEN COALESCE(
      (SELECT a.qty FROM public.addons a WHERE a.salon_id = p_salon_id AND a.type = 'extra_staff'),
      0
    )
    ELSE COALESCE(
      (SELECT a.qty FROM public.addons a WHERE a.salon_id = p_salon_id AND a.type = 'extra_languages'),
      0
    )
  END;
$$;

COMMENT ON FUNCTION public.salon_capped_addon_quantity(uuid, text, text) IS
  'Paid addon units from addons table only (Stripe mirror). Pending targets do not increase capacity.';
