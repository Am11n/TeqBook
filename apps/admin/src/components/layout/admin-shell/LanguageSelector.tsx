import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AppLocale } from "@/i18n/translations";

const LANGUAGE_MAP: Record<AppLocale, string> = {
  nb: "🇳🇴", en: "🇬🇧", ar: "🇸🇦", so: "🇸🇴", ti: "🇪🇷",
  am: "🇪🇹", tr: "🇹🇷", pl: "🇵🇱", vi: "🇻🇳", tl: "🇵🇭",
  zh: "🇨🇳", fa: "🇮🇷", dar: "🇦🇫", ur: "🇵🇰", hi: "🇮🇳",
};

interface LanguageSelectorProps {
  locale: string;
  salon: { supported_languages?: string[] | null } | null;
  setLocale: (locale: AppLocale) => void;
  languageAria: string;
}

export function LanguageSelector({ locale, salon, setLocale, languageAria }: LanguageSelectorProps) {
  const supportedLanguages =
    salon?.supported_languages && salon.supported_languages.length > 0
      ? salon.supported_languages
      : ["en", "nb"];

  const currentLocale = supportedLanguages.includes(locale as AppLocale)
    ? (locale as AppLocale)
    : ((supportedLanguages[0] || "en") as AppLocale);

  const flag = LANGUAGE_MAP[currentLocale] || "🌐";

  const menu = (
    <DropdownMenuContent align="end" className="min-w-36">
      {supportedLanguages.map((lang: string) => {
        const lv = lang as AppLocale;
        return (
          <DropdownMenuItem key={lang} onClick={() => setLocale(lv)} className="cursor-pointer">
            <span className="mr-2">{LANGUAGE_MAP[lv] || lang}</span>
            <span className="text-xs text-muted-foreground">{lv.toUpperCase()}</span>
          </DropdownMenuItem>
        );
      })}
    </DropdownMenuContent>
  );

  return (
    <>
      {/* Mobile */}
      <div className="sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-card/60 backdrop-blur-lg outline-none transition-all hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-primary/20"
              aria-label={languageAria}
            >
              <span className="text-base leading-none">{flag}</span>
            </button>
          </DropdownMenuTrigger>
          {menu}
        </DropdownMenu>
      </div>

      {/* Desktop */}
      <div className="hidden h-9 w-9 items-center justify-center rounded-lg bg-card/60 backdrop-blur-lg transition-all hover:scale-105 hover:bg-muted/60 sm:flex">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
              aria-label={languageAria}
            >
              <span className="text-base leading-none">{flag}</span>
            </button>
          </DropdownMenuTrigger>
          {menu}
        </DropdownMenu>
      </div>
    </>
  );
}
