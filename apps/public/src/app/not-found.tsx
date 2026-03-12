"use client";

import Link from "next/link";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { getPublicPageTranslations } from "@/i18n/public-pages";

export default function NotFound() {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = getPublicPageTranslations(appLocale).notFoundPage;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-b from-slate-50 to-blue-50/30 px-4">
      <h1 className="text-4xl font-semibold text-slate-800">404</h1>
      <p className="max-w-md text-center text-slate-600">
        {t.description}
      </p>
      <nav className="flex flex-wrap justify-center gap-4" aria-label={t.navAria}>
        <Link
          href="/"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          {t.home}
        </Link>
        <Link
          href="/landing"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          {t.productOverview}
        </Link>
        <Link
          href="/signup"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          {t.signup}
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          {t.login}
        </Link>
      </nav>
    </div>
  );
}
