export type LanguageCode =
  | "nb" | "en" | "ar" | "so" | "ti" | "am" | "tr"
  | "pl" | "vi" | "tl" | "zh" | "fa" | "dar" | "ur" | "hi";

export const LANGUAGE_FLAGS: Record<LanguageCode, string> = {
  nb: "\u{1F1F3}\u{1F1F4}",
  en: "\u{1F1EC}\u{1F1E7}",
  ar: "\u{1F1F8}\u{1F1E6}",
  so: "\u{1F1F8}\u{1F1F4}",
  ti: "\u{1F1EA}\u{1F1F7}",
  am: "\u{1F1EA}\u{1F1F9}",
  tr: "\u{1F1F9}\u{1F1F7}",
  pl: "\u{1F1F5}\u{1F1F1}",
  vi: "\u{1F1FB}\u{1F1F3}",
  tl: "\u{1F1F5}\u{1F1ED}",
  zh: "\u{1F1E8}\u{1F1F3}",
  fa: "\u{1F1EE}\u{1F1F7}",
  dar: "\u{1F1E6}\u{1F1EB}",
  ur: "\u{1F1F5}\u{1F1F0}",
  hi: "\u{1F1EE}\u{1F1F3}",
};

export const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  nb: "Norsk",
  en: "English",
  ar: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629",
  so: "Soomaali",
  ti: "\u1275\u130D\u122D\u129B",
  am: "\u12A0\u121B\u122D\u129B",
  tr: "T\u00FCrk\u00E7e",
  pl: "Polski",
  vi: "Ti\u1EBFng Vi\u1EC7t",
  tl: "Tagalog",
  zh: "\u4E2D\u6587",
  fa: "\u0641\u0627\u0631\u0633\u06CC",
  dar: "\u062F\u0631\u06CC",
  ur: "\u0627\u0631\u062F\u0648",
  hi: "\u0939\u093F\u0928\u094D\u0926\u0940",
};
