import type { AppLocale } from "@/i18n/translations";
import { termsAmLocale } from "@/i18n/terms-page-copy-am";
import { termsHiLocale } from "@/i18n/terms-page-copy-hi";
type LegalSection = { title: string; paragraphs: string[]; bullets?: string[] };

export type TermsPageCopy = {
  badge: string;
  title: string;
  description: string;
  effectiveDate: string;
  sections: LegalSection[];
  acceptance: string;
};

function enSections(): LegalSection[] {
  return [
    { title: "1. Agreement scope", paragraphs: ["These Terms govern your access to and use of TeqBook products, websites, applications, and related services. By creating an account or using the platform, you accept these terms."] },
    { title: "2. Accounts, roles and responsibilities", paragraphs: ["Account owners are responsible for team access, permissions, and activity under their organization account. You must provide accurate information and protect login credentials."] },
    { title: "3. Subscriptions, fees and billing", paragraphs: ["Paid plans are billed according to the selected subscription period. Upgrades, downgrades, and add-ons may change future invoices based on your active plan and usage.", "Unless otherwise stated, fees are non-refundable for already delivered service periods, subject to mandatory consumer law where applicable."] },
    { title: "4. Acceptable use", paragraphs: ["You agree not to:"], bullets: ["Use TeqBook for unlawful activity or fraudulent behavior.", "Attempt unauthorized access to systems, accounts, or data.", "Interfere with service stability, security, or other users.", "Upload harmful code, malware, or abusive content."] },
    { title: "5. Data ownership and privacy", paragraphs: ["You retain ownership of your business data. TeqBook processes personal data according to our Privacy Policy and applicable data protection law."] },
    { title: "6. Service availability and changes", paragraphs: ["We continuously improve the platform and may update features, limits, and integrations. Planned maintenance and security updates may temporarily affect availability."] },
    { title: "7. Limitation of liability", paragraphs: ["To the extent permitted by law, TeqBook is not liable for indirect, incidental, or consequential losses arising from service use, downtime, or third-party integrations."] },
    { title: "8. Termination and suspension", paragraphs: ["You may stop using the service at any time. We may suspend or terminate accounts that violate these terms, applicable law, or security policies."] },
    { title: "9. Governing law and contact", paragraphs: ["These terms are governed by applicable law in the jurisdiction where TeqBook is established, unless mandatory local law provides otherwise.", "For legal or contractual questions, contact support@teqbook.com."] },
  ];
}

const termsEn: TermsPageCopy = {
  badge: "TERMS",
  title: "Terms of service",
  description: "These terms explain the responsibilities and rights of TeqBook and its customers.",
  effectiveDate: "Effective date: 25 February 2026",
  sections: enSections(),
  acceptance:
    "By using TeqBook, you confirm that you have read and accepted these Terms of Service and the Privacy Policy.",
};

const nb: TermsPageCopy = {
  badge: "VILKAR",
  title: "Vilkår for tjenesten",
  description: "Disse vilkårene forklarer ansvar og rettigheter for TeqBook og kunder.",
  effectiveDate: "Ikrafttredelse: 25. februar 2026",
  sections: [
    { title: "1. Avtalens omfang", paragraphs: ["Disse vilkårene regulerer tilgang til og bruk av TeqBook, inkludert nettsted, app og relaterte tjenester. Ved opprettelse av konto eller bruk av plattformen godtar du vilkårene."] },
    { title: "2. Kontoer, roller og ansvar", paragraphs: ["Kontoeier er ansvarlig for teamtilgang, rettigheter og aktivitet under organisasjonskontoen. Du må oppgi riktig informasjon og beskytte innloggingsdetaljer."] },
    { title: "3. Abonnement, gebyrer og fakturering", paragraphs: ["Betalte planer faktureres etter valgt periode. Oppgraderinger, nedgraderinger og tillegg kan endre fremtidige fakturaer basert på aktiv plan og bruk.", "Med mindre annet er oppgitt, refunderes ikke gebyrer for allerede levert periode, med forbehold om ufravikelig forbrukerlovgivning."] },
    { title: "4. Tillatt bruk", paragraphs: ["Du samtykker i å ikke:"], bullets: ["Bruke TeqBook til ulovlig aktivitet eller svindel.", "Forsøke uautorisert tilgang til systemer, kontoer eller data.", "Forstyrre tjenestens stabilitet, sikkerhet eller andre brukere.", "Laste opp skadelig kode, skadevare eller krenkende innhold."] },
    { title: "5. Dataeierskap og personvern", paragraphs: ["Du beholder eierskap til virksomhetsdata. TeqBook behandler personopplysninger i tråd med personvernerklæringen og gjeldende lov."] },
    { title: "6. Tilgjengelighet og endringer", paragraphs: ["Vi forbedrer plattformen kontinuerlig og kan oppdatere funksjoner, grenser og integrasjoner. Planlagt vedlikehold og sikkerhetsoppdateringer kan midlertidig påvirke tilgjengelighet."] },
    { title: "7. Ansvarsbegrensning", paragraphs: ["I den grad loven tillater det, er TeqBook ikke ansvarlig for indirekte tap, følgeskader eller tap knyttet til nedetid eller tredjepartsintegrasjoner."] },
    { title: "8. Oppsigelse og suspensjon", paragraphs: ["Du kan avslutte bruk når som helst. Vi kan suspendere eller avslutte kontoer som bryter vilkårene, gjeldende lov eller sikkerhetspolicyer."] },
    { title: "9. Lovvalg og kontakt", paragraphs: ["Vilkårene reguleres av gjeldende lov i jurisdiksjonen der TeqBook er etablert, med mindre ufravikelig lokal lov sier noe annet.", "For juridiske spørsmål: support@teqbook.com."] },
  ],
  acceptance:
    "Ved å bruke TeqBook bekrefter du at du har lest og akseptert disse vilkårene og personvernerklæringen.",
};

