// =====================================================
// Booking Confirmation Email Template
// =====================================================
// Email template for booking confirmations with i18n support

import { translations } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import type { AppLocale } from "@/i18n/translations";
import type { Booking } from "@/lib/types/domain";
import { format } from "date-fns";
import { formatDateTimeInTimezone } from "@/lib/utils/timezone";

export interface BookingConfirmationTemplateProps {
  booking: Booking & {
    customer_full_name: string;
    service?: { name: string | null } | null;
    employee?: { name: string | null } | null;
    salon?: { name: string | null } | null;
  };
  language: string;
  timezone?: string | null; // IANA timezone identifier
}

// Helper to get translations
function getTranslations(locale: AppLocale) {
  // Email-specific translations (fallback to English if not available)
  const emailTranslations: Partial<Record<AppLocale, {
    subject: string;
    greeting: string;
    confirmed: string;
    details: string;
    service: string;
    employee: string;
    date: string;
    time: string;
    salon: string;
    notes: string;
    footer: string;
  }>> = {
    en: {
      subject: "Booking Confirmation - {{salonName}}",
      greeting: "Hello {{customerName}},",
      confirmed: "Your booking has been confirmed!",
      details: "Booking Details:",
      service: "Service",
      employee: "Employee",
      date: "Date",
      time: "Time",
      salon: "Salon",
      notes: "Notes",
      footer: "We look forward to seeing you!",
    },
    nb: {
      subject: "Bekreftelse av time - {{salonName}}",
      greeting: "Hei {{customerName}},",
      confirmed: "Din time er bekreftet!",
      details: "Timeinformasjon:",
      service: "Behandling",
      employee: "Ansatt",
      date: "Dato",
      time: "Tid",
      salon: "Salong",
      notes: "Notater",
      footer: "Vi gleder oss til å se deg!",
    },
    ar: {
      subject: "تأكيد الحجز - {{salonName}}",
      greeting: "مرحباً {{customerName}}،",
      confirmed: "تم تأكيد حجزك!",
      details: "تفاصيل الحجز:",
      service: "الخدمة",
      employee: "الموظف",
      date: "التاريخ",
      time: "الوقت",
      salon: "الصالون",
      notes: "ملاحظات",
      footer: "نتطلع لرؤيتك!",
    },
    so: {
      subject: "Xaqiijinta buugista - {{salonName}}",
      greeting: "Salaan {{customerName}},",
      confirmed: "Buugistaada ayaa la xaqiijiyay!",
      details: "Faahfaahinta buugista:",
      service: "Adeegga",
      employee: "Shaqaalaha",
      date: "Taariikhda",
      time: "Waqtiga",
      salon: "Saloonka",
      notes: "Xusuusin",
      footer: "Waxaan ku sugaynaa inaan ku aragno!",
    },
    ti: {
      subject: "ምርግጋጽ ዕዳጋ - {{salonName}}",
      greeting: "ሰላም {{customerName}},",
      confirmed: "ዕዳጋኻ ተረጋጊጹ ኣሎ!",
      details: "ዝርዝር ዕዳጋ:",
      service: "ኣገልግሎት",
      employee: "ሰራሕተኛ",
      date: "ዕለት",
      time: "ሰዓት",
      salon: "ሰሎን",
      notes: "ማስታወሻታት",
      footer: "ንምርኣይኩም ንጽበ!",
    },
    am: {
      subject: "የቦታ ማስፈንጠር ማረጋገጥ - {{salonName}}",
      greeting: "ሰላም {{customerName}},",
      confirmed: "የቦታ ማስፈንጠርዎ ተረጋግጧል!",
      details: "የቦታ ማስፈንጠር ዝርዝሮች:",
      service: "አገልግሎት",
      employee: "ሰራተኛ",
      date: "ቀን",
      time: "ሰዓት",
      salon: "ሰሎን",
      notes: "ማስታወሻዎች",
      footer: "እንድናያችሁ እንጠባበቃለን!",
    },
  } as Record<string, {
    subject: string;
    greeting: string;
    confirmed: string;
    details: string;
    service: string;
    employee: string;
    date: string;
    time: string;
    salon: string;
    notes: string;
    footer: string;
  }>;

  // Default to English for unsupported locales
  return emailTranslations[locale] || emailTranslations.en || emailTranslations["en"]!;
}

export function renderBookingConfirmationTemplate(
  props: BookingConfirmationTemplateProps
): { html: string; text: string; subject: string } {
  const locale = normalizeLocale(props.language) as AppLocale;
  const t = getTranslations(locale);

  const booking = props.booking;
  const salonName = booking.salon?.name || "Salon";
  const customerName = booking.customer_full_name;
  const serviceName = booking.service?.name || "Service";
  const employeeName = booking.employee?.name || "Employee";
  
  // Use salon timezone if provided, otherwise use UTC
  const timezone = props.timezone || "UTC";
  
  // Format date and time in salon timezone
  const startDateTime = formatDateTimeInTimezone(booking.start_time, timezone, locale === "nb" ? "nb-NO" : "en-US");
  const endTime = formatDateTimeInTimezone(booking.end_time, timezone, locale === "nb" ? "nb-NO" : "en-US");
  
  // Format date string (full date with weekday)
  const startDate = new Date(booking.start_time);
  const dateStr = new Intl.DateTimeFormat(locale === "nb" ? "nb-NO" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: timezone,
  }).format(startDate);
  
  const timeStr = `${startDateTime.time} - ${endTime.time}`;

  const subject = t.subject.replace("{{salonName}}", salonName);
  const greeting = t.greeting.replace("{{customerName}}", customerName);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px;">
    <h1 style="color: #2563eb; margin-top: 0;">${t.confirmed}</h1>
    <p>${greeting}</p>
    <p>${t.confirmed}</p>
    
    <div style="background-color: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
      <h2 style="margin-top: 0; color: #1f2937;">${t.details}</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; width: 120px;">${t.service}:</td>
          <td style="padding: 8px 0;">${serviceName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">${t.employee}:</td>
          <td style="padding: 8px 0;">${employeeName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">${t.date}:</td>
          <td style="padding: 8px 0;">${dateStr}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">${t.time}:</td>
          <td style="padding: 8px 0;">${timeStr}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">${t.salon}:</td>
          <td style="padding: 8px 0;">${salonName}</td>
        </tr>
        ${booking.notes ? `
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">${t.notes}:</td>
          <td style="padding: 8px 0;">${booking.notes}</td>
        </tr>
        ` : ""}
      </table>
    </div>
    
    <p style="margin-top: 30px;">${t.footer}</p>
    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
      ${salonName}
    </p>
  </div>
</body>
</html>
  `.trim();

  const text = `
${t.confirmed}

${greeting}

${t.confirmed}

${t.details}:
${t.service}: ${serviceName}
${t.employee}: ${employeeName}
${t.date}: ${dateStr}
${t.time}: ${timeStr}
${t.salon}: ${salonName}
${booking.notes ? `${t.notes}: ${booking.notes}` : ""}

${t.footer}

${salonName}
  `.trim();

  return { html, text, subject };
}

