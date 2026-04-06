-- Reschedule proposals: customer must approve new time via token link (see RPC migration).

CREATE TABLE IF NOT EXISTS public.booking_reschedule_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE RESTRICT,
  proposed_start_time timestamptz NOT NULL,
  proposed_end_time timestamptz NOT NULL,
  previous_start_time timestamptz NOT NULL,
  previous_end_time timestamptz NOT NULL,
  token_hash text NOT NULL,
  token_expires_at timestamptz,
  status text NOT NULL DEFAULT 'notification_pending',
  delivery_attempts jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  response_channel text,
  CONSTRAINT booking_reschedule_proposals_status_check CHECK (
    status = ANY (ARRAY[
      'notification_pending',
      'pending',
      'accepted',
      'declined',
      'expired',
      'superseded',
      'failed_slot_taken',
      'notification_failed',
      'cancelled'
    ])
  ),
  CONSTRAINT booking_reschedule_proposals_response_channel_check CHECK (
    response_channel IS NULL OR response_channel = ANY (ARRAY['sms_link', 'email_link', 'system'])
  ),
  CONSTRAINT booking_reschedule_proposals_time_order CHECK (proposed_end_time > proposed_start_time)
);

CREATE UNIQUE INDEX IF NOT EXISTS booking_reschedule_proposals_token_hash_key
  ON public.booking_reschedule_proposals(token_hash);

CREATE UNIQUE INDEX IF NOT EXISTS booking_reschedule_one_pending_per_booking
  ON public.booking_reschedule_proposals(booking_id)
  WHERE status IN ('pending', 'notification_pending');

CREATE UNIQUE INDEX IF NOT EXISTS booking_reschedule_one_pending_slot_per_employee
  ON public.booking_reschedule_proposals(salon_id, employee_id, proposed_start_time)
  WHERE status IN ('pending', 'notification_pending');

CREATE INDEX IF NOT EXISTS booking_reschedule_proposals_pending_expiry
  ON public.booking_reschedule_proposals(status, token_expires_at)
  WHERE status = 'pending';

COMMENT ON TABLE public.booking_reschedule_proposals IS
  'Staff-proposed booking time changes pending customer approval via signed token link.';

-- Activity / audit trail for staff UI and bypass logging

CREATE TABLE IF NOT EXISTS public.booking_reschedule_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  proposal_id uuid REFERENCES public.booking_reschedule_proposals(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  actor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT booking_reschedule_activity_event_check CHECK (
    event_type = ANY (ARRAY[
      'proposal_created',
      'proposal_activated',
      'proposal_superseded',
      'delivery_recorded',
      'proposal_accepted',
      'proposal_declined',
      'proposal_expired',
      'proposal_failed_slot',
      'notification_failed',
      'direct_reschedule'
    ])
  )
);

CREATE INDEX IF NOT EXISTS booking_reschedule_activity_booking_id_idx
  ON public.booking_reschedule_activity(booking_id, created_at DESC);

ALTER TABLE public.booking_reschedule_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_reschedule_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY booking_reschedule_proposals_select_salon
  ON public.booking_reschedule_proposals
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_reschedule_proposals.booking_id
        AND b.salon_id = booking_reschedule_proposals.salon_id
        AND (
          EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.user_id = auth.uid() AND p.salon_id = b.salon_id
          )
          OR EXISTS (
            SELECT 1 FROM public.salon_ownerships so
            WHERE so.user_id = auth.uid() AND so.salon_id = b.salon_id
          )
        )
    )
  );

CREATE POLICY booking_reschedule_activity_select_salon
  ON public.booking_reschedule_activity
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_reschedule_activity.booking_id
        AND b.salon_id = booking_reschedule_activity.salon_id
        AND (
          EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.user_id = auth.uid() AND p.salon_id = b.salon_id
          )
          OR EXISTS (
            SELECT 1 FROM public.salon_ownerships so
            WHERE so.user_id = auth.uid() AND so.salon_id = b.salon_id
          )
        )
    )
  );
