"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export function OnboardingBranding() {
  return (
    <motion.section
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
        Set up your <span className="text-blue-700">TeqBook</span> salon
      </h1>

      {/* Description */}
      <p className="mt-4 max-w-[460px] text-sm sm:text-base text-slate-600">
        We&apos;ll help you set up your salon so you can start accepting bookings in minutes.
      </p>

      {/* Bullets */}
      <ul className="mt-6 space-y-2 text-sm text-slate-700">
        <li className="flex items-start gap-2">
          <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-blue-600" />
          <span>Add your salon details</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-blue-600" />
          <span>Customize your booking settings</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-blue-600" />
          <span>Invite staff when you&apos;re ready</span>
        </li>
      </ul>

      {/* Trust line */}
      <p className="mt-8 text-xs text-slate-500">
        Trusted by salons that want simple, clean scheduling – not bloated software.
      </p>
    </motion.section>
  );
}

