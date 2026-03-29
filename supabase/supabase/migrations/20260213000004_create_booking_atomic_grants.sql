-- Grants + comments after generate_availability (00002) and create_booking_atomic buffers (00003).
-- Single DO block for Supabase CLI remote push (one protocol statement).

DO $grants1304$
BEGIN
  EXECUTE 'GRANT EXECUTE ON FUNCTION generate_availability(UUID, UUID, UUID, DATE) TO authenticated';
  EXECUTE 'GRANT EXECUTE ON FUNCTION generate_availability(UUID, UUID, UUID, DATE) TO anon';
  EXECUTE $cg$COMMENT ON FUNCTION generate_availability(UUID, UUID, UUID, DATE) IS 'Generates available time slots. Buffer-aware (prep/cleanup). Checks time_blocks, breaks (salon+employee), closures. Timezone-aware.'$cg$;
  EXECUTE 'GRANT EXECUTE ON FUNCTION create_booking_atomic(UUID, UUID, UUID, TIMESTAMPTZ, TEXT, TEXT, TEXT, TEXT, BOOLEAN) TO authenticated';
  EXECUTE $cb$COMMENT ON FUNCTION create_booking_atomic(UUID, UUID, UUID, TIMESTAMPTZ, TEXT, TEXT, TEXT, TEXT, BOOLEAN) IS 'Creates a booking atomically with buffer-aware overlap checking. Checks time_blocks. Uses SELECT ... FOR UPDATE.'$cb$;
END
$grants1304$;
