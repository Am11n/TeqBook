export { sendEmail } from "./core";
export {
  sendBookingConfirmation,
  sendBookingReminder,
  sendBookingCancellation,
  sendRescheduleProposalRequest,
} from "./booking-emails";
export { sendPaymentFailure, sendPaymentRetry, sendPaymentWarning } from "./payment-emails";
export type {
  EmailAttachment,
  SendEmailInput,
  SendBookingConfirmationInput,
  SendBookingReminderInput,
  SendBookingCancellationInput,
  SendRescheduleProposalEmailInput,
  SendPaymentFailureInput,
  SendPaymentRetryInput,
  SendPaymentWarningInput,
} from "./types";
