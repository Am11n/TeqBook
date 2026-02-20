// Thin re-export wrapper — preserves the original public API
export {
  getMicrosoftAuthUrl,
  exchangeCodeForTokens,
  refreshAccessToken,
  getUserInfo,
  getCalendars,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  bookingToOutlookEvent,
  generateBookingHash,
  mapToCalendarErrorCode,
  saveOutlookConnection,
  getOutlookConnection,
  disconnectOutlookCalendar,
  syncBookingToOutlook,
} from "./outlook-calendar/index";
