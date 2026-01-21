// =====================================================
// Booking Cancellation Email Template
// =====================================================
// Email template for booking cancellations with i18n support

import { normalizeLocale } from "@/i18n/normalizeLocale";
import type { AppLocale } from "@/i18n/translations";
import type { Booking } from "@/lib/types/domain";
import { format } from "date-fns";

export interface BookingCancellationTemplateProps {
  booking: Booking & {
    customer_full_name: string;
    service?: { name: string | null } | null;
    employee?: { name: string | null } | null;
    salon?: { name: string | null } | null;
  };
  language: string;
  cancellationReason?: string | null;
}

// Helper to get translations
function getTranslations(locale: AppLocale) {
  const emailTranslations: Partial<Record<AppLocale, {
    subject: string;
    greeting: string;
    cancelled: string;
    details: string;
    service: string;
    employee: string;
    date: string;
    time: string;
    salon: string;
    reason: string;
    footer: string;
    rebook: string;
  }>> = {
    en: {
      subject: "Booking Cancelled - {{salonName}}",
      greeting: "Hello {{customerName}},",
      cancelled: "Your booking has been cancelled.",
      details: "Cancelled Booking Details:",
      service: "Service",
      employee: "Employee",
      date: "Date",
      time: "Time",
      salon: "Salon",
      reason: "Reason",
      footer: "If you have any questions, please contact us.",
      rebook: "Would you like to rebook? Visit our booking page to schedule a new appointment.",
    },
    nb: {
      subject: "Time kansellert - {{salonName}}",
      greeting: "Hei {{customerName}},",
      cancelled: "Din time er kansellert.",
      details: "Kansellert timeinformasjon:",
      service: "Behandling",
      employee: "Ansatt",
      date: "Dato",
      time: "Tid",
      salon: "Salong",
      reason: "Grunn",
      footer: "Hvis du har spørsmål, ta gjerne kontakt med oss.",
      rebook: "Ønsker du å bestille ny time? Besøk vår bookingside for å booke en ny avtale.",
    },
    ar: {
      subject: "تم إلغاء الحجز - {{salonName}}",
      greeting: "مرحباً {{customerName}}،",
      cancelled: "تم إلغاء حجزك.",
      details: "تفاصيل الحجز الملغى:",
      service: "الخدمة",
      employee: "الموظف",
      date: "التاريخ",
      time: "الوقت",
      salon: "الصالون",
      reason: "السبب",
      footer: "إذا كان لديك أي أسئلة، يرجى التواصل معنا.",
      rebook: "هل ترغب في إعادة الحجز؟ قم بزيارة صفحة الحجز لدينا لتحديد موعد جديد.",
    },
    so: {
      subject: "Buugista waa la joojiyay - {{salonName}}",
      greeting: "Salaan {{customerName}},",
      cancelled: "Buugistaada ayaa la joojiyay.",
      details: "Faahfaahinta buugista la joojiyay:",
      service: "Adeegga",
      employee: "Shaqaalaha",
      date: "Taariikhda",
      time: "Waqtiga",
      salon: "Saloonka",
      reason: "Sababta",
      footer: "Haddii aad qabtid su'aalo, fadlan nala soo xiriir.",
      rebook: "Ma rabtaa inaad dib u codsato? Booqo bogga buugista si aad u ballanqaaddo ballan cusub.",
    },
    ti: {
      subject: "ዕዳጋ ተሰሪዙ - {{salonName}}",
      greeting: "ሰላም {{customerName}},",
      cancelled: "ዕዳጋኻ ተሰሪዙ ኣሎ።",
      details: "ዝተሰረዘ ዝርዝር ዕዳጋ:",
      service: "ኣገልግሎት",
      employee: "ሰራሕተኛ",
      date: "ዕለት",
      time: "ሰዓት",
      salon: "ሰሎን",
      reason: "ምኽንያት",
      footer: "ሕቶ እንተሃልዩኩም፡ በጃኹም ርኸቡና።",
      rebook: "ዳግማይ ክትእዝዙ ትደልዩ? ሓድሽ ቆጸራ ንምውሳን ገጽ ዕዳጋና ብጻሕ።",
    },
    am: {
      subject: "ቦታ ማስፈንጠር ተሰርዟል - {{salonName}}",
      greeting: "ሰላም {{customerName}},",
      cancelled: "የቦታ ማስፈንጠርዎ ተሰርዟል።",
      details: "የተሰረዘ ቦታ ማስፈንጠር ዝርዝሮች:",
      service: "አገልግሎት",
      employee: "ሰራተኛ",
      date: "ቀን",
      time: "ሰዓት",
      salon: "ሰሎን",
      reason: "ምክንያት",
      footer: "ጥያቄ ካለዎት እባክዎ ያግኙን።",
      rebook: "እንደገና ማስመዝገብ ይፈልጋሉ? አዲስ ቀጠሮ ለማቀድ የማስመዝገቢያ ገጻችንን ይጎብኙ።",
    },
  } as Record<string, {
    subject: string;
    greeting: string;
    cancelled: string;
    details: string;
    service: string;
    employee: string;
    date: string;
    time: string;
    salon: string;
    reason: string;
    footer: string;
    rebook: string;
  }>;

  return emailTranslations[locale] || emailTranslations.en || emailTranslations["en"]!;
}

export function renderBookingCancellationTemplate(
  props: BookingCancellationTemplateProps
): { html: string; text: string; subject: string } {
  const locale = normalizeLocale(props.language) as AppLocale;
  const t = getTranslations(locale);

  const booking = props.booking;
  const salonName = booking.salon?.name || "Salon";
  const customerName = booking.customer_full_name;
  const serviceName = booking.service?.name || "Service";
  const employeeName = booking.employee?.name || "Employee";
  
  const startTime = new Date(booking.start_time);
  const endTime = new Date(booking.end_time);
  
  // Format date and time based on locale
  const dateStr = format(startTime, "EEEE, MMMM d, yyyy", { locale: locale === "nb" ? require("date-fns/locale/nb") : undefined });
  const timeStr = `${format(startTime, "HH:mm")} - ${format(endTime, "HH:mm")}`;

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
  <div style="background-color: #fef2f2; padding: 30px; border-radius: 8px;">
    <h1 style="color: #dc2626; margin-top: 0;">${t.cancelled}</h1>
    <p>${greeting}</p>
    <p>${t.cancelled}</p>
    
    <div style="background-color: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dc2626;">
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
        ${props.cancellationReason ? `
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">${t.reason}:</td>
          <td style="padding: 8px 0;">${props.cancellationReason}</td>
        </tr>
        ` : ""}
      </table>
    </div>
    
    <p style="margin-top: 20px;">${t.rebook}</p>
    <p style="margin-top: 30px;">${t.footer}</p>
    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
      ${salonName}
    </p>
  </div>
</body>
</html>
  `.trim();

  const text = `
${t.cancelled}

${greeting}

${t.cancelled}

${t.details}:
${t.service}: ${serviceName}
${t.employee}: ${employeeName}
${t.date}: ${dateStr}
${t.time}: ${timeStr}
${t.salon}: ${salonName}
${props.cancellationReason ? `${t.reason}: ${props.cancellationReason}` : ""}

${t.rebook}

${t.footer}

${salonName}
  `.trim();

  return { html, text, subject };
}
