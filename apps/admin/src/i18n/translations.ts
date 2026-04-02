import type { AppLocale } from "./app-locale";
import type { TranslationNamespaces } from "./types/namespaces";

export type { AppLocale } from "./app-locale";
export { SOURCE_LOCALE, APP_LOCALES } from "./app-locale";
export type {
  TranslationNamespaces,
  PublicBookingMessages,
  LoginMessages,
  SignUpMessages,
  OnboardingMessages,
  DashboardMessages,
  HomeMessages,
  CalendarMessages,
  EmployeesMessages,
  ServicesMessages,
  CustomersMessages,
  BookingsMessages,
  ShiftsMessages,
  SettingsMessages,
  AdminMessages,
  ProductsMessages,
  NotificationsMessages,
} from "./types/namespaces";

import { nb } from "./bundles/nb";
import { en } from "./bundles/en";
import { so } from "./bundles/so";
import { ar } from "./bundles/ar";
import { ti } from "./bundles/ti";
import { am } from "./bundles/am";
import { tr } from "./bundles/tr";
import { pl } from "./bundles/pl";
import { vi } from "./bundles/vi";
import { zh } from "./bundles/zh";
import { tl } from "./bundles/tl";
import { fa } from "./bundles/fa";
import { dar } from "./bundles/dar";
import { ur } from "./bundles/ur";
import { hi } from "./bundles/hi";

export const translations: Record<AppLocale, TranslationNamespaces> = {
  nb,
  en,
  so,
  ar,
  am,
  ti,
  tr,
  pl,
  vi,
  zh,
  tl,
  fa,
  dar,
  ur,
  hi,
};
