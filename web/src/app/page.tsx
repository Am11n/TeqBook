"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { Section, SectionCard } from "@/components/section";
import { StatsGrid } from "@/components/stats-grid";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";

export default function Home() {
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
  const t = translations[appLocale].home;

  return (
    <DashboardShell>
      <Section title={t.title} description={t.description}>
        <StatsGrid>
          <SectionCard
            title={t.nextStepTitle}
            description={t.nextStepDescription}
          >
            <p className="mt-1 text-sm font-semibold">
              {t.nextStepBodyTitle}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t.nextStepBodyText}
            </p>
          </SectionCard>

          <SectionCard
            title={t.onboardingTitle}
            description={t.onboardingDescription}
          >
            <p className="mt-1 text-sm font-semibold">
              {t.onboardingBodyTitle}
          </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t.onboardingBodyText}
            </p>
          </SectionCard>

          <SectionCard
            title={t.bookingTitle}
            description={t.bookingDescription}
          >
            <p className="mt-1 text-sm font-semibold">
              {t.bookingBodyTitle}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t.bookingBodyText}
            </p>
          </SectionCard>
        </StatsGrid>
      </Section>
    </DashboardShell>
  );
}

