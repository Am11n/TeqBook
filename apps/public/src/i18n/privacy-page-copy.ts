import type { AppLocale } from "@/i18n/translations";

type LegalSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export type PrivacyPageCopy = {
  badge: string;
  title: string;
  description: string;
  effectiveDate: string;
  sections: [LegalSection, LegalSection, LegalSection, LegalSection, LegalSection];
  contactLead: string;
  contactEmail: string;
};

const privacyEn: PrivacyPageCopy = {
  badge: "PRIVACY",
  title: "Privacy policy",
  description: "We are committed to handling salon and customer data responsibly.",
  effectiveDate: "Effective date: 25 February 2026",
  sections: [
    { title: "1. Data we collect", paragraphs: ["We collect personal and business information needed to operate TeqBook."], bullets: ["Account data: name, email, role, and authentication details.", "Salon data: salon profile, staff details, and service setup.", "Booking data: customer names, appointment times, booked services, and notes.", "Technical usage data: device/browser info, logs, and security events."] },
    { title: "2. How and why we process data", paragraphs: ["We process personal data to provide, secure, and improve TeqBook.", "Legal basis includes contract performance, legitimate interests, legal obligations, and consent where required."], bullets: ["Deliver bookings, reminders, and operational workflows.", "Provide customer support and service communication.", "Maintain security, prevent abuse, and investigate incidents.", "Meet legal, accounting, and compliance obligations."] },
    { title: "3. Sharing, storage and retention", paragraphs: ["We only share data with trusted processors required to run the service, under contractual safeguards.", "Data is stored in secure systems with access controls, encryption in transit, and role-based permissions. Retention depends on account status, legal obligations, and business need."] },
    { title: "4. Your rights", paragraphs: ["Depending on applicable law, you may request access, correction, deletion, restriction, data export, or objection to processing.", "Requests can be sent to support@teqbook.com. We may verify identity before fulfilling a request."] },
    { title: "5. International transfers and policy updates", paragraphs: ["If data is transferred outside your country, we apply legal safeguards. We may update this policy to reflect legal, technical, or product changes."] },
  ],
  contactLead: "For privacy questions, rights requests, or complaints, contact",
  contactEmail: "support@teqbook.com",
};

