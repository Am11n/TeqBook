"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Database,
  ShieldCheck,
  UserCheck,
  HardDriveDownload,
} from "lucide-react";
import { Section } from "@/components/marketing/Section";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { getPublicPageTranslations } from "@/i18n/public-pages";
import type { AppLocale } from "@/i18n/translations";

type SecuritySectionId =
  | "data-protection"
  | "access-control"
  | "backups-reliability"
  | "data-ownership";

type SecurityLocaleContent = {
  trustStrip: [string, string, string, string];
  sharedPoints: [string, string, string, string];
  sections: Record<SecuritySectionId, { title: string; description: string }>;
};

const securityContentByLocale: Record<AppLocale, SecurityLocaleContent> = {
  en: {
    trustStrip: ["Secure EU hosting", "Encrypted connections", "Role-based access", "Automatic backups"],
    sharedPoints: [
      "Infrastructure is continuously monitored for unusual activity.",
      "Access is restricted by role and business need.",
      "Data is protected in transit and at rest.",
      "Operational controls support continuity and recovery.",
    ],
    sections: {
      "data-protection": { title: "Data protection", description: "We protect salon data with modern infrastructure and strong encryption." },
      "access-control": { title: "Access control & permissions", description: "Only the right people get access to the right data at the right time." },
      "backups-reliability": { title: "Backups & reliability", description: "We keep your system dependable so your daily operations can continue smoothly." },
      "data-ownership": { title: "Your data, your control", description: "Your business data remains yours, with clear control over access and lifecycle." },
    },
  },
  nb: {
    trustStrip: ["Sikker EU-hosting", "Krypterte forbindelser", "Rollebasert tilgang", "Automatiske sikkerhetskopier"],
    sharedPoints: [
      "Infrastrukturen overvåkes kontinuerlig for uvanlig aktivitet.",
      "Tilgang begrenses etter rolle og behov.",
      "Data beskyttes både under overføring og lagring.",
      "Driftskontroller støtter kontinuitet og gjenoppretting.",
    ],
    sections: {
      "data-protection": { title: "Databeskyttelse", description: "Vi beskytter salonsdata med moderne infrastruktur og sterk kryptering." },
      "access-control": { title: "Tilgangskontroll og rettigheter", description: "Kun riktige personer får tilgang til riktige data til riktig tid." },
      "backups-reliability": { title: "Backup og stabilitet", description: "Vi holder systemet stabilt slik at den daglige driften flyter." },
      "data-ownership": { title: "Dine data, din kontroll", description: "Bedriftsdataene dine forblir dine, med tydelig kontroll over tilgang og livssyklus." },
    },
  },
  ar: {
    trustStrip: ["استضافة آمنة داخل الاتحاد الأوروبي", "اتصالات مشفرة", "وصول حسب الأدوار", "نسخ احتياطية تلقائية"],
    sharedPoints: [
      "تتم مراقبة البنية التحتية باستمرار لأي نشاط غير معتاد.",
      "يتم تقييد الوصول حسب الدور والحاجة العملية.",
      "تتم حماية البيانات أثناء النقل وأثناء التخزين.",
      "تدعم ضوابط التشغيل الاستمرارية والتعافي.",
    ],
    sections: {
      "data-protection": { title: "حماية البيانات", description: "نحمي بيانات الصالون ببنية حديثة وتشفير قوي." },
      "access-control": { title: "التحكم بالصلاحيات", description: "يحصل الأشخاص المناسبون فقط على البيانات المناسبة في الوقت المناسب." },
      "backups-reliability": { title: "النسخ الاحتياطي والموثوقية", description: "نحافظ على موثوقية النظام حتى تستمر عملياتك اليومية بسلاسة." },
      "data-ownership": { title: "بياناتك تحت سيطرتك", description: "تبقى بيانات عملك ملكًا لك مع تحكم واضح في الوصول ودورة البيانات." },
    },
  },
  so: {
    trustStrip: ["Martigelin EU oo ammaan ah", "Xiriirro la sirgaxay", "Helitaan ku salaysan door", "Kayd otomaatig ah"],
    sharedPoints: [
      "Kaabayaasha si joogto ah ayaa loola socdaa dhaqdhaqaaq aan caadi ahayn.",
      "Helitaanka waxaa lagu xaddidaa door iyo baahi shaqo.",
      "Xogta waa la ilaaliyaa marka la gudbinayo iyo marka la keydinayo.",
      "Kontaroolada hawlgalka waxay taageeraan sii socodka iyo soo kabashada.",
    ],
    sections: {
      "data-protection": { title: "Ilaalinta xogta", description: "Waxaan ku ilaalinaa xogta salon-ka kaabayaal casri ah iyo sirgaxan adag." },
      "access-control": { title: "Xakameynta gelitaanka", description: "Kaliya dadka saxda ah ayaa helaya xogta saxda ah waqtiga saxda ah." },
      "backups-reliability": { title: "Kayd iyo isku hallayn", description: "Waxaan nidaamka ka dhignaa mid la isku halayn karo si hawsha maalinlaha ahi u socoto." },
      "data-ownership": { title: "Xogtaada adigaa leh", description: "Xogta ganacsigaagu adigaa iska leh, adiguna waad maamushaa." },
    },
  },
  ti: {
    trustStrip: ["ውሑስ EU hosting", "ዝተክረፀ ግንኙነት", "ብሓላፍነት ዝተመርኮሰ መእተዊ", "ኣውቶማቲክ ባካፕ"],
    sharedPoints: [
      "ትካል ኣወዳድራ ቀጻሊ ተከታትሎ ይኸውን።",
      "መእተዊ ብሓላፍነትን ብድሌት ስራሕን ይወሰን።",
      "ዳታ ኣብ ልእኽቲ እና ኣብ ማህደር ይሕለው።",
      "ስርዓት ቁጽጽር ንቀጻልነት እና ምምላስ ይድግፍ።",
    ],
    sections: {
      "data-protection": { title: "ሓለዋ ዳታ", description: "ዳታ ሳሎን ብዘመናዊ መሰረት እና ብርቱዕ ክሪፕሽን ንሕለው።" },
      "access-control": { title: "ቁጽጽር መእተዊ", description: "ዝግባእ ሰባት ጥራይ ናብ ዝግባእ ዳታ ይኣቱ።" },
      "backups-reliability": { title: "ባካፕን ተኣማንነትን", description: "ንስርዓትካ ኣመንታዊ እንገብሮ ንዕለታዊ ስራሕ።" },
      "data-ownership": { title: "ዳታኻ ትቆጻጸሮ", description: "ዳታ ንግድኻ ናትካ ይቐፅል።" },
    },
  },
  am: {
    trustStrip: ["አስተማማኝ EU ሆስቲንግ", "የተመሰጠሩ ግንኙነቶች", "በሚና የተመረጠ መዳረሻ", "ራስ-ሰር ባክአፕ"],
    sharedPoints: [
      "መሠረተ ልማቱ ያልተለመደ እንቅስቃሴ እንዳይኖር ቀጥሎ ይከታተላል።",
      "መዳረሻ በሚና እና በስራ ፍላጎት ይገደባል።",
      "ውሂብ በመተላለፊያ እና በማከማቻ ይጠበቃል።",
      "የኦፕሬሽን መቆጣጠሪያዎች ቀጣይነትን እና መመለስን ይደግፋሉ።",
    ],
    sections: {
      "data-protection": { title: "የውሂብ ጥበቃ", description: "የሳሎን ውሂብ በዘመናዊ መሠረተ ልማት እና በጠንካራ ኢንክሪፕሽን እንጠብቃለን።" },
      "access-control": { title: "የመዳረሻ ቁጥጥር", description: "ትክክለኛ ሰዎች ብቻ ትክክለኛውን ውሂብ ይደርሳሉ።" },
      "backups-reliability": { title: "ባክአፕ እና እምነት", description: "ዕለታዊ ስራዎት እንዲቀጥል ስርዓቱን እንዲታመን እናደርጋለን።" },
      "data-ownership": { title: "ውሂብዎ በእርስዎ ቁጥጥር", description: "የንግድ ውሂብዎ የእርስዎ ነው፣ ግልጽ ቁጥጥር አለዎት።" },
    },
  },
  tr: {
    trustStrip: ["Güvenli AB barındırma", "Şifreli bağlantılar", "Rol bazlı erişim", "Otomatik yedekleme"],
    sharedPoints: [
      "Altyapı, olağandışı etkinlikler için sürekli izlenir.",
      "Erişim, rol ve iş ihtiyacına göre sınırlandırılır.",
      "Veriler aktarımda ve depolamada korunur.",
      "Operasyonel kontroller süreklilik ve kurtarmayı destekler.",
    ],
    sections: {
      "data-protection": { title: "Veri koruma", description: "Salon verilerini modern altyapı ve güçlü şifreleme ile koruyoruz." },
      "access-control": { title: "Erişim kontrolü ve yetkiler", description: "Doğru kişiler doğru zamanda doğru verilere erişir." },
      "backups-reliability": { title: "Yedekleme ve güvenilirlik", description: "Günlük operasyonlarınızın sorunsuz sürmesi için sistemi güvenilir tutarız." },
      "data-ownership": { title: "Veriniz, sizin kontrolünüzde", description: "İş veriniz size aittir; erişim ve yaşam döngüsü üzerinde net kontrol sağlarsınız." },
    },
  },
  pl: {
    trustStrip: ["Bezpieczny hosting w UE", "Szyfrowane połączenia", "Dostęp oparty na rolach", "Automatyczne kopie zapasowe"],
    sharedPoints: [
      "Infrastruktura jest stale monitorowana pod kątem nietypowych zdarzeń.",
      "Dostęp jest ograniczany według roli i potrzeb biznesowych.",
      "Dane są chronione w tranzycie i w spoczynku.",
      "Kontrole operacyjne wspierają ciągłość i odtwarzanie.",
    ],
    sections: {
      "data-protection": { title: "Ochrona danych", description: "Chronimy dane salonu nowoczesną infrastrukturą i silnym szyfrowaniem." },
      "access-control": { title: "Kontrola dostępu i uprawnienia", description: "Właściwe osoby mają dostęp do właściwych danych we właściwym czasie." },
      "backups-reliability": { title: "Kopie zapasowe i niezawodność", description: "Utrzymujemy system niezawodny, aby codzienne operacje działały płynnie." },
      "data-ownership": { title: "Twoje dane pod Twoją kontrolą", description: "Dane Twojej firmy pozostają Twoje, z jasną kontrolą dostępu i cyklu życia." },
    },
  },
  vi: {
    trustStrip: ["Lưu trữ an toàn tại EU", "Kết nối được mã hóa", "Truy cập theo vai trò", "Sao lưu tự động"],
    sharedPoints: [
      "Hạ tầng được giám sát liên tục để phát hiện hoạt động bất thường.",
      "Quyền truy cập được giới hạn theo vai trò và nhu cầu công việc.",
      "Dữ liệu được bảo vệ khi truyền và khi lưu trữ.",
      "Kiểm soát vận hành hỗ trợ tính liên tục và khôi phục.",
    ],
    sections: {
      "data-protection": { title: "Bảo vệ dữ liệu", description: "Chúng tôi bảo vệ dữ liệu salon bằng hạ tầng hiện đại và mã hóa mạnh." },
      "access-control": { title: "Kiểm soát truy cập", description: "Đúng người chỉ truy cập đúng dữ liệu vào đúng thời điểm." },
      "backups-reliability": { title: "Sao lưu và độ tin cậy", description: "Chúng tôi giữ hệ thống ổn định để hoạt động hằng ngày diễn ra trơn tru." },
      "data-ownership": { title: "Dữ liệu của bạn, quyền kiểm soát của bạn", description: "Dữ liệu doanh nghiệp của bạn vẫn là của bạn, với kiểm soát rõ ràng." },
    },
  },
  zh: {
    trustStrip: ["欧盟安全托管", "加密连接", "基于角色的访问", "自动备份"],
    sharedPoints: [
      "基础设施持续监控异常活动。",
      "访问权限按角色和业务需求限制。",
      "数据在传输和存储时均受保护。",
      "运营控制支持连续性与恢复。",
    ],
    sections: {
      "data-protection": { title: "数据保护", description: "我们通过现代化基础设施和强加密保护沙龙数据。" },
      "access-control": { title: "访问控制与权限", description: "只有合适的人在合适时间访问合适数据。" },
      "backups-reliability": { title: "备份与可靠性", description: "我们保持系统可靠，确保日常运营顺畅。" },
      "data-ownership": { title: "你的数据由你掌控", description: "你的业务数据始终属于你，并可清晰控制访问和生命周期。" },
    },
  },
  tl: {
    trustStrip: ["Secure EU hosting", "Encrypted connections", "Role-based access", "Automatic backups"],
    sharedPoints: [
      "Patuloy na mino-monitor ang infrastructure laban sa kakaibang activity.",
      "Nililimitahan ang access ayon sa role at business need.",
      "Pinoprotektahan ang data habang dina-transfer at naka-store.",
      "Sinusuportahan ng operational controls ang continuity at recovery.",
    ],
    sections: {
      "data-protection": { title: "Proteksyon ng data", description: "Pinoprotektahan namin ang salon data gamit ang modernong infrastructure at malakas na encryption." },
      "access-control": { title: "Access control at permissions", description: "Tamang tao lang ang may access sa tamang data sa tamang oras." },
      "backups-reliability": { title: "Backups at reliability", description: "Pinapanatili naming dependable ang system para tuloy-tuloy ang daily operations." },
      "data-ownership": { title: "Data mo, kontrol mo", description: "Ang business data mo ay sa iyo pa rin, may malinaw na kontrol sa access at lifecycle." },
    },
  },
  fa: {
    trustStrip: ["میزبانی امن در اتحادیه اروپا", "اتصال رمزنگاری شده", "دسترسی مبتنی بر نقش", "پشتیبان گیری خودکار"],
    sharedPoints: [
      "زیرساخت به صورت پیوسته برای فعالیت غیرعادی پایش می شود.",
      "دسترسی بر اساس نقش و نیاز کاری محدود می شود.",
      "داده ها در انتقال و در حالت ذخیره محافظت می شوند.",
      "کنترل های عملیاتی از تداوم سرویس و بازیابی پشتیبانی می کنند.",
    ],
    sections: {
      "data-protection": { title: "محافظت از داده", description: "ما داده های سالن را با زیرساخت مدرن و رمزنگاری قوی محافظت می کنیم." },
      "access-control": { title: "کنترل دسترسی و مجوزها", description: "فقط افراد مناسب در زمان مناسب به داده مناسب دسترسی دارند." },
      "backups-reliability": { title: "پشتیبان گیری و پایداری", description: "سیستم را پایدار نگه می داریم تا عملیات روزانه شما روان بماند." },
      "data-ownership": { title: "داده شما، کنترل شما", description: "داده کسب وکار شما متعلق به شماست و کنترل روشنی روی دسترسی و چرخه عمر دارید." },
    },
  },
  dar: {
    trustStrip: ["میزبانی امن در اتحادیه اروپا", "اتصال رمزنگاری شده", "دسترسی مبتنی بر نقش", "بکاپ خودکار"],
    sharedPoints: [
      "زیرساخت به گونه دوامدار برای فعالیت غیرعادی نظارت می شود.",
      "دسترسی بر اساس نقش و ضرورت کاری محدود می شود.",
      "داده ها هنگام انتقال و ذخیره محافظت می شوند.",
      "کنترل های عملیاتی از تداوم خدمت و بازیابی پشتیبانی می کنند.",
    ],
    sections: {
      "data-protection": { title: "محافظت داده", description: "ما داده های سالن را با زیرساخت مدرن و رمزنگاری قوی محافظت می کنیم." },
      "access-control": { title: "کنترل دسترسی و مجوزها", description: "فقط افراد مناسب در زمان مناسب به داده مناسب دسترسی دارند." },
      "backups-reliability": { title: "بکاپ و پایداری", description: "سیستم را قابل اعتماد نگه می داریم تا عملیات روزمره روان باشد." },
      "data-ownership": { title: "داده شما، کنترل شما", description: "داده تجارت شما متعلق به شماست و کنترول واضح دارید." },
    },
  },
  ur: {
    trustStrip: ["محفوظ EU ہوسٹنگ", "انکرپٹڈ کنیکشنز", "رول بیسڈ ایکسیس", "خودکار بیک اپ"],
    sharedPoints: [
      "انفراسٹرکچر پر غیر معمولی سرگرمی کی مسلسل نگرانی کی جاتی ہے۔",
      "رسائی کو رول اور کاروباری ضرورت کے مطابق محدود کیا جاتا ہے۔",
      "ڈیٹا ٹرانزٹ اور اسٹوریج دونوں میں محفوظ رہتا ہے۔",
      "آپریشنل کنٹرولز تسلسل اور ریکوری کو سپورٹ کرتے ہیں۔",
    ],
    sections: {
      "data-protection": { title: "ڈیٹا تحفظ", description: "ہم جدید انفراسٹرکچر اور مضبوط انکرپشن کے ساتھ سیلون ڈیٹا محفوظ رکھتے ہیں۔" },
      "access-control": { title: "رسائی کنٹرول اور اجازتیں", description: "درست وقت پر درست افراد کو درست ڈیٹا تک رسائی ملتی ہے۔" },
      "backups-reliability": { title: "بیک اپ اور قابل اعتماد سسٹم", description: "ہم سسٹم کو قابل اعتماد رکھتے ہیں تاکہ روزانہ آپریشنز روانی سے چلیں۔" },
      "data-ownership": { title: "آپ کا ڈیٹا، آپ کا کنٹرول", description: "آپ کے کاروبار کا ڈیٹا آپ ہی کا رہتا ہے اور آپ کے کنٹرول میں ہوتا ہے۔" },
    },
  },
  hi: {
    trustStrip: ["सुरक्षित EU होस्टिंग", "एन्क्रिप्टेड कनेक्शन", "रोल आधारित एक्सेस", "ऑटोमेटिक बैकअप"],
    sharedPoints: [
      "इन्फ्रास्ट्रक्चर पर असामान्य गतिविधि की लगातार निगरानी होती है।",
      "एक्सेस को रोल और बिजनेस जरूरत के आधार पर सीमित किया जाता है।",
      "डेटा ट्रांजिट और स्टोरेज दोनों में सुरक्षित रहता है।",
      "ऑपरेशनल कंट्रोल्स निरंतरता और रिकवरी को सपोर्ट करते हैं।",
    ],
    sections: {
      "data-protection": { title: "डेटा सुरक्षा", description: "हम आधुनिक इंफ्रास्ट्रक्चर और मजबूत एन्क्रिप्शन से सैलून डेटा सुरक्षित रखते हैं।" },
      "access-control": { title: "एक्सेस कंट्रोल और परमिशन", description: "सही समय पर सही लोगों को सही डेटा तक पहुंच मिलती है।" },
      "backups-reliability": { title: "बैकअप और विश्वसनीयता", description: "हम सिस्टम को विश्वसनीय रखते हैं ताकि दैनिक संचालन सुचारु रहे।" },
      "data-ownership": { title: "आपका डेटा, आपका नियंत्रण", description: "आपके बिजनेस का डेटा आपका ही रहता है, और नियंत्रण भी आपका रहता है।" },
    },
  },
};

