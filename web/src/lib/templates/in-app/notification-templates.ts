// =====================================================
// In-App Notification Templates
// =====================================================
// Template renderer for in-app notifications with i18n support

import { normalizeLocale } from "@/i18n/normalizeLocale";
import type { NotificationEventType } from "@/lib/types/notifications";
import { format } from "date-fns";

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
}

export interface RenderedTemplate {
  title: string;
  body: string;
}

// =====================================================
// Translations
// =====================================================

type TranslationSet = {
  [key in NotificationEventType]: {
    title: string;
    body: string;
  };
};

const translations: Record<string, TranslationSet> = {
  en: {
    booking_confirmed: {
      title: "Booking Confirmed",
      body: "Your appointment for {{serviceName}} on {{date}} at {{time}} has been confirmed.",
    },
    booking_changed: {
      title: "Booking Updated",
      body: "Your appointment for {{serviceName}} has been updated to {{date}} at {{time}}.",
    },
    booking_cancelled: {
      title: "Booking Cancelled",
      body: "Your appointment for {{serviceName}} on {{date}} has been cancelled.",
    },
    booking_reminder_24h: {
      title: "Appointment Tomorrow",
      body: "Reminder: You have an appointment for {{serviceName}} tomorrow at {{time}}.",
    },
    booking_reminder_2h: {
      title: "Appointment Soon",
      body: "Reminder: Your appointment for {{serviceName}} is in 2 hours at {{time}}.",
    },
    new_booking: {
      title: "New Booking",
      body: "{{customerName}} has booked {{serviceName}} for {{date}} at {{time}}.",
    },
  },
  nb: {
    booking_confirmed: {
      title: "Time bekreftet",
      body: "Din avtale for {{serviceName}} den {{date}} kl. {{time}} er bekreftet.",
    },
    booking_changed: {
      title: "Time endret",
      body: "Din avtale for {{serviceName}} er endret til {{date}} kl. {{time}}.",
    },
    booking_cancelled: {
      title: "Time kansellert",
      body: "Din avtale for {{serviceName}} den {{date}} er kansellert.",
    },
    booking_reminder_24h: {
      title: "Avtale i morgen",
      body: "Påminnelse: Du har en avtale for {{serviceName}} i morgen kl. {{time}}.",
    },
    booking_reminder_2h: {
      title: "Avtale snart",
      body: "Påminnelse: Din avtale for {{serviceName}} er om 2 timer kl. {{time}}.",
    },
    new_booking: {
      title: "Ny booking",
      body: "{{customerName}} har booket {{serviceName}} den {{date}} kl. {{time}}.",
    },
  },
  ar: {
    booking_confirmed: {
      title: "تم تأكيد الحجز",
      body: "تم تأكيد موعدك لـ {{serviceName}} في {{date}} الساعة {{time}}.",
    },
    booking_changed: {
      title: "تم تحديث الحجز",
      body: "تم تحديث موعدك لـ {{serviceName}} إلى {{date}} الساعة {{time}}.",
    },
    booking_cancelled: {
      title: "تم إلغاء الحجز",
      body: "تم إلغاء موعدك لـ {{serviceName}} في {{date}}.",
    },
    booking_reminder_24h: {
      title: "موعد غداً",
      body: "تذكير: لديك موعد لـ {{serviceName}} غداً الساعة {{time}}.",
    },
    booking_reminder_2h: {
      title: "موعد قريباً",
      body: "تذكير: موعدك لـ {{serviceName}} بعد ساعتين الساعة {{time}}.",
    },
    new_booking: {
      title: "حجز جديد",
      body: "{{customerName}} حجز {{serviceName}} في {{date}} الساعة {{time}}.",
    },
  },
  so: {
    booking_confirmed: {
      title: "Buugista ayaa la xaqiijiyay",
      body: "Ballantaada ee {{serviceName}} maalinta {{date}} saacada {{time}} ayaa la xaqiijiyay.",
    },
    booking_changed: {
      title: "Buugista ayaa la beddelay",
      body: "Ballantaada ee {{serviceName}} ayaa la beddelay {{date}} saacada {{time}}.",
    },
    booking_cancelled: {
      title: "Buugista ayaa la joojiyay",
      body: "Ballantaada ee {{serviceName}} maalinta {{date}} ayaa la joojiyay.",
    },
    booking_reminder_24h: {
      title: "Ballan berri",
      body: "Xusuusin: Waxaad leedahay ballan {{serviceName}} berri saacada {{time}}.",
    },
    booking_reminder_2h: {
      title: "Ballan dhow",
      body: "Xusuusin: Ballantaada {{serviceName}} ayaa 2 saacadood kadib saacada {{time}}.",
    },
    new_booking: {
      title: "Buugis cusub",
      body: "{{customerName}} wuxuu buugiyay {{serviceName}} maalinta {{date}} saacada {{time}}.",
    },
  },
  ti: {
    booking_confirmed: {
      title: "ዕዳጋ ተረጋጊጹ",
      body: "ቆጸራኻ ንኣገልግሎት {{serviceName}} ኣብ {{date}} ሰዓት {{time}} ተረጋጊጹ ኣሎ።",
    },
    booking_changed: {
      title: "ዕዳጋ ተቐይሩ",
      body: "ቆጸራኻ ንኣገልግሎት {{serviceName}} ናብ {{date}} ሰዓት {{time}} ተቐይሩ ኣሎ።",
    },
    booking_cancelled: {
      title: "ዕዳጋ ተሰሪዙ",
      body: "ቆጸራኻ ንኣገልግሎት {{serviceName}} ኣብ {{date}} ተሰሪዙ ኣሎ።",
    },
    booking_reminder_24h: {
      title: "ቆጸራ ጽባሕ",
      body: "መዘኻኸሪ: ጽባሕ ሰዓት {{time}} ንኣገልግሎት {{serviceName}} ቆጸራ ኣለካ።",
    },
    booking_reminder_2h: {
      title: "ቆጸራ ቀረባ",
      body: "መዘኻኸሪ: ቆጸራኻ ንኣገልግሎት {{serviceName}} ድሕሪ 2 ሰዓት ሰዓት {{time}} እዩ።",
    },
    new_booking: {
      title: "ሓድሽ ዕዳጋ",
      body: "{{customerName}} ኣብ {{date}} ሰዓት {{time}} ንኣገልግሎት {{serviceName}} ዓዲጉ ኣሎ።",
    },
  },
  am: {
    booking_confirmed: {
      title: "ቦታ ማስፈንጠር ተረጋግጧል",
      body: "የእርስዎ ቀጠሮ ለ {{serviceName}} በ {{date}} ሰዓት {{time}} ተረጋግጧል።",
    },
    booking_changed: {
      title: "ቦታ ማስፈንጠር ተቀይሯል",
      body: "የእርስዎ ቀጠሮ ለ {{serviceName}} ወደ {{date}} ሰዓት {{time}} ተቀይሯል።",
    },
    booking_cancelled: {
      title: "ቦታ ማስፈንጠር ተሰርዟል",
      body: "የእርስዎ ቀጠሮ ለ {{serviceName}} በ {{date}} ተሰርዟል።",
    },
    booking_reminder_24h: {
      title: "ቀጠሮ ነገ",
      body: "ማስታወሻ: ነገ ሰዓት {{time}} ለ {{serviceName}} ቀጠሮ አለዎት።",
    },
    booking_reminder_2h: {
      title: "ቀጠሮ በቅርቡ",
      body: "ማስታወሻ: ለ {{serviceName}} ቀጠሮዎ በ2 ሰዓት ውስጥ ሰዓት {{time}} ነው።",
    },
    new_booking: {
      title: "አዲስ ቦታ ማስፈንጠር",
      body: "{{customerName}} ለ {{serviceName}} በ {{date}} ሰዓት {{time}} ቦታ አስመዝግበዋል።",
    },
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
 * Format date and time from ISO string
 */
function formatDateTime(isoString: string, locale: string): { date: string; time: string } {
  const date = new Date(isoString);
  
  const dateStr = format(date, "EEEE, MMMM d", {
    locale: locale === "nb" ? require("date-fns/locale/nb") : undefined,
  });
  
  const timeStr = format(date, "HH:mm");
  
  return { date: dateStr, time: timeStr };
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
  const localeTranslations = translations[locale] || translations.en;
  const template = localeTranslations[eventType];

  if (!template) {
    // Fallback to English if event type not found
    const fallback = translations.en[eventType];
    return {
      title: fallback?.title || "Notification",
      body: fallback?.body || "You have a new notification.",
    };
  }

  // Build variables for interpolation
  const variables: Record<string, string> = {
    customerName: data.customerName || "Customer",
    serviceName: data.serviceName || "Service",
    employeeName: data.employeeName || "Staff",
    salonName: data.salonName || "Salon",
  };

  // Format date and time if provided
  if (data.startTime) {
    const { date, time } = formatDateTime(data.startTime, locale);
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
