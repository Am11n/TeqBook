import type { AppLocale } from "@/i18n/translations";

type LegalSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export type TermsPageCopy = {
  badge: string;
  title: string;
  description: string;
  effectiveDate: string;
  sections: LegalSection[];
  acceptance: string;
};

const enSections: LegalSection[] = [
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

const termsEn: TermsPageCopy = {
  badge: "TERMS",
  title: "Terms of service",
  description: "These terms explain the responsibilities and rights of TeqBook and its customers.",
  effectiveDate: "Effective date: 25 February 2026",
  sections: enSections,
  acceptance: "By using TeqBook, you confirm that you have read and accepted these Terms of Service and the Privacy Policy.",
};

export const termsPageCopyByLocale: Record<AppLocale, TermsPageCopy> = {
  en: termsEn,
  nb: {
    badge: "VILKÅR",
    title: "Vilkår for tjenesten",
    description: "Disse vilkårene forklarer ansvar og rettigheter for TeqBook og kunder.",
    effectiveDate: "Ikrafttredelse: 25. februar 2026",
    sections: [
      { title: "1. Avtalens omfang", paragraphs: ["Disse vilkårene regulerer tilgang til og bruk av TeqBook-produkter, nettsteder, applikasjoner og relaterte tjenester. Ved å opprette konto eller bruke plattformen aksepterer du vilkårene."] },
      { title: "2. Kontoer, roller og ansvar", paragraphs: ["Kontoeier er ansvarlig for teamtilgang, rettigheter og aktivitet under organisasjonskontoen. Du må oppgi korrekt informasjon og beskytte innloggingsinformasjon."] },
      { title: "3. Abonnement, gebyrer og fakturering", paragraphs: ["Betalte planer faktureres etter valgt abonnementsperiode. Oppgraderinger, nedgraderinger og tillegg kan påvirke fremtidige fakturaer basert på aktiv plan og bruk.", "Med mindre annet er oppgitt, refunderes ikke gebyrer for allerede levert tjenesteperiode, med forbehold om ufravikelig forbrukerlovgivning."] },
      { title: "4. Akseptabel bruk", paragraphs: ["Du samtykker i å ikke:"], bullets: ["Bruke TeqBook til ulovlig aktivitet eller svindel.", "Forsøke uautorisert tilgang til systemer, kontoer eller data.", "Forstyrre stabilitet, sikkerhet eller andre brukere.", "Laste opp skadelig kode, malware eller krenkende innhold."] },
      { title: "5. Dataeierskap og personvern", paragraphs: ["Du beholder eierskap til virksomhetsdata. TeqBook behandler personopplysninger i tråd med personvernerklæringen og gjeldende personvernlovgivning."] },
      { title: "6. Tjenestetilgjengelighet og endringer", paragraphs: ["Vi forbedrer plattformen kontinuerlig og kan oppdatere funksjoner, grenser og integrasjoner. Planlagt vedlikehold og sikkerhetsoppdateringer kan midlertidig påvirke tilgjengelighet."] },
      { title: "7. Ansvarsbegrensning", paragraphs: ["Så langt loven tillater er TeqBook ikke ansvarlig for indirekte, tilfeldige eller følgeskader knyttet til bruk, nedetid eller tredjepartsintegrasjoner."] },
      { title: "8. Oppsigelse og suspensjon", paragraphs: ["Du kan avslutte bruk når som helst. Vi kan suspendere eller avslutte kontoer som bryter vilkårene, gjeldende lov eller sikkerhetspolicyer."] },
      { title: "9. Lovvalg og kontakt", paragraphs: ["Vilkårene reguleres av gjeldende lov i jurisdiksjonen der TeqBook er etablert, med mindre ufravikelig lokal lov sier noe annet.", "For juridiske eller kontraktsmessige spørsmål: support@teqbook.com."] },
    ],
    acceptance: "Ved å bruke TeqBook bekrefter du at du har lest og akseptert disse vilkårene og personvernerklæringen.",
  },
  ar: { ...termsEn, badge: "الشروط", title: "شروط الخدمة", description: "توضح هذه الشروط مسؤوليات وحقوق TeqBook والعملاء.", effectiveDate: "تاريخ السريان: 25 فبراير 2026", acceptance: "باستخدام TeqBook، فإنك تؤكد أنك قرأت ووافقت على شروط الخدمة وسياسة الخصوصية." },
  so: { ...termsEn, badge: "SHURUUDAHA", title: "Shuruudaha adeegga", description: "Shuruudahani waxay sharxayaan waajibaadka iyo xuquuqda TeqBook iyo macaamiisha.", effectiveDate: "Taariikhda dhaqan galka: 25 Febraayo 2026", acceptance: "Markaad isticmaasho TeqBook, waxaad xaqiijinaysaa inaad akhriday oo aqbashay shuruudahan iyo siyaasadda asturnaanta." },
  ti: { ...termsEn, badge: "መስፈርቲ", title: "መስፈርቲ ኣገልግሎት", description: "እዚ መስፈርቲ ሓላፍነትን መሰልን ናይ TeqBook እና ዓማዊል ይገልፅ።", effectiveDate: "ዕለት ስራሕ: 25 ለካቲት 2026", acceptance: "TeqBook ብምጥቃምካ እዞም መስፈርቲ እና ፖሊሲ ምስጢር ኣንቢብካ ተቐቢልካ ማለት እዩ።" },
  am: { ...termsEn, badge: "ውሎች", title: "የአገልግሎት ውሎች", description: "እነዚህ ውሎች የ TeqBook እና የደንበኞች መብቶችን እና ኃላፊነቶችን ያብራራሉ።", effectiveDate: "የሚተገበርበት ቀን: 25 ፌብሩወሪ 2026", acceptance: "TeqBook በመጠቀምዎ እነዚህን ውሎች እና የግላዊነት ፖሊሲ አንብበው እንደተቀበሉ ያረጋግጣሉ።" },
  tr: { ...termsEn, badge: "SARTLAR", title: "Hizmet sartlari", description: "Bu sartlar, TeqBook ve musterilerinin sorumluluklarini ve haklarini aciklar.", effectiveDate: "Yururluk tarihi: 25 Subat 2026", acceptance: "TeqBook'u kullanarak bu Hizmet Sartlarini ve Gizlilik Politikasini okudugunuzu ve kabul ettiginizi onaylarsiniz." },
  pl: { ...termsEn, badge: "WARUNKI", title: "Warunki korzystania", description: "Te warunki wyjasniaja prawa i obowiazki TeqBook oraz klientow.", effectiveDate: "Data wejscia w zycie: 25 lutego 2026", acceptance: "Korzystajac z TeqBook potwierdzasz, ze przeczytales i zaakceptowales Warunki korzystania oraz Polityke prywatnosci." },
  vi: { ...termsEn, badge: "DIEU KHOAN", title: "Dieu khoan dich vu", description: "Cac dieu khoan nay giai thich trach nhiem va quyen cua TeqBook va khach hang.", effectiveDate: "Ngay hieu luc: 25 thang 2, 2026", acceptance: "Bang viec su dung TeqBook, ban xac nhan da doc va chap nhan Dieu khoan dich vu va Chinh sach rieng tu." },
  zh: { ...termsEn, badge: "条款", title: "服务条款", description: "这些条款说明了 TeqBook 与客户的责任和权利。", effectiveDate: "生效日期：2026年2月25日", acceptance: "使用 TeqBook 即表示你已阅读并接受服务条款与隐私政策。" },
  tl: { ...termsEn, badge: "TUNTUNIN", title: "Mga tuntunin ng serbisyo", description: "Ipinapaliwanag ng mga tuntuning ito ang pananagutan at karapatan ng TeqBook at mga customer.", effectiveDate: "Petsa ng bisa: 25 Pebrero 2026", acceptance: "Sa paggamit ng TeqBook, kinukumpirma mong nabasa at tinanggap mo ang Mga Tuntunin ng Serbisyo at Patakaran sa Privacy." },
  fa: { ...termsEn, badge: "شرایط", title: "شرایط خدمات", description: "این شرایط، مسئولیت ها و حقوق TeqBook و مشتریان را توضیح می دهد.", effectiveDate: "تاریخ اجرا: 25 فوریه 2026", acceptance: "با استفاده از TeqBook تایید می کنید که شرایط خدمات و سیاست حریم خصوصی را خوانده و پذیرفته اید." },
  dar: { ...termsEn, badge: "شرایط", title: "شرایط خدمات", description: "این شرایط، حقوق و مسئولیت های TeqBook و مشتریان را تشریح می کند.", effectiveDate: "تاریخ اجرا: 25 فبروری 2026", acceptance: "با استفاده از TeqBook تایید می کنید که شرایط خدمات و پالیسی حریم خصوصی را خوانده و پذیرفته اید." },
  ur: { ...termsEn, badge: "شرائط", title: "سروس کی شرائط", description: "یہ شرائط TeqBook اور صارفین کے حقوق اور ذمہ داریوں کی وضاحت کرتی ہیں۔", effectiveDate: "موثر تاریخ: 25 فروری 2026", acceptance: "TeqBook استعمال کر کے آپ تصدیق کرتے ہیں کہ آپ نے سروس کی شرائط اور پرائیویسی پالیسی پڑھ کر قبول کی ہیں۔" },
  hi: { ...termsEn, badge: "शर्तें", title: "सेवा की शर्तें", description: "ये शर्तें TeqBook और ग्राहकों के अधिकारों और जिम्मेदारियों को समझाती हैं।", effectiveDate: "प्रभावी तिथि: 25 फरवरी 2026", acceptance: "TeqBook का उपयोग करके आप पुष्टि करते हैं कि आपने सेवा की शर्तें और गोपनीयता नीति पढ़कर स्वीकार की हैं।" },
};

export function getTermsPageCopy(locale: AppLocale): TermsPageCopy {
  return termsPageCopyByLocale[locale] ?? termsPageCopyByLocale.en;
}
