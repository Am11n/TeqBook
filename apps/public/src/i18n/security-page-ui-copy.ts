import type { AppLocale } from "@/i18n/translations";

export type SecurityPageCopy = {
  title: string;
  description: string;
  technicalOverviewTitle: string;
  technicalOverviewBody: string;
  yourDataTitle: string;
  yourDataBody: string;
  contactSupport: string;
};

export const securityPageCopyByLocale: Record<AppLocale, SecurityPageCopy> = {
  en: {
    title: "Security and data protection",
    description: "Your salon data stays protected, private, and under your control.",
    technicalOverviewTitle: "Technical overview",
    technicalOverviewBody:
      "TeqBook runs on modern cloud infrastructure with strict data isolation between salons. Core services are monitored continuously, with backup and recovery controls designed to protect business continuity.",
    yourDataTitle: "Your data stays yours.",
    yourDataBody: "We never sell or share customer data.",
    contactSupport: "Contact support",
  },
  nb: {
    title: "Sikkerhet og databeskyttelse",
    description: "Salongdataene dine er beskyttet, private og under din kontroll.",
    technicalOverviewTitle: "Teknisk oversikt",
    technicalOverviewBody:
      "TeqBook kjører på moderne skyinfrastruktur med streng dataisolasjon mellom salonger. Kjernetjenester overvåkes kontinuerlig, med backup- og gjenopprettingskontroller for å sikre kontinuitet i driften.",
    yourDataTitle: "Dine data forblir dine.",
    yourDataBody: "Vi selger eller deler aldri kundedata.",
    contactSupport: "Kontakt support",
  },
  ar: {
    title: "الأمان وحماية البيانات",
    description: "بيانات صالونك تبقى محمية وخاصة وتحت سيطرتك.",
    technicalOverviewTitle: "نظرة تقنية",
    technicalOverviewBody:
      "يعمل TeqBook على بنية سحابية حديثة مع عزل صارم للبيانات بين الصالونات. تتم مراقبة الخدمات الأساسية باستمرار مع ضوابط نسخ احتياطي واستعادة مصممة لحماية استمرارية العمل.",
    yourDataTitle: "بياناتك تبقى ملكك.",
    yourDataBody: "لا نبيع أو نشارك بيانات العملاء أبدًا.",
    contactSupport: "تواصل مع الدعم",
  },
  so: {
    title: "Amniga iyo ilaalinta xogta",
    description: "Xogta salon-kaaga waa la ilaaliyaa, waa gaar, adiguna waad maamushaa.",
    technicalOverviewTitle: "Dulmar farsamo",
    technicalOverviewBody:
      "TeqBook wuxuu ku shaqeeyaa kaabayaal daruureed casri ah oo leh kala-sooc adag oo xogta salon kasta ah. Adeegyada muhiimka ah si joogto ah ayaa loola socdaa, iyadoo la adeegsanayo kayd iyo soo kabasho si loo ilaaliyo joogtaynta shaqada.",
    yourDataTitle: "Xogtaadu adigaa leh.",
    yourDataBody: "Marna ma iibino mana wadaagno xogta macaamiisha.",
    contactSupport: "La xiriir taageerada",
  },
  ti: {
    title: "ደህንነትን ሓለዋ ዳታን",
    description: "ዳታ ሳሎንካ ይሕለው፣ ምስጢራዊ እዩ፣ ትቆጻጸሮ ድማ ንስኻ ኢኻ።",
    technicalOverviewTitle: "ቴክኒካዊ ሓፈሻዊ ርእይቶ",
    technicalOverviewBody:
      "TeqBook ብዘመናዊ ክላውድ መሰረት ይሰርሕ፣ ኣብ መንጎ ሳሎናት ድማ ጥብቅ ምፍላይ ዳታ ኣለዎ። መሰረታዊ ኣገልግሎታት ቀጻሊ ይተኻተቱ፣ ምስ ባካፕን ምምላስን ቁጽጽር ንቀጻልነት ስራሕ ይሕግዙ።",
    yourDataTitle: "ዳታኻ ናትካ ይቕጽል።",
    yourDataBody: "ዳታ ዓማዊል ፈጺምና ኣይንሸይጥን ኣይንካፈልን።",
    contactSupport: "ደገፍ ኣግኝ",
  },
  am: {
    title: "ደህንነት እና የውሂብ ጥበቃ",
    description: "የሳሎንዎ ውሂብ የተጠበቀ፣ የግል እና በእርስዎ ቁጥጥር ውስጥ ይቆያል።",
    technicalOverviewTitle: "ቴክኒካዊ አጠቃላይ እይታ",
    technicalOverviewBody:
      "TeqBook በዘመናዊ ክላውድ መሠረተ ልማት ላይ ይሰራል፣ በሳሎኖች መካከልም ጥብቅ የውሂብ መለያየት አለ። ዋና አገልግሎቶች በቀጣይነት ይታያሉ፣ እና የመጠባበቂያ/መመለሻ ቁጥጥሮች በስራ ቀጣይነት ላይ ይረዳሉ።",
    yourDataTitle: "ውሂብዎ የእርስዎ ነው።",
    yourDataBody: "የደንበኛ ውሂብ አንሸጥም እና አንጋራም።",
    contactSupport: "ድጋፍን ያግኙ",
  },
  tr: {
    title: "Guvenlik ve veri koruma",
    description: "Salon verileriniz korunur, ozel kalir ve controlunuzde olur.",
    technicalOverviewTitle: "Teknik genel bakis",
    technicalOverviewBody:
      "TeqBook, salonlar arasinda kati veri izolasyonuna sahip modern bulut altyapisi uzerinde calisir. Temel servisler surekli izlenir; yedekleme ve kurtarma kontrolleri is surekliligini koruyacak sekilde tasarlanmistir.",
    yourDataTitle: "Veriniz sizin kalir.",
    yourDataBody: "Musteri verilerini asla satmayiz veya paylasmayiz.",
    contactSupport: "Destekle iletisime gec",
  },
  pl: {
    title: "Bezpieczenstwo i ochrona danych",
    description: "Dane Twojego salonu pozostaja chronione, prywatne i pod Twoja kontrola.",
    technicalOverviewTitle: "Przeglad techniczny",
    technicalOverviewBody:
      "TeqBook dziala na nowoczesnej infrastrukturze chmurowej z rygorystyczna izolacja danych miedzy salonami. Kluczowe uslugi sa stale monitorowane, a mechanizmy kopii zapasowych i odtwarzania chronia ciaglosc dzialania.",
    yourDataTitle: "Twoje dane pozostaja Twoje.",
    yourDataBody: "Nigdy nie sprzedajemy ani nie udostepniamy danych klientow.",
    contactSupport: "Skontaktuj sie ze wsparciem",
  },
  vi: {
    title: "Bao mat va bao ve du lieu",
    description: "Du lieu salon cua ban duoc bao ve, rieng tu va nam trong quyen kiem soat cua ban.",
    technicalOverviewTitle: "Tong quan ky thuat",
    technicalOverviewBody:
      "TeqBook chay tren ha tang dam may hien dai voi co che co lap du lieu nghiem ngat giua cac salon. Cac dich vu cot loi duoc giam sat lien tuc, kem theo sao luu va phuc hoi de bao dam tinh lien tuc kinh doanh.",
    yourDataTitle: "Du lieu cua ban van la cua ban.",
    yourDataBody: "Chung toi khong bao gio ban hoac chia se du lieu khach hang.",
    contactSupport: "Lien he ho tro",
  },
  zh: {
    title: "安全与数据保护",
    description: "你的沙龙数据始终受到保护、保持私密，并由你掌控。",
    technicalOverviewTitle: "技术概览",
    technicalOverviewBody:
      "TeqBook 运行在现代云基础设施上，并在各个沙龙之间实施严格的数据隔离。核心服务持续监控，配合备份与恢复控制，保障业务连续性。",
    yourDataTitle: "你的数据始终属于你。",
    yourDataBody: "我们绝不会出售或共享客户数据。",
    contactSupport: "联系支持",
  },
  tl: {
    title: "Seguridad at proteksyon ng data",
    description: "Protektado, pribado, at nasa kontrol mo ang data ng salon mo.",
    technicalOverviewTitle: "Teknikal na pangkalahatang-ideya",
    technicalOverviewBody:
      "Ang TeqBook ay tumatakbo sa modernong cloud infrastructure na may mahigpit na paghihiwalay ng data sa pagitan ng mga salon. Tuloy-tuloy ang monitoring ng core services, kasama ang backup at recovery controls para sa business continuity.",
    yourDataTitle: "Iyo pa rin ang data mo.",
    yourDataBody: "Hindi namin ibinebenta o ibinabahagi ang data ng customer.",
    contactSupport: "Makipag-ugnayan sa support",
  },
  fa: {
    title: "امنیت و حفاظت از داده",
    description: "داده های سالن شما محافظت می شود، خصوصی می ماند و تحت کنترل شماست.",
    technicalOverviewTitle: "نمای فنی",
    technicalOverviewBody:
      "TeqBook روی زیرساخت ابری مدرن اجرا می شود و بین سالن ها جداسازی سختگیرانه داده دارد. سرویس های اصلی به صورت پیوسته پایش می شوند و کنترل های پشتیبان گیری و بازیابی برای حفظ تداوم کسب وکار طراحی شده اند.",
    yourDataTitle: "داده شما متعلق به شما می ماند.",
    yourDataBody: "ما هرگز داده مشتری را نمی فروشیم یا به اشتراک نمی گذاریم.",
    contactSupport: "تماس با پشتیبانی",
  },
  dar: {
    title: "امنیت و محافظت داده",
    description: "داده سالن شما محافظت می شود، خصوصی می ماند و تحت کنترول شماست.",
    technicalOverviewTitle: "مرور تخنیکی",
    technicalOverviewBody:
      "TeqBook روی زیرساخت ابری مدرن اجرا می شود و بین سالن ها جداسازی سختگیرانه داده دارد. خدمات اصلی به گونه دوامدار نظارت می شوند و کنترل های بکاپ و بازیابی برای حفظ تداوم فعالیت طراحی شده اند.",
    yourDataTitle: "داده شما مربوط خودتان می ماند.",
    yourDataBody: "ما هرگز داده مشتری را نمی فروشیم یا شریک نمی سازیم.",
    contactSupport: "تماس با پشتیبانی",
  },
  ur: {
    title: "سیکیورٹی اور ڈیٹا تحفظ",
    description: "آپ کے سیلون کا ڈیٹا محفوظ، نجی، اور آپ کے کنٹرول میں رہتا ہے۔",
    technicalOverviewTitle: "تکنیکی جائزہ",
    technicalOverviewBody:
      "TeqBook جدید کلاؤڈ انفراسٹرکچر پر چلتا ہے اور سیلونز کے درمیان سخت ڈیٹا آئسولیشن رکھتا ہے۔ بنیادی سروسز کی مسلسل نگرانی ہوتی ہے، جبکہ بیک اپ اور ریکوری کنٹرولز کاروباری تسلسل کے لئے بنائے گئے ہیں۔",
    yourDataTitle: "آپ کا ڈیٹا آپ ہی کا رہتا ہے۔",
    yourDataBody: "ہم کبھی بھی کسٹمر ڈیٹا فروخت یا شیئر نہیں کرتے۔",
    contactSupport: "سپورٹ سے رابطہ",
  },
  hi: {
    title: "सुरक्षा और डेटा संरक्षण",
    description: "आपके सैलून का डेटा सुरक्षित, निजी और आपके नियंत्रण में रहता है।",
    technicalOverviewTitle: "तकनीकी अवलोकन",
    technicalOverviewBody:
      "TeqBook आधुनिक क्लाउड इंफ्रास्ट्रक्चर पर चलता है और सैलूनों के बीच सख्त डेटा आइसोलेशन रखता है। कोर सेवाओं की लगातार निगरानी की जाती है, और बैकअप व रिकवरी नियंत्रण बिजनेस कंटिन्यूटी के लिए बनाए गए हैं।",
    yourDataTitle: "आपका डेटा आपका ही रहता है।",
    yourDataBody: "हम कभी भी ग्राहक डेटा बेचते या साझा नहीं करते।",
    contactSupport: "सपोर्ट से संपर्क करें",
  },
};
