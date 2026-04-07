-- PostgREST requires table-level GRANTs; RLS alone is not enough.
-- booking_reschedule_* had SELECT policies for authenticated but no GRANT → 403 from REST.

GRANT SELECT ON TABLE public.booking_reschedule_proposals TO authenticated;
GRANT SELECT ON TABLE public.booking_reschedule_activity TO authenticated;

GRANT ALL PRIVILEGES ON TABLE public.booking_reschedule_proposals TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.booking_reschedule_activity TO service_role;
