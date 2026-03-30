import type { AppLocale } from "./translations";
import type { ContactPageCopy } from "./contact-page-copy-types";
import { contactPageCopyPart1 } from "./contact-page-copy-part1";
import { contactPageCopyPart2 } from "./contact-page-copy-part2";

export type { ContactPageCopy };

export const contactPageCopy: Record<AppLocale, ContactPageCopy> = {
  ...contactPageCopyPart1,
  ...contactPageCopyPart2,
};

export function getContactPageCopy(locale: AppLocale): ContactPageCopy {
  return contactPageCopy[locale] ?? contactPageCopy.en;
}
