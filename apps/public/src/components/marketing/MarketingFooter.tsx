"use client";

import Link from "next/link";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { getPublicPageTranslations } from "@/i18n/public-pages";

export function MarketingFooter() {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = getPublicPageTranslations(appLocale).marketingFooter;
  const footerLinks = [
    { href: "/pricing", label: t.pricing },
    { href: "/security", label: t.security },
    { href: "/contact", label: t.contact },
    { href: "/privacy", label: t.privacy },
    { href: "/terms", label: t.terms },
  ];

  return (
    <footer className="border-t border-blue-200/50 bg-white/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:flex-wrap sm:justify-between sm:px-6">
        <span suppressHydrationWarning>
          &copy; {new Date().getFullYear()} TeqBook.
        </span>
        <nav
          aria-label={t.navAria}
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1"
        >
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-slate-900 underline-offset-4 hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <span className="text-center sm:text-left">
          {t.tagline}
        </span>
      </div>
    </footer>
  );
}
