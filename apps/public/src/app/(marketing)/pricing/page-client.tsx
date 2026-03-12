"use client";

import Link from "next/link";
import Image from "next/image";
import { Check, Shield, CreditCard, X, Lock } from "lucide-react";
import { PRICING } from "@/content/marketing";
import { Section, SectionHeader } from "@/components/marketing/Section";
import {
  ComparisonTable,
  type ComparisonColumn,
  type ComparisonRow,
  type ComparisonMeta,
} from "@/components/marketing/ComparisonTable";
import { CTASection } from "@/components/marketing/CTASection";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { getPublicPageTranslations } from "@/i18n/public-pages";
import { copy as landingCopy } from "@/components/landing/landing-copy";
import type { AppLocale } from "@/i18n/translations";

const TRUST_ICONS = {
  shield: Shield,
  card: CreditCard,
  x: X,
  lock: Lock,
} as const;

const columns: ComparisonColumn[] = [...PRICING.plans]
  .sort((a, b) => a.order - b.order)
  .map((plan) => ({
    id: plan.id,
    label: plan.name,
    highlighted: plan.highlighted,
  }));

const planMeta: ComparisonMeta[] = [...PRICING.plans]
  .sort((a, b) => a.order - b.order)
  .map((plan) => ({
    planId: plan.id,
    bestFor: plan.bestFor,
    teamSize: plan.teamSize,
  }));

const sortedCategories = [...PRICING.categories].sort((a, b) => a.order - b.order);
const rows: ComparisonRow[] = [...PRICING.features]
  .sort((a, b) => {
    const catA = PRICING.categories.find((c) => c.id === a.category)?.order ?? 99;
    const catB = PRICING.categories.find((c) => c.id === b.category)?.order ?? 99;
    return catA !== catB ? catA - catB : a.order - b.order;
  })
  .map((feature) => ({
    category: PRICING.categories.find((c) => c.id === feature.category)?.label ?? feature.category,
    feature: feature.label,
    values: { ...feature.values },
  }));

const categoryLabels = sortedCategories.map((c) => c.label);

const categoryMapsByLocale: Partial<Record<AppLocale, Record<string, string>>> = {
  nb: {
    "Booking & Calendar": "Booking og kalender",
    "Staff & Operations": "Ansatte og drift",
    Notifications: "Varsler",
    "Reporting & Data": "Rapportering og data",
    "Products & Payments": "Produkter og betalinger",
    "Branding & Language": "Profil og språk",
    Support: "Støtte",
  },
  ar: {
    "Booking & Calendar": "الحجز والتقويم",
    "Staff & Operations": "الموظفون والعمليات",
    Notifications: "الإشعارات",
    "Reporting & Data": "التقارير والبيانات",
    "Products & Payments": "المنتجات والمدفوعات",
    "Branding & Language": "الهوية واللغة",
    Support: "الدعم",
  },
  so: {
    "Booking & Calendar": "Ballansasho iyo jadwal",
    "Staff & Operations": "Shaqaale iyo hawlgal",
    Notifications: "Ogeysiisyo",
    "Reporting & Data": "Warbixin iyo xog",
    "Products & Payments": "Alaabo iyo lacag-bixin",
    "Branding & Language": "Summad iyo luuqad",
    Support: "Taageero",
  },
  ti: {
    "Booking & Calendar": "ምዝገባን ካሌንደርን",
    "Staff & Operations": "ሰራሕተኛታትን ስራሕን",
    Notifications: "ምልክታታት",
    "Reporting & Data": "ሪፖርትን ዳታን",
    "Products & Payments": "ፍርያትን ክፍሊትን",
    "Branding & Language": "ብራንድን ቋንቋን",
    Support: "ደገፍ",
  },
  am: {
    "Booking & Calendar": "ቦታ ማስያዝ እና ቀን መቁጠሪያ",
    "Staff & Operations": "ሰራተኞች እና ኦፕሬሽን",
    Notifications: "ማሳወቂያዎች",
    "Reporting & Data": "ሪፖርት እና ውሂብ",
    "Products & Payments": "ምርቶች እና ክፍያዎች",
    "Branding & Language": "ብራንዲንግ እና ቋንቋ",
    Support: "ድጋፍ",
  },
  tr: {
    "Booking & Calendar": "Rezervasyon ve takvim",
    "Staff & Operations": "Personel ve operasyon",
    Notifications: "Bildirimler",
    "Reporting & Data": "Raporlama ve veri",
    "Products & Payments": "Urunler ve odemeler",
    "Branding & Language": "Marka ve dil",
    Support: "Destek",
  },
  pl: {
    "Booking & Calendar": "Rezerwacje i kalendarz",
    "Staff & Operations": "Zespol i operacje",
    Notifications: "Powiadomienia",
    "Reporting & Data": "Raportowanie i dane",
    "Products & Payments": "Produkty i platnosci",
    "Branding & Language": "Branding i jezyk",
    Support: "Wsparcie",
  },
  vi: {
    "Booking & Calendar": "Dat lich va lich",
    "Staff & Operations": "Nhan su va van hanh",
    Notifications: "Thong bao",
    "Reporting & Data": "Bao cao va du lieu",
    "Products & Payments": "San pham va thanh toan",
    "Branding & Language": "Thuong hieu va ngon ngu",
    Support: "Ho tro",
  },
  zh: {
    "Booking & Calendar": "预约与日历",
    "Staff & Operations": "员工与运营",
    Notifications: "通知",
    "Reporting & Data": "报表与数据",
    "Products & Payments": "产品与支付",
    "Branding & Language": "品牌与语言",
    Support: "支持",
  },
  tl: {
    "Booking & Calendar": "Booking at calendar",
    "Staff & Operations": "Staff at operasyon",
    Notifications: "Notifications",
    "Reporting & Data": "Reporting at data",
    "Products & Payments": "Products at payments",
    "Branding & Language": "Branding at wika",
    Support: "Suporta",
  },
  fa: {
    "Booking & Calendar": "رزرو و تقویم",
    "Staff & Operations": "کارکنان و عملیات",
    Notifications: "اعلان ها",
    "Reporting & Data": "گزارش و داده",
    "Products & Payments": "محصولات و پرداخت",
    "Branding & Language": "برندینگ و زبان",
    Support: "پشتیبانی",
  },
  dar: {
    "Booking & Calendar": "رزرو و تقویم",
    "Staff & Operations": "کارمندان و عملیات",
    Notifications: "اطلاعیه ها",
    "Reporting & Data": "گزارش و داده",
    "Products & Payments": "محصولات و پرداخت",
    "Branding & Language": "برندینگ و زبان",
    Support: "پشتیبانی",
  },
  ur: {
    "Booking & Calendar": "بکنگ اور کیلنڈر",
    "Staff & Operations": "اسٹاف اور آپریشنز",
    Notifications: "نوٹیفکیشنز",
    "Reporting & Data": "رپورٹنگ اور ڈیٹا",
    "Products & Payments": "پروڈکٹس اور ادائیگیاں",
    "Branding & Language": "برانڈنگ اور زبان",
    Support: "سپورٹ",
  },
  hi: {
    "Booking & Calendar": "बुकिंग और कैलेंडर",
    "Staff & Operations": "स्टाफ और ऑपरेशंस",
    Notifications: "सूचनाएं",
    "Reporting & Data": "रिपोर्टिंग और डेटा",
    "Products & Payments": "प्रोडक्ट्स और पेमेंट्स",
    "Branding & Language": "ब्रांडिंग और भाषा",
    Support: "सपोर्ट",
  },
};

