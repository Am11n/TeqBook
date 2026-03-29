DO $rpc_product_access_grants$
BEGIN
  EXECUTE 'GRANT EXECUTE ON FUNCTION public.generate_availability(UUID, UUID, UUID, DATE) TO authenticated';
  EXECUTE 'GRANT EXECUTE ON FUNCTION public.generate_availability(UUID, UUID, UUID, DATE) TO anon';
  EXECUTE 'GRANT EXECUTE ON FUNCTION public.find_first_available_slots_batch(UUID, UUID, UUID[], DATE, DATE, INTEGER) TO authenticated';
  EXECUTE 'GRANT EXECUTE ON FUNCTION public.find_first_available_slots_batch(UUID, UUID, UUID[], DATE, DATE, INTEGER) TO anon';
  EXECUTE 'GRANT EXECUTE ON FUNCTION public.get_schedule_segments(UUID, DATE, UUID[]) TO authenticated';
  EXECUTE 'GRANT EXECUTE ON FUNCTION public.get_schedule_segments(UUID, DATE, UUID[]) TO anon';
  EXECUTE 'GRANT EXECUTE ON FUNCTION public.create_booking_atomic(UUID, UUID, UUID, TIMESTAMPTZ, TEXT, TEXT, TEXT, TEXT, BOOLEAN) TO authenticated';
END;
$rpc_product_access_grants$;
