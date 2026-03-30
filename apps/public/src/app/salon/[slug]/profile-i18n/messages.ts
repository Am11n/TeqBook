import type { AppLocale } from "@/i18n/translations";
import { EN_PROFILE_PAGE_MESSAGES } from "./profile-en";
import { formatProfileLanguageLabel } from "./profile-language-format";
import { PROFILE_PAGE_LOCALES_A } from "./profile-locales-a";
import { PROFILE_PAGE_LOCALES_B } from "./profile-locales-b";
import { PROFILE_PAGE_LOCALES_C } from "./profile-locales-c";
import { PROFILE_PAGE_LOCALES_D } from "./profile-locales-d";
import { PROFILE_PAGE_LOCALES_E } from "./profile-locales-e";
import type { ProfilePageMessages } from "./profile-page-types";

export { PROFILE_TEAM_DIALOG_MESSAGES } from "./team-dialog-messages";
export type { ProfilePageMessages } from "./profile-page-types";
export { formatProfileLanguageLabel };
export { getLocaleTag, getLocalizedWeekdays } from "./profile-page-types";

const PROFILE_PAGE_MESSAGES: Record<AppLocale, ProfilePageMessages> = {
  en: EN_PROFILE_PAGE_MESSAGES,
  ...PROFILE_PAGE_LOCALES_A,
  ...PROFILE_PAGE_LOCALES_B,
  ...PROFILE_PAGE_LOCALES_C,
  ...PROFILE_PAGE_LOCALES_D,
  ...PROFILE_PAGE_LOCALES_E,
};

export function getProfilePageMessages(locale: AppLocale): ProfilePageMessages {
  return PROFILE_PAGE_MESSAGES[locale] || PROFILE_PAGE_MESSAGES.en;
}
