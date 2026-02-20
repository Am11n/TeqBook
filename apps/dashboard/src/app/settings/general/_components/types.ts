export type GeneralFormValues = {
  salonName: string;
  salonType: string;
  whatsappNumber: string;
  currency: string;
  timezone: string;
  supportedLanguages: string[];
  defaultLanguage: string;
  userPreferredLanguage: string;
  businessAddress: string;
  orgNumber: string;
  cancellationHours: number;
  defaultBufferMinutes: number;
};

export const ALL_LANGUAGES = [
  { code: "nb", label: "Norsk", flag: "\u{1F1F3}\u{1F1F4}" },
  { code: "en", label: "English", flag: "\u{1F1EC}\u{1F1E7}" },
  { code: "ar", label: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629", flag: "\u{1F1F8}\u{1F1E6}" },
  { code: "so", label: "Soomaali", flag: "\u{1F1F8}\u{1F1F4}" },
  { code: "tr", label: "T\u00FCrk\u00E7e", flag: "\u{1F1F9}\u{1F1F7}" },
  { code: "ti", label: "\u1275\u130D\u122D\u129B", flag: "\u{1F1EA}\u{1F1F7}" },
  { code: "am", label: "\u12A0\u121B\u122D\u129B", flag: "\u{1F1EA}\u{1F1F9}" },
  { code: "pl", label: "Polski", flag: "\u{1F1F5}\u{1F1F1}" },
  { code: "vi", label: "Ti\u1EBFng Vi\u1EC7t", flag: "\u{1F1FB}\u{1F1F3}" },
  { code: "zh", label: "\u4E2D\u6587", flag: "\u{1F1E8}\u{1F1F3}" },
  { code: "tl", label: "Tagalog", flag: "\u{1F1F5}\u{1F1ED}" },
  { code: "fa", label: "\u0641\u0627\u0631\u0633\u06CC", flag: "\u{1F1EE}\u{1F1F7}" },
  { code: "dar", label: "\u062F\u0631\u06CC (Dari)", flag: "\u{1F1E6}\u{1F1EB}" },
  { code: "ur", label: "\u0627\u0631\u062F\u0648", flag: "\u{1F1F5}\u{1F1F0}" },
  { code: "hi", label: "\u0939\u093F\u0928\u094D\u0926\u0940", flag: "\u{1F1EE}\u{1F1F3}" },
] as const;

export const RECOMMENDED_CODES = ["nb", "en", "ar", "so", "tr"];

export function langLabelFn(code: string): string {
  const lang = ALL_LANGUAGES.find((l) => l.code === code);
  return lang ? `${lang.flag} ${lang.label}` : code;
}
