// Thin re-export wrapper — preserves the original public API
export {
  getGoogleAuthUrl,
  exchangeCodeForTokens,
  refreshAccessToken,
  getCalendars,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  bookingToCalendarEvent,
  generateBookingHash,
  mapToCalendarErrorCode,
  saveCalendarConnection,
  getCalendarConnection,
  updateCalendarSelection,
  disconnectCalendar,
  syncBookingToCalendar,
} from "./google-calendar/index";
