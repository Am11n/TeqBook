"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, Globe, UserPlus, Scissors, Waves, Hand, Paintbrush } from "lucide-react";
import { LogoLoop } from "@/components/ui/logo-loop";
import { languageLogos } from "./constants";

interface PricingTier {
  id: string;
  name: string;
  price: string;
  badge?: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}

interface LandingPricingProps {
  pricingTitle: string;
  pricingSubtitle: string;
  affordableSimple: string;
  tiers: PricingTier[];
  startFreeTrial: string;
  addOnsTitle: string;
  addOnsDescription: string;
  multilingualBookingTitle: string;
  multilingualBookingDescription: string;
  extraStaffTitle: string;
  extraStaffDescription: string;
}

export function LandingPricing({
  pricingTitle,
  pricingSubtitle,
  affordableSimple,
  tiers,
  startFreeTrial,
  addOnsTitle,
  addOnsDescription,
  multilingualBookingTitle,
  multilingualBookingDescription,
  extraStaffTitle,
  extraStaffDescription,
}: LandingPricingProps) {
  return (
    <section className="relative border-b border-blue-200/30 bg-gradient-to-b from-white/60 via-blue-50/20 to-blue-50/20 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            {pricingTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
            {pricingSubtitle}
          </p>
          <p className="mt-6 text-center text-sm font-semibold uppercase tracking-wide text-blue-600">
            {affordableSimple}
          </p>
        </motion.div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {tiers.map((plan, index) => {
            const isHighlighted =
              "highlighted" in plan && plan.highlighted === true;

            return (
              <motion.div
                key={plan.id}
                className={`group relative flex flex-col overflow-hidden rounded-3xl border-2 p-6 shadow-lg transition-all duration-300 sm:p-8 ${
                  isHighlighted
                    ? "border-blue-500 bg-gradient-to-br from-white via-blue-50/50 to-blue-50/50 shadow-2xl shadow-blue-500/20 ring-2 ring-blue-500/20"
                    : "border-blue-200/50 bg-white/80 backdrop-blur-sm hover:border-blue-300 hover:shadow-xl"
                }`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.02, y: -4 }}
              >
                {isHighlighted && (
                  <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-blue-400/30 to-blue-500/30 blur-2xl" />
                )}
                <div className="relative">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/90 shadow-lg shadow-blue-500/20">
                        <Image
                          src="/Favikon.svg"
                          alt="TeqBook"
                          width={24}
                          height={24}
                          className="h-6 w-6"
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {plan.name}
                        </h3>
                      </div>
                    </div>
                    {plan.badge && (
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          isHighlighted
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <p className="mb-4 text-sm text-slate-600">
                    {plan.description}
                  </p>
                  <div className="mb-6">
                    <span className="text-3xl font-bold text-slate-900">
                      {plan.price.split(" /")[0]}
                    </span>
                    <span className="text-sm text-slate-500">
                      {" /" + plan.price.split(" /")[1]}
                    </span>
                  </div>
                  <ul className="mb-6 flex-1 space-y-3 text-sm">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <Check
                          className={`mt-0.5 h-5 w-5 shrink-0 ${
                            isHighlighted
                              ? "text-blue-600"
                              : "text-blue-500"
                          }`}
                        />
                        <span className="text-slate-700">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup" className="w-full">
                    <Button
                      className={`w-full ${
                        isHighlighted
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40"
                          : "bg-slate-900 text-white hover:bg-slate-800"
                      }`}
                      size="lg"
                    >
                      {startFreeTrial}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900">{addOnsTitle}</h3>
            <p className="mt-2 text-sm text-slate-600">{addOnsDescription}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: Globe,
                title: multilingualBookingTitle,
                desc: multilingualBookingDescription,
                isMultilingual: true,
              },
              {
                icon: UserPlus,
                title: extraStaffTitle,
                desc: extraStaffDescription,
                isMultilingual: false,
                staffAvatars: [
                  { icon: Scissors, label: "Barber" },
                  { icon: Waves, label: "Massage therapist" },
                  { icon: Hand, label: "Nail technician" },
                  { icon: Paintbrush, label: "Makeup artist" },
                ],
              },
            ].map((addon, idx) => {
              const Icon = addon.icon;

              return (
                <motion.div
                  key={idx}
                  className="group relative flex flex-col overflow-hidden rounded-xl bg-gradient-to-br from-white via-indigo-50/30 to-blue-50/20 p-6 shadow-md transition-all duration-300 hover:shadow-lg sm:p-8 min-h-[160px]"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  style={{
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                  }}
                >
                  {/* Gradient border */}
                  <div
                    className="absolute inset-0 rounded-xl"
                    style={{
                      padding: "1px",
                      background:
                        "linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.1))",
                      WebkitMask:
                        "linear-gradient(white 0 0) content-box, linear-gradient(white 0 0)",
                      WebkitMaskComposite: "xor",
                      maskComposite: "exclude",
                    }}
                  />
                  <div className="relative flex flex-col flex-1">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 text-indigo-600">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900 sm:text-base">
                        {addon.title}
                      </h4>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-600 mb-4">
                      {addon.desc}
                    </p>
                    <div className="mt-auto">
                      {addon.isMultilingual && (
                        <div className="h-12 relative overflow-hidden w-full">
                          <LogoLoop
                            logos={languageLogos}
                            speed={40}
                            direction="left"
                            logoHeight={24}
                            gap={24}
                            fadeOut
                            fadeOutColor="rgba(255, 255, 255, 0.9)"
                            className="h-full w-full"
                          />
                        </div>
                      )}
                      {addon.staffAvatars && (
                        <div className="flex items-center justify-center gap-3 pt-2">
                          {addon.staffAvatars.map((staff, staffIdx) => {
                            const StaffIcon = staff.icon;
                            return (
                              <div
                                key={staffIdx}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 via-indigo-50/80 to-blue-100 text-indigo-600 transition-transform hover:scale-110"
                                title={staff.label}
                              >
                                <StaffIcon className="h-5 w-5" />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

