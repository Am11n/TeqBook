"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Calendar, Clock, User } from "lucide-react";
import type { Locale } from "./landing-copy";

interface LandingHeroProps {
  locale: Locale;
  badge: string;
  heroTitle: string;
  heroSubtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
  newBooking: string;
  exampleCustomerName: string;
  exampleService: string;
  exampleDate: string;
  today: string;
  bookingsCount: string;
  cutService: string;
}

function getNoCreditCardText(locale: Locale): string {
  switch (locale) {
    case "nb":
      return "Ingen kredittkort nødvendig.";
    case "ar":
      return "لا حاجة لبطاقة ائتمان.";
    case "so":
      return "Kaararka deynta looma baahna.";
    case "ti":
      return "ክሬዲት ካርታ ኣይድልየን።";
    case "am":
      return "የክሬዲት ካርድ መረጃ አያስፈልግም።";
    case "tr":
      return "Kredi kartı gerekmez.";
    case "pl":
      return "Karta kredytowa nie jest wymagana.";
    case "vi":
      return "Không cần thẻ tín dụng.";
    case "zh":
      return "无需信用卡。";
    case "tl":
      return "Hindi kailangan ng credit card.";
    case "fa":
    case "dar":
    case "ur":
      return "نیازی به کارت اعتباری نیست.";
    default:
      return "No credit card required.";
  }
}

export function LandingHero({
  locale,
  badge,
  heroTitle,
  heroSubtitle,
  ctaPrimary,
  ctaSecondary,
  newBooking,
  exampleCustomerName,
  exampleService,
  exampleDate,
  today,
  bookingsCount,
  cutService,
}: LandingHeroProps) {
  return (
    <section className="relative -mt-[120px] pt-[120px] border-b border-blue-200/30 overflow-hidden bg-blue-50 min-h-[calc(100vh-120px)]">
      {/* Abstract gradient background layers */}
      <div className="pointer-events-none absolute inset-0 top-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-100" />

        {/* Large blurred blobs for depth */}
        <motion.div
          className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-indigo-400/30 blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-56 -left-10 h-96 w-96 rounded-full bg-sky-300/25 blur-3xl"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.25, 0.35, 0.25],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-indigo-500/8 blur-3xl" />

        {/* Ghost watermark logo */}
        <div className="absolute top-1/2 left-[55%] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <Image
            src="/Favikon.svg"
            alt=""
            width={1000}
            height={1000}
            className="w-[1000px] h-[1000px] opacity-[0.04] blur-[1.5px] select-none"
            priority
            aria-hidden="true"
          />
        </div>

        {/* Subtle diagonal grid pattern */}
        <div className="absolute inset-0 opacity-[0.08]">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid-pattern"
                x="0"
                y="0"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="currentColor"
                  className="text-indigo-600"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          </svg>
        </div>
      </div>

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12 md:py-16 lg:flex-row lg:items-center lg:gap-16">
        <motion.div
          className="flex-1 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.span
            className="inline-flex items-center gap-2 rounded-full border border-blue-200/50 bg-white/70 px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-blue-700 shadow-sm backdrop-blur-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            {badge}
          </motion.span>
          <motion.h1
            className="text-balance bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-4xl font-semibold leading-tight tracking-tight text-transparent sm:text-5xl md:text-6xl lg:text-7xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {heroTitle}
          </motion.h1>
          <motion.p
            className="max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {heroSubtitle}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Link href="/signup" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-10 py-7 text-base font-semibold text-white transition-all duration-300 hover:scale-[1.02] sm:w-auto"
                style={{
                  boxShadow:
                    "0 10px 40px rgba(99, 102, 241, 0.25), 0 0 0 1px rgba(99, 102, 241, 0.05), 0 0 60px rgba(99, 102, 241, 0.06)",
                }}
              >
                <span className="relative z-10">{ctaPrimary}</span>
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="group w-full rounded-xl border-2 border-slate-200 bg-white px-8 py-6 text-base font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-md sm:w-auto"
              type="button"
            >
              {ctaSecondary}
            </Button>
          </motion.div>
          <motion.p
            className="text-xs text-slate-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.4 }}
          >
            {getNoCreditCardText(locale)}
          </motion.p>
        </motion.div>

        {/* Floating UI Cards */}
        <motion.div
          className="relative flex-1 lg:min-h-[500px] flex items-start justify-center pt-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {/* Card 1: Booking Example */}
          <motion.div
            className="group relative z-10 mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-[0_6px_20px_rgba(0,0,0,0.04)] backdrop-blur-md sm:p-6"
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="relative">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-xs font-medium text-slate-600">
                    {newBooking}
                  </span>
                </div>
                <Calendar className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {exampleCustomerName}
                    </p>
                    <p className="text-xs text-slate-500">{exampleService}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Clock className="h-3.5 w-3.5 text-indigo-600" />
                  <span>{exampleDate}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Calendar View */}
          <motion.div
            className="absolute top-56 right-0 z-0 w-full max-w-xs overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-[0_6px_20px_rgba(0,0,0,0.04)] backdrop-blur-md sm:p-5"
            animate={{
              y: [0, 6, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          >
            <div className="relative">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">
                  {today}
                </h3>
                <span className="text-xs text-slate-500">{bookingsCount}</span>
              </div>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-lg bg-indigo-50/50 px-2 py-1.5"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    <span className="text-xs text-slate-700">
                      {`${9 + i * 2}:00 - ${cutService}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

