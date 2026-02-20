export {
  getBookingsForCurrentSalon,
  getBookingsForCalendar,
  getAvailableSlots,
  getBookingById,
  getBookingByIdWithSalonVerification,
  createBooking,
  updateBookingStatus,
  updateBooking,
  deleteBooking,
  getBookingHistoryForCustomer,
  getBookingStatsForCustomer,
} from "./bookings/index";

export type {
  CustomerBookingHistoryItem,
  CustomerBookingStats,
  GetBookingHistoryOptions,
} from "./bookings/index";
