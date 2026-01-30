"use client";

import { motion } from "framer-motion";
import { Scissors, CreditCard, TrendingUp } from "lucide-react";
import { Section } from "@/components/layout/section";
import { StatsGrid } from "@/components/stats-grid";

interface LandingStatsProps {
  stats: Array<{ title: string; body: string }>;
}

export function LandingStats({ stats }: LandingStatsProps) {
  const icons = [Scissors, CreditCard, TrendingUp];

  return (
    <section id="features" className="relative border-b border-blue-200/30 bg-white/40 backdrop-blur-sm" aria-label="Features and benefits">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <Section>
          <StatsGrid>
            {stats.map((s, index) => {
              const Icon = icons[index] || Scissors;

              return (
                <motion.div
                  key={s.title}
                  className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-md transition-all duration-300 hover:shadow-lg sm:p-8"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
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
                  <div className="relative">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 text-indigo-600">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 sm:text-base">
                        {s.title}
                      </h3>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-600">
                      {s.body}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </StatsGrid>
        </Section>
      </div>
    </section>
  );
}

