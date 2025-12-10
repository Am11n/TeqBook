"use client";

import { Card } from "@/components/ui/card";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";

export default function BrandingSettingsPage() {
  const { locale } = useLocale();
  
  const appLocale =
    locale === "nb"
      ? "nb"
      : locale === "ar"
        ? "ar"
        : locale === "so"
          ? "so"
          : locale === "ti"
            ? "ti"
            : locale === "am"
              ? "am"
              : locale === "tr"
                ? "tr"
                : locale === "pl"
                  ? "pl"
                  : locale === "vi"
                    ? "vi"
                    : locale === "zh"
                      ? "zh"
                      : locale === "tl"
                        ? "tl"
                        : locale === "fa"
                          ? "fa"
                          : locale === "dar"
                            ? "dar"
                            : locale === "ur"
                              ? "ur"
                              : locale === "hi"
                                ? "hi"
                                : "en";
  const t = translations[appLocale].settings;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-2">{t.brandingTitle}</h3>
      <p className="text-sm text-muted-foreground mb-6">
        {t.brandingDescription}
      </p>
      <p className="text-sm text-muted-foreground">
        {t.comingSoon}
      </p>
    </Card>
  );
}

