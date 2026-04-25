import type { AppLocale } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { renderNotificationTemplate } from "@/lib/templates/in-app/notification-templates";
import type { InAppNotification, NotificationEventType } from "@/lib/types/notifications";

const RENDERABLE_EVENTS: ReadonlySet<NotificationEventType> = new Set([
  "booking_confirmed",
  "booking_changed",
  "booking_cancelled",
  "booking_reminder_24h",
  "booking_reminder_2h",
  "new_booking",
]);

function coerceStartTime(meta: Record<string, unknown>): string | null {
  const v = meta.start_time;
  if (typeof v === "string" && v.length > 0) return v;
  return null;
}

/**
 * Re-renders booking-related in-app notifications using the current UI locale when
 * `metadata` contains `event_type`, `start_time`, and related fields (from RPC or
 * unified notification service). Otherwise returns the stored title/body.
 */
export function getLocalizedInAppNotificationCopy(
  notification: InAppNotification,
  locale: AppLocale,
): { title: string; body: string } {
  const raw = notification.metadata;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { title: notification.title, body: notification.body };
  }

  const meta = raw as Record<string, unknown>;
  const eventType = meta.event_type;
  if (typeof eventType !== "string" || !RENDERABLE_EVENTS.has(eventType as NotificationEventType)) {
    return { title: notification.title, body: notification.body };
  }

  const startTime = coerceStartTime(meta);
  if (!startTime) {
    return { title: notification.title, body: notification.body };
  }

  const appLocale = normalizeLocale(locale);

  const customerName = typeof meta.customer_name === "string" ? meta.customer_name : "";
  const serviceName =
    typeof meta.service_name === "string" && meta.service_name.length > 0
      ? meta.service_name
      : "Service";
  const employeeName =
    typeof meta.employee_name === "string" && meta.employee_name.length > 0
      ? meta.employee_name
      : "Staff";
  const salonName =
    typeof meta.salon_name === "string" && meta.salon_name.length > 0 ? meta.salon_name : "Salon";
  const timezone =
    typeof meta.timezone === "string" && meta.timezone.length > 0 ? meta.timezone : "UTC";

  return renderNotificationTemplate(
    eventType as NotificationEventType,
    {
      customerName: customerName || undefined,
      serviceName,
      employeeName,
      salonName,
      startTime,
      timezone,
    },
    appLocale,
  );
}
