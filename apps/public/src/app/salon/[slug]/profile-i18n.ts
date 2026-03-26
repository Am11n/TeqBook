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

export type ProfilePageMessages = {
  bookAppointment: string;
  shareProfileAria: string;
  payInSalon: string;
  reviewsWord: string;
  openNow: string;
  closedNow: string;
  closesLabel: string;
  closesAtLabel: string;
  hoursMayVary: string;
  linkCopied: string;
  copyFailed: string;
  shareText: string;
  servicesHeading: string;
  durationOnRequest: string;
  minuteShort: string;
  book: string;
  seeAllServices: string;
  teamHeading: string;
  openProfileFor: string;
  teamMember: string;
  teamBioFallback: string;
  defaultSpecialty1: string;
  defaultSpecialty2: string;
  viewProfile: string;
  aboutHeading: string;
  openPrefix: string;
  visitHeading: string;
  openLocationInMaps: string;
  mapPreviewFor: string;
  openingHoursHeading: string;
  dayFallback: string;
  closedDay: string;
  portfolioHeading: string;
  portfolioAlt: string;
  reviewsHeading: string;
};

const EN_PROFILE_PAGE_MESSAGES: ProfilePageMessages = {
  bookAppointment: "Book appointment",
  shareProfileAria: "Share profile",
  payInSalon: "Pay in salon",
  reviewsWord: "reviews",
  openNow: "Open now",
  closedNow: "Closed now",
  closesLabel: "Closes",
  closesAtLabel: "Closes at",
  hoursMayVary: "Hours may vary",
  linkCopied: "Link copied",
  copyFailed: "Copy failed",
  shareText: "Book your next appointment at",
  servicesHeading: "Services",
  durationOnRequest: "Duration on request",
  minuteShort: "min",
  book: "Book",
  seeAllServices: "See all services",
  teamHeading: "Team",
  openProfileFor: "Open profile for",
  teamMember: "Team member",
  teamBioFallback: "Experienced barber focused on precision cuts and clean grooming.",
  defaultSpecialty1: "Haircut",
  defaultSpecialty2: "Grooming",
  viewProfile: "View profile",
  aboutHeading: "About",
  openPrefix: "Open",
  visitHeading: "Visit",
  openLocationInMaps: "Open location in Google Maps",
  mapPreviewFor: "Map preview for",
  openingHoursHeading: "Opening hours",
  dayFallback: "Day",
  closedDay: "Closed",
  portfolioHeading: "Portfolio",
  portfolioAlt: "Portfolio",
  reviewsHeading: "Reviews",
};

