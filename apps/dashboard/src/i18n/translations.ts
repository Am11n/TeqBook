import type { TranslationNamespaces } from './types';

export type AppLocale =
  | "nb"
  | "en"
  | "ar"
  | "so"
  | "ti"
  | "am"
  | "tr"
  | "pl"
  | "vi"
  | "zh"
  | "tl"
  | "fa"
  | "dar"
  | "ur"
  | "hi";

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
  PersonallisteMessages,
  SettingsMessages,
  ProductsMessages,
  NotificationsMessages,
  FeatureGateMessages,
  RepoErrorsMessages,
} from './types';

import { nb } from './nb';
import { en } from './en';
import { so } from './so';
import { ar } from './ar';
import { ti } from './ti';
import { am } from './am';
import { tr } from './tr';
import { pl } from './pl';
import { vi } from './vi';
import { zh } from './zh';
import { tl } from './tl';
import { fa } from './fa';
import { dar } from './dar';
import { ur } from './ur';
import { hi } from './hi';

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
