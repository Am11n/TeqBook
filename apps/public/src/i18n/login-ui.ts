import type { AppLocale } from "./translations";

export type LoginUiMessages = {
  confirmedBanner: string;
  passwordResetBanner: string;
};

const en: LoginUiMessages = {
  confirmedBanner: "Your signup is confirmed. Welcome to TeqBook - you can log in now.",
  passwordResetBanner: "Your password has been reset successfully. You can log in now.",
};

export const loginUiByLocale: Record<AppLocale, LoginUiMessages> = {
  en,
  nb: {
    confirmedBanner: "Du har bekreftet sign up. Velkommen til TeqBook - du kan logge inn nå.",
    passwordResetBanner: "Passordet ditt er oppdatert. Du kan logge inn nå.",
  },
  ar: en,
  so: en,
  ti: en,
  am: en,
  tr: en,
  pl: en,
  vi: en,
  zh: en,
  tl: en,
  fa: en,
  dar: en,
  ur: en,
  hi: en,
};