const featureMapsByLocale: Partial<Record<AppLocale, Record<string, string>>> = {
  nb: {
    "Online booking": "Nettbooking",
    "Calendar view": "Kalendervisning",
    "Customer list & service management": "Kundeliste og tjenestehåndtering",
    "Pay-in-salon flow": "Betal i salong-flyt",
    "Shift planning & staff scheduling": "Vaktplanlegging og ansattplan",
    "Roles & access control (owner, manager, staff)":
      "Roller og tilgangskontroll (eier, leder, ansatt)",
    "SMS reminders": "SMS-påminnelser",
    "Email notifications": "E-postvarsler",
    "WhatsApp support": "WhatsApp-støtte",
    "Advanced reports (revenue & capacity)":
      "Avanserte rapporter (inntekt og kapasitet)",
    "Data export for accounting": "Dataeksport for regnskap",
    "Full customer booking history": "Full kundebookingshistorikk",
    "Lightweight product inventory": "Lett produktlager",
    Languages: "Språk",
    "Branded booking page (logo & colors)": "Profilert bookingside (logo og farger)",
    "Priority support": "Prioritert støtte",
  },
  ar: {
    "Online booking": "الحجز عبر الإنترنت",
    "Calendar view": "عرض التقويم",
    "Customer list & service management": "قائمة العملاء وإدارة الخدمات",
    "Pay-in-salon flow": "الدفع داخل الصالون",
    "Shift planning & staff scheduling": "تخطيط الورديات وجدولة الموظفين",
    "Roles & access control (owner, manager, staff)":
      "الأدوار والتحكم في الوصول (مالك، مدير، موظف)",
    "SMS reminders": "تذكيرات SMS",
    "Email notifications": "إشعارات البريد الإلكتروني",
    "WhatsApp support": "دعم واتساب",
    "Advanced reports (revenue & capacity)": "تقارير متقدمة (الإيرادات والسعة)",
    "Data export for accounting": "تصدير البيانات للمحاسبة",
    "Full customer booking history": "سجل حجوزات العملاء الكامل",
    "Lightweight product inventory": "مخزون منتجات خفيف",
    Languages: "اللغات",
    "Branded booking page (logo & colors)": "صفحة حجز بعلامتك (شعار وألوان)",
    "Priority support": "دعم أولوية",
  },
  so: {
    "Online booking": "Ballansasho online ah",
    "Calendar view": "Muuqaalka jadwalka",
    "Customer list & service management": "Liiska macaamiisha iyo maareynta adeegyada",
    "Pay-in-salon flow": "Bixin gudaha salon-ka",
    "Shift planning & staff scheduling": "Qorshaynta shift-ka iyo jadwalka shaqaalaha",
    "Roles & access control (owner, manager, staff)":
      "Doorar iyo xakamaynta gelitaanka (milkiile, maamule, shaqaale)",
    "SMS reminders": "Xusuusin SMS",
    "Email notifications": "Ogeysiisyo iimayl",
    "WhatsApp support": "Taageero WhatsApp",
    "Advanced reports (revenue & capacity)": "Warbixino horumarsan (dakhliga iyo awoodda)",
    "Data export for accounting": "Dhoofinta xogta xisaabaadka",
    "Full customer booking history": "Taariikh buuxda oo ballamaha macaamiisha",
    "Lightweight product inventory": "Kayd alaab fudud",
    Languages: "Luuqado",
    "Branded booking page (logo & colors)": "Bog ballansasho sumadeysan (logo iyo midabyo)",
    "Priority support": "Taageero mudnaan leh",
  },
  ti: {
    "Online booking": "ኦንላይን ምዝገባ",
    "Calendar view": "ካሌንደር ርእይቶ",
    "Customer list & service management": "ዝርዝር ዓማዊልን ምሕደራ ኣገልግሎትን",
    "Pay-in-salon flow": "ኣብ ሳሎን ክፍሊት",
    "Shift planning & staff scheduling": "ምድላው ሺፍትን ፕላን ሰራሕተኛታትን",
    "Roles & access control (owner, manager, staff)":
      "ተራታትን ቁጽጽር መእተዊን (ወናኒ፣ ማናጀር፣ ሰራሕተኛ)",
    "SMS reminders": "SMS መዘኻኸሪ",
    "Email notifications": "ማሕበራዊ ኢመይል ምልክታ",
    "WhatsApp support": "WhatsApp ደገፍ",
    "Advanced reports (revenue & capacity)": "ዝማዕበለ ሪፖርት (እቶትን ዓቕምን)",
    "Data export for accounting": "ምውጻእ ዳታ ንሒሳብ",
    "Full customer booking history": "ምሉእ ታሪኽ ምዝገባ ዓማዊል",
    "Lightweight product inventory": "ቀሊል መዝገብ ፍርያት",
    Languages: "ቋንቋታት",
    "Branded booking page (logo & colors)": "ብራንድ ዘለዎ ገጽ ምዝገባ (ሎጎን ሕብርታትን)",
    "Priority support": "ቀዳማይ ደገፍ",
  },
  am: {
    "Online booking": "ኦንላይን ቦታ ማስያዝ",
    "Calendar view": "የቀን መቁጠሪያ እይታ",
    "Customer list & service management": "የደንበኛ ዝርዝር እና የአገልግሎት አስተዳደር",
    "Pay-in-salon flow": "በሳሎን ውስጥ ክፍያ",
    "Shift planning & staff scheduling": "የሺፍት እቅድ እና የሰራተኛ መርሃ ግብር",
    "Roles & access control (owner, manager, staff)":
      "ሚና እና የመዳረሻ ቁጥጥር (ባለቤት፣ አስተዳዳሪ፣ ሰራተኛ)",
    "SMS reminders": "የSMS ማስታወሻዎች",
    "Email notifications": "የኢሜይል ማሳወቂያዎች",
    "WhatsApp support": "የWhatsApp ድጋፍ",
    "Advanced reports (revenue & capacity)": "የላቀ ሪፖርቶች (ገቢ እና አቅም)",
    "Data export for accounting": "ለሂሳብ ውሂብ ማውጣት",
    "Full customer booking history": "ሙሉ የደንበኛ ቦታ ማስያዝ ታሪክ",
    "Lightweight product inventory": "ቀላል የምርት ክምችት",
    Languages: "ቋንቋዎች",
    "Branded booking page (logo & colors)": "ብራንድ ያለው የቦታ ማስያዝ ገጽ (ሎጎ እና ቀለሞች)",
    "Priority support": "ቅድሚያ ድጋፍ",
  },
  tr: {
    "Online booking": "Online rezervasyon",
    "Calendar view": "Takvim gorunumu",
    "Customer list & service management": "Musteri listesi ve hizmet yonetimi",
    "Pay-in-salon flow": "Salonda odeme akis",
    "Shift planning & staff scheduling": "Vardiya planlama ve personel cizelgeleme",
    "Roles & access control (owner, manager, staff)":
      "Roller ve erisim kontrolu (sahip, yonetici, personel)",
    "SMS reminders": "SMS hatirlatmalari",
    "Email notifications": "E-posta bildirimleri",
    "WhatsApp support": "WhatsApp destegi",
    "Advanced reports (revenue & capacity)": "Gelismis raporlar (gelir ve kapasite)",
    "Data export for accounting": "Muhasebe icin veri disa aktarma",
    "Full customer booking history": "Tam musteri rezervasyon gecmisi",
    "Lightweight product inventory": "Hafif urun envanteri",
    Languages: "Diller",
    "Branded booking page (logo & colors)": "Markali rezervasyon sayfasi (logo ve renkler)",
    "Priority support": "Oncelikli destek",
  },
  pl: {
    "Online booking": "Rezerwacje online",
    "Calendar view": "Widok kalendarza",
    "Customer list & service management": "Lista klientow i zarzadzanie uslugami",
    "Pay-in-salon flow": "Platnosc w salonie",
    "Shift planning & staff scheduling": "Planowanie zmian i grafiku",
    "Roles & access control (owner, manager, staff)":
      "Role i kontrola dostepu (wlasciciel, menedzer, pracownik)",
    "SMS reminders": "Przypomnienia SMS",
    "Email notifications": "Powiadomienia e-mail",
    "WhatsApp support": "Wsparcie WhatsApp",
    "Advanced reports (revenue & capacity)": "Zaawansowane raporty (przychod i pojemnosc)",
    "Data export for accounting": "Eksport danych do ksiegowosci",
    "Full customer booking history": "Pelna historia rezerwacji klienta",
    "Lightweight product inventory": "Lekki magazyn produktow",
    Languages: "Jezyki",
    "Branded booking page (logo & colors)": "Brandowana strona rezerwacji (logo i kolory)",
    "Priority support": "Wsparcie priorytetowe",
  },
  vi: {
    "Online booking": "Dat lich online",
    "Calendar view": "Che do lich",
    "Customer list & service management": "Danh sach khach hang va quan ly dich vu",
    "Pay-in-salon flow": "Thanh toan tai salon",
    "Shift planning & staff scheduling": "Lap ca va sap lich nhan vien",
    "Roles & access control (owner, manager, staff)":
      "Vai tro va kiem soat truy cap (chu, quan ly, nhan vien)",
    "SMS reminders": "Nhac lich SMS",
    "Email notifications": "Thong bao email",
    "WhatsApp support": "Ho tro WhatsApp",
    "Advanced reports (revenue & capacity)": "Bao cao nang cao (doanh thu va cong suat)",
    "Data export for accounting": "Xuat du lieu cho ke toan",
    "Full customer booking history": "Lich su dat lich day du cua khach",
    "Lightweight product inventory": "Kho san pham gon nhe",
    Languages: "Ngon ngu",
    "Branded booking page (logo & colors)": "Trang dat lich theo thuong hieu (logo va mau sac)",
    "Priority support": "Ho tro uu tien",
  },
  zh: {
    "Online booking": "在线预约",
    "Calendar view": "日历视图",
    "Customer list & service management": "客户列表与服务管理",
    "Pay-in-salon flow": "到店支付流程",
    "Shift planning & staff scheduling": "排班与员工日程",
    "Roles & access control (owner, manager, staff)": "角色与访问控制（老板、经理、员工）",
    "SMS reminders": "短信提醒",
    "Email notifications": "邮件通知",
    "WhatsApp support": "WhatsApp 支持",
    "Advanced reports (revenue & capacity)": "高级报表（营收与产能）",
    "Data export for accounting": "导出数据用于财务",
    "Full customer booking history": "完整客户预约历史",
    "Lightweight product inventory": "轻量商品库存",
    Languages: "语言",
    "Branded booking page (logo & colors)": "品牌化预约页（Logo 和颜色）",
    "Priority support": "优先支持",
  },
  tl: {
    "Online booking": "Online booking",
    "Calendar view": "Calendar view",
    "Customer list & service management": "Listahan ng customer at pamamahala ng serbisyo",
    "Pay-in-salon flow": "Bayad sa salon flow",
    "Shift planning & staff scheduling": "Pagplano ng shift at schedule ng staff",
    "Roles & access control (owner, manager, staff)":
      "Roles at access control (owner, manager, staff)",
    "SMS reminders": "SMS reminders",
    "Email notifications": "Email notifications",
    "WhatsApp support": "WhatsApp support",
    "Advanced reports (revenue & capacity)": "Advanced reports (kita at kapasidad)",
    "Data export for accounting": "Data export para sa accounting",
    "Full customer booking history": "Buong booking history ng customer",
    "Lightweight product inventory": "Lightweight product inventory",
    Languages: "Mga wika",
    "Branded booking page (logo & colors)": "Branded booking page (logo at kulay)",
    "Priority support": "Priority support",
  },
  fa: {
    "Online booking": "رزرو آنلاین",
    "Calendar view": "نمای تقویم",
    "Customer list & service management": "لیست مشتریان و مدیریت خدمات",
    "Pay-in-salon flow": "پرداخت در سالن",
    "Shift planning & staff scheduling": "برنامه شیفت و زمان بندی کارکنان",
    "Roles & access control (owner, manager, staff)":
      "نقش ها و کنترل دسترسی (مالک، مدیر، کارمند)",
    "SMS reminders": "یادآوری پیامکی",
    "Email notifications": "اعلان ایمیل",
    "WhatsApp support": "پشتیبانی واتساپ",
    "Advanced reports (revenue & capacity)": "گزارش های پیشرفته (درآمد و ظرفیت)",
    "Data export for accounting": "خروجی داده برای حسابداری",
    "Full customer booking history": "تاریخچه کامل رزرو مشتری",
    "Lightweight product inventory": "انبار سبک محصولات",
    Languages: "زبان ها",
    "Branded booking page (logo & colors)": "صفحه رزرو برندشده (لوگو و رنگ ها)",
    "Priority support": "پشتیبانی اولویت دار",
  },
  dar: {
    "Online booking": "رزرو آنلاین",
    "Calendar view": "نمای تقویم",
    "Customer list & service management": "لیست مشتری و مدیریت خدمات",
    "Pay-in-salon flow": "پرداخت در سالن",
    "Shift planning & staff scheduling": "پلان شیفت و زمان بندی کارمندان",
    "Roles & access control (owner, manager, staff)":
      "نقش ها و کنترول دسترسی (مالک، مدیر، کارمند)",
    "SMS reminders": "یادآوری SMS",
    "Email notifications": "اطلاعیه ایمیل",
    "WhatsApp support": "پشتیبانی واتساپ",
    "Advanced reports (revenue & capacity)": "گزارش های پیشرفته (درآمد و ظرفیت)",
    "Data export for accounting": "خروجی داده برای حسابداری",
    "Full customer booking history": "تاریخچه کامل رزرو مشتری",
    "Lightweight product inventory": "انبار سبک محصولات",
    Languages: "زبان ها",
    "Branded booking page (logo & colors)": "صفحه رزرو برندشده (لوگو و رنگ ها)",
    "Priority support": "پشتیبانی اولویت دار",
  },
  ur: {
    "Online booking": "آن لائن بکنگ",
    "Calendar view": "کیلنڈر ویو",
    "Customer list & service management": "کسٹمر لسٹ اور سروس مینجمنٹ",
    "Pay-in-salon flow": "سیلون میں ادائیگی فلو",
    "Shift planning & staff scheduling": "شفٹ پلاننگ اور اسٹاف شیڈولنگ",
    "Roles & access control (owner, manager, staff)":
      "رولز اور ایکسیس کنٹرول (اونر، مینیجر، اسٹاف)",
    "SMS reminders": "SMS یاددہانیاں",
    "Email notifications": "ای میل نوٹیفکیشنز",
    "WhatsApp support": "واٹس ایپ سپورٹ",
    "Advanced reports (revenue & capacity)": "ایڈوانس رپورٹس (آمدنی اور گنجائش)",
    "Data export for accounting": "اکاؤنٹنگ کے لئے ڈیٹا ایکسپورٹ",
    "Full customer booking history": "کسٹمر بکنگ کی مکمل ہسٹری",
    "Lightweight product inventory": "ہلکا پروڈکٹ انوینٹری",
    Languages: "زبانیں",
    "Branded booking page (logo & colors)": "برانڈڈ بکنگ پیج (لوگو اور رنگ)",
    "Priority support": "ترجیحی سپورٹ",
  },
  hi: {
    "Online booking": "ऑनलाइन बुकिंग",
    "Calendar view": "कैलेंडर व्यू",
    "Customer list & service management": "ग्राहक सूची और सेवा प्रबंधन",
    "Pay-in-salon flow": "सैलून में भुगतान फ्लो",
    "Shift planning & staff scheduling": "शिफ्ट प्लानिंग और स्टाफ शेड्यूलिंग",
    "Roles & access control (owner, manager, staff)":
      "रोल और एक्सेस कंट्रोल (मालिक, मैनेजर, स्टाफ)",
    "SMS reminders": "SMS रिमाइंडर",
    "Email notifications": "ईमेल नोटिफिकेशन",
    "WhatsApp support": "व्हाट्सऐप सपोर्ट",
    "Advanced reports (revenue & capacity)": "एडवांस रिपोर्ट (राजस्व और क्षमता)",
    "Data export for accounting": "अकाउंटिंग के लिए डेटा एक्सपोर्ट",
    "Full customer booking history": "पूरी ग्राहक बुकिंग हिस्ट्री",
    "Lightweight product inventory": "हल्का प्रोडक्ट इन्वेंटरी",
    Languages: "भाषाएं",
    "Branded booking page (logo & colors)": "ब्रांडेड बुकिंग पेज (लोगो और रंग)",
    "Priority support": "प्राथमिकता सपोर्ट",
  },
};