const commonLocalized: Partial<Record<AppLocale, TermsPageCopy>> = {
  ar: {
    ...termsEn,
    badge: "الشروط",
    title: "شروط الخدمة",
    description: "توضح هذه الشروط مسؤوليات وحقوق TeqBook والعملاء.",
    effectiveDate: "تاريخ السريان: 25 فبراير 2026",
    sections: [
      { title: "1. نطاق الاتفاقية", paragraphs: ["تحكم هذه الشروط وصولك واستخدامك لمنتجات TeqBook ومواقعه وتطبيقاته وخدماته. بإنشاء حساب أو استخدام المنصة فإنك تقبل هذه الشروط."] },
      { title: "2. الحسابات والأدوار والمسؤوليات", paragraphs: ["مالك الحساب مسؤول عن صلاحيات الفريق والنشاط ضمن حساب المؤسسة. يجب تقديم معلومات دقيقة وحماية بيانات تسجيل الدخول."] },
      { title: "3. الاشتراكات والرسوم والفوترة", paragraphs: ["تُفوتر الخطط المدفوعة حسب فترة الاشتراك المختارة. قد تؤثر الترقية أو التخفيض أو الإضافات في الفواتير المستقبلية.", "ما لم يُذكر خلاف ذلك، لا تُرد الرسوم للفترات المقدمة بالفعل، مع مراعاة قوانين المستهلك الإلزامية."] },
      { title: "4. الاستخدام المقبول", paragraphs: ["توافق على عدم:"], bullets: ["استخدام TeqBook لنشاط غير قانوني أو احتيالي.", "محاولة الوصول غير المصرح به إلى الأنظمة أو الحسابات أو البيانات.", "التأثير على استقرار الخدمة أو أمنها أو على المستخدمين الآخرين.", "رفع تعليمات ضارة أو برمجيات خبيثة أو محتوى مسيء."] },
      { title: "5. ملكية البيانات والخصوصية", paragraphs: ["تبقى ملكية بيانات عملك لك. يعالج TeqBook البيانات الشخصية وفق سياسة الخصوصية والقانون المعمول به."] },
      { title: "6. توفر الخدمة والتغييرات", paragraphs: ["نعمل باستمرار على تحسين المنصة وقد نحدّث الميزات والحدود والتكاملات. قد تؤثر أعمال الصيانة والتحديثات الأمنية مؤقتًا على التوفر."] },
      { title: "7. تحديد المسؤولية", paragraphs: ["إلى الحد المسموح به قانونًا، لا يتحمل TeqBook مسؤولية الخسائر غير المباشرة أو التبعية الناتجة عن استخدام الخدمة أو التوقف أو تكاملات الطرف الثالث."] },
      { title: "8. الإنهاء والتعليق", paragraphs: ["يمكنك التوقف عن الاستخدام في أي وقت. وقد نعلّق أو ننهي الحسابات المخالفة للشروط أو القانون أو سياسات الأمان."] },
      { title: "9. القانون الحاكم والتواصل", paragraphs: ["تخضع هذه الشروط للقانون المعمول به في الولاية القضائية التي تأسس فيها TeqBook، ما لم يفرض القانون المحلي خلاف ذلك.", "للاستفسارات القانونية: support@teqbook.com."] },
    ],
    acceptance: "باستخدام TeqBook، فإنك تؤكد أنك قرأت ووافقت على شروط الخدمة وسياسة الخصوصية.",
  },
  so: {
    ...termsEn,
    badge: "SHURUUDAHA",
    title: "Shuruudaha adeegga",
    description: "Shuruudahani waxay sharxayaan waajibaadka iyo xuquuqda TeqBook iyo macaamiisha.",
    effectiveDate: "Taariikhda dhaqan galka: 25 Febraayo 2026",
    sections: [
      { title: "1. Baaxadda heshiiska", paragraphs: ["Shuruudahani waxay maamulaan gelitaanka iyo isticmaalka TeqBook iyo adeegyada la xiriira. Samaynta akoon ama isticmaalka madalku waxay ka dhigan tahay inaad aqbashay shuruudahaan."] },
      { title: "2. Akoonno, doorar iyo masuuliyado", paragraphs: ["Milkiilaha akoonka ayaa mas'uul ka ah rukhsadaha kooxda iyo dhaqdhaqaaqa ku jira akoonka ururka. Waa inaad bixisaa xog sax ah oo ilaalisaa aqoonsiga gelitaanka."] },
      { title: "3. Isdiiwaangelin, kharash iyo biil", paragraphs: ["Qorshayaasha lacagta leh waxaa lagu dalacaa muddada la doortay. Kor u qaadis, hoos u dhigid iyo add-ons waxay beddeli karaan biilasha mustaqbalka.", "Haddii aan si kale loo sheegin, kharashka muddadii adeegga la bixiyay lama soo celiyo, marka laga reebo shuruudaha sharci ee khasabka ah."] },
      { title: "4. Isticmaal la oggol yahay", paragraphs: ["Waxaad ogolaatay inaadan:"], bullets: ["u isticmaalin TeqBook falal sharci-darro ah ama khiyaano.", "isku dayin gelitaan aan idmanayn nidaamyo, akoonno ama xog.", "faragelin ku samayn xasiloonida ama amniga adeegga.", "soo gelin code waxyeello leh ama malware."] },
      { title: "5. Lahaanshaha xogta iyo asturnaanta", paragraphs: ["Xogta ganacsigaaga adigaa iska leh. TeqBook waxay xogta shaqsiga u maamushaa si waafaqsan siyaasadda asturnaanta iyo sharciga khuseeya."] },
      { title: "6. Helitaanka adeegga iyo isbeddellada", paragraphs: ["Waxaan si joogto ah u horumarinaa madalka, waxaana beddeli karnaa sifooyin, xadiddo iyo integrations. Dayactir qorshaysan iyo updates amni ayaa si ku meel gaar ah u saameyn kara helitaanka."] },
      { title: "7. Xadidaadda masuuliyadda", paragraphs: ["Inta sharcigu oggol yahay, TeqBook mas'uul kama aha khasaarooyin aan toos ahayn ama ka dhasha adeegga, downtime ama adeegyada dhinac saddexaad."] },
      { title: "8. Joojin iyo hakad", paragraphs: ["Waxaad joojin kartaa adeegsiga mar kasta. Waxaan hakad gelin karnaa ama joojin karnaa akoonno jebiya shuruudaha, sharciga ama siyaasadaha amniga."] },
      { title: "9. Sharciga lagu dhaqayo iyo xiriir", paragraphs: ["Shuruudahani waxay ku xiran yihiin sharciga meesha TeqBook laga aasaasay, haddii aan sharci maxalli ah oo khasab ahi ka duwanayn.", "Su'aalaha sharci: support@teqbook.com."] },
    ],
    acceptance: "Markaad isticmausho TeqBook, waxaad xaqiijinaysaa inaad akhriday oo aqbashay shuruudahan iyo siyaasadda asturnaanta.",
  },
  ti: {
    ...termsEn,
    badge: "መስፈርቲ",
    title: "መስፈርቲ ኣገልግሎት",
    description: "እዚ መስፈርቲ ሓላፍነትን መሰልን ናይ TeqBook እና ዓማዊል ይገልፅ።",
    effectiveDate: "ዕለት ስራሕ: 25 ለካቲት 2026",
    sections: [
      { title: "1. ወሰን ስምምዕ", paragraphs: ["እዚ መስፈርቲ ንምእታውን ንጥቅምን ናይ TeqBook እና ኣገልግሎታቱ ይቆጻጸር። ኣካውንት ብምፍጣር ወይ ብምጥቃም እዚ መስፈርቲ ትቕበል።"] },
      { title: "2. ኣካውንትን ሓላፍነትን", paragraphs: ["ባዓል ኣካውንት ንሓላፍነት ጉጅለ እና ንተግባር ኣብ ውሽጢ ኣካውንት ይሓዝ። ትኽክለኛ ሓበሬታ ክትህብን መእተዊ ክትሕሉን ኣለካ።"] },
      { title: "3. ምዝገባን ክፍሊትን", paragraphs: ["ዝኽፈል ፕላን ብዝተመርጸ ግዜ ይቕፅል። ምዕባይ ወይ ምንኣስ ናይ ዝመጽእ ክፍሊት ክቕይር ይኽእል።", "እንተዘይተገልጸ ናይ ቀዲሙ ዝተረከበ ግዜ ክፍሊት ኣይመለስን።"] },
      { title: "4. ዝፍቀድ ኣጠቓቕማ", paragraphs: ["እዚ ከይትገብር ትስማዕ:"], bullets: ["ብሕጊ ዘይፍቀድ ነገር ምጥቃም.", "ዘይተፈቕደ ምእታው ምፍታን.", "ምረጋጋእ ኣገልግሎት ምትዕንቃፍ.", "ጉድኣታዊ ኮድ ምግባር."] },
      { title: "5. ብዓልነት ዳታ", paragraphs: ["ዳታ ንግድኻ ናትካ ይቐፅል። TeqBook ውልቃዊ ዳታ ብመሰረት ፖሊሲ ምስጢር ይሰርሕ።"] },
      { title: "6. ምብፃሕ ኣገልግሎት", paragraphs: ["ፕላትፎርም ቀጻሊ ንምምሕያሽ ንሰርሕ። ዝተወሰነ ግዜ ምጽጋን ኣብ ምብፃሕ ግዜያዊ ተጽዕኖ ክፈጥር ይኽእል።"] },
      { title: "7. ወሰን ሓላፍነት", paragraphs: ["ብመሰረት ሕጊ TeqBook ንዘይቀጥታዊ ጉድኣት ሓላፍነት ኣይወስድን።"] },
      { title: "8. ምቁራፅ እና ምእጋድ", paragraphs: ["ኣብ ዝኾነ ግዜ ኣገልግሎት ክትሕዝ ክትቁርፅ ትኽእል። መስፈርቲ ዘይከብር ኣካውንት ክንዕግድ ክንቁርፅ ንኽእል።"] },
      { title: "9. ሕጊ እና ርክብ", paragraphs: ["እዚ መስፈርቲ ብሕጊ ናይ ቦታ መሰረት TeqBook ዝተመስረተሉ ይመሓደር።", "ሕጋዊ ሕቶ: support@teqbook.com."] },
    ],
    acceptance: "TeqBook ብምጥቃምካ እዚ መስፈርቲን ፖሊሲ ምስጢርን ኣንቢብካ ተቐቢልካ ማለት እዩ።",
  },
  am: termsAmLocale,
  tr: {
    ...termsEn,
    badge: "SARTLAR",
    title: "Hizmet sartlari",
    description: "Bu sartlar, TeqBook ve musterilerinin sorumluluklarini ve haklarini aciklar.",
    effectiveDate: "Yururluk tarihi: 25 Subat 2026",
    sections: [
      { title: "1. Sozlesmenin kapsami", paragraphs: ["Bu sartlar TeqBook urunleri, web siteleri, uygulamalar ve ilgili hizmetlerin kullanimini duzenler. Hesap olusturarak veya platformu kullanarak bu sartlari kabul edersiniz."] },
      { title: "2. Hesaplar, roller ve sorumluluklar", paragraphs: ["Hesap sahibi ekip erisimi, yetkiler ve organizasyon hesabi altindaki etkinlikten sorumludur. Dogru bilgi vermeli ve giris bilgilerini korumalısınız."] },
      { title: "3. Abonelik, ucret ve faturalama", paragraphs: ["Ucretli planlar secilen doneme gore faturalandirilir. Yukseltme, dusurme ve ek paketler gelecekteki faturalari etkileyebilir.", "Aksi belirtilmedikce, sunulan doneme ait ucretler iade edilmez; zorunlu tuketici hukuku istisnadir."] },
      { title: "4. Kabul edilebilir kullanim", paragraphs: ["Sunlari yapmamayi kabul edersiniz:"], bullets: ["Yasadisi veya hileli kullanim.", "Yetkisiz sistem/hesap/veri erisimi denemesi.", "Hizmet kararliligini veya guvenligini bozma.", "Zararli kod veya kotuye kullanim icerigi yukleme."] },
      { title: "5. Veri sahipligi ve gizlilik", paragraphs: ["Isletme verinizin sahipligi sizde kalir. TeqBook kisisel veriyi Gizlilik Politikasi ve uygulanabilir hukuk kapsaminda isler."] },
      { title: "6. Hizmet kullanilabilirligi ve degisiklikler", paragraphs: ["Platformu surekli gelistiririz; ozellikler, limitler ve entegrasyonlar guncellenebilir. Planli bakim ve guvenlik guncellemeleri gecici etki yaratabilir."] },
      { title: "7. Sorumlulugun sinirlandirilmasi", paragraphs: ["Yasanin izin verdigi olcude TeqBook, dolayli veya sonuc niteligindeki kayiplardan sorumlu degildir."] },
      { title: "8. Sonlandirma ve askiya alma", paragraphs: ["Hizmeti istediginiz zaman birakabilirsiniz. Sartlari, hukuku veya guvenlik politikalarini ihlal eden hesaplar askiya alinabilir veya sonlandirilabilir."] },
      { title: "9. Uygulanacak hukuk ve iletisim", paragraphs: ["Bu sartlar TeqBook'un kurulu oldugu yargi cevresindeki hukuka tabidir; zorunlu yerel hukuk saklidir.", "Hukuki sorular: support@teqbook.com."] },
    ],
    acceptance: "TeqBook'u kullanarak bu Hizmet Sartlarini ve Gizlilik Politikasini okudugunuzu ve kabul ettiginizi onaylarsiniz.",
  },
  pl: {
    ...termsEn,
    badge: "WARUNKI",
    title: "Warunki korzystania",
    description: "Te warunki wyjasniaja prawa i obowiazki TeqBook oraz klientow.",
    effectiveDate: "Data wejscia w zycie: 25 lutego 2026",
    sections: [
      { title: "1. Zakres umowy", paragraphs: ["Niniejsze warunki reguluja dostep i korzystanie z produktow TeqBook, stron internetowych, aplikacji i uslug powiazanych. Tworzac konto lub korzystajac z platformy, akceptujesz te warunki."] },
      { title: "2. Konta, role i odpowiedzialnosc", paragraphs: ["Wlasciciel konta odpowiada za dostep zespolu, uprawnienia i aktywnosc w ramach konta organizacji. Musisz podawac poprawne dane i chronic dane logowania."] },
      { title: "3. Subskrypcje, oplaty i rozliczenia", paragraphs: ["Plany platne sa rozliczane wedlug wybranego okresu subskrypcji. Zmiany planu i dodatki moga zmienic przyszle faktury.", "O ile nie wskazano inaczej, oplaty za zrealizowany okres nie podlegaja zwrotowi, z zastrzezeniem bezwzglednie obowiazujacego prawa konsumenckiego."] },
      { title: "4. Dozwolone korzystanie", paragraphs: ["Zgadzasz sie, ze nie bedziesz:"], bullets: ["korzystac z TeqBook do dzialan nielegalnych lub oszukanczych.", "podejmowac prob nieuprawnionego dostepu do systemow, kont lub danych.", "zaklocac stabilnosci lub bezpieczenstwa uslugi.", "wgrywac zlosliwego kodu lub naduzyc."] },
      { title: "5. Wlasnosc danych i prywatnosc", paragraphs: ["Zachowujesz wlasnosc danych biznesowych. TeqBook przetwarza dane osobowe zgodnie z Polityka prywatnosci i prawem."] },
      { title: "6. Dostepnosc uslugi i zmiany", paragraphs: ["Stale rozwijamy platforme i mozemy aktualizowac funkcje, limity oraz integracje. Planowane prace i aktualizacje bezpieczenstwa moga tymczasowo wplynac na dostepnosc."] },
      { title: "7. Ograniczenie odpowiedzialnosci", paragraphs: ["W zakresie dozwolonym prawem TeqBook nie odpowiada za szkody posrednie lub nastepcze."] },
      { title: "8. Wypowiedzenie i zawieszenie", paragraphs: ["Mozesz zaprzestac korzystania w dowolnym momencie. Mozemy zawiesic lub zamknac konta naruszajace warunki, prawo lub zasady bezpieczenstwa."] },
      { title: "9. Prawo wlasciwe i kontakt", paragraphs: ["Warunki podlegaja prawu jurysdykcji, w ktorej ustanowiony jest TeqBook, chyba ze bezwzgledne prawo lokalne stanowi inaczej.", "Pytania prawne: support@teqbook.com."] },
    ],
    acceptance: "Korzystajac z TeqBook potwierdzasz, ze przeczytales i zaakceptowales Warunki korzystania oraz Polityke prywatnosci.",
  },
  vi: {
    ...termsEn,
    badge: "DIEU KHOAN",
    title: "Dieu khoan dich vu",
    description: "Cac dieu khoan nay giai thich trach nhiem va quyen cua TeqBook va khach hang.",
    effectiveDate: "Ngay hieu luc: 25 thang 2, 2026",
    sections: [
      { title: "1. Pham vi thoa thuan", paragraphs: ["Dieu khoan nay dieu chinh quyen truy cap va su dung san pham, website, ung dung va dich vu lien quan cua TeqBook. Khi tao tai khoan hoac su dung nen tang, ban dong y cac dieu khoan nay."] },
      { title: "2. Tai khoan, vai tro va trach nhiem", paragraphs: ["Chu tai khoan chiu trach nhiem ve quyen truy cap cua doi nhom, phan quyen va hoat dong trong tai khoan to chuc. Ban phai cung cap thong tin chinh xac va bao ve thong tin dang nhap."] },
      { title: "3. Goi dich vu, phi va thanh toan", paragraphs: ["Goi tra phi duoc tinh theo chu ky da chon. Nang cap, ha cap va add-on co the thay doi hoa don tuong lai.", "Tru khi co quy dinh khac, phi cho thoi ky da cung cap khong duoc hoan lai, ngoai tru cac truong hop bat buoc theo luat nguoi tieu dung."] },
      { title: "4. Su dung chap nhan duoc", paragraphs: ["Ban dong y khong:"], bullets: ["su dung TeqBook cho hanh vi bat hop phap hoac gian lan.", "co gang truy cap trai phep vao he thong, tai khoan hoac du lieu.", "can thiep vao tinh on dinh, bao mat hoac nguoi dung khac.", "tai len ma doc, malware hoac noi dung lam dung."] },
      { title: "5. Quyen so huu du lieu va rieng tu", paragraphs: ["Ban giu quyen so huu du lieu doanh nghiep cua minh. TeqBook xu ly du lieu ca nhan theo Chinh sach rieng tu va quy dinh phap luat ap dung."] },
      { title: "6. Tinh san sang cua dich vu va thay doi", paragraphs: ["Chung toi lien tuc cai tien nen tang va co the cap nhat tinh nang, gioi han va tich hop. Bao tri theo ke hoach va cap nhat bao mat co the tam thoi anh huong den tinh san sang."] },
      { title: "7. Gioi han trach nhiem", paragraphs: ["Trong pham vi phap luat cho phep, TeqBook khong chiu trach nhiem doi voi thiet hai gian tiep hoac hau qua."] },
      { title: "8. Cham dut va tam dung", paragraphs: ["Ban co the ngung su dung bat cu luc nao. Chung toi co the tam dung hoac cham dut tai khoan vi pham dieu khoan, phap luat hoac chinh sach bao mat."] },
      { title: "9. Luat ap dung va lien he", paragraphs: ["Dieu khoan nay duoc dieu chinh boi phap luat tai noi TeqBook duoc thanh lap, tru khi luat dia phuong bat buoc quy dinh khac.", "Cau hoi phap ly: support@teqbook.com."] },
    ],
    acceptance: "Bang viec su dung TeqBook, ban xac nhan da doc va chap nhan Dieu khoan dich vu va Chinh sach rieng tu.",
  },
  zh: {
    ...termsEn,
    badge: "条款",
    title: "服务条款",
    description: "这些条款说明了 TeqBook 与客户的责任和权利。",
    effectiveDate: "生效日期：2026年2月25日",
    sections: [
      { title: "1. 协议范围", paragraphs: ["本条款规范你对 TeqBook 产品、网站、应用及相关服务的访问与使用。创建账户或使用平台即表示你接受本条款。"] },
      { title: "2. 账户、角色与责任", paragraphs: ["账户所有者负责组织账户下的团队访问、权限和活动。你必须提供准确的信息并妥善保护登录凭据。"] },
      { title: "3. 订阅、费用与结算", paragraphs: ["付费方案按所选订阅周期计费。升级、降级和附加项可能影响未来账单。", "除非另有说明，已提供服务周期的费用一般不予退还，但强制性消费者法律另有规定的除外。"] },
      { title: "4. 可接受使用", paragraphs: ["你同意不会："], bullets: ["将 TeqBook 用于违法或欺诈活动。", "尝试未经授权访问系统、账户或数据。", "干扰服务稳定性、安全性或其他用户。", "上传恶意代码、恶意软件或滥用内容。"] },
      { title: "5. 数据所有权与隐私", paragraphs: ["你的业务数据所有权归你所有。TeqBook 按照隐私政策及适用数据保护法律处理个人数据。"] },
      { title: "6. 服务可用性与变更", paragraphs: ["我们持续改进平台，并可能更新功能、限制与集成。计划维护和安全更新可能暂时影响可用性。"] },
      { title: "7. 责任限制", paragraphs: ["在法律允许范围内，TeqBook 不对因服务使用、中断或第三方集成导致的间接或后果性损失承担责任。"] },
      { title: "8. 终止与暂停", paragraphs: ["你可随时停止使用服务。对违反条款、法律或安全政策的账户，我们可暂停或终止。"] },
      { title: "9. 适用法律与联系", paragraphs: ["本条款适用 TeqBook 设立地的法律；如当地强制性法律另有规定，则以当地法律为准。", "法律问题请联系：support@teqbook.com。"] },
    ],
    acceptance: "使用 TeqBook 即表示你已阅读并接受服务条款与隐私政策。",
  },
  tl: {
    ...termsEn,
    badge: "TUNTUNIN",
    title: "Mga tuntunin ng serbisyo",
    description: "Ipinapaliwanag ng mga tuntuning ito ang pananagutan at karapatan ng TeqBook at mga customer.",
    effectiveDate: "Petsa ng bisa: 25 Pebrero 2026",
    sections: [
      { title: "1. Saklaw ng kasunduan", paragraphs: ["Ang mga tuntuning ito ang namamahala sa access at paggamit mo ng mga produkto, website, app, at kaugnay na serbisyo ng TeqBook. Sa paggawa ng account o paggamit ng platform, tinatanggap mo ang mga tuntuning ito."] },
      { title: "2. Mga account, role, at responsibilidad", paragraphs: ["Ang may-ari ng account ang responsable sa team access, permissions, at activity sa account ng organisasyon. Dapat kang magbigay ng tamang impormasyon at protektahan ang login credentials."] },
      { title: "3. Subscription, bayad, at billing", paragraphs: ["Ang bayad na plans ay bina-bill ayon sa napiling period. Ang upgrades, downgrades, at add-ons ay maaaring makaapekto sa susunod na invoices.", "Maliban kung may ibang pahayag, hindi nare-refund ang bayad sa period na naibigay na, maliban sa mandatoryong consumer law."] },
      { title: "4. Katanggap-tanggap na paggamit", paragraphs: ["Sumasang-ayon kang hindi:"], bullets: ["gagamitin ang TeqBook para sa ilegal o mapanlinlang na gawain.", "susubukang magkaroon ng hindi awtorisadong access sa systems, accounts, o data.", "manghihimasok sa stability o security ng serbisyo.", "mag-a-upload ng harmful code, malware, o abusadong content."] },
      { title: "5. Pagmamay-ari ng data at privacy", paragraphs: ["Nananatili sa iyo ang pagmamay-ari ng business data mo. Pinoproseso ng TeqBook ang personal data ayon sa Privacy Policy at naaangkop na batas."] },
      { title: "6. Availability ng serbisyo at mga pagbabago", paragraphs: ["Patuloy naming pinapahusay ang platform at maaaring mag-update ng features, limits, at integrations. Ang planadong maintenance at security updates ay maaaring pansamantalang makaapekto sa availability."] },
      { title: "7. Limitasyon ng pananagutan", paragraphs: ["Sa lawak na pinapayagan ng batas, hindi mananagot ang TeqBook sa indirect o consequential losses mula sa paggamit ng serbisyo, downtime, o third-party integrations."] },
      { title: "8. Pagtatapos at pagsususpinde", paragraphs: ["Maaari mong ihinto ang paggamit anumang oras. Maaari naming suspendihin o wakasan ang accounts na lumalabag sa tuntunin, batas, o security policies."] },
      { title: "9. Namamahalang batas at contact", paragraphs: ["Pinamamahalaan ang mga tuntuning ito ng naaangkop na batas sa hurisdiksyon kung saan itinatag ang TeqBook, maliban kung iba ang itinatakda ng mandatory local law.", "Para sa legal na tanong: support@teqbook.com."] },
    ],
    acceptance: "Sa paggamit ng TeqBook, kinukumpirma mong nabasa at tinanggap mo ang Mga Tuntunin ng Serbisyo at Patakaran sa Privacy.",
  },
  fa: {
    ...termsEn,
    badge: "شرایط",
    title: "شرایط خدمات",
    description: "این شرایط، مسئولیت ها و حقوق TeqBook و مشتریان را توضیح می دهد.",
    effectiveDate: "تاریخ اجرا: 25 فوریه 2026",
    sections: [
      { title: "1. دامنه توافق", paragraphs: ["این شرایط دسترسی و استفاده شما از محصولات، وب‌سایت‌ها، برنامه‌ها و خدمات مرتبط TeqBook را تنظیم می‌کند. با ایجاد حساب یا استفاده از پلتفرم، این شرایط را می‌پذیرید."] },
      { title: "2. حساب‌ها، نقش‌ها و مسئولیت‌ها", paragraphs: ["مالک حساب مسئول دسترسی تیم، مجوزها و فعالیت‌ها در حساب سازمانی است. باید اطلاعات دقیق ارائه دهید و از اطلاعات ورود محافظت کنید."] },
      { title: "3. اشتراک، هزینه و صورتحساب", paragraphs: ["پلن‌های پولی بر اساس دوره اشتراک انتخابی صورتحساب می‌شوند. ارتقا، تنزل یا افزونه‌ها ممکن است صورتحساب‌های آینده را تغییر دهند.", "مگر اینکه خلاف آن اعلام شود، هزینه دوره‌های ارائه‌شده قابل استرداد نیست، مگر در موارد الزامی قانون حمایت از مصرف‌کننده."] },
      { title: "4. استفاده مجاز", paragraphs: ["شما موافقت می‌کنید که موارد زیر را انجام ندهید:"], bullets: ["استفاده غیرقانونی یا متقلبانه از TeqBook.", "تلاش برای دسترسی غیرمجاز به سیستم‌ها، حساب‌ها یا داده‌ها.", "ایجاد اختلال در پایداری یا امنیت سرویس یا سایر کاربران.", "بارگذاری کد مخرب، بدافزار یا محتوای سوءاستفاده‌گرانه."] },
      { title: "5. مالکیت داده و حریم خصوصی", paragraphs: ["مالکیت داده‌های کسب‌وکار شما نزد شما باقی می‌ماند. TeqBook داده‌های شخصی را مطابق سیاست حریم خصوصی و قانون قابل اجرا پردازش می‌کند."] },
      { title: "6. دسترس‌پذیری سرویس و تغییرات", paragraphs: ["ما به‌صورت مستمر پلتفرم را بهبود می‌دهیم و ممکن است ویژگی‌ها، محدودیت‌ها و یکپارچه‌سازی‌ها را تغییر دهیم. نگهداری برنامه‌ریزی‌شده و به‌روزرسانی‌های امنیتی ممکن است موقتاً بر دسترس‌پذیری اثر بگذارد."] },
      { title: "7. محدودیت مسئولیت", paragraphs: ["تا حد مجاز قانون، TeqBook در قبال خسارات غیرمستقیم یا تبعی ناشی از استفاده از سرویس، قطعی یا یکپارچه‌سازی‌های شخص ثالث مسئول نیست."] },
      { title: "8. خاتمه و تعلیق", paragraphs: ["شما می‌توانید هر زمان استفاده را متوقف کنید. ما می‌توانیم حساب‌هایی را که شرایط، قانون یا سیاست‌های امنیتی را نقض می‌کنند تعلیق یا خاتمه دهیم."] },
      { title: "9. قانون حاکم و تماس", paragraphs: ["این شرایط تابع قانون حوزه‌ای است که TeqBook در آن تاسیس شده است، مگر اینکه قانون محلی اجباری خلاف آن را مقرر کند.", "برای سوالات حقوقی: support@teqbook.com."] },
    ],
    acceptance: "با استفاده از TeqBook تایید می‌کنید که شرایط خدمات و سیاست حریم خصوصی را خوانده و پذیرفته‌اید.",
  },
  dar: {
    ...termsEn,
    badge: "شرایط",
    title: "شرایط خدمات",
    description: "این شرایط، حقوق و مسئولیت های TeqBook و مشتریان را تشریح می کند.",
    effectiveDate: "تاریخ اجرا: 25 فبروری 2026",
    sections: [
      { title: "1. دامنه توافق", paragraphs: ["این شرایط دسترسی و استفاده شما از محصولات، وب‌سایت‌ها، اپلیکیشن‌ها و خدمات مرتبط TeqBook را تنظیم می‌کند. با ساخت حساب یا استفاده از پلتفرم، این شرایط را می‌پذیرید."] },
      { title: "2. حساب‌ها، نقش‌ها و مسئولیت‌ها", paragraphs: ["مالک حساب مسئول دسترسی تیم، مجوزها و فعالیت‌ها در حساب سازمانی است. شما باید معلومات دقیق بدهید و معلومات ورود را محافظت کنید."] },
      { title: "3. اشتراک، فیس و صورتحساب", paragraphs: ["پلن‌های پولی مطابق دوره اشتراک انتخابی صورتحساب می‌شود. ارتقا، تنزل یا افزونه‌ها می‌تواند صورتحساب‌های آینده را تغییر دهد.", "مگر اینکه خلاف آن ذکر شود، فیس دوره‌های ارائه‌شده قابل بازپرداخت نیست، به استثنای موارد اجباری قانون حمایت از مصرف‌کننده."] },
      { title: "4. استفاده مجاز", paragraphs: ["شما موافق هستید که انجام ندهید:"], bullets: ["استفاده غیرقانونی یا تقلبی از TeqBook.", "تلاش برای دسترسی غیرمجاز به سیستم‌ها، حساب‌ها یا داده‌ها.", "ایجاد اخلال در ثبات یا امنیت سرویس یا کاربران دیگر.", "بارگذاری کُد مضر، بدافزار یا محتوای سوءاستفاده‌گرانه."] },
      { title: "5. مالکیت داده و حریم خصوصی", paragraphs: ["مالکیت داده‌های کسب‌وکار شما نزد خودتان باقی می‌ماند. TeqBook داده‌های شخصی را مطابق پالیسی حریم خصوصی و قانون قابل اجرا پردازش می‌کند."] },
      { title: "6. دسترس‌پذیری سرویس و تغییرات", paragraphs: ["ما پلتفرم را به‌طور دوامدار بهتر می‌کنیم و ممکن است قابلیت‌ها، محدودیت‌ها و یکپارچه‌سازی‌ها را تغییر دهیم. نگهداری برنامه‌ریزی‌شده و آپدیت‌های امنیتی می‌تواند موقتاً بر دسترس‌پذیری اثر بگذارد."] },
      { title: "7. محدودیت مسئولیت", paragraphs: ["تا حد مجاز قانون، TeqBook مسئول خسارات غیرمستقیم یا تبعی ناشی از استفاده از سرویس، قطعی یا یکپارچه‌سازی‌های جانب سوم نیست."] },
      { title: "8. ختم و تعلیق", paragraphs: ["شما می‌توانید هر زمان استفاده را متوقف کنید. ما می‌توانیم حساب‌هایی را که شرایط، قانون یا پالیسی امنیتی را نقض کنند، تعلیق یا ختم کنیم."] },
      { title: "9. قانون حاکم و تماس", paragraphs: ["این شرایط تابع قانون حوزه‌ای است که TeqBook در آن تاسیس شده است، مگر اینکه قانون محلی اجباری خلاف آن را مقرر کند.", "برای سوالات حقوقی: support@teqbook.com."] },
    ],
    acceptance: "با استفاده از TeqBook تایید می‌کنید که شرایط خدمات و پالیسی حریم خصوصی را خوانده و پذیرفته‌اید.",
  },
  ur: {
    ...termsEn,
    badge: "شرائط",
    title: "سروس کی شرائط",
    description: "یہ شرائط TeqBook اور صارفین کے حقوق اور ذمہ داریوں کی وضاحت کرتی ہیں۔",
    effectiveDate: "موثر تاریخ: 25 فروری 2026",
    sections: [
      { title: "1. معاہدے کا دائرہ", paragraphs: ["یہ شرائط TeqBook کی مصنوعات، ویب سائٹس، ایپس اور متعلقہ سروسز تک آپ کی رسائی اور استعمال کو منظم کرتی ہیں۔ اکاؤنٹ بنانے یا پلیٹ فارم استعمال کرنے سے آپ ان شرائط کو قبول کرتے ہیں۔"] },
      { title: "2. اکاؤنٹس، کردار اور ذمہ داریاں", paragraphs: ["اکاؤنٹ مالک ٹیم کی رسائی، اجازتوں اور تنظیمی اکاؤنٹ کی سرگرمی کا ذمہ دار ہے۔ آپ درست معلومات فراہم کریں اور لاگ اِن تفصیلات محفوظ رکھیں۔"] },
      { title: "3. سبسکرپشن، فیس اور بلنگ", paragraphs: ["ادائیگی والے پلان منتخب مدت کے مطابق بل ہوتے ہیں۔ اپ گریڈ، ڈاؤن گریڈ اور ایڈ آنز مستقبل کے بلوں کو متاثر کر سکتے ہیں۔", "جب تک الگ سے نہ بتایا جائے، فراہم کی گئی مدت کی فیس قابل واپسی نہیں، سوائے ان صورتوں کے جہاں صارف قانون لازمی قرار دے۔"] },
      { title: "4. قابل قبول استعمال", paragraphs: ["آپ اس بات سے اتفاق کرتے ہیں کہ آپ:"], bullets: ["TeqBook کو غیر قانونی یا دھوکہ دہی کے کام کے لیے استعمال نہیں کریں گے۔", "سسٹمز، اکاؤنٹس یا ڈیٹا تک غیر مجاز رسائی کی کوشش نہیں کریں گے۔", "سروس کے استحکام، سیکیورٹی یا دوسرے صارفین میں مداخلت نہیں کریں گے۔", "نقصان دہ کوڈ، میلویئر یا بدسلوکی والا مواد اپ لوڈ نہیں کریں گے۔"] },
      { title: "5. ڈیٹا کی ملکیت اور پرائیویسی", paragraphs: ["آپ کے کاروباری ڈیٹا کی ملکیت آپ کے پاس رہتی ہے۔ TeqBook ذاتی ڈیٹا کو پرائیویسی پالیسی اور قابل اطلاق قانون کے مطابق پراسیس کرتا ہے۔"] },
      { title: "6. سروس دستیابی اور تبدیلیاں", paragraphs: ["ہم پلیٹ فارم کو مسلسل بہتر بناتے ہیں اور فیچرز، حدود اور انٹیگریشنز اپڈیٹ کر سکتے ہیں۔ پلانڈ مینٹیننس اور سیکیورٹی اپڈیٹس عارضی طور پر دستیابی متاثر کر سکتی ہیں۔"] },
      { title: "7. ذمہ داری کی حد", paragraphs: ["قانونی حد تک TeqBook غیر مستقیم یا نتیجہ خیز نقصانات کا ذمہ دار نہیں ہوگا جو سروس کے استعمال، ڈاؤن ٹائم یا تھرڈ پارٹی انٹیگریشنز سے پیدا ہوں۔"] },
      { title: "8. معطلی اور اختتام", paragraphs: ["آپ کسی بھی وقت سروس استعمال کرنا بند کر سکتے ہیں۔ ہم ایسی اکاؤنٹس معطل یا ختم کر سکتے ہیں جو شرائط، قانون یا سیکیورٹی پالیسی کی خلاف ورزی کریں۔"] },
      { title: "9. لاگو قانون اور رابطہ", paragraphs: ["یہ شرائط اس دائرہ اختیار کے قانون کے مطابق ہیں جہاں TeqBook قائم ہے، جب تک لازمی مقامی قانون کچھ اور نہ کہے۔", "قانونی سوالات کے لیے: support@teqbook.com."] },
    ],
    acceptance: "TeqBook استعمال کر کے آپ تصدیق کرتے ہیں کہ آپ نے سروس کی شرائط اور پرائیویسی پالیسی پڑھ کر قبول کی ہیں۔",
  },
  hi: termsHiLocale,
};

export const termsPageCopyByLocale: Record<AppLocale, TermsPageCopy> = {
  en: termsEn,
  nb,
  ar: commonLocalized.ar ?? termsEn,
  so: commonLocalized.so ?? termsEn,
  ti: commonLocalized.ti ?? termsEn,
  am: commonLocalized.am ?? termsEn,
  tr: commonLocalized.tr ?? termsEn,
  pl: commonLocalized.pl ?? termsEn,
  vi: commonLocalized.vi ?? termsEn,
  zh: commonLocalized.zh ?? termsEn,
  tl: commonLocalized.tl ?? termsEn,
  fa: commonLocalized.fa ?? termsEn,
  dar: commonLocalized.dar ?? termsEn,
  ur: commonLocalized.ur ?? termsEn,
  hi: commonLocalized.hi ?? termsEn,
};

export function getTermsPageCopy(locale: AppLocale): TermsPageCopy {
  return termsPageCopyByLocale[locale] ?? termsPageCopyByLocale.en;
}
