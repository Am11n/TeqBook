-- =====================================================
-- SMS log provider status update RPC
-- =====================================================
-- Purpose:
-- - Allow server-side app code to update sms_log status/provider fields
--   without granting broad UPDATE rights on sms_log.
-- - Keep table policy strict while enabling controlled writes.
-- =====================================================

CREATE OR REPLACE FUNCTION update_sms_log_provider_result(
  p_log_id UUID,
  p_status TEXT,
  p_provider_name TEXT DEFAULT NULL,
  p_provider_message_id TEXT DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL,
  p_sent_at TIMESTAMPTZ DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS sms_log
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row sms_log%ROWTYPE;
BEGIN
  IF p_log_id IS NULL THEN
    RAISE EXCEPTION 'p_log_id is required' USING ERRCODE = 'P0001';
  END IF;

  IF p_status IS NULL OR p_status NOT IN ('sent', 'failed', 'delivered', 'undelivered', 'pending', 'blocked') THEN
    RAISE EXCEPTION 'Invalid p_status: %', p_status USING ERRCODE = 'P0001';
  END IF;

  SELECT *
  INTO v_row
  FROM sms_log
  WHERE id = p_log_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'sms_log row not found: %', p_log_id USING ERRCODE = 'P0001';
  END IF;

  -- Access guard: service role or salon member.
  IF COALESCE(auth.role(), '') <> 'service_role' THEN
    IF auth.uid() IS NULL THEN
      RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'P0001';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM profiles
      WHERE user_id = auth.uid()
        AND salon_id = v_row.salon_id
    ) THEN
      RAISE EXCEPTION 'Access denied for sms_log row %', p_log_id USING ERRCODE = 'P0001';
    END IF;
  END IF;

  UPDATE sms_log
  SET
    status = p_status,
    provider_name = COALESCE(p_provider_name, provider_name),
    provider_message_id = COALESCE(p_provider_message_id, provider_message_id),
    error_message = p_error_message,
    sent_at = COALESCE(p_sent_at, sent_at),
    metadata = COALESCE(metadata, '{}'::jsonb) || COALESCE(p_metadata, '{}'::jsonb)
  WHERE id = p_log_id
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

COMMENT ON FUNCTION update_sms_log_provider_result(UUID, TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ, JSONB) IS
  'Controlled update for sms_log provider/status fields. Allows service_role or salon members via SECURITY DEFINER.';

GRANT EXECUTE ON FUNCTION update_sms_log_provider_result(UUID, TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ, JSONB) TO authenticated, service_role;
