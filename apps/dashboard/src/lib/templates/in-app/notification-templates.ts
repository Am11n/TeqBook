// =====================================================
// In-App Notification Templates
// =====================================================
// Template renderer for in-app notifications with i18n support

import { normalizeLocale } from "@/i18n/normalizeLocale";
import type { NotificationEventType } from "@/lib/types/notifications";
import { formatDateTimeInTimezone } from "@/lib/utils/timezone";

// =====================================================
// Types
// =====================================================

export interface NotificationTemplateData {
  customerName?: string;
  serviceName?: string;
  employeeName?: string;
  salonName?: string;
  startTime?: string;
  endTime?: string;
  timezone?: string | null; // Salon timezone for formatting times
}

export interface RenderedTemplate {
  title: string;
  body: string;
}

import { translations } from "@/i18n/translations";

const EVENT_TO_NOTIFICATION_KEYS: Record<
  NotificationEventType,
  { title: keyof typeof translations.en.notifications; body: keyof typeof translations.en.notifications }
> = {
  booking_confirmed: {
    title: "bookingConfirmedTitle",
    body: "bookingConfirmedBody",
  },
  booking_changed: {
    title: "bookingChangedTitle",
    body: "bookingChangedBody",
  },
  booking_cancelled: {
    title: "bookingCancelledTitle",
    body: "bookingCancelledBody",
  },
  booking_reminder_24h: {
    title: "reminder24hTitle",
    body: "reminder24hBody",
  },
  booking_reminder_2h: {
    title: "reminder2hTitle",
    body: "reminder2hBody",
  },
  new_booking: {
    title: "newBookingTitle",
    body: "newBookingBody",
  },
};

// =====================================================
// Template Renderer
// =====================================================

/**
 * Interpolate variables in a template string
 */
function interpolate(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || `{{${key}}}`);
}

/**
 * Format date and time from ISO string in salon timezone
 */
function formatDateTime(isoString: string, locale: string, timezone?: string | null): { date: string; time: string } {
  const timezoneToUse = timezone || "UTC";
  const localeToUse = locale === "nb" ? "nb-NO" : "en-US";
  
  // Use timezone utility function
  const { date: dateStr, time: timeStr } = formatDateTimeInTimezone(isoString, timezoneToUse, localeToUse);
  
  // Format date with weekday and full month name
  const date = new Date(isoString);
  const formattedDate = new Intl.DateTimeFormat(localeToUse, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: timezoneToUse,
  }).format(date);
  
  return { date: formattedDate, time: timeStr };
}

/**
 * Render a notification template for a given event type
 */
export function renderNotificationTemplate(
  eventType: NotificationEventType,
  data: NotificationTemplateData,
  language: string = "en"
): RenderedTemplate {
  const locale = normalizeLocale(language);
  const localeMessages = translations[locale].notifications;
  const englishMessages = translations.en.notifications;
  const eventKeys = EVENT_TO_NOTIFICATION_KEYS[eventType];
  const template = {
    title: localeMessages[eventKeys.title] || englishMessages[eventKeys.title],
    body: localeMessages[eventKeys.body] || englishMessages[eventKeys.body],
  };

  // Build variables for interpolation
  const variables: Record<string, string> = {
    customerName: data.customerName || "Customer",
    serviceName: data.serviceName || "Service",
    employeeName: data.employeeName || "Staff",
    salonName: data.salonName || "Salon",
  };

  // Format date and time if provided
  if (data.startTime) {
    const { date, time } = formatDateTime(data.startTime, locale, data.timezone);
    variables.date = date;
    variables.time = time;
  }

  return {
    title: interpolate(template.title, variables),
    body: interpolate(template.body, variables),
  };
}

/**
 * Get all available notification event types
 */
export function getNotificationEventTypes(): NotificationEventType[] {
  return [
    "booking_confirmed",
    "booking_changed",
    "booking_cancelled",
    "booking_reminder_24h",
    "booking_reminder_2h",
    "new_booking",
  ];
}
