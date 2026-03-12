"use client";

import Link from "next/link";
import Image from "next/image";
import { Check, Shield, CreditCard, X, Lock } from "lucide-react";
import { PRICING } from "@/content/marketing";
import { Section, SectionHeader } from "@/components/marketing/Section";
import {
  ComparisonTable,
  type ComparisonColumn,
  type ComparisonRow,
  type ComparisonMeta,
} from "@/components/marketing/ComparisonTable";
import { CTASection } from "@/components/marketing/CTASection";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { getPublicPageTranslations } from "@/i18n/public-pages";
import { copy as landingCopy } from "@/components/landing/landing-copy";
import { categoryMapsByLocale } from "@/i18n/pricing-locale-categories";
import { featureMapsByLocale } from "@/i18n/pricing-locale-features";
import {
  atCostByLocale,
  pricingUiOverrides,
  teamSizeByLocale,
  trustSignalsByLocale,
  unlimitedByLocale,
} from "@/i18n/pricing-locale-ui";

const TRUST_ICONS = {
  shield: Shield,
  card: CreditCard,
  x: X,
  lock: Lock,
} as const;

const columns: ComparisonColumn[] = [...PRICING.plans]
  .sort((a, b) => a.order - b.order)
  .map((plan) => ({
    id: plan.id,
    label: plan.name,
    highlighted: plan.highlighted,
  }));

const planMeta: ComparisonMeta[] = [...PRICING.plans]
  .sort((a, b) => a.order - b.order)
  .map((plan) => ({
    planId: plan.id,
    bestFor: plan.bestFor,
    teamSize: plan.teamSize,
  }));

const sortedCategories = [...PRICING.categories].sort((a, b) => a.order - b.order);
const rows: ComparisonRow[] = [...PRICING.features]
  .sort((a, b) => {
    const catA = PRICING.categories.find((c) => c.id === a.category)?.order ?? 99;
    const catB = PRICING.categories.find((c) => c.id === b.category)?.order ?? 99;
    return catA !== catB ? catA - catB : a.order - b.order;
  })
  .map((feature) => ({
    category: PRICING.categories.find((c) => c.id === feature.category)?.label ?? feature.category,
    feature: feature.label,
    values: { ...feature.values },
  }));

const categoryLabels = sortedCategories.map((c) => c.label);

