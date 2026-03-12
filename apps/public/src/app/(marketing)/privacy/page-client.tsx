"use client";

import Image from "next/image";
import { Section } from "@/components/marketing/Section";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { getPublicPageTranslations } from "@/i18n/public-pages";

export default function PrivacyPageClient() {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = getPublicPageTranslations(appLocale).marketingPages.privacy;

  return (
    <>
      <Section className="bg-gradient-to-b from-blue-50/80 via-blue-100/30 to-white pb-8 pt-20 sm:pb-10 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1.5 shadow-sm">
            <Image src="/Favikon.svg" alt="TeqBook" width={22} height={22} className="h-5 w-5" />
            <span className="text-xs font-semibold tracking-wide text-blue-700">
              {t.title.toUpperCase()}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {t.title}
          </h1>
          <p className="mt-4 text-base text-slate-600 sm:text-lg">{t.description}</p>
          <p className="mt-3 text-sm font-medium text-slate-500">{t.effectiveDate}</p>
        </div>
      </Section>

      <Section className="py-10 sm:py-12">
        <div className="mx-auto max-w-4xl rounded-2xl border border-blue-100 bg-white p-6 text-slate-700 shadow-sm sm:p-7">
          <p className="leading-7">{t.contact}</p>
        </div>
      </Section>
    </>
  );
}
