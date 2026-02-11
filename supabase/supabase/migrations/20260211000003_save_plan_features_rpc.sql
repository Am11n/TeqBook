-- =====================================================
-- RPC: save_plan_features
-- =====================================================
-- Atomic batch save for the plan features matrix editor.
-- Accepts upserts and deletes, runs in a single transaction,
-- performs a concurrency check, and writes an audit log entry.
-- =====================================================

CREATE OR REPLACE FUNCTION save_plan_features(
  p_upserts JSONB DEFAULT '[]'::JSONB,
  p_deletes JSONB DEFAULT '[]'::JSONB,
  p_snapshot_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_latest TIMESTAMPTZ;
  v_upsert JSONB;
  v_delete JSONB;
  v_upsert_count INT := 0;
  v_delete_count INT := 0;
  v_caller UUID;
BEGIN
  -- 1. Auth check: only superadmins
  v_caller := auth.uid();
  IF v_caller IS NULL OR NOT EXISTS (
    SELECT 1 FROM profiles WHERE user_id = v_caller AND is_superadmin = true
  ) THEN
    RAISE EXCEPTION 'Only superadmins can call this function'
      USING ERRCODE = 'P0001';
  END IF;

  -- 2. Concurrency check
  IF p_snapshot_at IS NOT NULL THEN
    SELECT MAX(created_at) INTO v_latest FROM plan_features;
    IF v_latest IS NOT NULL AND v_latest > p_snapshot_at THEN
      RAISE EXCEPTION 'CONFLICT: plan_features were modified after your snapshot (% > %). Please reload.',
        v_latest, p_snapshot_at
        USING ERRCODE = 'P0002';
    END IF;
  END IF;

  -- 3. Process deletes
  -- Each element: { "plan_type": "starter", "feature_id": "uuid" }
  FOR v_delete IN SELECT * FROM jsonb_array_elements(p_deletes)
  LOOP
    DELETE FROM plan_features
    WHERE plan_type = (v_delete->>'plan_type')::plan_type
      AND feature_id = (v_delete->>'feature_id')::UUID;
    v_delete_count := v_delete_count + 1;
  END LOOP;

  -- 4. Process upserts (insert or update limit_value)
  -- Each element: { "plan_type": "pro", "feature_id": "uuid", "limit_value": 5 }
  FOR v_upsert IN SELECT * FROM jsonb_array_elements(p_upserts)
  LOOP
    INSERT INTO plan_features (plan_type, feature_id, limit_value)
    VALUES (
      (v_upsert->>'plan_type')::plan_type,
      (v_upsert->>'feature_id')::UUID,
      CASE WHEN v_upsert->>'limit_value' IS NULL THEN NULL
           ELSE (v_upsert->>'limit_value')::NUMERIC END
    )
    ON CONFLICT (plan_type, feature_id)
    DO UPDATE SET limit_value = CASE
      WHEN v_upsert->>'limit_value' IS NULL THEN NULL
      ELSE (v_upsert->>'limit_value')::NUMERIC
    END;
    v_upsert_count := v_upsert_count + 1;
  END LOOP;

  -- 5. Audit log
  INSERT INTO security_audit_log (user_id, action, resource_type, metadata)
  VALUES (
    v_caller,
    'plan_features_updated',
    'plan_features',
    jsonb_build_object(
      'upserts', v_upsert_count,
      'deletes', v_delete_count,
      'snapshot_at', p_snapshot_at
    )
  );

  -- 6. Return summary
  RETURN jsonb_build_object(
    'success', true,
    'upserts', v_upsert_count,
    'deletes', v_delete_count
  );
END;
$$;

COMMENT ON FUNCTION save_plan_features IS
  'Atomic batch save for plan features matrix. Accepts upserts/deletes, checks concurrency, writes audit log.';