const trustSignalsByLocale: Partial<Record<AppLocale, [string, string, string, string]>> = {
  nb: ["14 dagers gratis prøveperiode", "Ingen kredittkort nødvendig", "Avslutt når som helst", "EU-hostet og sikker"],
  ar: ["تجربة مجانية لمدة 14 يومًا", "لا حاجة لبطاقة ائتمان", "إلغاء في أي وقت", "مستضاف في الاتحاد الأوروبي وآمن"],
  so: ["Tijaabo bilaash ah 14 maalmood", "Kaarka deynta looma baahna", "Jooji wakhti kasta", "EU lagu martigeliyay oo ammaan ah"],
  ti: ["14 መዓልቲ ነጻ ሙከራ", "ክሬዲት ካርድ ኣየድልን", "ኩሉ ግዜ ሰርዝ", "ኣብ EU ዝተኣሰረ ደህንነት"],
  am: ["14 ቀን ነፃ ሙከራ", "ክሬዲት ካርድ አያስፈልግም", "በማንኛውም ጊዜ ይሰርዙ", "በEU የተስተናገደ እና ደህንነቱ የተጠበቀ"],
  tr: ["14 gunluk ucretsiz deneme", "Kredi karti gerekmez", "Istedigin zaman iptal et", "AB barindirmali ve guvenli"],
  pl: ["14 dni darmowego okresu probnego", "Karta kredytowa nie jest wymagana", "Anuluj w dowolnym momencie", "Hostowane w UE i bezpieczne"],
  vi: ["Dung thu mien phi 14 ngay", "Khong can the tin dung", "Huy bat cu luc nao", "Luu tru tai EU va bao mat"],
  zh: ["14 天免费试用", "无需信用卡", "随时取消", "欧盟托管且安全"],
  tl: ["14-araw na libreng trial", "Walang credit card na kailangan", "Kanselahin anumang oras", "EU-hosted at secure"],
  fa: ["۱۴ روز آزمایش رایگان", "بدون نیاز به کارت بانکی", "لغو در هر زمان", "میزبانی در اروپا و امن"],
  dar: ["۱۴ روز آزمایش رایگان", "بدون نیاز به کارت بانکی", "لغو در هر زمان", "میزبانی در اروپا و امن"],
  ur: ["14 دن کا مفت ٹرائل", "کریڈٹ کارڈ کی ضرورت نہیں", "کبھی بھی منسوخ کریں", "EU میں ہوسٹڈ اور محفوظ"],
  hi: ["14 दिन का फ्री ट्रायल", "क्रेडिट कार्ड जरूरी नहीं", "कभी भी कैंसल करें", "EU-hosted और सुरक्षित"],
};

