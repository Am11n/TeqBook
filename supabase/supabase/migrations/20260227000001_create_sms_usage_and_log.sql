-- =====================================================
-- SMS usage + log foundation
-- =====================================================
-- Goals:
-- - Track SMS usage per salon and Stripe billing period
-- - Enforce idempotent usage increments and pending log creation
-- - Enable provider status callbacks (sent/delivered/failed)
-- =====================================================

CREATE TABLE IF NOT EXISTS sms_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  included_quota INTEGER NOT NULL DEFAULT 0 CHECK (included_quota >= 0),
  hard_cap INTEGER CHECK (hard_cap IS NULL OR hard_cap >= 0),
  used_count INTEGER NOT NULL DEFAULT 0 CHECK (used_count >= 0),
  overage_count INTEGER NOT NULL DEFAULT 0 CHECK (overage_count >= 0),
  overage_cost_estimate NUMERIC(12, 4) NOT NULL DEFAULT 0 CHECK (overage_cost_estimate >= 0),
  hard_cap_reached BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT sms_usage_period_unique UNIQUE (salon_id, period_start, period_end),
  CONSTRAINT sms_usage_period_valid CHECK (period_end > period_start),
  CONSTRAINT sms_usage_count_consistency CHECK (used_count >= overage_count)
);