export const privacyPageCopyByLocale: Record<AppLocale, PrivacyPageCopy> = {
  en: privacyEn,
  nb: {
    badge: "PERSONVERN",
    title: "Personvernerklæring",
    description: "Vi er forpliktet til å behandle salong- og kundedata ansvarlig.",
    effectiveDate: "Ikrafttredelse: 25. februar 2026",
    sections: [
      { title: "1. Data vi samler inn", paragraphs: ["Vi samler person- og virksomhetsdata som er nødvendige for å levere TeqBook."], bullets: ["Kontodata: navn, e-post, rolle og autentiseringsdetaljer.", "Salongdata: salongprofil, ansatte og tjenesteoppsett.", "Bookingtdata: kundenavn, tidspunkt, bestilte tjenester og notater.", "Tekniske bruksdata: enhets-/nettleserinfo, logger og sikkerhetshendelser."] },
      { title: "2. Hvordan og hvorfor vi behandler data", paragraphs: ["Vi behandler personopplysninger for å levere, sikre og forbedre TeqBook.", "Rettslig grunnlag inkluderer avtaleoppfyllelse, berettiget interesse, lovpålagte krav og samtykke der det kreves."], bullets: ["Levere booking, påminnelser og driftsflyt.", "Yte kundestøtte og tjenestekommunikasjon.", "Opprettholde sikkerhet, forebygge misbruk og undersøke hendelser.", "Oppfylle juridiske, regnskapsmessige og regulatoriske krav."] },
      { title: "3. Deling, lagring og oppbevaring", paragraphs: ["Vi deler kun data med pålitelige databehandlere som er nødvendige for drift, under avtalte sikkerhetstiltak.", "Data lagres i sikre systemer med tilgangskontroll, kryptering under overføring og rollebaserte rettigheter. Oppbevaring avhenger av kontostatus, lovkrav og forretningsbehov."] },
      { title: "4. Dine rettigheter", paragraphs: ["Avhengig av gjeldende lov kan du be om innsyn, retting, sletting, begrensning, dataeksport eller protest mot behandling.", "Forespørsler kan sendes til support@teqbook.com. Vi kan be om identitetsbekreftelse før vi oppfyller forespørselen."] },
      { title: "5. Internasjonale overføringer og oppdateringer", paragraphs: ["Hvis data overføres utenfor landet ditt, bruker vi lovpålagte sikkerhetstiltak. Vi kan oppdatere erklæringen ved juridiske, tekniske eller produktmessige endringer."] },
    ],
    contactLead: "For spørsmål om personvern, innsynskrav eller klager, kontakt",
    contactEmail: "support@teqbook.com",
  },
  ar: {
    badge: "الخصوصية",
    title: "سياسة الخصوصية",
    description: "نلتزم بالتعامل المسؤول مع بيانات الصالون والعملاء.",
    effectiveDate: "تاريخ السريان: 25 فبراير 2026",
    sections: [
      { title: "1. البيانات التي نجمعها", paragraphs: ["نجمع بيانات شخصية وتجارية لازمة لتشغيل TeqBook."], bullets: ["بيانات الحساب: الاسم والبريد الإلكتروني والدور وبيانات المصادقة.", "بيانات الصالون: ملف الصالون وبيانات الموظفين وإعداد الخدمات.", "بيانات الحجز: أسماء العملاء ومواعيد الحجز والخدمات والملاحظات.", "بيانات الاستخدام التقنية: معلومات الجهاز/المتصفح والسجلات وأحداث الأمان."] },
      { title: "2. كيف ولماذا نعالج البيانات", paragraphs: ["نعالج البيانات لتقديم TeqBook وتأمينه وتحسينه.", "الأساس القانوني يشمل تنفيذ العقد والمصلحة المشروعة والالتزام القانوني والموافقة عند الحاجة."], bullets: ["تنفيذ الحجوزات والتذكيرات وسير العمل التشغيلي.", "تقديم الدعم والتواصل الخدمي.", "الحفاظ على الأمان ومنع الإساءة والتحقيق في الحوادث.", "الوفاء بالالتزامات القانونية والمحاسبية والتنظيمية."] },
      { title: "3. المشاركة والتخزين والاحتفاظ", paragraphs: ["نشارك البيانات فقط مع معالجي بيانات موثوقين ضروريين لتشغيل الخدمة وبضمانات تعاقدية.", "يتم التخزين في أنظمة آمنة مع ضوابط وصول وتشفير أثناء النقل وصلاحيات حسب الدور. مدة الاحتفاظ تعتمد على حالة الحساب والالتزامات القانونية واحتياج العمل."] },
      { title: "4. حقوقك", paragraphs: ["وفقًا للقانون المعمول به، يمكنك طلب الوصول أو التصحيح أو الحذف أو التقييد أو تصدير البيانات أو الاعتراض على المعالجة.", "يمكن إرسال الطلبات إلى support@teqbook.com وقد نتحقق من الهوية قبل التنفيذ."] },
      { title: "5. التحويلات الدولية وتحديثات السياسة", paragraphs: ["إذا تم نقل البيانات خارج بلدك فنحن نطبق الضمانات القانونية المناسبة. وقد نحدّث هذه السياسة بما يعكس التغييرات القانونية أو التقنية أو المتعلقة بالمنتج."] },
    ],
    contactLead: "لأسئلة الخصوصية أو طلبات الحقوق أو الشكاوى، تواصل مع",
    contactEmail: "support@teqbook.com",
  },
  so: {
    badge: "ASTURNAAN",
    title: "Siyaasadda asturnaanta",
    description: "Waxaan ka go'an nahay maarayn mas'uul ah oo xogta salon iyo macaamiil.",
    effectiveDate: "Taariikhda dhaqan galka: 25 Febraayo 2026",
    sections: [
      { title: "1. Xogta aan ururino", paragraphs: ["Waxaan ururinaa xog shaqsi iyo mid ganacsi oo lagama maarmaan u ah TeqBook."], bullets: ["Xogta akoonka: magaca, iimaylka, doorka, iyo xaqiijinta.", "Xogta salon: profile-ka salon, shaqaale, iyo dejinta adeegyada.", "Xogta booking: magacyada macaamiisha, wakhtiyada, adeegyada, iyo qoraallada.", "Xogta farsamo: xog qalab/browser, logs, iyo dhacdooyin amni."] },
      { title: "2. Sida iyo sababta aan u farsamayno xogta", paragraphs: ["Waxaan farsamaynaa xogta si aan u bixino, u sugno, uguna horumarino TeqBook.", "Saldhigga sharci wuxuu ka kooban yahay fulinta heshiiska, dan sharci ah, waajibaad sharci, iyo oggolaansho marka loo baahdo."], bullets: ["In la bixiyo booking, xusuusin, iyo habraacyada hawlgalka.", "In la bixiyo taageero iyo isgaarsiin adeeg.", "In la ilaaliyo amniga oo la baaro dhacdooyinka.", "In la buuxiyo waajibaadka sharci iyo xisaabeed."] },
      { title: "3. Wadaagid, kaydin, iyo hayn", paragraphs: ["Waxaan xogta la wadaagnaa oo keliya processors la aamini karo oo lagama maarmaan u ah adeegga, iyadoo qandaraasyo amni jiraan.", "Xogta waxaa lagu kaydiyaa nidaamyo ammaan ah oo leh xakameyn gelitaan, sirgaxan gudbin, iyo rukhsado door-ku-saleysan. Muddo hayntu waxay ku xiran tahay xaaladda akoonka, sharciyada, iyo baahida ganacsi."] },
      { title: "4. Xuquuqdaada", paragraphs: ["Iyada oo ku xiran sharciga khuseeya, waxaad codsan kartaa gelitaan, sixid, tirtirid, xaddidid, dhoofin xog, ama diidmo farsamayn.", "Codsiyada ku dir support@teqbook.com. Waxaan xaqiijin karnaa aqoonsiga ka hor fulinta."] },
      { title: "5. Wareejinta caalamiga ah iyo cusboonaysiinta siyaasadda", paragraphs: ["Haddii xogta loo wareejiyo dibadda dalkaaga, waxaan adeegsannaa dammaanado sharci ah. Waxaan cusboonaysiin karnaa siyaasaddan marka sharci, farsamo, ama badeecad is beddelaan."] },
    ],
    contactLead: "Su'aalaha asturnaanta, codsiyada xuquuqda, ama cabashooyinka, la xiriir",
    contactEmail: "support@teqbook.com",
  },
  ti: {
    badge: "ምስጢራውነት",
    title: "ፖሊሲ ምስጢር",
    description: "ዳታ ሳሎንን ዓማዊልን ብኃላፍነት ክንሕዝ ተሓባቢርና ኢና።",
    effectiveDate: "ዕለት ስራሕ: 25 ለካቲት 2026",
    sections: [
      { title: "1. እንእክቦ ዳታ", paragraphs: ["TeqBook ንምስራሕ ዘድሊ ውልቃዊን ንግዳዊን ዳታ ንእክብ።"], bullets: ["ዳታ ኣካውንት: ስም, ኢሜይል, ሓላፍነት, ናይ ምርግጋጽ ሓበሬታ.", "ዳታ ሳሎን: ፕሮፋይል ሳሎን, ሰራሕተኛታት, ቅንብር ኣገልግሎት.", "ዳታ ቡኪንግ: ስም ዓማዊል, ሰዓት, ኣገልግሎት, መዘኻኸሪ.", "ቴክኒካዊ ዳታ: ሓበሬታ መሳርሒ/ብራውዘር, ሎግ, ናይ ደህንነት ኩነታት."] },
      { title: "2. ከመይን ስለምንታይን ዳታ ንሰርሕ", paragraphs: ["TeqBook ንምቕራብ, ንምሕላው, ንምምሕያሽ ዳታ ንሰርሕ።", "ሕጋዊ መሰረት እንተላ ስምምዕ ፍጻመ, ሕጋዊ ፍላጎት, ሕጋዊ ግዴታ, ከምኡውን ምፍቃድ እዩ።"], bullets: ["ቡኪንግ, ዝኽሪ, ስርዓት ስራሕ ምቕራብ.", "ደገፍ ዓማዊል እና ርክብ ኣገልግሎት.", "ደህንነት ምሕላውን ምርመራ ኩነታትን.", "ሕጋዊን ሒሳባዊን ግዴታታት ምፍጻም."] },
      { title: "3. ምክፋል, ምኽዛን, ምቕማጥ", paragraphs: ["ኣገልግሎት ንምክያድ ኣስፈላጊ ዝኾኑ ዝተኣማመኑ ሰራሕተኛታት ዳታ ጥራይ ንካፈል።", "ዳታ ብቁጽጽር መእተዊ, ክሪፕሽን ኣብ ልእኽቲ, እና ብሓላፍነት ፍቓድ ኣብ ውሑስ ስርዓት ይቕመጥ።"] },
      { title: "4. መሰላትካ", paragraphs: ["ብመሰረት ሕጊ ተፈፃሚ, ምእታው, ምእራም, ምድምሳስ, ግደብ, ምውጻእ ዳታ ወይ ተቓውሞ ክትሓትት ትኽእል።", "ጥያቄታት ናብ support@teqbook.com ስደድ። ቅድሚ ምፍጻም መንነት ክንረጋግፅ ንኽእል።"] },
      { title: "5. ዓለምለኻዊ ምትሕልላፍን ምምሕያሽ ፖሊሲን", paragraphs: ["ዳታ ካብ ሃገርካ እንተተላለፈ, ሕጋዊ መከላከያ ንጥቀም። እዚ ፖሊሲ ብሕጋዊ, ቴክኒካዊ ወይ ናይ ፕሮዳክት ለውጢ ክንዘምን ንኽእል።"] },
    ],
    contactLead: "ጥያቄ ምስጢር ወይ ሕቶ መሰል ን",
    contactEmail: "support@teqbook.com",
  },
  am: { ...privacyEn, badge: "ግላዊነት", title: "የግላዊነት ፖሊሲ", description: "የሳሎን እና የደንበኛ ውሂብን በኃላፊነት ለመቆጣጠር ቁርጠኞች ነን።", effectiveDate: "የሚተገበርበት ቀን: 25 ፌብሩወሪ 2026", contactLead: "ለግላዊነት ጥያቄዎች ወይም ቅሬታዎች ያግኙ", contactEmail: "support@teqbook.com" },
  tr: { ...privacyEn, badge: "GIZLILIK", title: "Gizlilik politikasi", description: "Salon ve musteri verilerini sorumlu sekilde islemeye bagliyiz.", effectiveDate: "Yururluk tarihi: 25 Subat 2026", contactLead: "Gizlilik sorulari ve hak talepleri icin", contactEmail: "support@teqbook.com" },
  pl: { ...privacyEn, badge: "PRYWATNOSC", title: "Polityka prywatnosci", description: "Zobowiazujemy sie do odpowiedzialnego przetwarzania danych salonu i klientow.", effectiveDate: "Data wejscia w zycie: 25 lutego 2026", contactLead: "W sprawach prywatnosci i praw skontaktuj sie:", contactEmail: "support@teqbook.com" },
  vi: { ...privacyEn, badge: "RIENG TU", title: "Chinh sach rieng tu", description: "Chung toi cam ket xu ly du lieu salon va khach hang mot cach co trach nhiem.", effectiveDate: "Ngay hieu luc: 25 thang 2, 2026", contactLead: "Cho cau hoi ve quyen rieng tu, lien he", contactEmail: "support@teqbook.com" },
  zh: { ...privacyEn, badge: "YINSI", title: "隐私政策", description: "我们承诺以负责的方式处理沙龙与客户数据。", effectiveDate: "生效日期：2026年2月25日", contactLead: "如有隐私问题、权利请求或投诉，请联系", contactEmail: "support@teqbook.com" },
  tl: { ...privacyEn, badge: "PRIVACY", title: "Patakaran sa privacy", description: "Naka-commit kami sa responsableng paghawak ng data ng salon at customer.", effectiveDate: "Petsa ng bisa: 25 Pebrero 2026", contactLead: "Para sa privacy questions at rights requests, kontakin ang", contactEmail: "support@teqbook.com" },
  fa: { ...privacyEn, badge: "حریم خصوصی", title: "سیاست حریم خصوصی", description: "ما متعهد به مدیریت مسئولانه داده های سالن و مشتری هستیم.", effectiveDate: "تاریخ اجرا: 25 فوریه 2026", contactLead: "برای پرسش های حریم خصوصی یا درخواست حقوق، تماس بگیرید با", contactEmail: "support@teqbook.com" },
  dar: { ...privacyEn, badge: "حریم خصوصی", title: "پالیسی حریم خصوصی", description: "ما متعهد به مدیریت مسئولانه معلومات سالن و مشتری هستیم.", effectiveDate: "تاریخ اجرا: 25 فبروری 2026", contactLead: "برای سوالات حریم خصوصی یا درخواست حقوق، تماس بگیرید با", contactEmail: "support@teqbook.com" },
  ur: { ...privacyEn, badge: "پرائیویسی", title: "پرائیویسی پالیسی", description: "ہم سیلون اور صارف ڈیٹا کو ذمہ داری سے سنبھالنے کے پابند ہیں۔", effectiveDate: "موثر تاریخ: 25 فروری 2026", contactLead: "پرائیویسی سوالات یا حقوق کی درخواست کے لیے رابطہ کریں", contactEmail: "support@teqbook.com" },
  hi: { ...privacyEn, badge: "गोपनीयता", title: "गोपनीयता नीति", description: "हम सैलून और ग्राहक डेटा को जिम्मेदारी से संभालने के लिए प्रतिबद्ध हैं।", effectiveDate: "प्रभावी तिथि: 25 फरवरी 2026", contactLead: "गोपनीयता प्रश्न या अधिकार अनुरोध के लिए संपर्क करें", contactEmail: "support@teqbook.com" },
};

export function getPrivacyPageCopy(locale: AppLocale): PrivacyPageCopy {
  return privacyPageCopyByLocale[locale] ?? privacyPageCopyByLocale.en;
}