const pricingUiOverrides: Partial<
  Record<
    AppLocale,
    {
      whyProTitle: string;
      whyProDescription: string;
      fullComparisonTitle: string;
      fullComparisonDescription: string;
      ctaTitle: string;
      ctaDescription: string;
      trustLine: string;
      feature: string;
      bestFor: string;
      teamSize: string;
      featureCountOne: string;
      featureCountMany: string;
    }
  >
> = {
  nb: {
    whyProTitle: "Hvorfor salonger velger Pro",
    whyProDescription: "De fleste salonger starter med Pro. Her er hvorfor.",
    fullComparisonTitle: "Full funksjonssammenligning",
    fullComparisonDescription: "Se nøyaktig hva som er inkludert i hver plan.",
    ctaTitle: "Bruk mindre tid på administrasjon. Mer tid med kunder.",
    ctaDescription:
      "TeqBook håndterer booking, påminnelser og planlegging, så du slipper.",
    trustLine: "Ingen kredittkort nødvendig.",
    feature: "Funksjon",
    bestFor: "Best for",
    teamSize: "Teamstørrelse",
    featureCountOne: "funksjon",
    featureCountMany: "funksjoner",
  },
  ar: {
    whyProTitle: "لماذا تختار الصالونات خطة Pro",
    whyProDescription: "معظم الصالونات تبدأ بـ Pro. إليك السبب.",
    fullComparisonTitle: "مقارنة كاملة للميزات",
    fullComparisonDescription: "شاهد بالضبط ما هو متضمن في كل خطة.",
    ctaTitle: "وقت أقل للإدارة. وقت أكثر مع العملاء.",
    ctaDescription: "TeqBook يتولى الحجوزات والتذكيرات والجدولة نيابةً عنك.",
    trustLine: "لا حاجة لبطاقة ائتمان.",
    feature: "الميزة",
    bestFor: "مناسب لـ",
    teamSize: "حجم الفريق",
    featureCountOne: "ميزة",
    featureCountMany: "ميزات",
  },
  so: {
    whyProTitle: "Sababta salon-yadu u doortaan Pro",
    whyProDescription: "Inta badan salon-yadu waxay ku bilaabaan Pro. Waa sababta.",
    fullComparisonTitle: "Isbarbardhig buuxa oo astaamo ah",
    fullComparisonDescription: "Si sax ah u arag waxa ku jira qorshe kasta.",
    ctaTitle: "Waqti yar ku bixi maamul. Waqti badan la qaado macaamiisha.",
    ctaDescription: "TeqBook ayaa kuu maamula ballamaha, xasuusinta, iyo jadwalka.",
    trustLine: "Kaarka deynta looma baahna.",
    feature: "Astaamo",
    bestFor: "Ku habboon",
    teamSize: "Cabbirka kooxda",
    featureCountOne: "astaan",
    featureCountMany: "astaamo",
  },
  ti: {
    whyProTitle: "ሳሎናት ንምንታይ Pro ይመርጹ",
    whyProDescription: "ኣብዝሓ ሳሎናት ብ Pro ይጅምሩ። ምኽንያቱ እዚ እዩ።",
    fullComparisonTitle: "ምሉእ ምንጽጻር ባህሪታት",
    fullComparisonDescription: "ኣብ ነፍሲ ወከፍ ፕላን እንታይ ከም ዘሎ ብግልጺ ርአ።",
    ctaTitle: "ንምሕደራ ዝተንከለ ግዜ። ንዓማዊል ዝበለጸ ግዜ።",
    ctaDescription: "TeqBook ምዝገባ፣ መዘኻኸሪን ፕላንን ንኻ ይሕዝ።",
    trustLine: "ክሬዲት ካርድ ኣየድልን።",
    feature: "ባህሪ",
    bestFor: "ዝምችእ",
    teamSize: "መጠን ጉጅለ",
    featureCountOne: "ባህሪ",
    featureCountMany: "ባህሪታት",
  },
  am: {
    whyProTitle: "ሳሎኖች Pro ለምን ይመርጣሉ",
    whyProDescription: "አብዛኞቹ ሳሎኖች በPro ይጀምራሉ። ምክንያቱ ይህ ነው።",
    fullComparisonTitle: "ሙሉ የባህሪ ንፅፅር",
    fullComparisonDescription: "በእያንዳንዱ ፕላን ውስጥ የሚካተተውን በግልፅ ይመልከቱ።",
    ctaTitle: "ለአስተዳደር ትንሽ ጊዜ። ለደንበኞች ብዙ ጊዜ።",
    ctaDescription: "TeqBook ቦታ ማስያዝ፣ ማስታወሻ እና ሰሌዳ ለእርስዎ ያስተዳድራል።",
    trustLine: "ክሬዲት ካርድ አያስፈልግም።",
    feature: "ባህሪ",
    bestFor: "ለማን",
    teamSize: "የቡድን መጠን",
    featureCountOne: "ባህሪ",
    featureCountMany: "ባህሪያት",
  },
  tr: {
    whyProTitle: "Salonlar neden Pro'yu seciyor",
    whyProDescription: "Cogu salon Pro ile baslar. Nedeni bu.",
    fullComparisonTitle: "Tam ozellik karsilastirmasi",
    fullComparisonDescription: "Her planda nelerin oldugunu tam olarak gorun.",
    ctaTitle: "Yonetimde daha az zaman. Musterilere daha fazla zaman.",
    ctaDescription: "TeqBook rezervasyon, hatirlatma ve planlamayi sizin yerinize yonetir.",
    trustLine: "Kredi karti gerekmez.",
    feature: "Ozellik",
    bestFor: "Kimler icin",
    teamSize: "Ekip boyutu",
    featureCountOne: "ozellik",
    featureCountMany: "ozellik",
  },
  pl: {
    whyProTitle: "Dlaczego salony wybieraja Pro",
    whyProDescription: "Wiekszosc salonow zaczyna od Pro. Oto dlaczego.",
    fullComparisonTitle: "Pelne porownanie funkcji",
    fullComparisonDescription: "Zobacz dokladnie, co zawiera kazdy plan.",
    ctaTitle: "Mniej czasu na zarzadzanie. Wiecej czasu dla klientow.",
    ctaDescription:
      "TeqBook obsluguje rezerwacje, przypomnienia i harmonogram za Ciebie.",
    trustLine: "Karta kredytowa nie jest wymagana.",
    feature: "Funkcja",
    bestFor: "Dla kogo",
    teamSize: "Wielkosc zespolu",
    featureCountOne: "funkcja",
    featureCountMany: "funkcje",
  },
  vi: {
    whyProTitle: "Vì sao các salon chọn Pro",
    whyProDescription: "Hầu hết salon bắt đầu với Pro. Đây là lý do.",
    fullComparisonTitle: "So sánh đầy đủ tính năng",
    fullComparisonDescription: "Xem chính xác những gì có trong từng gói.",
    ctaTitle: "Ít thời gian quản lý hơn. Nhiều thời gian cho khách hơn.",
    ctaDescription:
      "TeqBook xử lý đặt lịch, nhắc lịch và sắp lịch để bạn không phải làm.",
    trustLine: "Không cần thẻ tín dụng.",
    feature: "Tính năng",
    bestFor: "Phù hợp cho",
    teamSize: "Quy mô đội ngũ",
    featureCountOne: "tính năng",
    featureCountMany: "tính năng",
  },
  zh: {
    whyProTitle: "为什么沙龙选择 Pro",
    whyProDescription: "大多数沙龙从 Pro 开始。这就是原因。",
    fullComparisonTitle: "完整功能对比",
    fullComparisonDescription: "准确查看每个套餐包含的内容。",
    ctaTitle: "更少时间管理。更多时间服务客户。",
    ctaDescription: "TeqBook 帮你处理预约、提醒和排班。",
    trustLine: "无需信用卡。",
    feature: "功能",
    bestFor: "适用对象",
    teamSize: "团队规模",
    featureCountOne: "功能",
    featureCountMany: "功能",
  },
  tl: {
    whyProTitle: "Bakit pinipili ng mga salon ang Pro",
    whyProDescription: "Karamihan ng salon ay nagsisimula sa Pro. Ito ang dahilan.",
    fullComparisonTitle: "Buong paghahambing ng features",
    fullComparisonDescription: "Tingnan nang eksakto ang kasama sa bawat plano.",
    ctaTitle: "Mas kaunting oras sa pag-manage. Mas maraming oras sa customers.",
    ctaDescription: "Ang TeqBook ang bahala sa booking, reminders, at scheduling para sa iyo.",
    trustLine: "Walang credit card na kailangan.",
    feature: "Feature",
    bestFor: "Pinakamainam para sa",
    teamSize: "Laki ng team",
    featureCountOne: "feature",
    featureCountMany: "features",
  },
  fa: {
    whyProTitle: "چرا سالن ها Pro را انتخاب می کنند",
    whyProDescription: "بیشتر سالن ها با Pro شروع می کنند. دلیلش این است.",
    fullComparisonTitle: "مقایسه کامل ویژگی ها",
    fullComparisonDescription: "دقیقا ببینید هر پلن چه چیزهایی دارد.",
    ctaTitle: "زمان کمتر برای مدیریت. زمان بیشتر برای مشتریان.",
    ctaDescription: "TeqBook رزرو، یادآوری و برنامه ریزی را برای شما انجام می دهد.",
    trustLine: "بدون نیاز به کارت بانکی.",
    feature: "ویژگی",
    bestFor: "مناسب برای",
    teamSize: "اندازه تیم",
    featureCountOne: "ویژگی",
    featureCountMany: "ویژگی",
  },
  dar: {
    whyProTitle: "چرا سالن ها Pro را انتخاب می کنند",
    whyProDescription: "اکثر سالن ها با Pro شروع می کنند. دلیلش این است.",
    fullComparisonTitle: "مقایسه کامل ویژگی ها",
    fullComparisonDescription: "دقیقا ببینید هر پلان چه چیزهایی دارد.",
    ctaTitle: "وقت کمتر برای مدیریت. وقت بیشتر برای مشتریان.",
    ctaDescription: "TeqBook رزرو، یادآوری و زمان بندی را برای شما انجام می دهد.",
    trustLine: "بدون نیاز به کارت بانکی.",
    feature: "ویژگی",
    bestFor: "مناسب برای",
    teamSize: "اندازه تیم",
    featureCountOne: "ویژگی",
    featureCountMany: "ویژگی",
  },
  ur: {
    whyProTitle: "سیلون Pro کیوں منتخب کرتے ہیں",
    whyProDescription: "زیادہ تر سیلون Pro سے شروع کرتے ہیں۔ یہی وجہ ہے۔",
    fullComparisonTitle: "مکمل فیچر موازنہ",
    fullComparisonDescription: "دیکھیں ہر پلان میں بالکل کیا شامل ہے۔",
    ctaTitle: "انتظام پر کم وقت۔ کسٹمرز کے ساتھ زیادہ وقت۔",
    ctaDescription: "TeqBook بکنگ، ریمائنڈر اور شیڈولنگ آپ کے لئے سنبھالتا ہے۔",
    trustLine: "کریڈٹ کارڈ کی ضرورت نہیں۔",
    feature: "فیچر",
    bestFor: "موزوں برائے",
    teamSize: "ٹیم سائز",
    featureCountOne: "فیچر",
    featureCountMany: "فیچرز",
  },
  hi: {
    whyProTitle: "सलून Pro क्यों चुनते हैं",
    whyProDescription: "ज्यादातर सलून Pro से शुरू करते हैं। यही कारण है।",
    fullComparisonTitle: "पूरा फीचर तुलना",
    fullComparisonDescription: "देखें कि हर प्लान में क्या-क्या शामिल है।",
    ctaTitle: "मैनेजमेंट में कम समय। ग्राहकों के साथ ज्यादा समय।",
    ctaDescription:
      "TeqBook बुकिंग, रिमाइंडर और शेड्यूलिंग संभालता है ताकि आपको न करना पड़े।",
    trustLine: "क्रेडिट कार्ड जरूरी नहीं।",
    feature: "फीचर",
    bestFor: "किसके लिए",
    teamSize: "टीम आकार",
    featureCountOne: "फीचर",
    featureCountMany: "फीचर्स",
  },
};