const securitySectionMeta: Array<{ id: SecuritySectionId; icon: typeof ShieldCheck }> = [
  { id: "data-protection", icon: ShieldCheck },
  { id: "access-control", icon: UserCheck },
  { id: "backups-reliability", icon: Database },
  { id: "data-ownership", icon: HardDriveDownload },
];

export default function SecurityPageClient() {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = getPublicPageTranslations(appLocale).marketingPages.security;
  const localized = securityContentByLocale[appLocale];

  return (
    <>
      <Section className="bg-gradient-to-b from-slate-50 via-blue-50/30 to-white pb-10 pt-20 sm:pb-12 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {t.title}
          </h1>
          <p className="mt-4 text-base text-slate-600 sm:text-lg">{t.description}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-slate-600 sm:gap-x-8">
            {localized.trustStrip.map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </Section>

      <Section className="py-14 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          {securitySectionMeta.map((sectionMeta) => {
            const section = localized.sections[sectionMeta.id];
            const points = localized.sharedPoints;
            return (
              <div
                key={sectionMeta.id}
                className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm shadow-blue-100/30 sm:p-7"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <sectionMeta.icon className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
                  {section.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {section.description}
                </p>
                <ul className="mt-5 space-y-3">
                  {points.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-slate-700">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                      <span className="leading-7">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Section>

      <Section className="py-10 sm:py-12">
        <div className="mx-auto max-w-3xl rounded-xl border border-blue-100 bg-blue-50/40 px-6 py-8 sm:px-8">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            {t.technicalOverviewTitle}
          </h2>
          <p className="mt-3 leading-7 text-slate-700">{t.technicalOverviewBody}</p>
        </div>
      </Section>

      <Section className="pt-6 sm:pt-8">
        <div className="mx-auto max-w-3xl border-t border-slate-200 pt-10 text-center sm:pt-12">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {t.yourDataTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-600">{t.yourDataBody}</p>
          <div className="mt-8">
            <Link
              href="/#demo"
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              {t.contactSupport}
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
