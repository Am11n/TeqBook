"use client";

import Image from "next/image";
import { Section } from "@/components/marketing/Section";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { getPrivacyPageCopy } from "@/i18n/privacy-page-copy";

export default function PrivacyPageClient() {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = getPrivacyPageCopy(appLocale);

  return (
    <>
      <Section className="bg-gradient-to-b from-blue-50/80 via-blue-100/30 to-white pb-8 pt-20 sm:pb-10 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1.5 shadow-sm">
            <Image src="/Favikon.svg" alt="TeqBook" width={22} height={22} className="h-5 w-5" />
            <span className="text-xs font-semibold tracking-wide text-blue-700">
              {t.badge}
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
        <div className="mx-auto max-w-4xl space-y-4 text-slate-700">
          {t.sections.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm sm:p-7"
            >
              <h2 className="text-xl font-semibold text-slate-900">{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-3 leading-7">
                  {paragraph}
                </p>
              ))}
              {section.bullets && section.bullets.length > 0 ? (
                <ul className="mt-3 list-disc space-y-2 pl-5 leading-7">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}

          <div className="rounded-2xl border border-blue-200 bg-blue-50/60 px-6 py-5 text-sm text-slate-700 sm:px-7">
            {t.contactLead}
            <span className="ml-1 font-semibold text-slate-900">{t.contactEmail}</span>.
          </div>
        </div>
      </Section>
    </>
  );
}
