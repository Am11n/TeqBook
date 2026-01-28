// =====================================================
// Booking Reminder Email Template
// =====================================================
// Email template for booking reminders with i18n support

import { normalizeLocale } from "@/i18n/normalizeLocale";
import type { AppLocale } from "@/i18n/translations";
import type { Booking } from "@/lib/types/domain";
import { format } from "date-fns";
import { formatDateTimeInTimezone } from "@/lib/utils/timezone";

export interface BookingReminderTemplateProps {
  booking: Booking & {
    customer_full_name: string;
    service?: { name: string | null } | null;
    employee?: { name: string | null } | null;
    salon?: { name: string | null } | null;
  };
  reminderType: "24h" | "2h";
  language: string;
  timezone?: string | null; // IANA timezone identifier
}

// Helper to get translations
function getTranslations(locale: AppLocale, reminderType: "24h" | "2h") {
  const emailTranslations: Partial<Record<AppLocale, {
    subject24h: string;
    subject2h: string;
    greeting: string;
    reminder24h: string;
    reminder2h: string;
    details: string;
    service: string;
    employee: string;
    date: string;
    time: string;
    salon: string;
    footer: string;
  }>> = {
    en: {
      subject24h: "Reminder: Your appointment tomorrow at {{salonName}}",
      subject2h: "Reminder: Your appointment in 2 hours at {{salonName}}",
      greeting: "Hello {{customerName}},",
      reminder24h: "This is a friendly reminder that you have an appointment tomorrow.",
      reminder2h: "This is a friendly reminder that you have an appointment in 2 hours.",
      details: "Appointment Details:",
      service: "Service",
      employee: "Employee",
      date: "Date",
      time: "Time",
      salon: "Salon",
      footer: "We look forward to seeing you!",
    },
    nb: {
      subject24h: "Påminnelse: Din time i morgen hos {{salonName}}",
      subject2h: "Påminnelse: Din time om 2 timer hos {{salonName}}",
      greeting: "Hei {{customerName}},",
      reminder24h: "Dette er en vennlig påminnelse om at du har en time i morgen.",
      reminder2h: "Dette er en vennlig påminnelse om at du har en time om 2 timer.",
      details: "Timeinformasjon:",
      service: "Behandling",
      employee: "Ansatt",
      date: "Dato",
      time: "Tid",
      salon: "Salong",
      footer: "Vi gleder oss til å se deg!",
    },
    ar: {
      subject24h: "تذكير: موعدك غداً في {{salonName}}",
      subject2h: "تذكير: موعدك بعد ساعتين في {{salonName}}",
      greeting: "مرحباً {{customerName}}،",
      reminder24h: "هذا تذكير ودود بأن لديك موعداً غداً.",
      reminder2h: "هذا تذكير ودود بأن لديك موعداً بعد ساعتين.",
      details: "تفاصيل الموعد:",
      service: "الخدمة",
      employee: "الموظف",
      date: "التاريخ",
      time: "الوقت",
      salon: "الصالون",
      footer: "نتطلع لرؤيتك!",
    },
    so: {
      subject24h: "Xusuusin: Ballantaada berri {{salonName}}",
      subject2h: "Xusuusin: Ballantaada 2 saacadood ka dib {{salonName}}",
      greeting: "Salaan {{customerName}},",
      reminder24h: "Tani waa xusuusin jaceyl ah inaad berri ballan leedahay.",
      reminder2h: "Tani waa xusuusin jaceyl ah inaad 2 saacadood ka dib ballan leedahay.",
      details: "Faahfaahinta ballanta:",
      service: "Adeegga",
      employee: "Shaqaalaha",
      date: "Taariikhda",
      time: "Waqtiga",
      salon: "Saloonka",
      footer: "Waxaan ku sugaynaa inaan ku aragno!",
    },
    ti: {
      subject24h: "ዘኻይዱ: ዕዳጋኻ ጽባሕ ኣብ {{salonName}}",
      subject2h: "ዘኻይዱ: ዕዳጋኻ ኣብ 2 ሰዓታት ኣብ {{salonName}}",
      greeting: "ሰላም {{customerName}},",
      reminder24h: "እዚ ሰላም ዘኻይዱ እዩ ንጽባሕ ዕዳጋ ከም ዘሎካ.",
      reminder2h: "እዚ ሰላም ዘኻይዱ እዩ ኣብ 2 ሰዓታት ዕዳጋ ከም ዘሎካ.",
      details: "ዝርዝር ዕዳጋ:",
      service: "ኣገልግሎት",
      employee: "ሰራሕተኛ",
      date: "ዕለት",
      time: "ሰዓት",
      salon: "ሰሎን",
      footer: "ንምርኣይኩም ንጽበ!",
    },
    am: {
      subject24h: "አስታዋሽ: የእርስዎ ቀጠሮ ነገ በ {{salonName}}",
      subject2h: "አስታዋሽ: የእርስዎ ቀጠሮ በ 2 ሰዓታት በ {{salonName}}",
      greeting: "ሰላም {{customerName}},",
      reminder24h: "ይህ በጋራ አስታዋሽ ነው ነገ ቀጠሮ እንዳለዎት.",
      reminder2h: "ይህ በጋራ አስታዋሽ ነው በ 2 ሰዓታት ቀጠሮ እንዳለዎት.",
      details: "የቀጠሮ ዝርዝሮች:",
      service: "አገልግሎት",
      employee: "ሰራተኛ",
      date: "ቀን",
      time: "ሰዓት",
      salon: "ሰሎን",
      footer: "እንድናያችሁ እንጠባበቃለን!",
    },
  } as Record<string, {
    subject24h: string;
    subject2h: string;
    greeting: string;
    reminder24h: string;
    reminder2h: string;
    details: string;
    service: string;
    employee: string;
    date: string;
    time: string;
    salon: string;
    footer: string;
  }>;

  // Default to English for unsupported locales
  return emailTranslations[locale] || emailTranslations.en || emailTranslations["en"]!;
}

