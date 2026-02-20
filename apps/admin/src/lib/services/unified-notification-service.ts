// Thin re-export wrapper — preserves the original public API
export {
  sendNotification,
  sendBookingNotification,
  sendReminderNotification,
  sendNewBookingNotification,
  shouldSendToChannel,
} from "./unified-notification/index";