const teamSizeByLocale: Partial<Record<AppLocale, Record<string, string>>> = {
  nb: { starter: "1-2 ansatte", pro: "3-6 ansatte", business: "6+ ansatte" },
  ar: { starter: "1-2 موظف", pro: "3-6 موظفين", business: "6+ موظفين" },
  so: { starter: "1-2 shaqaale", pro: "3-6 shaqaale", business: "6+ shaqaale" },
  ti: { starter: "1-2 ሰራሕተኛ", pro: "3-6 ሰራሕተኛ", business: "6+ ሰራሕተኛ" },
  am: { starter: "1-2 ሰራተኛ", pro: "3-6 ሰራተኛ", business: "6+ ሰራተኛ" },
  tr: { starter: "1-2 personel", pro: "3-6 personel", business: "6+ personel" },
  pl: { starter: "1-2 pracownikow", pro: "3-6 pracownikow", business: "6+ pracownikow" },
  vi: { starter: "1-2 nhan vien", pro: "3-6 nhan vien", business: "6+ nhan vien" },
  zh: { starter: "1-2 名员工", pro: "3-6 名员工", business: "6+ 名员工" },
  tl: { starter: "1-2 staff", pro: "3-6 staff", business: "6+ staff" },
  fa: { starter: "1-2 کارمند", pro: "3-6 کارمند", business: "6+ کارمند" },
  dar: { starter: "1-2 کارمند", pro: "3-6 کارمند", business: "6+ کارمند" },
  ur: { starter: "1-2 اسٹاف", pro: "3-6 اسٹاف", business: "6+ اسٹاف" },
  hi: { starter: "1-2 स्टाफ", pro: "3-6 स्टाफ", business: "6+ स्टाफ" },
};