export function renderBookingReminderTemplate(
  props: BookingReminderTemplateProps
): { html: string; text: string; subject: string } {
  const locale = normalizeLocale(props.language) as AppLocale;
  const t = getTranslations(locale, props.reminderType);

  const booking = props.booking;
  const salonName = booking.salon?.name || "Salon";
  const customerName = booking.customer_full_name;
  const serviceName = booking.service?.name || "Service";
  const employeeName = booking.employee?.name || "Employee";
  
  // Use salon timezone if provided, otherwise use UTC
  const timezone = props.timezone || "UTC";
  
  // Format date and time in salon timezone
  const startDateTime = formatDateTimeInTimezone(booking.start_time, timezone, locale === "nb" ? "nb-NO" : "en-US");
  const endDateTime = formatDateTimeInTimezone(booking.end_time, timezone, locale === "nb" ? "nb-NO" : "en-US");
  
  // Format date string (full date with weekday)
  const startDate = new Date(booking.start_time);
  const dateStr = new Intl.DateTimeFormat(locale === "nb" ? "nb-NO" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: timezone,
  }).format(startDate);
  
  const timeStr = `${startDateTime.time} - ${endDateTime.time}`;

  const subject = props.reminderType === "24h" 
    ? t.subject24h.replace("{{salonName}}", salonName)
    : t.subject2h.replace("{{salonName}}", salonName);
  
  const greeting = t.greeting.replace("{{customerName}}", customerName);
  const reminderText = props.reminderType === "24h" ? t.reminder24h : t.reminder2h;

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
    <h1 style="color: #2563eb; margin-top: 0;">${subject}</h1>
    <p>${greeting}</p>
    <p>${reminderText}</p>
    
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
${subject}

${greeting}

${reminderText}

${t.details}:
${t.service}: ${serviceName}
${t.employee}: ${employeeName}
${t.date}: ${dateStr}
${t.time}: ${timeStr}
${t.salon}: ${salonName}

${t.footer}

${salonName}
  `.trim();

  return { html, text, subject };
}
