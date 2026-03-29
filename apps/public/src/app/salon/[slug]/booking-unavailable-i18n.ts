import type { AppLocale } from "@/i18n/translations";
import type { PublicBookingBlockReason } from "./profile-types";

export type PublicBookingUnavailableCopy = {
  title: string;
  description: string;
};

const EN: Record<PublicBookingBlockReason, PublicBookingUnavailableCopy> = {
  online_booking_disabled: {
    title: "Online booking unavailable",
    description:
      "This salon is not accepting online bookings right now. Please contact them directly by phone or message.",
  },
  billing_locked: {
    title: "Online booking unavailable",
    description:
      "Online booking is temporarily unavailable. Please try again later or contact the salon directly.",
  },
  salon_not_found: {
    title: "Online booking unavailable",
    description: "Booking could not be started. Please contact the salon directly.",
  },
};

const NB: Record<PublicBookingBlockReason, PublicBookingUnavailableCopy> = {
  online_booking_disabled: {
    title: "Nettbestilling ikke tilgjengelig",
    description:
      "Salongen tar ikke imot nettbestilling akkurat nå. Ta kontakt direkte per telefon eller melding.",
  },
  billing_locked: {
    title: "Nettbestilling ikke tilgjengelig",
    description:
      "Nettbestilling er midlertidig utilgjengelig. Prøv igjen senere eller kontakt salongen direkte.",
  },
  salon_not_found: {
    title: "Nettbestilling ikke tilgjengelig",
    description: "Bestilling kunne ikke startes. Ta kontakt med salongen direkte.",
  },
};

const AR: Record<PublicBookingBlockReason, PublicBookingUnavailableCopy> = {
  online_booking_disabled: {
    title: "الحجز عبر الإنترنت غير متاح",
    description: "هذا الصالون لا يقبل الحجز عبر الإنترنت حالياً. يرجى التواصل مباشرة بالهاتف أو الرسائل.",
  },
  billing_locked: {
    title: "الحجز عبر الإنترنت غير متاح",
    description: "الحجز عبر الإنترنت غير متاح مؤقتاً. حاول لاحقاً أو تواصل مع الصالون مباشرة.",
  },
  salon_not_found: {
    title: "الحجز عبر الإنترنت غير متاح",
    description: "تعذر بدء الحجز. يرجى التواصل مع الصالون مباشرة.",
  },
};

const SO: Record<PublicBookingBlockReason, PublicBookingUnavailableCopy> = {
  online_booking_disabled: {
    title: "Ballanshaha internetka lama heli karo",
    description:
      "Saloonkani ma qaato ballanshaha internetka hadda. Fadlan si toos ah ula xiriir taleefanka ama fariimaha.",
  },
  billing_locked: {
    title: "Ballanshaha internetka lama heli karo",
    description:
      "Ballanshaha internetku waa ku meel gaadh ah. Mar kale isku day ama si toos ah ula xiriir saloonka.",
  },
  salon_not_found: {
    title: "Ballanshaha internetka lama heli karo",
    description: "Ballan lama bilaabi karin. Fadlan si toos ah ula xiriir saloonka.",
  },
};

const TI: Record<PublicBookingBlockReason, PublicBookingUnavailableCopy> = {
  online_booking_disabled: {
    title: "ናይ ኢንተርነት ምዝገባ ኣይክኣልን",
    description:
      "እዚ ሳሎን ኣብዚ እዋን ናይ ኢንተርነት ምዝገባ ኣይቕበልን። ብቐጥታ ብስልኪ ወይ መልእኽቲ ርከብዎም።",
  },
  billing_locked: {
    title: "ናይ ኢንተርነት ምዝገባ ኣይክኣልን",
    description:
      "ናይ ኢንተርነት ምዝገባ ኣገናኒ ተሰናኺሉ ኣሎ። ድሕሪ እዋን ደጊምካ ፈትን ወይ ብቐጥታ ምስ ሳሎን ርከብ።",
  },
  salon_not_found: {
    title: "ናይ ኢንተርነት ምዝገባ ኣይክኣልን",
    description: "ምዝገባ ክጀምር ኣይከኣለን። ብቐጥታ ምስ ሳሎን ርከብ።",
  },
};