const atCostByLocale: Partial<Record<AppLocale, string>> = {
  nb: "Etter kost",
  ar: "حسب التكلفة",
  so: "Kharash ahaan",
  ti: "ብኽፍሊት",
  am: "በወጪ",
  tr: "Maliyetine",
  pl: "Po koszcie",
  vi: "Theo chi phi",
  zh: "按成本",
  tl: "Ayon sa gastos",
  fa: "به قیمت تمام شده",
  dar: "به قیمت تمام شده",
  ur: "لاگت کے حساب سے",
  hi: "लागत के अनुसार",
};

const unlimitedByLocale: Partial<Record<AppLocale, string>> = {
  nb: "Ubegrenset",
  ar: "غير محدود",
  so: "Aan xadidnayn",
  ti: "ዘይተደረቐ",
  am: "ያልተገደበ",
  tr: "Sinirsiz",
  pl: "Bez limitu",
  vi: "Khong gioi han",
  zh: "无限",
  tl: "Walang limit",
  fa: "نامحدود",
  dar: "نامحدود",
  ur: "لامحدود",
  hi: "असीमित",
};

export default function PricingPageClient() {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = getPublicPageTranslations(appLocale).marketingPages.pricing;
  const l = landingCopy[appLocale];
  const pricingUi = pricingUiOverrides[appLocale];
  const sortedTiers = [...l.tiers].sort((a, b) => {
    const order: Record<string, number> = { starter: 1, pro: 2, business: 3 };
    return (order[a.id] ?? 99) - (order[b.id] ?? 99);
  });
  const localizedColumns: ComparisonColumn[] = columns.map((col) => ({
    ...col,
    label: sortedTiers.find((tier) => tier.id === col.id)?.name ?? col.label,
  }));
  const localizedPlanMeta: ComparisonMeta[] = planMeta.map((meta) => ({
    planId: meta.planId,
    bestFor: sortedTiers.find((tier) => tier.id === meta.planId)?.description ?? meta.bestFor,
    teamSize: teamSizeByLocale[appLocale]?.[meta.planId] ?? meta.teamSize,
  }));
  const localeCategoryMap = categoryMapsByLocale[appLocale];
  const localeFeatureMap = featureMapsByLocale[appLocale];
  const localizedRows: ComparisonRow[] = rows.map((row) => ({
    ...row,
    category: localeCategoryMap?.[row.category] ?? row.category,
    feature: localeFeatureMap?.[row.feature] ?? row.feature,
    values: {
      ...row.values,
      starter:
        row.values.starter === "At cost"
          ? atCostByLocale[appLocale] ?? row.values.starter
          : row.values.starter === "Unlimited"
            ? unlimitedByLocale[appLocale] ?? row.values.starter
            : row.values.starter,
      pro:
        row.values.pro === "Unlimited"
          ? unlimitedByLocale[appLocale] ?? row.values.pro
          : row.values.pro,
      business:
        row.values.business === "Unlimited"
          ? unlimitedByLocale[appLocale] ?? row.values.business
          : row.values.business,
    },
  }));
  const localizedCategoryLabels = categoryLabels.map(
    (category) => localeCategoryMap?.[category] ?? category,
  );
  const trustSignals = trustSignalsByLocale[appLocale];

  return (
    <>
      <Section className="bg-gradient-to-b from-slate-50 via-blue-50/30 to-white pb-0 sm:pb-0">
        <SectionHeader
          title={t.heroTitle}
          description={t.heroDescription}
          badge={t.heroBadge}
        />
      </Section>

      <Section className="!pt-8">
        <div className="grid gap-6 md:grid-cols-3">
          {sortedTiers.map((plan) => {
              const features = plan.features.slice(0, 7);
              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-2xl border-2 p-5 shadow-sm sm:p-8 sm:shadow-md ${
                    plan.badge ? "pt-10 sm:pt-12" : ""
                  } ${
                    plan.highlighted
                      ? "border-blue-500 bg-gradient-to-br from-white via-blue-50/50 to-blue-50/30 ring-2 ring-blue-500/20 sm:shadow-xl sm:shadow-blue-500/10"
                      : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg"
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                      <span className="whitespace-nowrap rounded-full bg-blue-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-md shadow-blue-500/25">
                        {plan.badge}
                      </span>
                    </div>
                  )}
                  <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-md shadow-blue-500/10">
                      <Image
                        src="/Favikon.svg"
                        alt="TeqBook"
                        width={20}
                        height={20}
                        className="h-5 w-5"
                      />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                  </div>
                  {plan.badge ? (
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-600">
                      {plan.badge}
                    </p>
                  ) : null}
                  <p className="mb-4 text-sm text-slate-600">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                  </div>
                  <ul className="mb-6 flex-1 space-y-2.5 text-sm">
                    {features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <Check
                          className={`mt-0.5 h-4 w-4 shrink-0 ${
                            plan.highlighted ? "text-blue-600" : "text-blue-500"
                          }`}
                        />
                        <span className="text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/signup"
                    className={`block min-h-12 w-full rounded-xl py-3.5 text-center text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 sm:text-sm ${
                      plan.highlighted
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    {t.startTrial}
                  </Link>
                </div>
              );
            })}
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {PRICING.trustSignals.map((signal, index) => {
            const Icon = TRUST_ICONS[signal.icon];
            return (
              <div key={signal.text} className="flex items-center gap-2 text-sm text-slate-500">
                <Icon className="h-4 w-4 text-slate-400" />
                <span>{trustSignals?.[index] ?? signal.text}</span>
              </div>
            );
          })}
        </div>

      </Section>

      <Section className="bg-gradient-to-b from-white to-slate-50/50">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {pricingUi?.whyProTitle ?? t.whyProTitle}
          </h2>
          <p className="mt-3 text-base text-slate-600">
            {pricingUi?.whyProDescription ?? t.whyProDescription}
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {l.stats.map((item) => {
            return (
              <div key={item.title} className="rounded-xl bg-white px-6 py-8 text-center shadow-sm">
                <p className="text-lg font-semibold text-slate-900">{item.title}</p>
                <p className="mt-2 text-sm text-slate-500">{item.body}</p>
              </div>
            );
          })}
        </div>
      </Section>

      <Section id="compare" className="bg-slate-50/50">
        <SectionHeader
          title={pricingUi?.fullComparisonTitle ?? t.fullComparisonTitle}
          description={pricingUi?.fullComparisonDescription ?? t.fullComparisonDescription}
        />
        <div className="mt-12">
          <ComparisonTable
            columns={localizedColumns}
            rows={localizedRows}
            categories={localizedCategoryLabels}
            planMeta={localizedPlanMeta}
            labels={{
              feature: pricingUi?.feature ?? t.feature,
              bestFor: pricingUi?.bestFor ?? t.bestFor,
              teamSize: pricingUi?.teamSize ?? t.teamSize,
              featureCountOne:
                pricingUi?.featureCountOne ?? (pricingUi?.feature ?? t.feature).toLowerCase(),
              featureCountMany:
                pricingUi?.featureCountMany ?? `${(pricingUi?.feature ?? t.feature).toLowerCase()}s`,
            }}
          />
        </div>
      </Section>

      <Section>
        <SectionHeader title={t.addonsTitle} description={t.addonsDescription} />
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {[
            {
              id: "multilingual-booking",
              title: l.multilingualBookingTitle,
              description: l.multilingualBookingDescription,
              recommendedWith: l.tiers[1]?.name ?? "Pro",
            },
            {
              id: "extra-staff",
              title: l.extraStaffTitle,
              description: l.extraStaffDescription,
              recommendedWith: l.tiers[2]?.name ?? "Business",
            },
          ].map((addon) => (
            <div
              key={addon.id}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold text-slate-900">{addon.title}</h3>
                <span className="shrink-0 rounded-full bg-blue-50 px-3 py-0.5 text-xs font-medium text-blue-600">
                  {addon.recommendedWith}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{addon.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <CTASection
          title={pricingUi?.ctaTitle ?? t.ctaTitle}
          description={pricingUi?.ctaDescription ?? t.ctaDescription}
          primaryLabel={t.ctaPrimary}
          primaryHref="/signup"
          secondaryLabel={t.ctaSecondary}
          secondaryHref="/#demo"
          trustLine={pricingUi?.trustLine ?? t.trustLine}
        />
      </Section>
    </>
  );
}
