"use client";

import { motion } from "framer-motion";

interface FAQItem {
  q: string;
  a: string;
}

interface LandingFAQProps {
  faqTitle: string;
  faq: FAQItem[];
}

export function LandingFAQ({ faqTitle, faq }: LandingFAQProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white/60 to-slate-50/40 backdrop-blur-sm">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {faqTitle}
          </h2>
        </motion.div>
        <div className="mt-12 space-y-6">
          {faq.map((item, index) => (
            <motion.div
              key={item.q}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm transition-all hover:border-slate-300 hover:shadow-md sm:p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.01 }}
            >
              <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">
                {item.q}
              </h3>
              <p className="mt-5 text-base leading-relaxed text-slate-600">
                {item.a}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

