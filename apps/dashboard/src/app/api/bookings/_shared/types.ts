export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type BookingDataPayload = {
  id: string;
  salon_id: string;
  start_time: string;
  end_time: string | null;
  status: string;
  is_walk_in: boolean;
  customer_full_name: string;
  service_name?: string;
  employee_name?: string;
};

export type SendNotificationsBody = {
  bookingId: string;
  customerEmail?: string;
  salonId?: string;
  language?: string;
  bookingData?: BookingDataPayload;
};

export type SendCancellationBody = {
  bookingId: string;
  customerEmail?: string;
  salonId?: string;
  language?: string;
  cancelledBy?: "customer" | "salon";
  cancellationReason?: string | null;
  bookingData?: BookingDataPayload;
};
