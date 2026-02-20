export {
  sendEmail,
  sendBookingConfirmation,
  sendBookingReminder,
  sendBookingCancellation,
  sendPaymentFailure,
  sendPaymentRetry,
  sendPaymentWarning,
} from "./email";

export type {
  EmailAttachment,
  SendEmailInput,
  SendBookingConfirmationInput,
  SendBookingReminderInput,
  SendBookingCancellationInput,
  SendPaymentFailureInput,
  SendPaymentRetryInput,
  SendPaymentWarningInput,
} from "./email";
