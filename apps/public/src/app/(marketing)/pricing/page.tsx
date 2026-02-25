import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Check, Shield, CreditCard, X, Lock, CalendarCheck, Users, TrendingUp } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { PRICING, getTopFeaturesForPlan } from "@/content/marketing";
import { Section, SectionHeader } from "@/components/marketing/Section";
import {
  ComparisonTable,
  type ComparisonColumn,
  type ComparisonRow,
  type ComparisonMeta,
} from "@/components/marketing/ComparisonTable";
import { CTASection } from "@/components/marketing/CTASection";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Pricing | TeqBook",
    description:
      "Simple, transparent pricing for salons of all sizes. Start with Starter, upgrade anytime. No hidden fees.",
    path: "/pricing",
  });
}

const columns: ComparisonColumn[] = [...PRICING.plans]
  .sort((a, b) => a.order - b.order)
  .map((p) => ({
    id: p.id,
    label: p.name,
    highlighted: p.highlighted,
  }));

const planMeta: ComparisonMeta[] = [...PRICING.plans]
  .sort((a, b) => a.order - b.order)
  .map((p) => ({
    planId: p.id,
    bestFor: p.bestFor,
    teamSize: p.teamSize,
  }));

const sortedCategories = [...PRICING.categories].sort(
  (a, b) => a.order - b.order
);

const rows: ComparisonRow[] = [...PRICING.features]
  .sort((a, b) => {
    const catA =
      PRICING.categories.find((c) => c.id === a.category)?.order ?? 99;
    const catB =
      PRICING.categories.find((c) => c.id === b.category)?.order ?? 99;
    return catA !== catB ? catA - catB : a.order - b.order;
  })
  .map((f) => ({
    category:
      PRICING.categories.find((c) => c.id === f.category)?.label ??
      f.category,
    feature: f.label,
    values: { ...f.values },
  }));

const categoryLabels = sortedCategories.map((c) => c.label);

const TRUST_ICONS = {
  shield: Shield,
  card: CreditCard,
  x: X,
  lock: Lock,
} as const;

const WHY_PRO_ICONS = {
  "calendar-check": CalendarCheck,
  users: Users,
  "trending-up": TrendingUp,
} as const;

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <Section className="bg-gradient-to-b from-slate-50 via-blue-50/30 to-white pb-0 sm:pb-0">
        <SectionHeader
          title="Choose your TeqBook plan"
          description="Built for salons of all sizes — start simple, then upgrade anytime."
          badge="Affordable. Simple. Built for international salons."
        />
      </Section>

      {/* Pricing cards */}
      <Section className="!pt-8">
        <div className="grid gap-6 md:grid-cols-3">
          {[...PRICING.plans]
            .sort((a, b) => a.order - b.order)
            .map((plan) => {
              const features = getTopFeaturesForPlan(plan.id, 7);
              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-2xl border-2 p-5 shadow-sm sm:p-8 sm:shadow-md ${
                    plan.badge ? "pt-10 sm:pt-12" : ""
                  } ${
                    plan.highlighted
                      ? "border-blue-500 bg-gradient-to-br from-white via-blue-50/50 to-blue-50/30 ring-2 ring-blue-500/20 sm:shadow-xl sm:shadow-blue-500/10"
                      : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg"
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <span className="whitespace-nowrap rounded-full bg-blue-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-md shadow-blue-500/25">
                        {plan.badge}
                      </span>
                    </div>
                  )}
                  <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-md shadow-blue-500/10">
                      <Image
                        src="/Favikon.svg"
                        alt="TeqBook"
                        width={20}
                        height={20}
                        className="h-5 w-5"
                      />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {plan.name}
                    </h3>
                  </div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-600">
                    {plan.bestFor}
                  </p>
                  <p className="mb-4 text-sm text-slate-600">
                    {plan.description}
                  </p>
                  <div className="mb-6">
                    <span className="text-3xl font-bold text-slate-900">
                      {plan.price}
                    </span>
                    <span className="text-sm text-slate-500">
                      {plan.period}
                    </span>
                  </div>
                  <ul className="mb-6 flex-1 space-y-2.5 text-sm">
                    {features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <Check
                          className={`mt-0.5 h-4 w-4 shrink-0 ${
                            plan.highlighted
                              ? "text-blue-600"
                              : "text-blue-500"
                          }`}
                        />
                        <span className="text-slate-700">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/signup"
                    className={`block min-h-12 w-full rounded-xl py-3.5 text-center text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 sm:text-sm ${
                      plan.highlighted
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    Start free trial
                  </Link>
                </div>
              );
            })}
        </div>

        {/* Trust / Risk-reversal strip */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {PRICING.trustSignals.map((signal) => {
            const Icon = TRUST_ICONS[signal.icon];
            return (
              <div
                key={signal.text}
                className="flex items-center gap-2 text-sm text-slate-500"
              >
                <Icon className="h-4 w-4 text-slate-400" />
                <span>{signal.text}</span>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Why salons choose Pro */}
      <Section className="bg-gradient-to-b from-white to-slate-50/50">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Why salons choose Pro
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Most salons start with Pro. Here&apos;s why.
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {PRICING.whyPro.map((item) => {
            const Icon = WHY_PRO_ICONS[item.icon];
            return (
              <div
                key={item.text}
                className="rounded-xl bg-white px-6 py-8 text-center shadow-sm"
              >
                <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-lg font-semibold text-slate-900">
                  {item.text}
                </p>
                <p className="mt-2 text-sm text-slate-500">{item.description}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Full comparison table */}
      <Section id="compare" className="bg-slate-50/50">
        <SectionHeader
          title="Full feature comparison"
          description="See exactly what's included in each plan."
        />
        <div className="mt-12">
          <ComparisonTable
            columns={columns}
            rows={rows}
            categories={categoryLabels}
            planMeta={planMeta}
          />
        </div>
      </Section>

      {/* Add-ons */}
      <Section>
        <SectionHeader
          title="Add-ons"
          description="Build the TeqBook setup that fits your salon."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {PRICING.addons.map((addon) => (
            <div
              key={addon.id}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold text-slate-900">
                  {addon.title}
                </h3>
                <span className="shrink-0 rounded-full bg-blue-50 px-3 py-0.5 text-xs font-medium text-blue-600">
                  {addon.recommendedWith}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{addon.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section>
        <CTASection
          title="Spend less time managing. More time with clients."
          description="TeqBook handles bookings, reminders and scheduling — so you don't have to."
          primaryLabel="Create your salon"
          primaryHref="/signup"
          secondaryLabel="Book a demo"
          secondaryHref="/#demo"
          trustLine="No credit card required."
        />
      </Section>
    </>
  );
}