const AM: Record<PublicBookingBlockReason, PublicBookingUnavailableCopy> = {
  online_booking_disabled: {
    title: "የመስመር ላይ ቀጠሮ አይገኝም",
    description:
      "ይህ ሳሎን በአሁኑ ጊዜ የመስመር ላይ ቀጠሮ አይቀበልም። እባክዎ በቀጥታ በስልክ ወይም በመልዕክት ያግኙ።",
  },
  billing_locked: {
    title: "የመስመር ላይ ቀጠሮ አይገኝም",
    description:
      "የመስመር ላይ ቀጠሮ ለጊዜው አይገኝም። ቆይተው እንደገና ይሞክሩ ወይም ከሳሎኑ ጋር በቀጥታ ያግኙ።",
  },
  salon_not_found: {
    title: "የመስመር ላይ ቀጠሮ አይገኝም",
    description: "ቀጠሮ ማስጀመር አልተቻለም። እባክዎ ከሳሎኑ ጋር በቀጥታ ያግኙ።",
  },
};

const TR: Record<PublicBookingBlockReason, PublicBookingUnavailableCopy> = {
  online_booking_disabled: {
    title: "Cevrimici randevu kullanilamiyor",
    description:
      "Bu salon su anda cevrimici randevu almiyor. Lutfen dogrudan telefon veya mesajla iletisime gecin.",
  },
  billing_locked: {
    title: "Cevrimici randevu kullanilamiyor",
    description:
      "Cevrimici randevu gecici olarak kullanilamiyor. Daha sonra tekrar deneyin veya salonla dogrudan iletisime gecin.",
  },
  salon_not_found: {
    title: "Cevrimici randevu kullanilamiyor",
    description: "Randevu baslatilamadi. Lutfen salonla dogrudan iletisime gecin.",
  },
};

const PL: Record<PublicBookingBlockReason, PublicBookingUnavailableCopy> = {
  online_booking_disabled: {
    title: "Rezerwacja online niedostepna",
    description:
      "Salon obecnie nie przyjmuje rezerwacji online. Skontaktuj sie bezposrednio telefonicznie lub wiadomoscia.",
  },
  billing_locked: {
    title: "Rezerwacja online niedostepna",
    description:
      "Rezerwacja online jest tymczasowo niedostepna. Sprobuj pozniej lub skontaktuj sie bezposrednio z salonem.",
  },
  salon_not_found: {
    title: "Rezerwacja online niedostepna",
    description: "Nie mozna rozpoczac rezerwacji. Skontaktuj sie bezposrednio z salonem.",
  },
};

const VI: Record<PublicBookingBlockReason, PublicBookingUnavailableCopy> = {
  online_booking_disabled: {
    title: "Khong the dat lich truc tuyen",
    description:
      "Salon hien khong nhan dat lich truc tuyen. Vui long lien he truc tiep qua dien thoai hoac tin nhan.",
  },
  billing_locked: {
    title: "Khong the dat lich truc tuyen",
    description:
      "Dat lich truc tuyen tam thoi khong kha dung. Vui long thu lai sau hoac lien he truc tiep voi salon.",
  },
  salon_not_found: {
    title: "Khong the dat lich truc tuyen",
    description: "Khong the bat dau dat lich. Vui long lien he truc tiep voi salon.",
  },
};

const ZH: Record<PublicBookingBlockReason, PublicBookingUnavailableCopy> = {
  online_booking_disabled: {
    title: "暂无法在线预约",
    description: "该门店目前不接受在线预约。请直接通过电话或信息联系门店。",
  },
  billing_locked: {
    title: "暂无法在线预约",
    description: "在线预约暂时不可用。请稍后再试或直接联系门店。",
  },
  salon_not_found: {
    title: "暂无法在线预约",
    description: "无法开始预约。请直接联系门店。",
  },
};

const TL: Record<PublicBookingBlockReason, PublicBookingUnavailableCopy> = {
  online_booking_disabled: {
    title: "Hindi available ang online booking",
    description:
      "Ang salon ay hindi tumatanggap ng online booking sa ngayon. Makipag-ugnayan nang direkta sa telepono o mensahe.",
  },
  billing_locked: {
    title: "Hindi available ang online booking",
    description:
      "Pansamantalang hindi available ang online booking. Subukan muli mamaya o makipag-ugnayan nang direkta sa salon.",
  },
  salon_not_found: {
    title: "Hindi available ang online booking",
    description: "Hindi masimulan ang booking. Makipag-ugnayan nang direkta sa salon.",
  },
};

