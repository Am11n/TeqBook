// =====================================================
// Payment Failure Email Template
// =====================================================
// Email template for payment failure notifications with i18n support

import { normalizeLocale } from "@/i18n/normalizeLocale";
import type { AppLocale } from "@/i18n/translations";

export interface PaymentFailureTemplateProps {
  salonName: string;
  failureReason: string;
  language: string;
}

// Helper to get translations
function getTranslations(locale: AppLocale) {
  const emailTranslations: Partial<Record<AppLocale, {
    subject: string;
    greeting: string;
    message: string;
    reason: string;
    action: string;
    footer: string;
  }>> = {
    en: {
      subject: "Payment Failed - Action Required",
      greeting: "Hello,",
      message: "We were unable to process your payment for {{salonName}}.",
      reason: "Reason",
      action: "Please update your payment method in your account settings to avoid service interruption.",
      footer: "If you have any questions, please contact support.",
    },
    nb: {
      subject: "Betaling mislyktes - Handling påkrevd",
      greeting: "Hei,",
      message: "Vi kunne ikke behandle betalingen din for {{salonName}}.",
      reason: "Årsak",
      action: "Vennligst oppdater betalingsmetoden din i kontoinnstillingene for å unngå tjenesteavbrudd.",
      footer: "Hvis du har spørsmål, vennligst kontakt kundestøtte.",
    },
    ar: {
      subject: "فشل الدفع - إجراء مطلوب",
      greeting: "مرحباً،",
      message: "لم نتمكن من معالجة دفعتك لـ {{salonName}}.",
      reason: "السبب",
      action: "يرجى تحديث طريقة الدفع الخاصة بك في إعدادات الحساب لتجنب انقطاع الخدمة.",
      footer: "إذا كان لديك أي أسئلة، يرجى الاتصال بالدعم.",
    },
    so: {
      subject: "Lacag bixinta ayaa fashilantay - Waxqabad loo baahan yahay",
      greeting: "Salaan,",
      message: "Ma awoodnay inaan bixintaada u maamulno {{salonName}}.",
      reason: "Sababta",
      action: "Fadlan cusbooneysii habka bixintaada ee goobaha akoonkaaga si aad uga fogaato xidhitaanka adeegga.",
      footer: "Haddii aad su'aalo qabtid, fadlan la xiriir taageerada.",
    },
    ti: {
      subject: "ክፍያ ኣይተዓወተን - ተግባር የድሊ",
      greeting: "ሰላም,",
      message: "ን{{salonName}} ክፍያኻ ክንሰርሕ ኣይከኣልናን።",
      reason: "ምኽንያት",
      action: "ንምክልኻል ኣገልግሎት ንኸይንቋረጽ ኣብ ምትእስሳር ኣካውንኻ ናይ ክፍያ ኣገባብኻ እተወስኸ ኣሎኻ።",
      footer: "ሕቶታት እንተ ኣለዉኻ፣ እተወሰኸ ኣሎኻ ሓገዝ ርኸብ።",
    },
    am: {
      subject: "ክፍያ አልተሳካም - እርምጃ ያስፈልጋል",
      greeting: "ሰላም፣",
      message: "ለ {{salonName}} ክፍያዎን ማስተካከል አልቻልንም።",
      reason: "ምክንያት",
      action: "አገልግሎት እንዳይቋረጥ እባክዎ የክፍያ ዘዴዎን በመለያ ቅንብሮችዎ ያዘምኑ።",
      footer: "ማንኛውም ጥያቄ ካለዎት፣ እባክዎ ድጋፍ ያግኙ።",
    },
  } as Record<string, {
    subject: string;
    greeting: string;
    message: string;
    reason: string;
    action: string;
    footer: string;
  }>;

  // Default to English for unsupported locales
  return emailTranslations[locale] || emailTranslations.en || emailTranslations["en"]!;
}

export function renderPaymentFailureTemplate(
  props: PaymentFailureTemplateProps
): { html: string; text: string; subject: string } {
  const locale = normalizeLocale(props.language) as AppLocale;
  const t = getTranslations(locale);

  const subject = t.subject;
  const message = t.message.replace("{{salonName}}", props.salonName);

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
    <h1 style="color: #dc2626; margin-top: 0;">${subject}</h1>
    <p>${t.greeting}</p>
    <p>${message}</p>
    
    <div style="background-color: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dc2626;">
      <p style="margin: 0;"><strong>${t.reason}:</strong> ${props.failureReason}</p>
    </div>
    
    <p style="margin-top: 20px;">${t.action}</p>
    
    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
      ${t.footer}
    </p>
    <p style="color: #6b7280; font-size: 14px;">
      ${props.salonName}
    </p>
  </div>
</body>
</html>
  `.trim();

  const text = `
${subject}

${t.greeting}

${message}

${t.reason}: ${props.failureReason}

${t.action}

${t.footer}

${props.salonName}
  `.trim();

  return { html, text, subject };
}