CREATE INDEX IF NOT EXISTS idx_sms_usage_salon_id ON sms_usage (salon_id);
CREATE INDEX IF NOT EXISTS idx_sms_usage_period_window ON sms_usage (period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_sms_usage_salon_period_lookup ON sms_usage (salon_id, period_start, period_end);

COMMENT ON TABLE sms_usage IS
  'SMS usage counters per salon and Stripe billing period.';
COMMENT ON COLUMN sms_usage.included_quota IS
  'Included SMS units locked for the billing period at first usage row creation.';
COMMENT ON COLUMN sms_usage.hard_cap IS
  'Plan cap for the period. NULL means no plan hard cap, but abuse/rate guards can still block sends.';

CREATE TABLE IF NOT EXISTS sms_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  waitlist_id UUID REFERENCES public.waitlist_entries(id) ON DELETE SET NULL,
  recipient_phone TEXT NOT NULL,
  sms_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'failed', 'blocked', 'delivered', 'undelivered')),
  provider_name TEXT,
  provider_message_id TEXT,
  idempotency_key UUID NOT NULL,
  plan_at_send plan_type,
  effective_unit_price_at_send NUMERIC(12, 4) NOT NULL DEFAULT 0 CHECK (effective_unit_price_at_send >= 0),
  cost_estimate NUMERIC(12, 4) NOT NULL DEFAULT 0 CHECK (cost_estimate >= 0),
  cost_actual NUMERIC(12, 4) CHECK (cost_actual IS NULL OR cost_actual >= 0),
  cost_source TEXT NOT NULL DEFAULT 'estimate' CHECK (cost_source IN ('estimate', 'provider')),
  currency TEXT NOT NULL DEFAULT 'NOK',
  metadata JSONB,
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT sms_log_salon_idempotency_unique UNIQUE (salon_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_sms_log_salon_created_at ON sms_log (salon_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sms_log_status ON sms_log (status);
CREATE INDEX IF NOT EXISTS idx_sms_log_provider_message_id ON sms_log (provider_message_id) WHERE provider_message_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sms_log_booking_id ON sms_log (booking_id) WHERE booking_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sms_log_waitlist_id ON sms_log (waitlist_id) WHERE waitlist_id IS NOT NULL;

COMMENT ON TABLE sms_log IS
  'SMS message log. Append-only for content fields; status fields may be updated by trusted service-role callbacks.';
COMMENT ON COLUMN sms_log.recipient_phone IS
  'Normalized E.164 phone number used for provider delivery.';
COMMENT ON COLUMN sms_log.idempotency_key IS
  'Request idempotency key unique per salon for deterministic retries.';
COMMENT ON COLUMN sms_log.status IS
  'Lifecycle: pending -> sent/failed/blocked -> delivered/undelivered.';

CREATE OR REPLACE FUNCTION update_sms_usage_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_sms_usage_updated_at ON sms_usage;
CREATE TRIGGER trigger_update_sms_usage_updated_at
  BEFORE UPDATE ON sms_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_sms_usage_updated_at();

ALTER TABLE sms_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sms_usage for their salon"
  ON sms_usage FOR SELECT
  USING (
    salon_id IN (
      SELECT salon_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage sms_usage"
  ON sms_usage FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Users can view sms_log for their salon"
  ON sms_log FOR SELECT
  USING (
    salon_id IN (
      SELECT salon_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage sms_log"
  ON sms_log FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION ensure_sms_usage_row_for_period(
  p_salon_id UUID,
  p_period_start TIMESTAMPTZ,
  p_period_end TIMESTAMPTZ,
  p_included_quota INTEGER,
  p_hard_cap INTEGER DEFAULT NULL
)
RETURNS sms_usage
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row sms_usage%ROWTYPE;
BEGIN
  IF p_salon_id IS NULL THEN
    RAISE EXCEPTION 'p_salon_id is required' USING ERRCODE = 'P0001';
  END IF;

  IF p_period_start IS NULL OR p_period_end IS NULL OR p_period_end <= p_period_start THEN
    RAISE EXCEPTION 'Invalid period window' USING ERRCODE = 'P0001';
  END IF;

  IF p_included_quota < 0 THEN
    RAISE EXCEPTION 'p_included_quota must be >= 0' USING ERRCODE = 'P0001';
  END IF;

  IF p_hard_cap IS NOT NULL AND p_hard_cap < 0 THEN
    RAISE EXCEPTION 'p_hard_cap must be >= 0 when provided' USING ERRCODE = 'P0001';
  END IF;

  IF auth.role() <> 'service_role' THEN
    IF auth.uid() IS NULL THEN
      RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'P0001';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE user_id = auth.uid()
        AND salon_id = p_salon_id
    ) THEN
      RAISE EXCEPTION 'Access denied for salon %', p_salon_id USING ERRCODE = 'P0001';
    END IF;
  END IF;

  INSERT INTO sms_usage (
    salon_id,
    period_start,
    period_end,
    included_quota,
    hard_cap
  )
  VALUES (
    p_salon_id,
    p_period_start,
    p_period_end,
    p_included_quota,
    p_hard_cap
  )
  ON CONFLICT (salon_id, period_start, period_end) DO NOTHING;

  SELECT *
  INTO v_row
  FROM sms_usage
  WHERE salon_id = p_salon_id
    AND period_start = p_period_start
    AND period_end = p_period_end;

  RETURN v_row;
END;
$$;

COMMENT ON FUNCTION ensure_sms_usage_row_for_period(UUID, TIMESTAMPTZ, TIMESTAMPTZ, INTEGER, INTEGER) IS
  'Creates usage row for billing period if missing. Locks included_quota/hard_cap for the period.';

CREATE OR REPLACE FUNCTION increment_sms_usage_and_log(
  p_salon_id UUID,
  p_period_start TIMESTAMPTZ,
  p_period_end TIMESTAMPTZ,
  p_idempotency_key UUID,
  p_recipient_phone TEXT,
  p_sms_type TEXT,
  p_included_quota INTEGER,
  p_hard_cap INTEGER DEFAULT NULL,
  p_effective_unit_price_at_send NUMERIC DEFAULT 0,
  p_plan_at_send plan_type DEFAULT NULL,
  p_booking_id UUID DEFAULT NULL,
  p_waitlist_id UUID DEFAULT NULL,
  p_currency TEXT DEFAULT 'NOK',
  p_metadata JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_usage sms_usage%ROWTYPE;
  v_existing_log sms_log%ROWTYPE;
  v_new_used_count INTEGER;
  v_new_overage_count INTEGER;
  v_overage_cost_delta NUMERIC(12, 4);
  v_blocked BOOLEAN := false;
BEGIN
  IF p_salon_id IS NULL THEN
    RAISE EXCEPTION 'p_salon_id is required' USING ERRCODE = 'P0001';
  END IF;

  IF p_idempotency_key IS NULL THEN
    RAISE EXCEPTION 'p_idempotency_key is required' USING ERRCODE = 'P0001';
  END IF;

  IF COALESCE(TRIM(p_recipient_phone), '') = '' THEN
    RAISE EXCEPTION 'p_recipient_phone is required' USING ERRCODE = 'P0001';
  END IF;

  IF COALESCE(TRIM(p_sms_type), '') = '' THEN
    RAISE EXCEPTION 'p_sms_type is required' USING ERRCODE = 'P0001';
  END IF;

  IF p_period_start IS NULL OR p_period_end IS NULL OR p_period_end <= p_period_start THEN
    RAISE EXCEPTION 'Invalid period window' USING ERRCODE = 'P0001';
  END IF;

  IF p_included_quota < 0 THEN
    RAISE EXCEPTION 'p_included_quota must be >= 0' USING ERRCODE = 'P0001';
  END IF;

  IF p_hard_cap IS NOT NULL AND p_hard_cap < 0 THEN
    RAISE EXCEPTION 'p_hard_cap must be >= 0 when provided' USING ERRCODE = 'P0001';
  END IF;

  IF p_effective_unit_price_at_send < 0 THEN
    RAISE EXCEPTION 'p_effective_unit_price_at_send must be >= 0' USING ERRCODE = 'P0001';
  END IF;

  IF auth.role() <> 'service_role' THEN
    IF auth.uid() IS NULL THEN
      RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'P0001';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE user_id = auth.uid()
        AND salon_id = p_salon_id
    ) THEN
      RAISE EXCEPTION 'Access denied for salon %', p_salon_id USING ERRCODE = 'P0001';
    END IF;
  END IF;

  SELECT *
  INTO v_existing_log
  FROM sms_log
  WHERE salon_id = p_salon_id
    AND idempotency_key = p_idempotency_key;

  IF FOUND THEN
    SELECT *
    INTO v_usage
    FROM sms_usage
    WHERE salon_id = p_salon_id
      AND period_start = p_period_start
      AND period_end = p_period_end;

    RETURN jsonb_build_object(
      'allowed', v_existing_log.status <> 'blocked',
      'idempotent_replay', true,
      'log_id', v_existing_log.id,
      'status', v_existing_log.status,
      'provider_message_id', v_existing_log.provider_message_id,
      'used_count', COALESCE(v_usage.used_count, 0),
      'overage_count', COALESCE(v_usage.overage_count, 0),
      'hard_cap_reached', COALESCE(v_usage.hard_cap_reached, false)
    );
  END IF;

  PERFORM ensure_sms_usage_row_for_period(
    p_salon_id,
    p_period_start,
    p_period_end,
    p_included_quota,
    p_hard_cap
  );

  SELECT *
  INTO v_usage
  FROM sms_usage
  WHERE salon_id = p_salon_id
    AND period_start = p_period_start
    AND period_end = p_period_end
  FOR UPDATE;

  IF v_usage.hard_cap IS NOT NULL AND v_usage.used_count >= v_usage.hard_cap THEN
    v_blocked := true;
  END IF;

  IF v_blocked THEN
    INSERT INTO sms_log (
      salon_id,
      booking_id,
      waitlist_id,
      recipient_phone,
      sms_type,
      status,
      idempotency_key,
      plan_at_send,
      effective_unit_price_at_send,
      cost_estimate,
      cost_source,
      currency,
      metadata,
      error_message
    ) VALUES (
      p_salon_id,
      p_booking_id,
      p_waitlist_id,
      p_recipient_phone,
      p_sms_type,
      'blocked',
      p_idempotency_key,
      p_plan_at_send,
      p_effective_unit_price_at_send,
      0,
      'estimate',
      p_currency,
      p_metadata,
      'Hard cap reached for billing period'
    )
    RETURNING * INTO v_existing_log;

    UPDATE sms_usage
    SET hard_cap_reached = true
    WHERE id = v_usage.id;

    RETURN jsonb_build_object(
      'allowed', false,
      'idempotent_replay', false,
      'log_id', v_existing_log.id,
      'status', v_existing_log.status,
      'provider_message_id', NULL,
      'used_count', v_usage.used_count,
      'overage_count', v_usage.overage_count,
      'hard_cap_reached', true
    );
  END IF;

  v_new_used_count := v_usage.used_count + 1;
  v_new_overage_count := GREATEST(v_new_used_count - v_usage.included_quota, 0);
  v_overage_cost_delta := GREATEST(v_new_overage_count - v_usage.overage_count, 0) * p_effective_unit_price_at_send;

  INSERT INTO sms_log (
    salon_id,
    booking_id,
    waitlist_id,
    recipient_phone,
    sms_type,
    status,
    idempotency_key,
    plan_at_send,
    effective_unit_price_at_send,
    cost_estimate,
    cost_source,
    currency,
    metadata
  ) VALUES (
    p_salon_id,
    p_booking_id,
    p_waitlist_id,
    p_recipient_phone,
    p_sms_type,
    'pending',
    p_idempotency_key,
    p_plan_at_send,
    p_effective_unit_price_at_send,
    p_effective_unit_price_at_send,
    'estimate',
    p_currency,
    p_metadata
  )
  RETURNING * INTO v_existing_log;

  UPDATE sms_usage
  SET
    used_count = v_new_used_count,
    overage_count = v_new_overage_count,
    overage_cost_estimate = overage_cost_estimate + v_overage_cost_delta,
    hard_cap_reached = CASE
      WHEN hard_cap IS NULL THEN false
      WHEN v_new_used_count >= hard_cap THEN true
      ELSE false
    END
  WHERE id = v_usage.id
  RETURNING * INTO v_usage;

  RETURN jsonb_build_object(
    'allowed', true,
    'idempotent_replay', false,
    'log_id', v_existing_log.id,
    'status', v_existing_log.status,
    'provider_message_id', v_existing_log.provider_message_id,
    'used_count', v_usage.used_count,
    'overage_count', v_usage.overage_count,
    'hard_cap_reached', v_usage.hard_cap_reached
  );
END;
$$;

COMMENT ON FUNCTION increment_sms_usage_and_log(
  UUID, TIMESTAMPTZ, TIMESTAMPTZ, UUID, TEXT, TEXT, INTEGER, INTEGER, NUMERIC, plan_type, UUID, UUID, TEXT, JSONB
) IS
  'Atomically enforces quota/hard cap, writes pending/blocked sms_log, increments usage, and supports deterministic idempotent retries.';

GRANT EXECUTE ON FUNCTION ensure_sms_usage_row_for_period(UUID, TIMESTAMPTZ, TIMESTAMPTZ, INTEGER, INTEGER) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION increment_sms_usage_and_log(UUID, TIMESTAMPTZ, TIMESTAMPTZ, UUID, TEXT, TEXT, INTEGER, INTEGER, NUMERIC, plan_type, UUID, UUID, TEXT, JSONB) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION cleanup_old_sms_log(retention_days INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM sms_log
  WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_old_sms_log(INTEGER) IS
  'Deletes sms_log rows older than retention_days. Intended for scheduled cleanup.';