export default function PricingPageClient() {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = getPublicPageTranslations(appLocale).marketingPages.pricing;
  const l = landingCopy[appLocale];
  const pricingUi = pricingUiOverrides[appLocale];
  const sortedTiers = [...l.tiers].sort((a, b) => {
    const order: Record<string, number> = { starter: 1, pro: 2, business: 3 };
    return (order[a.id] ?? 99) - (order[b.id] ?? 99);
  });
  const localizedColumns: ComparisonColumn[] = columns.map((col) => ({
    ...col,
    label: sortedTiers.find((tier) => tier.id === col.id)?.name ?? col.label,
  }));
  const localizedPlanMeta: ComparisonMeta[] = planMeta.map((meta) => ({
    planId: meta.planId,
    bestFor: sortedTiers.find((tier) => tier.id === meta.planId)?.description ?? meta.bestFor,
    teamSize: teamSizeByLocale[appLocale]?.[meta.planId] ?? meta.teamSize,
  }));
  const localeCategoryMap = categoryMapsByLocale[appLocale];
  const localeFeatureMap = featureMapsByLocale[appLocale];
  const localizedRows: ComparisonRow[] = rows.map((row) => ({
    ...row,
    category: localeCategoryMap?.[row.category] ?? row.category,
    feature: localeFeatureMap?.[row.feature] ?? row.feature,
    values: {
      ...row.values,
      starter:
        row.values.starter === "At cost"
          ? atCostByLocale[appLocale] ?? row.values.starter
          : row.values.starter === "Unlimited"
            ? unlimitedByLocale[appLocale] ?? row.values.starter
            : row.values.starter,
      pro:
        row.values.pro === "Unlimited"
          ? unlimitedByLocale[appLocale] ?? row.values.pro
          : row.values.pro,
      business:
        row.values.business === "Unlimited"
          ? unlimitedByLocale[appLocale] ?? row.values.business
          : row.values.business,
    },
  }));
  const localizedCategoryLabels = categoryLabels.map(
    (category) => localeCategoryMap?.[category] ?? category,
  );
  const trustSignals = trustSignalsByLocale[appLocale];

  return (
    <>
      <Section className="bg-gradient-to-b from-slate-50 via-blue-50/30 to-white pb-0 sm:pb-0">
        <SectionHeader
          title={t.heroTitle}
          description={t.heroDescription}
          badge={t.heroBadge}
        />
      </Section>

      <Section className="!pt-8">
        <div className="grid gap-6 md:grid-cols-3">
          {sortedTiers.map((plan) => {
              const features = plan.features.slice(0, 7);
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
                    <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
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
                    <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                  </div>
                  {plan.badge ? (
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-600">
                      {plan.badge}
                    </p>
                  ) : null}
                  <p className="mb-4 text-sm text-slate-600">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                  </div>
                  <ul className="mb-6 flex-1 space-y-2.5 text-sm">
                    {features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <Check
                          className={`mt-0.5 h-4 w-4 shrink-0 ${
                            plan.highlighted ? "text-blue-600" : "text-blue-500"
                          }`}
                        />
                        <span className="text-slate-700">{feature}</span>
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
                    {t.startTrial}
                  </Link>
                </div>
              );
            })}
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {PRICING.trustSignals.map((signal, index) => {
            const Icon = TRUST_ICONS[signal.icon];
            return (
              <div key={signal.text} className="flex items-center gap-2 text-sm text-slate-500">
                <Icon className="h-4 w-4 text-slate-400" />
                <span>{trustSignals?.[index] ?? signal.text}</span>
              </div>
            );
          })}
        </div>

      </Section>

      <Section className="bg-gradient-to-b from-white to-slate-50/50">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {pricingUi?.whyProTitle ?? t.whyProTitle}
          </h2>
          <p className="mt-3 text-base text-slate-600">
            {pricingUi?.whyProDescription ?? t.whyProDescription}
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {l.stats.map((item) => {
            return (
              <div key={item.title} className="rounded-xl bg-white px-6 py-8 text-center shadow-sm">
                <p className="text-lg font-semibold text-slate-900">{item.title}</p>
                <p className="mt-2 text-sm text-slate-500">{item.body}</p>
              </div>
            );
          })}
        </div>
      </Section>

      <Section id="compare" className="bg-slate-50/50">
        <SectionHeader
          title={pricingUi?.fullComparisonTitle ?? t.fullComparisonTitle}
          description={pricingUi?.fullComparisonDescription ?? t.fullComparisonDescription}
        />
        <div className="mt-12">
          <ComparisonTable
            columns={localizedColumns}
            rows={localizedRows}
            categories={localizedCategoryLabels}
            planMeta={localizedPlanMeta}
            labels={{
              feature: pricingUi?.feature ?? t.feature,
              bestFor: pricingUi?.bestFor ?? t.bestFor,
              teamSize: pricingUi?.teamSize ?? t.teamSize,
              featureCountOne:
                pricingUi?.featureCountOne ?? (pricingUi?.feature ?? t.feature).toLowerCase(),
              featureCountMany:
                pricingUi?.featureCountMany ?? `${(pricingUi?.feature ?? t.feature).toLowerCase()}s`,
            }}
          />
        </div>
      </Section>

      <Section>
        <SectionHeader title={t.addonsTitle} description={t.addonsDescription} />
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {[
            {
              id: "multilingual-booking",
              title: l.multilingualBookingTitle,
              description: l.multilingualBookingDescription,
              recommendedWith: l.tiers[1]?.name ?? "Pro",
            },
            {
              id: "extra-staff",
              title: l.extraStaffTitle,
              description: l.extraStaffDescription,
              recommendedWith: l.tiers[2]?.name ?? "Business",
            },
          ].map((addon) => (
            <div
              key={addon.id}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold text-slate-900">{addon.title}</h3>
                <span className="shrink-0 rounded-full bg-blue-50 px-3 py-0.5 text-xs font-medium text-blue-600">
                  {addon.recommendedWith}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{addon.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <CTASection
          title={pricingUi?.ctaTitle ?? t.ctaTitle}
          description={pricingUi?.ctaDescription ?? t.ctaDescription}
          primaryLabel={t.ctaPrimary}
          primaryHref="/signup"
          secondaryLabel={t.ctaSecondary}
          secondaryHref="/#demo"
          trustLine={pricingUi?.trustLine ?? t.trustLine}
        />
      </Section>
    </>
  );
}
