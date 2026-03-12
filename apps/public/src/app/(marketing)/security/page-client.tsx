"use client";

import Link from "next/link";
import { Section } from "@/components/marketing/Section";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { getPublicPageTranslations } from "@/i18n/public-pages";

export default function SecurityPageClient() {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = getPublicPageTranslations(appLocale).marketingPages.security;

  return (
    <>
      <Section className="bg-gradient-to-b from-slate-50 via-blue-50/30 to-white pb-10 pt-20 sm:pb-12 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {t.title}
          </h1>
          <p className="mt-4 text-base text-slate-600 sm:text-lg">{t.description}</p>
        </div>
      </Section>

      <Section className="py-10 sm:py-12">
        <div className="mx-auto max-w-3xl rounded-xl border border-blue-100 bg-blue-50/40 px-6 py-8 sm:px-8">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            {t.technicalOverviewTitle}
          </h2>
          <p className="mt-3 leading-7 text-slate-700">{t.technicalOverviewBody}</p>
        </div>
      </Section>

      <Section className="pt-6 sm:pt-8">
        <div className="mx-auto max-w-3xl border-t border-slate-200 pt-10 text-center sm:pt-12">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {t.yourDataTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-600">{t.yourDataBody}</p>
          <div className="mt-8">
            <Link
              href="/#demo"
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              {t.contactSupport}
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
