import type { AppLocale } from "@/i18n/translations";
import { DialogSelect } from "@/components/ui/dialog-select";

const LANGUAGE_MAP: Record<AppLocale, string> = {
  nb: "🇳🇴", en: "🇬🇧", ar: "🇸🇦", so: "🇸🇴", ti: "🇪🇷", am: "🇪🇹",
  tr: "🇹🇷", pl: "🇵🇱", vi: "🇻🇳", tl: "🇵🇭", zh: "🇨🇳", fa: "🇮🇷",
  dar: "🇦🇫", ur: "🇵🇰", hi: "🇮🇳",
};

interface LanguageSelectorProps {
  locale: string;
  salon: { supported_languages?: string[] | null } | null;
  setLocale: (locale: AppLocale) => void;
}

export function LanguageSelector({ locale, salon, setLocale }: LanguageSelectorProps) {
  const supportedLanguages =
    salon?.supported_languages && salon.supported_languages.length > 0
      ? salon.supported_languages
      : ["en", "nb"];

  const currentLocale = supportedLanguages.includes(locale as AppLocale)
    ? locale
    : (supportedLanguages[0] || "en");

  return (
    <DialogSelect
      value={currentLocale}
      onChange={(v) => setLocale(v as AppLocale)}
      options={supportedLanguages.map((lang: string) => ({
        value: lang,
        label: LANGUAGE_MAP[lang as AppLocale] || lang,
      }))}
    />
  );
}
