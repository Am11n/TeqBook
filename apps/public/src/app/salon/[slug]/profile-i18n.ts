import type { AppLocale } from "@/i18n/translations";

const LANGUAGE_LABELS: Record<string, string> = {
  nb: "Norwegian",
  no: "Norwegian",
  en: "English",
  ar: "Arabic",
  so: "Somali",
  tr: "Turkish",
  ti: "Tigrinya",
  am: "Amharic",
  pl: "Polish",
  vi: "Vietnamese",
  zh: "Chinese",
  tl: "Tagalog",
  fa: "Persian",
  dar: "Dari",
  ur: "Urdu",
  hi: "Hindi",
};

export const PROFILE_TEAM_DIALOG_MESSAGES: Record<
  AppLocale,
  {
    about: string;
    services: string;
    teamMember: string;
    specialties: string;
    languages: string;
    servicesEmpty: string;
    bookWith: string;
    closeDialog: string;
    bioFallback: string;
  }
> = {
  en: {
    about: "About",
    services: "Services",
    teamMember: "Team member",
    specialties: "Specialties",
    languages: "Languages",
    servicesEmpty: "Services will be shown here.",
    bookWith: "Book with",
    closeDialog: "Close dialog",
    bioFallback: "helps customers with modern cuts and grooming.",
  },
  nb: {
    about: "Om",
    services: "Tjenester",
    teamMember: "Ansatt",
    specialties: "Spesialiteter",
    languages: "Sprak",
    servicesEmpty: "Tjenester vises her.",
    bookWith: "Book med",
    closeDialog: "Lukk dialog",
    bioFallback: "hjelper kunder med moderne klipp og grooming.",
  },
  ar: {
    about: "نبذة",
    services: "الخدمات",
    teamMember: "عضو الفريق",
    specialties: "التخصصات",
    languages: "اللغات",
    servicesEmpty: "ستظهر الخدمات هنا.",
    bookWith: "احجز مع",
    closeDialog: "إغلاق النافذة",
    bioFallback: "يساعد العملاء في القصات الحديثة والعناية.",
  },
  so: {
    about: "Ku saabsan",
    services: "Adeegyada",
    teamMember: "Xubin kooxda",
    specialties: "Takhasusyada",
    languages: "Luuqadaha",
    servicesEmpty: "Adeegyada halkan ayay kasoo muuqan doonaan.",
    bookWith: "La ballan",
    closeDialog: "Xir daaqadda",
    bioFallback: "wuxuu ka caawiyaa macaamiisha timo-jaris casri ah iyo qurxin.",
  },
  ti: {
    about: "ብዛዕባ",
    services: "ኣገልግሎታት",
    teamMember: "ኣባል ጉጅለ",
    specialties: "ልምድታት",
    languages: "ቋንቋታት",
    servicesEmpty: "ኣገልግሎታት ኣብዚ ይርከቡ።",
    bookWith: "ምስ ዝነበረ ምዝገባ",
    closeDialog: "መስኮት ዕጸው",
    bioFallback: "ንደንበኛታት ዘመናዊ ቁረጽን ምርባሕን ይሕግዝ።",
  },
  am: {
    about: "ስለ",
    services: "አገልግሎቶች",
    teamMember: "የቡድን አባል",
    specialties: "ልዩ ችሎታዎች",
    languages: "ቋንቋዎች",
    servicesEmpty: "አገልግሎቶች እዚህ ይታያሉ።",
    bookWith: "ከ",
    closeDialog: "መስኮቱን ዝጋ",
    bioFallback: "ደንበኞችን በዘመናዊ ቁርጠት እና እንክብካቤ ያግዛል።",
  },
  tr: {
    about: "Hakkinda",
    services: "Hizmetler",
    teamMember: "Ekip uyesi",
    specialties: "Uzmanliklar",
    languages: "Diller",
    servicesEmpty: "Hizmetler burada gosterilecek.",
    bookWith: "Sununla randevu al",
    closeDialog: "Pencereyi kapat",
    bioFallback: "musterilere modern kesim ve bakimda yardimci olur.",
  },
  pl: {
    about: "O mnie",
    services: "Uslugi",
    teamMember: "Czlonek zespolu",
    specialties: "Specjalizacje",
    languages: "Jezyki",
    servicesEmpty: "Uslugi beda pokazane tutaj.",
    bookWith: "Rezerwuj z",
    closeDialog: "Zamknij okno",
    bioFallback: "pomaga klientom w nowoczesnych strzyzeniach i pielegnacji.",
  },
  vi: {
    about: "Gioi thieu",
    services: "Dich vu",
    teamMember: "Thanh vien",
    specialties: "Chuyen mon",
    languages: "Ngon ngu",
    servicesEmpty: "Dich vu se hien thi o day.",
    bookWith: "Dat voi",
    closeDialog: "Dong hop thoai",
    bioFallback: "ho tro khach hang voi kieu cat hien dai va cham soc.",
  },
  zh: {
    about: "关于",
    services: "服务",
    teamMember: "团队成员",
    specialties: "擅长",
    languages: "语言",
    servicesEmpty: "服务将显示在这里。",
    bookWith: "与其预约",
    closeDialog: "关闭对话框",
    bioFallback: "帮助客户完成现代剪发与护理。",
  },
  tl: {
    about: "Tungkol",
    services: "Mga serbisyo",
    teamMember: "Miyembro ng team",
    specialties: "Espesyalidad",
    languages: "Mga wika",
    servicesEmpty: "Ipapakita dito ang mga serbisyo.",
    bookWith: "Mag-book kay",
    closeDialog: "Isara ang dialog",
    bioFallback: "tumutulong sa mga customer sa modernong gupit at grooming.",
  },
  fa: {
    about: "درباره",
    services: "خدمات",
    teamMember: "عضو تیم",
    specialties: "تخصص‌ها",
    languages: "زبان‌ها",
    servicesEmpty: "خدمات اینجا نمایش داده می‌شوند.",
    bookWith: "رزرو با",
    closeDialog: "بستن پنجره",
    bioFallback: "به مشتریان در اصلاح مدرن و آراستگی کمک می‌کند.",
  },
  dar: {
    about: "درباره",
    services: "خدمات",
    teamMember: "عضو تیم",
    specialties: "تخصص‌ها",
    languages: "زبان‌ها",
    servicesEmpty: "خدمات اینجا نشان داده می‌شود.",
    bookWith: "رزرو با",
    closeDialog: "بستن پنجره",
    bioFallback: "به مشتریان در اصلاح مدرن و آراستگی کمک می‌کند.",
  },
  ur: {
    about: "تعارف",
    services: "خدمات",
    teamMember: "ٹیم ممبر",
    specialties: "مہارتیں",
    languages: "زبانیں",
    servicesEmpty: "خدمات یہاں دکھائی جائیں گی۔",
    bookWith: "کے ساتھ بک کریں",
    closeDialog: "ڈائیلاگ بند کریں",
    bioFallback: "صارفین کو جدید ہیئر کٹ اور گرومنگ میں مدد کرتا ہے۔",
  },
  hi: {
    about: "परिचय",
    services: "सेवाएं",
    teamMember: "टीम सदस्य",
    specialties: "विशेषताएं",
    languages: "भाषाएं",
    servicesEmpty: "सेवाएं यहां दिखाई जाएंगी।",
    bookWith: "के साथ बुक करें",
    closeDialog: "डायलॉग बंद करें",
    bioFallback: "ग्राहकों को आधुनिक हेयरकट और ग्रूमिंग में मदद करता है।",
  },
};

export function formatProfileLanguageLabel(codeOrName: string, locale: AppLocale): string {
  const value = codeOrName.trim();
  if (!value) return "Language";
  const normalized = value.toLowerCase();
  try {
    const displayLocale = locale === "nb" ? "nb-NO" : locale;
    const names = new Intl.DisplayNames([displayLocale], { type: "language" });
    const translated = names.of(normalized);
    if (translated && translated.toLowerCase() !== normalized) return translated;
  } catch {
    // Fall back to static labels.
  }
  return LANGUAGE_LABELS[normalized] || value;
}
