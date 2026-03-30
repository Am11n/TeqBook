import type { AppLocale } from "@/i18n/translations";

export type ProfilePageMessages = {
  bookAppointment: string;
  bookingPreviewUnavailable: string;
  shareProfileAria: string;
  payInSalon: string;
  reviewsWord: string;
  openNow: string;
  closedNow: string;
  closesLabel: string;
  closesAtLabel: string;
  hoursMayVary: string;
  linkCopied: string;
  copyFailed: string;
  shareText: string;
  servicesHeading: string;
  durationOnRequest: string;
  minuteShort: string;
  book: string;
  seeAllServices: string;
  teamHeading: string;
  openProfileFor: string;
  teamMember: string;
  teamBioFallback: string;
  defaultSpecialty1: string;
  defaultSpecialty2: string;
  viewProfile: string;
  aboutHeading: string;
  openPrefix: string;
  visitHeading: string;
  openLocationInMaps: string;
  mapPreviewFor: string;
  openingHoursHeading: string;
  dayFallback: string;
  closedDay: string;
  portfolioHeading: string;
  portfolioAlt: string;
  reviewsHeading: string;
  socialInstagram: string;
  socialFacebook: string;
  socialTwitter: string;
  socialTiktok: string;
  socialWebsite: string;
};

const LOCALE_TAGS: Record<AppLocale, string> = {
  en: "en",
  nb: "nb-NO",
  ar: "ar",
  so: "so",
  ti: "ti-ER",
  am: "am-ET",
  tr: "tr-TR",
  pl: "pl-PL",
  vi: "vi-VN",
  zh: "zh-CN",
  tl: "fil-PH",
  fa: "fa-IR",
  dar: "fa-AF",
  ur: "ur-PK",
  hi: "hi-IN",
};

export function getLocaleTag(locale: AppLocale): string {
  return LOCALE_TAGS[locale] || "en";
}

export function getLocalizedWeekdays(locale: AppLocale): string[] {
  const tag = getLocaleTag(locale);
  const mondayUtc = new Date(Date.UTC(2024, 0, 1));
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(mondayUtc);
    date.setUTCDate(mondayUtc.getUTCDate() + index);
    return new Intl.DateTimeFormat(tag, { weekday: "short" }).format(date);
  });
}
