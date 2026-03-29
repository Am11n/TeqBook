DO $update_booking_atomic_grants$
BEGIN
  EXECUTE 'REVOKE ALL ON FUNCTION update_booking_atomic(UUID, UUID, TIMESTAMPTZ, TIMESTAMPTZ, UUID, TEXT, TEXT) FROM PUBLIC';
  EXECUTE 'GRANT EXECUTE ON FUNCTION update_booking_atomic(UUID, UUID, TIMESTAMPTZ, TIMESTAMPTZ, UUID, TEXT, TEXT) TO authenticated';
  EXECUTE 'GRANT EXECUTE ON FUNCTION update_booking_atomic(UUID, UUID, TIMESTAMPTZ, TIMESTAMPTZ, UUID, TEXT, TEXT) TO service_role';
  EXECUTE $c$
    COMMENT ON FUNCTION update_booking_atomic(UUID, UUID, TIMESTAMPTZ, TIMESTAMPTZ, UUID, TEXT, TEXT) IS
      'Atomically updates booking schedule/employee/state with conflict checks to prevent race-condition double booking.'
  $c$;
END;
$update_booking_atomic_grants$;