const PROFILE_PAGE_MESSAGES: Record<AppLocale, ProfilePageMessages> = {
  en: EN_PROFILE_PAGE_MESSAGES,
  nb: {
    bookAppointment: "Bestill time",
    shareProfileAria: "Del profil",
    payInSalon: "Betal i salong",
    reviewsWord: "anmeldelser",
    openNow: "Åpen nå",
    closedNow: "Stengt nå",
    closesLabel: "Stenger",
    closesAtLabel: "Stenger kl.",
    hoursMayVary: "Åpningstider kan variere",
    linkCopied: "Lenke kopiert",
    copyFailed: "Kopiering feilet",
    shareText: "Bestill din neste time hos",
    servicesHeading: "Tjenester",
    durationOnRequest: "Varighet ved forespørsel",
    minuteShort: "min",
    book: "Bestill",
    seeAllServices: "Se alle tjenester",
    teamHeading: "Team",
    openProfileFor: "Åpne profil for",
    teamMember: "Ansatt",
    teamBioFallback: "Erfaren frisør med fokus på presisjon og grooming.",
    defaultSpecialty1: "Hår",
    defaultSpecialty2: "Grooming",
    viewProfile: "Se profil",
    aboutHeading: "Om",
    openPrefix: "Åpne",
    visitHeading: "Besøk",
    openLocationInMaps: "Åpne lokasjon i Google Maps",
    mapPreviewFor: "Kartforhåndsvisning for",
    openingHoursHeading: "Åpningstider",
    dayFallback: "Dag",
    closedDay: "Stengt",
    portfolioHeading: "Portefølje",
    portfolioAlt: "Portefølje",
    reviewsHeading: "Anmeldelser",
  },
  ar: {
    bookAppointment: "احجز موعد",
    shareProfileAria: "مشاركة الملف",
    payInSalon: "الدفع في الصالون",
    reviewsWord: "تقييمات",
    openNow: "مفتوح الآن",
    closedNow: "مغلق الآن",
    closesLabel: "يغلق",
    closesAtLabel: "يغلق عند",
    hoursMayVary: "قد تختلف ساعات العمل",
    linkCopied: "تم نسخ الرابط",
    copyFailed: "فشل النسخ",
    shareText: "احجز موعدك القادم لدى",
    servicesHeading: "الخدمات",
    durationOnRequest: "المدة عند الطلب",
    minuteShort: "د",
    book: "احجز",
    seeAllServices: "عرض كل الخدمات",
    teamHeading: "الفريق",
    openProfileFor: "فتح ملف",
    teamMember: "عضو الفريق",
    teamBioFallback: "خبير يركز على القصات الدقيقة والعناية.",
    defaultSpecialty1: "قص الشعر",
    defaultSpecialty2: "العناية",
    viewProfile: "عرض الملف",
    aboutHeading: "نبذة",
    openPrefix: "فتح",
    visitHeading: "الزيارة",
    openLocationInMaps: "فتح الموقع في خرائط Google",
    mapPreviewFor: "معاينة الخريطة لـ",
    openingHoursHeading: "ساعات العمل",
    dayFallback: "اليوم",
    closedDay: "مغلق",
    portfolioHeading: "الأعمال",
    portfolioAlt: "الأعمال",
    reviewsHeading: "التقييمات",
  },
  so: { ...EN_PROFILE_PAGE_MESSAGES, bookAppointment: "Qabso waqti", shareProfileAria: "La wadaag profile", servicesHeading: "Adeegyada", teamHeading: "Kooxda", aboutHeading: "Ku saabsan", visitHeading: "Booqo", openingHoursHeading: "Saacadaha furitaanka", reviewsHeading: "Faallooyin" },
  ti: { ...EN_PROFILE_PAGE_MESSAGES, bookAppointment: "ቆጸራ ሓዝ", servicesHeading: "ኣገልግሎታት", teamHeading: "ጉጅለ", aboutHeading: "ብዛዕባ", visitHeading: "ብጻሕ", openingHoursHeading: "ሰዓታት ስራሕ", reviewsHeading: "ግምገማት" },
  am: { ...EN_PROFILE_PAGE_MESSAGES, bookAppointment: "ቀጠሮ ያዝ", servicesHeading: "አገልግሎቶች", teamHeading: "ቡድን", aboutHeading: "ስለ", visitHeading: "ጉብኝት", openingHoursHeading: "የስራ ሰዓት", reviewsHeading: "ግምገማዎች" },
  tr: { ...EN_PROFILE_PAGE_MESSAGES, bookAppointment: "Randevu al", shareProfileAria: "Profili paylas", payInSalon: "Salonda odeme", reviewsWord: "yorum", servicesHeading: "Hizmetler", teamHeading: "Ekip", aboutHeading: "Hakkinda", visitHeading: "Konum", openingHoursHeading: "Calisma saatleri", reviewsHeading: "Yorumlar" },
  pl: { ...EN_PROFILE_PAGE_MESSAGES, bookAppointment: "Umow wizyte", shareProfileAria: "Udostepnij profil", payInSalon: "Platnosc w salonie", reviewsWord: "opinie", servicesHeading: "Uslugi", teamHeading: "Zespol", aboutHeading: "O nas", visitHeading: "Wizyta", openingHoursHeading: "Godziny otwarcia", reviewsHeading: "Opinie" },
  vi: { ...EN_PROFILE_PAGE_MESSAGES, bookAppointment: "Dat lich", shareProfileAria: "Chia se ho so", payInSalon: "Thanh toan tai salon", reviewsWord: "danh gia", servicesHeading: "Dich vu", teamHeading: "Doi ngu", aboutHeading: "Gioi thieu", visitHeading: "Dia diem", openingHoursHeading: "Gio mo cua", reviewsHeading: "Danh gia" },
  zh: { ...EN_PROFILE_PAGE_MESSAGES, bookAppointment: "预约", shareProfileAria: "分享主页", payInSalon: "到店支付", reviewsWord: "评价", servicesHeading: "服务", teamHeading: "团队", aboutHeading: "关于", visitHeading: "到店信息", openingHoursHeading: "营业时间", reviewsHeading: "评价" },
  tl: { ...EN_PROFILE_PAGE_MESSAGES, bookAppointment: "Mag-book", shareProfileAria: "I-share ang profile", payInSalon: "Bayad sa salon", reviewsWord: "reviews", servicesHeading: "Mga serbisyo", teamHeading: "Team", aboutHeading: "Tungkol", visitHeading: "Bisitahin", openingHoursHeading: "Oras ng bukas", reviewsHeading: "Mga review" },
  fa: { ...EN_PROFILE_PAGE_MESSAGES, bookAppointment: "رزرو نوبت", shareProfileAria: "اشتراک پروفایل", payInSalon: "پرداخت در سالن", reviewsWord: "نظرات", servicesHeading: "خدمات", teamHeading: "تیم", aboutHeading: "درباره", visitHeading: "مراجعه", openingHoursHeading: "ساعات کاری", reviewsHeading: "نظرات" },
  dar: { ...EN_PROFILE_PAGE_MESSAGES, bookAppointment: "رزرو نوبت", shareProfileAria: "اشتراک پروفایل", payInSalon: "پرداخت در سالن", reviewsWord: "نظرات", servicesHeading: "خدمات", teamHeading: "تیم", aboutHeading: "درباره", visitHeading: "مراجعه", openingHoursHeading: "ساعات کاری", reviewsHeading: "نظرات" },
  ur: { ...EN_PROFILE_PAGE_MESSAGES, bookAppointment: "وقت بک کریں", shareProfileAria: "پروفائل شئیر کریں", payInSalon: "ادائیگی سیلون میں", reviewsWord: "ریویوز", servicesHeading: "سروسز", teamHeading: "ٹیم", aboutHeading: "تعارف", visitHeading: "وزٹ", openingHoursHeading: "اوقات کار", reviewsHeading: "ریویوز" },
  hi: { ...EN_PROFILE_PAGE_MESSAGES, bookAppointment: "अपॉइंटमेंट बुक करें", shareProfileAria: "प्रोफाइल शेयर करें", payInSalon: "सैलून में भुगतान", reviewsWord: "रिव्यू", servicesHeading: "सेवाएं", teamHeading: "टीम", aboutHeading: "परिचय", visitHeading: "विजिट", openingHoursHeading: "खुलने का समय", reviewsHeading: "रिव्यू" },
};

const LOCALE_TAGS: Record<AppLocale, string> = {
  en: "en",
  nb: "nb-NO",
  ar: "ar",
  so: "so",
  ti: "ti-ER",
  am: "am-ET",
  tr: "tr-TR",
  pl: "pl-PL",
  vi: "vi-VN",
  zh: "zh-CN",
  tl: "fil-PH",
  fa: "fa-IR",
  dar: "fa-AF",
  ur: "ur-PK",
  hi: "hi-IN",
};

export function getProfilePageMessages(locale: AppLocale): ProfilePageMessages {
  return PROFILE_PAGE_MESSAGES[locale] || PROFILE_PAGE_MESSAGES.en;
}

export function getLocaleTag(locale: AppLocale): string {
  return LOCALE_TAGS[locale] || "en";
}

export function getLocalizedWeekdays(locale: AppLocale): string[] {
  const tag = getLocaleTag(locale);
  const mondayUtc = new Date(Date.UTC(2024, 0, 1));
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(mondayUtc);
    date.setUTCDate(mondayUtc.getUTCDate() + index);
    return new Intl.DateTimeFormat(tag, { weekday: "short" }).format(date);
  });
}
