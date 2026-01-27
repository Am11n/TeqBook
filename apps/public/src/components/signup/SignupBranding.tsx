"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";

const MotionSection = dynamic(
  () => import("framer-motion").then((mod) => mod.motion.section),
  { ssr: false }
);

interface SignupBrandingProps {
  translations: {
    headline: string;
    subheadline: string;
    bullet1: string;
    bullet2: string;
    bullet3: string;
    trustLine: string;
  };
}

export function SignupBranding({ translations }: SignupBrandingProps) {
  return (
    <MotionSection
      className="flex flex-col justify-center"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Logo row */}
      <Link href="/" className="flex items-center gap-3 mb-8 hover:opacity-80 transition-opacity">
        <Image
          src="/Favikon.svg"
          alt="TeqBook logo"
          width={40}
          height={40}
          className="drop-shadow-[0_2px_8px_rgba(15,23,42,0.15)]"
        />
        <span className="text-xl font-semibold tracking-tight text-slate-900">TeqBook</span>
      </Link>

      {/* Headline */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-[1.2] tracking-tight text-slate-900 max-w-[460px]">
        {translations.headline}
      </h1>

      {/* Description */}
      <p className="mt-4 max-w-[460px] text-sm sm:text-base text-slate-600">{translations.subheadline}</p>

      {/* Bullets */}
      <ul className="mt-6 space-y-2 text-sm text-slate-700">
        <li className="flex items-start gap-2">
          <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-blue-600" />
          <span>{translations.bullet1}</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-blue-600" />
          <span>{translations.bullet2}</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-blue-600" />
          <span>{translations.bullet3}</span>
        </li>
      </ul>

      {/* Trust line */}
      <p className="mt-8 text-xs text-slate-500">{translations.trustLine}</p>
    </MotionSection>
  );
}

