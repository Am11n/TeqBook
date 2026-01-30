"use client";

import Link from "next/link";
import type { Locale } from "./landing-copy";

interface LandingFooterProps {
  locale: Locale;
}

function getFooterText(locale: Locale): string {
  switch (locale) {
    case "nb":
      return "Hjelper salonger med å holde seg organisert, selvsikre og fullt booket — globalt.";
    case "ar":
      return "مساعدة الصالونات على البقاء منظمة وواثقة ومحجوزة بالكامل — عالميًا.";
    case "so":
      return "Waxaan ka caawinaynaa saloonnada inay sii wadaan oo ay u noqdaan mid habaysan, kalsooni leh oo buuxa — adduunka oo dhan.";
    case "ti":
      return "ንሳሎናት ንኽሳለሉ፣ ንኽርእዩ ከምኡውን ንኽምሉኡ ዝሕግዙ — ኣብ ምሉእ ዓለም።";
    case "am":
      return "ሳሎኖች የተደራጁ፣ በራስ የሚታመኑ እና ሙሉ በሙሉ የተዘጋጁ እንዲሆኑ ማገዝ — በዓለም አቀፍ ደረጃ።";
    case "tr":
      return "Salonların organize, kendinden emin ve tamamen rezerve kalmasına yardımcı oluyoruz — küresel olarak.";
    case "pl":
      return "Pomagamy salonom pozostać zorganizowanym, pewnym siebie i w pełni zarezerwowanym — globalnie.";
    case "vi":
      return "Giúp các salon luôn có tổ chức, tự tin và được đặt đầy đủ — trên toàn cầu.";
    case "zh":
      return "帮助沙龙保持有序、自信和完全预订 — 全球。";
    case "tl":
      return "Tumutulong sa mga salon na manatiling organisado, kumpiyansa at ganap na naka-book — sa buong mundo.";
    case "fa":
    case "dar":
    case "ur":
      return "کمک به سالن‌ها برای منظم، مطمئن و کاملاً رزرو شده ماندن — در سطح جهانی.";
    default:
      return "Helping salons stay organized, confident and fully booked — globally.";
  }
}

export function LandingFooter({ locale }: LandingFooterProps) {
  return (
    <footer className="border-t border-blue-200/50 bg-white/60 backdrop-blur-xl" role="contentinfo">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:justify-between sm:px-6 sm:text-base">
        <span>© {new Date().getFullYear()} TeqBook.</span>
        <nav aria-label="Footer navigation" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
          <Link href="/#features" className="hover:text-foreground underline-offset-4 hover:underline">
            Features
          </Link>
          <Link href="/#pricing" className="hover:text-foreground underline-offset-4 hover:underline">
            Pricing
          </Link>
          <Link href="/#faq" className="hover:text-foreground underline-offset-4 hover:underline">
            FAQ
          </Link>
          <Link href="/signup" className="hover:text-foreground underline-offset-4 hover:underline">
            Sign up
          </Link>
          <Link href="/login" className="hover:text-foreground underline-offset-4 hover:underline">
            Log in
          </Link>
        </nav>
        <span className="text-center sm:text-left">{getFooterText(locale)}</span>
      </div>
    </footer>
  );
}

