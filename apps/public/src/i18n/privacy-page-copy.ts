import type { AppLocale } from "@/i18n/translations";
import { privacyAmLocale } from "@/i18n/privacy-page-copy-am";

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
  am: privacyAmLocale,
  tr: {
    badge: "GIZLILIK",
    title: "Gizlilik politikasi",
    description: "Salon ve musteri verilerini sorumlu sekilde islemeye bagliyiz.",
    effectiveDate: "Yururluk tarihi: 25 Subat 2026",
    sections: [
      { title: "1. Topladigimiz veriler", paragraphs: ["TeqBook hizmetini sunmak icin gerekli kisisel ve isletme verilerini toplariz."], bullets: ["Hesap verisi: ad, e-posta, rol ve kimlik dogrulama bilgileri.", "Salon verisi: salon profili, personel bilgileri ve hizmet ayarlari.", "Randevu verisi: musteri adlari, randevu saatleri, hizmetler ve notlar.", "Teknik kullanim verisi: cihaz/tarayici bilgisi, loglar ve guvenlik olaylari."] },
      { title: "2. Veriyi nasil ve neden isliyoruz", paragraphs: ["Kisisel verileri TeqBook'u sunmak, guvenli tutmak ve gelistirmek icin isliyoruz.", "Hukuki dayanak; sozlesmenin ifasi, mesru menfaat, yasal yukumluluk ve gerektiginde acik riza olabilir."], bullets: ["Randevu, hatirlatma ve operasyon akisini yurutmeyi saglamak.", "Musteri destegi ve hizmet iletisimi sunmak.", "Guvenligi korumak ve olaylari incelemek.", "Yasal ve muhasebesel yukumlulukleri yerine getirmek."] },
      { title: "3. Paylasim, saklama ve muhafaza", paragraphs: ["Verileri yalnizca hizmet icin gerekli, guvenilir isleyicilerle sozlesmesel guvencelerle paylasiriz.", "Veriler erisim kontrolleri ve iletim sirasinda sifreleme ile korunur. Saklama suresi hesap durumu, yasal zorunluluk ve is ihtiyacina baglidir."] },
      { title: "4. Haklariniz", paragraphs: ["Gecerli hukuka gore erisim, duzeltme, silme, kisitlama, veri tasinabilirligi veya itiraz talep edebilirsiniz.", "Talepler support@teqbook.com adresine gonderilebilir. Talep oncesinde kimlik dogrulamasi isteyebiliriz."] },
      { title: "5. Uluslararasi aktarim ve guncellemeler", paragraphs: ["Veri ulkeniz disina aktarilirsa uygun yasal guvenceler uygulariz. Bu politikayi hukuki, teknik veya urun degisikliklerine gore guncelleyebiliriz."] },
    ],
    contactLead: "Gizlilik sorulari ve hak talepleri icin",
    contactEmail: "support@teqbook.com",
  },
  pl: {
    ...privacyEn,
    badge: "PRYWATNOSC",
    title: "Polityka prywatnosci",
    description: "Zobowiazujemy sie do odpowiedzialnego przetwarzania danych salonu i klientow.",
    effectiveDate: "Data wejscia w zycie: 25 lutego 2026",
    sections: [
      { title: "1. Jakie dane zbieramy", paragraphs: ["Zbieramy dane osobowe i biznesowe niezbedne do dzialania TeqBook."], bullets: ["Dane konta: imie, e-mail, rola, dane logowania.", "Dane salonu: profil, personel i konfiguracja uslug.", "Dane rezerwacji: dane klienta, terminy, uslugi i notatki.", "Dane techniczne: informacje o urzadzeniu/przegladarce, logi i zdarzenia bezpieczenstwa."] },
      { title: "2. Jak i dlaczego przetwarzamy dane", paragraphs: ["Przetwarzamy dane osobowe, aby swiadczyc, zabezpieczac i rozwijac TeqBook.", "Podstawa prawna obejmuje wykonanie umowy, uzasadniony interes, obowiazki prawne oraz zgode, gdy jest wymagana."], bullets: ["Realizacja rezerwacji i przypomnien.", "Obsluga wsparcia i komunikacji.", "Zapewnienie bezpieczenstwa i analiza incydentow.", "Spelnianie obowiazkow prawnych i ksiegowych."] },
      { title: "3. Udostepnianie, przechowywanie i retencja", paragraphs: ["Dane udostepniamy tylko zaufanym podmiotom przetwarzajacym niezbednym do dzialania uslugi, z zabezpieczeniami umownymi.", "Dane sa przechowywane bezpiecznie z kontrola dostepu i szyfrowaniem. Okres retencji zalezy od statusu konta, prawa i potrzeb biznesowych."] },
      { title: "4. Twoje prawa", paragraphs: ["W zaleznosci od prawa mozesz zadac dostepu, sprostowania, usuniecia, ograniczenia, przenoszenia danych lub sprzeciwu.", "Wnioski wysylaj na support@teqbook.com. Mozemy zweryfikowac tozsamosc przed realizacja."] },
      { title: "5. Transfery miedzynarodowe i aktualizacje", paragraphs: ["Przy transferach poza kraj stosujemy odpowiednie zabezpieczenia prawne. Polityka moze byc aktualizowana z powodow prawnych, technicznych lub produktowych."] },
    ],
    contactLead: "W sprawach prywatnosci i praw skontaktuj sie:",
    contactEmail: "support@teqbook.com",
  },
  vi: {
    ...privacyEn,
    badge: "RIENG TU",
    title: "Chinh sach rieng tu",
    description: "Chung toi cam ket xu ly du lieu salon va khach hang mot cach co trach nhiem.",
    effectiveDate: "Ngay hieu luc: 25 thang 2, 2026",
    sections: [
      { title: "1. Du lieu chung toi thu thap", paragraphs: ["Chung toi thu thap du lieu ca nhan va du lieu doanh nghiep can thiet de van hanh TeqBook."], bullets: ["Du lieu tai khoan: ten, email, vai tro, thong tin xac thuc.", "Du lieu salon: ho so salon, nhan su, cau hinh dich vu.", "Du lieu dat lich: ten khach, thoi gian, dich vu, ghi chu.", "Du lieu ky thuat: thong tin thiet bi/trinh duyet, log, su kien bao mat."] },
      { title: "2. Cach va ly do xu ly du lieu", paragraphs: ["Chung toi xu ly du lieu de cung cap, bao ve va cai tien TeqBook.", "Co so phap ly gom thuc hien hop dong, loi ich hop phap, nghia vu phap ly va su dong y khi can."], bullets: ["Van hanh dat lich va nhac lich.", "Ho tro khach hang va lien lac dich vu.", "Dam bao an toan va dieu tra su co.", "Tuan thu nghia vu phap ly va ke toan."] },
      { title: "3. Chia se, luu tru va thoi gian luu giu", paragraphs: ["Chung toi chi chia se du lieu voi doi tac xu ly dang tin cay can thiet cho dich vu, theo rang buoc hop dong.", "Du lieu duoc luu trong he thong an toan voi kiem soat truy cap va ma hoa. Thoi gian luu giu phu thuoc trang thai tai khoan, quy dinh phap ly va nhu cau kinh doanh."] },
      { title: "4. Quyen cua ban", paragraphs: ["Tuy theo phap luat ap dung, ban co the yeu cau truy cap, chinh sua, xoa, han che, xuat du lieu hoac phan doi xu ly.", "Gui yeu cau den support@teqbook.com. Chung toi co the xac minh danh tinh truoc khi xu ly."] },
      { title: "5. Chuyen du lieu quoc te va cap nhat chinh sach", paragraphs: ["Neu du lieu duoc chuyen ra ngoai quoc gia cua ban, chung toi ap dung bien phap bao dam phap ly phu hop. Chung toi co the cap nhat chinh sach nay theo thay doi phap ly, ky thuat hoac san pham."] },
    ],
    contactLead: "Cho cau hoi ve quyen rieng tu, lien he",
    contactEmail: "support@teqbook.com",
  },
  zh: {
    ...privacyEn,
    badge: "YINSI",
    title: "隐私政策",
    description: "我们承诺以负责的方式处理沙龙与客户数据。",
    effectiveDate: "生效日期：2026年2月25日",
    sections: [
      { title: "1. 我们收集的数据", paragraphs: ["我们收集运营 TeqBook 所需的个人与业务数据。"], bullets: ["账户数据：姓名、邮箱、角色与认证信息。", "沙龙数据：沙龙资料、员工信息与服务配置。", "预约数据：客户姓名、预约时间、服务与备注。", "技术数据：设备/浏览器信息、日志与安全事件。"] },
      { title: "2. 我们如何以及为何处理数据", paragraphs: ["我们处理个人数据以提供、保护并改进 TeqBook。", "法律依据通常包括合同履行、合法利益、法定义务以及在需要时的同意。"], bullets: ["提供预约、提醒和运营流程。", "提供客户支持与服务沟通。", "维护安全并调查事件。", "履行法律与会计义务。"] },
      { title: "3. 共享、存储与保留", paragraphs: ["我们仅在服务运行所需范围内与受合同约束的可信处理方共享数据。", "数据在具备访问控制和传输加密的安全系统中存储。保留期限取决于账户状态、法律要求与业务需要。"] },
      { title: "4. 你的权利", paragraphs: ["根据适用法律，你可请求访问、更正、删除、限制处理、导出数据或提出反对。", "请求可发送至 support@teqbook.com。处理前我们可能进行身份验证。"] },
      { title: "5. 国际传输与政策更新", paragraphs: ["若数据跨境传输，我们将采取适当法律保障。我们可能因法律、技术或产品变化更新本政策。"] },
    ],
    contactLead: "如有隐私问题、权利请求或投诉，请联系",
    contactEmail: "support@teqbook.com",
  },
  tl: {
    ...privacyEn,
    badge: "PRIVACY",
    title: "Patakaran sa privacy",
    description: "Naka-commit kami sa responsableng paghawak ng data ng salon at customer.",
    effectiveDate: "Petsa ng bisa: 25 Pebrero 2026",
    sections: [
      { title: "1. Datos na kinokolekta namin", paragraphs: ["Kinokolekta namin ang personal at business data na kailangan para patakbuhin ang TeqBook."], bullets: ["Account data: pangalan, email, role, at authentication details.", "Salon data: profile ng salon, staff details, at setup ng serbisyo.", "Booking data: pangalan ng customer, oras, serbisyo, at notes.", "Technical usage data: device/browser info, logs, at security events."] },
      { title: "2. Paano at bakit namin pinoproseso ang data", paragraphs: ["Pinoproseso namin ang data para maibigay, maseguro, at mapahusay ang TeqBook.", "Kasama sa legal basis ang contract performance, legitimate interests, legal obligations, at consent kapag kailangan."], bullets: ["Pagpapatakbo ng bookings at reminders.", "Customer support at service communication.", "Pagpapanatili ng security at pag-imbestiga ng incidents.", "Pagsunod sa legal at accounting obligations."] },
      { title: "3. Pagbabahagi, pag-iimbak, at retention", paragraphs: ["Ibinabahagi lang namin ang data sa trusted processors na kailangan para sa serbisyo, sa ilalim ng contractual safeguards.", "Iniimbak ang data sa secure systems na may access controls at encryption. Depende ang retention sa account status, legal requirements, at business need."] },
      { title: "4. Iyong mga karapatan", paragraphs: ["Depende sa applicable law, maaari kang humiling ng access, correction, deletion, restriction, data export, o objection sa processing.", "Ipadala ang request sa support@teqbook.com. Maaaring mag-verify muna kami ng identity."] },
      { title: "5. International transfers at policy updates", paragraphs: ["Kung ililipat ang data sa labas ng bansa mo, gagamit kami ng angkop na legal safeguards. Maaari naming i-update ang policy na ito dahil sa legal, technical, o product changes."] },
    ],
    contactLead: "Para sa privacy questions at rights requests, kontakin ang",
    contactEmail: "support@teqbook.com",
  },
  fa: {
    ...privacyEn,
    badge: "حریم خصوصی",
    title: "سیاست حریم خصوصی",
    description: "ما متعهد به مدیریت مسئولانه داده های سالن و مشتری هستیم.",
    effectiveDate: "تاریخ اجرا: 25 فوریه 2026",
    sections: [
      { title: "1. داده هایی که جمع آوری می کنیم", paragraphs: ["ما داده های شخصی و تجاری لازم برای ارائه TeqBook را جمع آوری می کنیم."], bullets: ["داده حساب: نام، ایمیل، نقش و اطلاعات احراز هویت.", "داده سالن: پروفایل سالن، اطلاعات کارکنان و تنظیم خدمات.", "داده رزرو: نام مشتری، زمان، خدمات رزروشده و یادداشت ها.", "داده فنی: اطلاعات دستگاه/مرورگر، لاگ ها و رویدادهای امنیتی."] },
      { title: "2. نحوه و دلیل پردازش داده", paragraphs: ["ما داده های شخصی را برای ارائه، ایمن سازی و بهبود TeqBook پردازش می کنیم.", "مبنای قانونی شامل اجرای قرارداد، منافع مشروع، الزامات قانونی و رضایت در صورت نیاز است."], bullets: ["اجرای رزروها و یادآوری ها.", "ارائه پشتیبانی و ارتباط خدماتی.", "حفظ امنیت و بررسی رخدادها.", "انجام الزامات قانونی و حسابداری."] },
      { title: "3. اشتراک گذاری، نگهداری و ماندگاری", paragraphs: ["ما داده را فقط با پردازشگرهای قابل اعتماد و ضروری، تحت تضمین های قراردادی، به اشتراک می گذاریم.", "داده ها در سیستم های امن با کنترل دسترسی و رمزنگاری نگهداری می شوند. مدت نگهداری به وضعیت حساب، الزامات قانونی و نیاز کسب وکار وابسته است."] },
      { title: "4. حقوق شما", paragraphs: ["بسته به قانون قابل اجرا، می توانید درخواست دسترسی، اصلاح، حذف، محدودسازی، خروجی داده یا اعتراض به پردازش داشته باشید.", "درخواست ها را به support@teqbook.com ارسال کنید. ممکن است پیش از اجرا، احراز هویت انجام شود."] },
      { title: "5. انتقال بین المللی و به روزرسانی سیاست", paragraphs: ["اگر داده ها به خارج از کشور شما منتقل شوند، از تضمین های قانونی مناسب استفاده می کنیم. ممکن است این سیاست را به دلیل تغییرات حقوقی، فنی یا محصول به روز کنیم."] },
    ],
    contactLead: "برای پرسش های حریم خصوصی یا درخواست حقوق، تماس بگیرید با",
    contactEmail: "support@teqbook.com",
  },
  dar: {
    ...privacyEn,
    badge: "حریم خصوصی",
    title: "پالیسی حریم خصوصی",
    description: "ما متعهد به مدیریت مسئولانه معلومات سالن و مشتری هستیم.",
    effectiveDate: "تاریخ اجرا: 25 فبروری 2026",
    sections: [
      { title: "1. معلوماتی که جمع آوری می کنیم", paragraphs: ["ما معلومات شخصی و تجارتی لازم برای ارائه TeqBook را جمع آوری می کنیم."], bullets: ["معلومات حساب: نام، ایمیل، نقش و معلومات تصدیق.", "معلومات سالن: پروفایل سالن، معلومات کارمندان و تنظیم خدمات.", "معلومات رزرو: نام مشتری، زمان، خدمات رزرو شده و یادداشت ها.", "معلومات فنی: معلومات دستگاه/مرورگر، لاگ ها و رویدادهای امنیتی."] },
      { title: "2. چگونه و چرا معلومات را پردازش می کنیم", paragraphs: ["ما معلومات شخصی را برای ارائه، امن سازی و بهبود TeqBook پردازش می کنیم.", "مبنای قانونی شامل اجرای قرارداد، منافع مشروع، الزامات قانونی و رضایت در صورت نیاز است."], bullets: ["اجرای رزروها و یادآوری ها.", "ارائه پشتیبانی و ارتباط خدماتی.", "حفظ امنیت و بررسی رویدادها.", "انجام الزامات قانونی و حسابداری."] },
      { title: "3. شریک سازی، نگهداری و حفظ معلومات", paragraphs: ["ما معلومات را فقط با پردازشگرهای قابل اعتماد و ضروری، تحت تضمین های قراردادی، شریک می سازیم.", "معلومات در سیستم های امن با کنترول دسترسی و رمزنگاری نگهداری می شوند. مدت نگهداری به وضعیت حساب، الزامات قانونی و نیاز کاروبار وابسته است."] },
      { title: "4. حقوق شما", paragraphs: ["مطابق قانون قابل اجرا، می توانید درخواست دسترسی، اصلاح، حذف، محدودسازی، انتقال داده یا اعتراض به پردازش داشته باشید.", "درخواست ها را به support@teqbook.com ارسال کنید. ممکن است پیش از اجرا، هویت شما بررسی شود."] },
      { title: "5. انتقال بین المللی و به روزرسانی پالیسی", paragraphs: ["اگر معلومات به خارج از کشور شما انتقال شود، از تضمین های قانونی مناسب استفاده می کنیم. ممکن است این پالیسی را به دلیل تغییرات حقوقی، فنی یا محصول به روز کنیم."] },
    ],
    contactLead: "برای سوالات حریم خصوصی یا درخواست حقوق، تماس بگیرید با",
    contactEmail: "support@teqbook.com",
  },
  ur: {
    ...privacyEn,
    badge: "پرائیویسی",
    title: "پرائیویسی پالیسی",
    description: "ہم سیلون اور صارف ڈیٹا کو ذمہ داری سے سنبھالنے کے پابند ہیں۔",
    effectiveDate: "موثر تاریخ: 25 فروری 2026",
    sections: [
      { title: "1. ہم کون سا ڈیٹا جمع کرتے ہیں", paragraphs: ["ہم TeqBook چلانے کے لیے ضروری ذاتی اور کاروباری ڈیٹا جمع کرتے ہیں۔"], bullets: ["اکاؤنٹ ڈیٹا: نام، ای میل، کردار اور تصدیقی معلومات۔", "سیلون ڈیٹا: سیلون پروفائل، اسٹاف معلومات اور سروس سیٹ اپ۔", "بکنگ ڈیٹا: کسٹمر نام، اوقات، سروسز اور نوٹس۔", "تکنیکی ڈیٹا: ڈیوائس/براؤزر معلومات، لاگز اور سیکیورٹی واقعات۔"] },
      { title: "2. ہم ڈیٹا کیسے اور کیوں پراسیس کرتے ہیں", paragraphs: ["ہم ذاتی ڈیٹا TeqBook فراہم کرنے، محفوظ رکھنے اور بہتر بنانے کے لیے پراسیس کرتے ہیں۔", "قانونی بنیاد میں معاہدے کی تکمیل، جائز مفاد، قانونی تقاضے اور جہاں ضروری ہو رضامندی شامل ہے۔"], bullets: ["بکنگ اور یاددہانی چلانا۔", "کسٹمر سپورٹ اور سروس کمیونیکیشن دینا۔", "سیکیورٹی برقرار رکھنا اور واقعات کی جانچ کرنا۔", "قانونی اور اکاؤنٹنگ ذمہ داریاں پوری کرنا۔"] },
      { title: "3. شیئرنگ، اسٹوریج اور ریٹینشن", paragraphs: ["ہم ڈیٹا صرف قابل اعتماد پروسیسرز کے ساتھ شیئر کرتے ہیں جو سروس کے لیے ضروری ہوں، اور وہ بھی معاہداتی حفاظتی شرائط کے تحت۔", "ڈیٹا محفوظ سسٹمز میں ایکسیس کنٹرول اور انکرپشن کے ساتھ محفوظ رکھا جاتا ہے۔ ریٹینشن مدت اکاؤنٹ اسٹیٹس، قانونی تقاضوں اور کاروباری ضرورت پر منحصر ہے۔"] },
      { title: "4. آپ کے حقوق", paragraphs: ["قابل اطلاق قانون کے مطابق آپ رسائی، تصحیح، حذف، پابندی، ڈیٹا ایکسپورٹ یا پراسیسنگ پر اعتراض کی درخواست کر سکتے ہیں۔", "درخواست support@teqbook.com پر بھیجیں۔ عمل سے پہلے ہم شناخت کی تصدیق کر سکتے ہیں۔"] },
      { title: "5. بین الاقوامی منتقلی اور پالیسی اپڈیٹس", paragraphs: ["اگر ڈیٹا آپ کے ملک سے باہر منتقل ہو تو ہم مناسب قانونی حفاظتی اقدامات اپناتے ہیں۔ قانونی، تکنیکی یا پروڈکٹ تبدیلی کی صورت میں ہم اس پالیسی کو اپڈیٹ کر سکتے ہیں۔"] },
    ],
    contactLead: "پرائیویسی سوالات یا حقوق کی درخواست کے لیے رابطہ کریں",
    contactEmail: "support@teqbook.com",
  },
  hi: {
    ...privacyEn,
    badge: "गोपनीयता",
    title: "गोपनीयता नीति",
    description: "हम सैलून और ग्राहक डेटा को जिम्मेदारी से संभालने के लिए प्रतिबद्ध हैं।",
    effectiveDate: "प्रभावी तिथि: 25 फरवरी 2026",
    sections: [
      { title: "1. हम कौन सा डेटा एकत्र करते हैं", paragraphs: ["हम TeqBook चलाने के लिए आवश्यक व्यक्तिगत और व्यावसायिक डेटा एकत्र करते हैं।"], bullets: ["खाता डेटा: नाम, ईमेल, भूमिका और प्रमाणीकरण विवरण।", "सैलून डेटा: सैलून प्रोफाइल, स्टाफ जानकारी और सेवा सेटअप।", "बुकिंग डेटा: ग्राहक नाम, समय, बुक सेवाएं और नोट्स।", "तकनीकी डेटा: डिवाइस/ब्राउज़र जानकारी, लॉग और सुरक्षा घटनाएं।"] },
      { title: "2. हम डेटा कैसे और क्यों प्रोसेस करते हैं", paragraphs: ["हम TeqBook प्रदान करने, सुरक्षित रखने और बेहतर बनाने के लिए व्यक्तिगत डेटा प्रोसेस करते हैं।", "कानूनी आधार में अनुबंध पालन, वैध हित, कानूनी दायित्व और आवश्यक होने पर सहमति शामिल है।"], bullets: ["बुकिंग, रिमाइंडर और संचालन प्रक्रियाएं चलाना।", "ग्राहक सहायता और सेवा संचार प्रदान करना।", "सुरक्षा बनाए रखना और घटनाओं की जांच करना।", "कानूनी और लेखांकन दायित्व पूरे करना।"] },
      { title: "3. साझा करना, संग्रहण और संरक्षण", paragraphs: ["हम डेटा केवल विश्वसनीय प्रोसेसरों के साथ साझा करते हैं जो सेवा संचालन के लिए आवश्यक हों, और वह भी अनुबंधित सुरक्षा के तहत।", "डेटा सुरक्षित प्रणालियों में एक्सेस कंट्रोल और ट्रांजिट एन्क्रिप्शन के साथ रखा जाता है। संरक्षण अवधि खाता स्थिति, कानूनी आवश्यकताओं और व्यवसायिक जरूरत पर निर्भर करती है।"] },
      { title: "4. आपके अधिकार", paragraphs: ["लागू कानून के अनुसार आप एक्सेस, सुधार, हटाने, प्रोसेसिंग सीमित करने, डेटा निर्यात या आपत्ति का अनुरोध कर सकते हैं।", "अनुरोध support@teqbook.com पर भेजें। कार्रवाई से पहले हम पहचान सत्यापित कर सकते हैं।"] },
      { title: "5. अंतरराष्ट्रीय ट्रांसफर और नीति अपडेट", paragraphs: ["यदि डेटा आपके देश से बाहर स्थानांतरित होता है, तो हम उचित कानूनी सुरक्षा उपाय लागू करते हैं। कानूनी, तकनीकी या उत्पाद परिवर्तनों के आधार पर हम इस नीति को अपडेट कर सकते हैं।"] },
    ],
    contactLead: "गोपनीयता प्रश्न या अधिकार अनुरोध के लिए संपर्क करें",
    contactEmail: "support@teqbook.com",
  },
};

export function getPrivacyPageCopy(locale: AppLocale): PrivacyPageCopy {
  return privacyPageCopyByLocale[locale] ?? privacyPageCopyByLocale.en;
}
