export type MarketingNavMessages = {
  pricing: string;
  security: string;
  contact: string;
  signup: string;
  login: string;
  language: string;
  openMenu: string;
  closeMenu: string;
  primaryNavAria: string;
  mobileNavAria: string;
};

export type MarketingFooterMessages = {
  pricing: string;
  security: string;
  contact: string;
  privacy: string;
  terms: string;
  tagline: string;
  navAria: string;
};

export type MarketingLayoutMessages = {
  startFree: string;
  contact: string;
};

export type MarketingPageMessages = {
  pricing: {
    title: string;
    description: string;
    heroTitle: string;
    heroDescription: string;
    heroBadge: string;
    whyProTitle: string;
    whyProDescription: string;
    fullComparisonTitle: string;
    fullComparisonDescription: string;
    addonsTitle: string;
    addonsDescription: string;
    ctaTitle: string;
    ctaDescription: string;
    ctaPrimary: string;
    ctaSecondary: string;
    trustLine: string;
    startTrial: string;
    feature: string;
    bestFor: string;
    teamSize: string;
  };
  contact: {
    title: string;
    description: string;
    supportBadge: string;
    intro: string;
    fullName: string;
    fullNamePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    message: string;
    messagePlaceholder: string;
    consent: string;
    sending: string;
    send: string;
    supportInfoTitle: string;
    supportInfoBody: string;
    office: string;
    phone: string;
    success: string;
    error: string;
    networkError: string;
  };
  security: {
    title: string;
    description: string;
    technicalOverviewTitle: string;
    technicalOverviewBody: string;
    yourDataTitle: string;
    yourDataBody: string;
    contactSupport: string;
  };
  privacy: {
    title: string;
    description: string;
    effectiveDate: string;
    contact: string;
  };
  terms: {
    title: string;
    description: string;
    effectiveDate: string;
    acceptance: string;
  };
};
