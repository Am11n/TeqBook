import type { AppLocale } from "../app-locale";
import type { AdminConsoleMessages } from "./locales/en";
import { enAdminConsole } from "./locales/en";
import { nbAdminConsole } from "./locales/nb";
import { soAdminConsole } from "./locales/so";
import { arAdminConsole } from "./locales/ar";
import { tiAdminConsole } from "./locales/ti";
import { amAdminConsole } from "./locales/am";
import { trAdminConsole } from "./locales/tr";
import { plAdminConsole } from "./locales/pl";
import { viAdminConsole } from "./locales/vi";
import { zhAdminConsole } from "./locales/zh";
import { tlAdminConsole } from "./locales/tl";
import { faAdminConsole } from "./locales/fa";
import { darAdminConsole } from "./locales/dar";
import { urAdminConsole } from "./locales/ur";
import { hiAdminConsole } from "./locales/hi";

export type { AdminConsoleMessages } from "./locales/en";

export const adminConsoleByLocale: Record<AppLocale, AdminConsoleMessages> = {
  nb: nbAdminConsole,
  en: enAdminConsole,
  so: soAdminConsole,
  ar: arAdminConsole,
  am: amAdminConsole,
  ti: tiAdminConsole,
  tr: trAdminConsole,
  pl: plAdminConsole,
  vi: viAdminConsole,
  zh: zhAdminConsole,
  tl: tlAdminConsole,
  fa: faAdminConsole,
  dar: darAdminConsole,
  ur: urAdminConsole,
  hi: hiAdminConsole,
};

export function getAdminConsoleMessages(locale: AppLocale): AdminConsoleMessages {
  return adminConsoleByLocale[locale] ?? adminConsoleByLocale.en;
}
