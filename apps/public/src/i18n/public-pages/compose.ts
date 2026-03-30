import type { AppLocale, MarketingPageMessages } from "../translation-types";
import { copy as landingCopy } from "@/components/landing/landing-copy";
import { enBase, type PublicPageNamespaces } from "./en-base";
import { nbOverrides, arOverrides } from "./overrides/batch-a";
import { faOverrides, urOverrides } from "./overrides/batch-b";
import { soOverrides, tiOverrides, amOverrides } from "./overrides/batch-c";
import { trOverrides, plOverrides } from "./overrides/batch-d";
import { viOverrides, zhOverrides } from "./overrides/batch-e";
import { tlOverrides, darOverrides, hiOverrides } from "./overrides/batch-f";

function withOverrides(
  base: PublicPageNamespaces,
  overrides: Partial<PublicPageNamespaces>,
): PublicPageNamespaces {
  return {
    marketingNav: overrides.marketingNav ?? base.marketingNav,
    marketingFooter: overrides.marketingFooter ?? base.marketingFooter,
    marketingLayout: overrides.marketingLayout ?? base.marketingLayout,
    marketingPages: overrides.marketingPages ?? base.marketingPages,
    login2fa: overrides.login2fa ?? base.login2fa,
    adminLogin: overrides.adminLogin ?? base.adminLogin,
    bookingConfirmation: overrides.bookingConfirmation ?? base.bookingConfirmation,
    notFoundPage: overrides.notFoundPage ?? base.notFoundPage,
  };
}

function localizedPricing(locale: AppLocale): MarketingPageMessages["pricing"] {
  const landing = landingCopy[locale];
  return {
    ...enBase.marketingPages.pricing,
    heroTitle: landing.pricingTitle,
    heroDescription: landing.pricingSubtitle,
    heroBadge: landing.affordableSimple,
    addonsTitle: landing.addOnsTitle,
    addonsDescription: landing.addOnsDescription,
    startTrial: landing.startFreeTrial,
    ctaPrimary: landing.signUpButton,
    ctaSecondary: landing.ctaSecondary,
  };
}

function withLocalizedPricing(
  locale: AppLocale,
  overrides: Partial<PublicPageNamespaces>,
) {
  return withOverrides(enBase, {
    ...overrides,
    marketingPages: {
      ...(overrides.marketingPages ?? enBase.marketingPages),
      pricing: localizedPricing(locale),
    },
  });
}

export const publicPageTranslations: Record<AppLocale, PublicPageNamespaces> = {
  en: withLocalizedPricing("en", {}),
  nb: withLocalizedPricing("nb", nbOverrides),
  ar: withLocalizedPricing("ar", arOverrides),
  so: withLocalizedPricing("so", soOverrides),
  ti: withLocalizedPricing("ti", tiOverrides),
  am: withLocalizedPricing("am", amOverrides),
  tr: withLocalizedPricing("tr", trOverrides),
  pl: withLocalizedPricing("pl", plOverrides),
  vi: withLocalizedPricing("vi", viOverrides),
  zh: withLocalizedPricing("zh", zhOverrides),
  tl: withLocalizedPricing("tl", tlOverrides),
  fa: withLocalizedPricing("fa", faOverrides),
  dar: withLocalizedPricing("dar", darOverrides),
  ur: withLocalizedPricing("ur", urOverrides),
  hi: withLocalizedPricing("hi", hiOverrides),
};

export function getPublicPageTranslations(locale: AppLocale): PublicPageNamespaces {
  const value = publicPageTranslations[locale];
  if (!value) {
    throw new Error(`Missing public-page translations for locale "${locale}"`);
  }
  return value;
}

export type { PublicPageNamespaces };