const FA: Record<PublicBookingBlockReason, PublicBookingUnavailableCopy> = {
  online_booking_disabled: {
    title: "رزرو آنلاین در دسترس نیست",
    description:
      "این سالن در حال حاضر رزرو آنلاین نمی‌پذیرد. لطفاً مستقیماً با تماس یا پیام ارتباط بگیرید.",
  },
  billing_locked: {
    title: "رزرو آنلاین در دسترس نیست",
    description:
      "رزرو آنلاین موقتاً در دسترس نیست. بعداً دوباره تلاش کنید یا مستقیماً با سالن تماس بگیرید.",
  },
  salon_not_found: {
    title: "رزرو آنلاین در دسترس نیست",
    description: "شروع رزرو ممکن نشد. لطفاً مستقیماً با سالن تماس بگیرید.",
  },
};

const DAR: Record<PublicBookingBlockReason, PublicBookingUnavailableCopy> = {
  online_booking_disabled: {
    title: "رزرو آنلاین در دسترس نیست",
    description:
      "این سالن فعلاً رزرو آنلاین نمی‌پذیرد. لطفاً مستقیماً با تلیفون یا پیام در تماس شوید.",
  },
  billing_locked: {
    title: "رزرو آنلاین در دسترس نیست",
    description:
      "رزرو آنلاین موقتاً در دسترس نیست. بعداً دوباره کوشش کنید یا مستقیماً با سالن در تماس شوید.",
  },
  salon_not_found: {
    title: "رزرو آنلاین در دسترس نیست",
    description: "شروع رزرو ممکن نشد. لطفاً مستقیماً با سالن در تماس شوید.",
  },
};

const UR: Record<PublicBookingBlockReason, PublicBookingUnavailableCopy> = {
  online_booking_disabled: {
    title: "آن لائن بکنگ دستیاب نہیں",
    description:
      "یہ سیلون فی الحال آن لائن بکنگ نہیں لیتا۔ براہ کرم براہ راست فون یا پیغام سے رابطہ کریں۔",
  },
  billing_locked: {
    title: "آن لائن بکنگ دستیاب نہیں",
    description:
      "آن لائن بکنگ عارضی طور پر دستیاب نہیں۔ بعد میں دوبارہ کوشش کریں یا سیلون سے براہ راست رابطہ کریں۔",
  },
  salon_not_found: {
    title: "آن لائن بکنگ دستیاب نہیں",
    description: "بکنگ شروع نہیں ہو سکی۔ براہ کرم سیلون سے براہ راست رابطہ کریں۔",
  },
};

const HI: Record<PublicBookingBlockReason, PublicBookingUnavailableCopy> = {
  online_booking_disabled: {
    title: "ऑनलाइन बुकिंग उपलब्ध नहीं है",
    description:
      "यह सैलून अभी ऑनलाइन बुकिंग नहीं ले रहा है। कृपया सीधे फोन या संदेश से संपर्क करें।",
  },
  billing_locked: {
    title: "ऑनलाइन बुकिंग उपलब्ध नहीं है",
    description:
      "ऑनलाइन बुकिंग अस्थायी रूप से उपलब्ध नहीं है। बाद में पुनः प्रयास करें या सैलून से सीधे संपर्क करें।",
  },
  salon_not_found: {
    title: "ऑनलाइन बुकिंग उपलब्ध नहीं है",
    description: "बुकिंग शुरू नहीं हो सकी। कृपया सैलून से सीधे संपर्क करें।",
  },
};

const BY_LOCALE: Record<AppLocale, Record<PublicBookingBlockReason, PublicBookingUnavailableCopy>> = {
  en: EN,
  nb: NB,
  ar: AR,
  so: SO,
  ti: TI,
  am: AM,
  tr: TR,
  pl: PL,
  vi: VI,
  zh: ZH,
  tl: TL,
  fa: FA,
  dar: DAR,
  ur: UR,
  hi: HI,
};

export function getPublicBookingUnavailableCopy(
  locale: AppLocale,
  reason: PublicBookingBlockReason
): PublicBookingUnavailableCopy {
  const pack = BY_LOCALE[locale] ?? EN;
  return pack[reason];
}
