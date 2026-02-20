export type NotificationForm = {
  bookingConfirmation: boolean;
  bookingReminder: boolean;
  reminderTiming: string;
  cancellationNotice: boolean;
  newBooking: boolean;
  bookingChanges: boolean;
  bookingCancellations: boolean;
};

export const DEFAULT_VALUES: NotificationForm = {
  bookingConfirmation: true,
  bookingReminder: true,
  reminderTiming: "24h",
  cancellationNotice: true,
  newBooking: true,
  bookingChanges: true,
  bookingCancellations: true,
};

export const PREVIEW_TEMPLATES: Record<string, { subject: string; body: string }> = {
  bookingConfirmation: {
    subject: "Booking Confirmed",
    body: `Hi {customer_name},\n\nYour booking at {salon_name} has been confirmed!\n\nDate: {date}\nTime: {time}\nService: {service_name}\n\nWe look forward to seeing you.\n\n— {salon_name}`,
  },
  bookingReminder: {
    subject: "Booking Reminder",
    body: `Hi {customer_name},\n\nJust a friendly reminder about your upcoming appointment at {salon_name}.\n\nDate: {date}\nTime: {time}\nService: {service_name}\n\nSee you soon!\n\n— {salon_name}`,
  },
  cancellationNotice: {
    subject: "Booking Cancelled",
    body: `Hi {customer_name},\n\nYour booking at {salon_name} has been cancelled.\n\nDate: {date}\nTime: {time}\n\nIf this was a mistake, feel free to book again.\n\n— {salon_name}`,
  },
  newBooking: {
    subject: "New Booking Received",
    body: `A new booking has been made:\n\nCustomer: {customer_name}\nDate: {date}\nTime: {time}\nService: {service_name}\n\nView it in your dashboard.`,
  },
  bookingChanges: {
    subject: "Booking Modified",
    body: `A booking has been modified:\n\nCustomer: {customer_name}\nNew date: {date}\nNew time: {time}\nService: {service_name}`,
  },
  bookingCancellations: {
    subject: "Booking Cancelled",
    body: `A booking has been cancelled:\n\nCustomer: {customer_name}\nDate: {date}\nTime: {time}\nService: {service_name}`,
  },
};
