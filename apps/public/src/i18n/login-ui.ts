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
  ar: {
    confirmedBanner: "Your signup is confirmed. Welcome to TeqBook - you can log in now.",
    passwordResetBanner: "Your password has been reset successfully. You can log in now.",
  },
  so: {
    confirmedBanner: "Your signup is confirmed. Welcome to TeqBook - you can log in now.",
    passwordResetBanner: "Your password has been reset successfully. You can log in now.",
  },
  ti: {
    confirmedBanner: "Your signup is confirmed. Welcome to TeqBook - you can log in now.",
    passwordResetBanner: "Your password has been reset successfully. You can log in now.",
  },
  am: {
    confirmedBanner: "Your signup is confirmed. Welcome to TeqBook - you can log in now.",
    passwordResetBanner: "Your password has been reset successfully. You can log in now.",
  },
  tr: {
    confirmedBanner: "Your signup is confirmed. Welcome to TeqBook - you can log in now.",
    passwordResetBanner: "Your password has been reset successfully. You can log in now.",
  },
  pl: {
    confirmedBanner: "Your signup is confirmed. Welcome to TeqBook - you can log in now.",
    passwordResetBanner: "Your password has been reset successfully. You can log in now.",
  },
  vi: {
    confirmedBanner: "Your signup is confirmed. Welcome to TeqBook - you can log in now.",
    passwordResetBanner: "Your password has been reset successfully. You can log in now.",
  },
  zh: {
    confirmedBanner: "Your signup is confirmed. Welcome to TeqBook - you can log in now.",
    passwordResetBanner: "Your password has been reset successfully. You can log in now.",
  },
  tl: {
    confirmedBanner: "Your signup is confirmed. Welcome to TeqBook - you can log in now.",
    passwordResetBanner: "Your password has been reset successfully. You can log in now.",
  },
  fa: {
    confirmedBanner: "Your signup is confirmed. Welcome to TeqBook - you can log in now.",
    passwordResetBanner: "Your password has been reset successfully. You can log in now.",
  },
  dar: {
    confirmedBanner: "Your signup is confirmed. Welcome to TeqBook - you can log in now.",
    passwordResetBanner: "Your password has been reset successfully. You can log in now.",
  },
  ur: {
    confirmedBanner: "Your signup is confirmed. Welcome to TeqBook - you can log in now.",
    passwordResetBanner: "Your password has been reset successfully. You can log in now.",
  },
  hi: {
    confirmedBanner: "Your signup is confirmed. Welcome to TeqBook - you can log in now.",
    passwordResetBanner: "Your password has been reset successfully. You can log in now.",
  },
};
