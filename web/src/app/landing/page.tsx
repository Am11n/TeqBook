"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { StatsGrid } from "@/components/stats-grid";
import { Section, SectionCard } from "@/components/section";

type Locale =
  | "nb"
  | "en"
  | "ar"
  | "so"
  | "ti"
  | "am"
  | "tr"
  | "pl"
  | "vi"
  | "zh"
  | "tl"
  | "fa"
  | "dar"
  | "ur"
  | "hi";

const copy: Record<
  Locale,
  {
    brand: string;
    heroTitle: string;
    heroSubtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    badge: string;
    pricingTitle: string;
    pricingSubtitle: string;
    tiers: {
      id: string;
      name: string;
      price: string;
      description: string;
      features: string[];
      highlighted?: boolean;
      badge?: string;
    }[];
    stats: { title: string; body: string }[];
    faqTitle: string;
    faq: { q: string; a: string }[];
  }
> = {
  nb: {
    brand: "TeqBook",
    heroTitle: "Booking for salonger – bygget for fysisk betaling",
    heroSubtitle:
      "TeqBook er et enkelt og moderne bookingsystem for frisører og salonger i Norden. Kundene booker på nett, men betaler alltid i salong.",
    ctaPrimary: "Kom i gang gratis",
    ctaSecondary: "Book demo",
    badge: "Bygget for salonger",
    pricingTitle: "Velg TeqBook-pakken som passer din salong",
    pricingSubtitle:
      "Bygget for internasjonale salonger i Vesten – start enkelt, og utvid når du trenger mer.",
    tiers: [
      {
        id: "starter",
        name: "TeqBook Starter",
        price: "299 kr / måned",
        badge: "For små salonger",
        description:
          "Perfekt for barber, frisør, negler eller massasje med 1–2 ansatte.",
        features: [
          "Online booking og kalender",
          "Kunderegister og tjenestestyring",
          "Fysisk betaling uten kompliserte integrasjoner",
          "WhatsApp-support fra mennesker som forstår internasjonale salonger",
          "Engelsk + én valgfri språkpakke",
          "SMS-varsler til kostpris",
        ],
      },
      {
        id: "pro",
        name: "TeqBook Pro",
        price: "499 kr / måned",
        badge: "Mest valgt",
        description:
          "For salonger med 3–6 ansatte som vil ha mer kontroll og færre no-shows.",
        features: [
          "Alt i Starter",
          "Full flerspråklig brukerflate for ansatte og kunder",
          "Avanserte rapporter på omsetning, kapasitetsutnyttelse og no-shows",
          "Automatiske påminnelser og varslinger",
          "Støtte for flere ansatte og enkle vaktlister",
          "Enkel varebeholdning for produkter du selger i salongen",
          "Brandet bookingside med din logo og farger",
        ],
        highlighted: true,
      },
      {
        id: "business",
        name: "TeqBook Business",
        price: "799 kr / måned",
        badge: "For voksende kjeder",
        description:
          "For større og mer travle salonger som trenger struktur, roller og bedre rapportering.",
        features: [
          "Alt i Pro",
          "Roller og tilgangskontroll (eier, leder, resepsjon, ansatt)",
          "Bedre statistikk og eksport for regnskap og rapportering",
          "Prioritert support når noe haster",
        ],
      },
    ],
    stats: [
      {
        title: "Bygget for fysisk betaling",
        body: "Alle tekster og flows er optimalisert for at betaling skjer i salong – ikke på nett.",
      },
      {
        title: "Multi-salong fra dag én",
        body: "Ett TeqBook-login kan eie flere salonger, med datasikker multi-tenancy i Supabase.",
      },
      {
        title: "Klar for videre vekst",
        body: "MVP-en er bygget med tydelig roadmap for notifikasjoner, rapportering og kassasystem.",
      },
    ],
    faqTitle: "Ofte stilte spørsmål",
    faq: [
      {
        q: "Må jeg ha kortbetaling på nett?",
        a: "Nei. Hele TeqBook er designet for at betaling skjer fysisk i salong. Du kan fortsatt legge inn notater om betaling, men ingen kort trekkes på nett.",
      },
      {
        q: "Kan jeg ha flere salonger i samme konto?",
        a: "Ja. TeqBook støtter flere salonger per eier, med strenge RLS-regler i databasen slik at data aldri blandes.",
      },
      {
        q: "Hva med SMS og e-post?",
        a: "Dette kommer i Phase 5. Systemet er allerede rigget med kunder og bookinger slik at vi enkelt kan koble på varsling senere.",
      },
    ],
  },
  en: {
    brand: "TeqBook",
    heroTitle: "Salon booking – built for pay-in-salon",
    heroSubtitle:
      "TeqBook is a simple, modern booking system for salons in the Nordics. Clients book online, but always pay on-site.",
    ctaPrimary: "Get started for free",
    ctaSecondary: "Book a demo",
    badge: "Built for salons",
    pricingTitle: "Choose your TeqBook plan",
    pricingSubtitle:
      "Built for international salons – start simple, then upgrade as your business grows.",
    tiers: [
      {
        id: "starter",
        name: "TeqBook Starter",
        price: "299 NOK / month",
        description:
          "Perfect for barbers, hair, nails or massage with 1–2 staff.",
        features: [
          "Online booking and calendar",
          "Customer list and service management",
          "Pay in-salon without complex payment integrations",
          "WhatsApp support from people who understand international salons",
          "English + one additional language pack",
          "SMS reminders at cost price",
        ],
      },
      {
        id: "pro",
        name: "TeqBook Pro",
        price: "499 NOK / month",
        description:
          "For salons with 3–6 staff who want more control and fewer no‑shows.",
        features: [
          "Everything in Starter",
          "Fully multilingual UI for both staff and clients",
          "Advanced reports on revenue, capacity and no‑shows",
          "Automatic reminders and notifications",
          "Support for more staff and simple shift planning",
          "Lightweight inventory for products you sell in the salon",
          "Branded booking page with your logo and colours",
        ],
        highlighted: true,
      },
      {
        id: "business",
        name: "TeqBook Business",
        price: "799 NOK / month",
        description:
          "For larger and busier salons that need structure, roles and better reporting.",
        features: [
          "Everything in Pro",
          "Roles and access control (owner, manager, reception, staff)",
          "Deeper statistics and export for accounting and reporting",
          "Priority support when something is urgent",
        ],
      },
    ],
    stats: [
      {
        title: "Designed for offline payments",
        body: "All copy and flows are optimized for pay-in-salon, not online card payments.",
      },
      {
        title: "Multi-salon from day one",
        body: "One TeqBook login can own multiple salons, with strict row-level security per tenant.",
      },
      {
        title: "Ready to grow with you",
        body: "The MVP is built with a clear roadmap: notifications, reporting and POS integrations.",
      },
    ],
    faqTitle: "Frequently asked questions",
    faq: [
      {
        q: "Do I need online card payments?",
        a: "No. TeqBook is explicitly designed for pay-in-salon only. You can still keep track of payments in notes, but no cards are charged online.",
      },
      {
        q: "Can I manage multiple salons under one account?",
        a: "Yes. TeqBook supports multiple salons per owner, with strict RLS so data never leaks between tenants.",
      },
      {
        q: "What about SMS and email reminders?",
        a: "This is coming in Phase 5. The data model is already in place so we can easily plug in notifications later.",
      },
    ],
  },
  ar: {
    brand: "إيفو",
    heroTitle: "حجوزات للصالونات – مصمَّمة للدفع داخل الصالون",
    heroSubtitle:
      "إيفو هو نظام حجز بسيط وحديث لصالونات التجميل في الشمال الأوروبي. يحجز العملاء عبر الإنترنت، لكن الدفع يتم دائمًا في الصالون.",
    ctaPrimary: "ابدأ مجانًا",
    ctaSecondary: "احجز عرضًا توضيحيًا",
    badge: "مصمَّم للصالونات",
    pricingTitle: "اختر باقة TeqBook المناسبة لصالونك",
    pricingSubtitle:
      "مصمَّمة خصيصًا للصالونات الدولية في أوروبا – ابدأ ببساطة وطور عملك عندما تكون مستعدًا.",
    tiers: [
      {
        id: "starter",
        name: "TeqBook Starter",
        price: "299 كرونة / شهريًا",
        description:
          "مثالي للحلاقين وصالونات الشعر والأظافر والتدليك التي لديها 1–2 موظفين.",
        features: [
          "حجز عبر الإنترنت مع تقويم بسيط",
          "سجل عملاء وإدارة للخدمات",
          "دفع داخل الصالون بدون تكاملات دفع معقدة",
          "دعم عبر واتساب من أشخاص يفهمون الصالونات الدولية",
          "الإنجليزية + حزمة لغة إضافية واحدة",
          "تذكيرات SMS بتكلفة رسائل منخفضة",
        ],
      },
      {
        id: "pro",
        name: "TeqBook Pro",
        price: "499 كرونة / شهريًا",
        description:
          "مناسب للصالونات التي لديها 3–6 موظفين وتريد تحكمًا أفضل وتقليل الغياب عن المواعيد.",
        features: [
          "كل ما في باقة Starter",
          "واجهة متعددة اللغات بالكامل للموظفين والعملاء",
          "تقارير متقدمة عن الإيرادات، واستغلال السعة، والحجوزات الملغاة أو الفائتة",
          "تذكيرات وإشعارات تلقائية",
          "دعم لعدد أكبر من الموظفين مع جداول مناوبات بسيطة",
          "إدارة مخزون خفيفة للمنتجات التي تبيعها في الصالون",
          "صفحة حجز مخصصة تحمل شعارك وألوان علامتك",
        ],
        highlighted: true,
      },
      {
        id: "business",
        name: "TeqBook Business",
        price: "799 كرونة / شهريًا",
        description:
          "للصالونات الأكبر والأكثر ازدحامًا التي تحتاج إلى أدوار واضحة وتقارير أفضل.",
        features: [
          "كل ما في باقة Pro",
          "أدوار وصلاحيات وصول (مالك، مدير، استقبال، موظف)",
          "إحصائيات أعمق وتصدير للبيانات للمحاسبة والتقارير",
          "دعم أولوية عندما تكون الأمور مستعجلة",
        ],
      },
    ],
    stats: [
      {
        title: "مصمَّم للدفع داخل الصالون",
        body: "كل النصوص وتدفقات الاستخدام مهيأة للدفع في الصالون – وليس للدفع بالبطاقة عبر الإنترنت.",
      },
      {
        title: "متعدد الصالونات من اليوم الأول",
        body: "يمكن لاسم مستخدم واحد في إيفو إدارة عدة صالونات مع عزل صارم للبيانات لكل صالون في Supabase.",
      },
      {
        title: "جاهز للنمو معك",
        body: "تم بناء الـ MVP مع خارطة طريق واضحة: تنبيهات، تقارير وتكاملات مع أنظمة نقاط البيع.",
      },
    ],
    faqTitle: "الأسئلة الشائعة",
    faq: [
      {
        q: "هل أحتاج إلى دفع بالبطاقة عبر الإنترنت؟",
        a: "لا. إيفو مصمم صراحة للدفع داخل الصالون فقط. يمكنك مع ذلك تدوين ملاحظات عن المدفوعات، لكن لا يتم سحب أي بطاقات عبر الإنترنت.",
      },
      {
        q: "هل يمكنني إدارة عدة صالونات في حساب واحد؟",
        a: "نعم. يدعم إيفو عدة صالونات لكل مالك، مع قواعد RLS صارمة لضمان عدم اختلاط البيانات بين الصالونات.",
      },
      {
        q: "ماذا عن التذكير عبر الرسائل القصيرة والبريد الإلكتروني؟",
        a: "هذا قادم في المرحلة 5. نموذج البيانات جاهز بالفعل حتى نتمكن من توصيل نظام التنبيهات بسهولة لاحقًا.",
      },
    ],
  },
  so: {
    brand: "TeqBook",
    heroTitle:
      "Ballansashada Saloonnada – Waxaa loo dhisay lacag bixinta gudaha saloonka",
    heroSubtitle:
      "TeqBook waa nidaam ballansasho fudud oo casri ah oo loogu talagalay timo-jarayaasha iyo saloonnada Waqooyiga Yurub. Macaamiishu waxay ballansadaan online, laakiin mar walba waxay lacagta ku bixiyaan gudaha saloonka.",
    ctaPrimary: "Bilaaw bilaash",
    ctaSecondary: "Ballan demo",
    badge: "Waxaa loo dhisay saloonnada",
    pricingTitle: "Dooro qorshaha TeqBook ee ku habboon saloonkaaga",
    pricingSubtitle:
      "Loogu talagalay saloonnada caalamiga ah ee Yurub – ku bilow si fudud oo koro marka aad diyaar tahay.",
    tiers: [
      {
        id: "starter",
        name: "TeqBook Starter",
        price: "299 kr / bishii",
        description:
          "Ku habboon timo‑jarayaasha, saloonka timaha, ciddiyaha ama duugista ee leh 1–2 shaqaale.",
        features: [
          "Online booking iyo kalandar fudud",
          "Diiwaan macaamiil iyo maarayn adeegyadu",
          "Lacag bixinta gudaha saloonka iyada oo aan la rabin isku‑xir lacag bixin adag",
          "Taageero WhatsApp ah oo ka timid dad fahamsan saloonnada caalamiga ah",
          "Ingiriisi + hal luuqad dheeri ah oo lagu daro",
          "Xasuusin SMS ah oo lagu qaado qiimaha dhabta ah",
        ],
      },
      {
        id: "pro",
        name: "TeqBook Pro",
        price: "499 kr / bishii",
        description:
          "Saloonnada leh 3–6 shaqaale oo rabta xakameyn fiican iyo ballamo yara baxa.",
        features: [
          "Wax walba oo ku jira Starter",
          "UI buuxda oo luuqado badan ah oo loogu talagalay shaqaalaha iyo macaamiisha",
          "Warbixinno horumarsan oo ku saabsan dakhli, isticmaalka awoodda iyo no‑shows",
          "Digniino iyo xasuusin toos ah",
          "Taageero shaqaale dheeraad ah iyo jadwal shifts fudud",
          "Maarayn fudud oo keydka alaabta aad ka iibiso saloonka",
          "Bog ballansasho leh astaantaada iyo midabadaada",
        ],
        highlighted: true,
      },
      {
        id: "business",
        name: "TeqBook Business",
        price: "799 kr / bishii",
        description:
          "Loogu talagalay saloonnada waaweyn ee mashquulka ah ee u baahan qaab‑dhismeed, doorar iyo warbixin fiican.",
        features: [
          "Wax walba oo ku jira Pro",
          "Doorar iyo xakameyn oggolaansho (milkiile, maamule, xafiis, shaqaale)",
          "Tirokoob qoto dheer iyo dhoofin xogta xisaab iyo warbixin",
          "Taageero mudnaanta leh marka ay arrintu degdeg tahay",
        ],
      },
    ],
    stats: [
      {
        title: "Waxaa loo dhisay lacag bixinta gudaha saloonka",
        body: "Dhammaan qoraallada iyo hababka shaqada waxaa loo hagaajiyay in lacag bixintu ka dhacdo gudaha saloonka – ma aha online.",
      },
      {
        title: "Saloonno badan laga bilaabo maalinta koowaad",
        body: "Hal login oo TeqBook ah ayaa yeelan kara saloonno badan, iyadoo la adeegsanayo nidaamka multi-tenancy ee Supabase.",
      },
      {
        title: "Diyaar u ah inuu kula koro",
        body: "MVP-ga waxaa lagu dhisay qorshe cad: ogeysiisyada, warbixinnada iyo isku-dhafka nidaamka lacag bixinta.",
      },
    ],
    faqTitle: "Su'aalaha inta badan la isweydiiyo",
    faq: [
      {
        q: "Ma u baahanahay inaan lacag ku bixiyo kaadh online ah?",
        a: "Maya. TeqBook waxaa si gaar ah loogu talagalay lacag bixinta gudaha saloonka oo keliya. Waxaad weli ku qori kartaa xusuus-qor ku saabsan lacag bixinta, laakiin ma jiro kaadh online ah oo lacag laga qaadayo.",
      },
      {
        q: "Ma ku maamuli karaa saloonno badan hal akoon?",
        a: "Haa. TeqBook wuxuu taageeraa saloonno badan oo milkiile kasta, iyadoo la adeegsanayo sharciyo adag oo RLS ah si xogta aanay isugu darsamin.",
      },
      {
        q: "Ka waran SMS iyo email xasuusin?",
        a: "Tani waxay soo socotaa Phase 5. Nidaamka xogta waa diyaar si aan si fudud ugu xirno ogeysiisyada mustaqbalka.",
      },
    ],
  },
  ti: {
    brand: "TeqBook",
    heroTitle:
      "ሳሎን መመዝገቢ – ክፍሊ ገንዘብ ኣብ ሳሎን ውሽጢ ንምግባር ዝተሰርሐ",
    heroSubtitle:
      "TeqBook ቀሊልን ዘመናዊን መስርሒ መመዝገብታት እዩ ንሳሎናት ኣብ ሰሜን ኤውሮጳ። ደኣናት ብመስመር ላይ ይመዝገቡ፣ ገንዘብ ግን ሓደ ግዜ ኣብ ሳሎን ይኸፍሉ።",
    ctaPrimary: "ብነጻ ጀምር",
    ctaSecondary: "Demo ጸዓን ጠይቅ",
    badge: "ንሳሎናት ዝተሰርሐ",
    pricingTitle: "ንሳሎንካ ዝምልከት TeqBook ፓኬጅ ምረፅ",
    pricingSubtitle:
      "ንኣለም‑ስነተኛ ሳሎናት ኣብ ኤውሮፓ ዝተሰርሐ – ብቐሊል ጀምር ንድሕሪኡ ዝተኣኽለ እዩ።",
    tiers: [
      {
        id: "starter",
        name: "TeqBook Starter",
        price: "299 kr / ወርሒ",
        description:
          "ጽቡቕ እዩ ንባርበር፣ ጸጉሪ ሳሎን፣ ጥፍሪ ኣዕላማ ወይ ማሳጅ ን1–2 ሰራሕተኛታት ዝርከቡ።",
        features: [
          "መመዝገቢ ኦንላይንን ካለንደርን",
          "መዝገብ ደኣንነትን ምኽሪ ኣገልግሎታትን",
          "ክፍሊ ገንዘብ ብቐጥታ ኣብ ሳሎን ዘይኮነ ዝተስተኻኸለ መንገዲ ክፍሊ ኢንተግሬሽን",
          "ዝተማሓየሸ ሰባት ዘለዎም ናይ ኣለም‑ስነተኛ ሳሎናት ሓበሬታ ዝረክቡ WhatsApp ሓገዝ",
          "እንግሊዝኛ + ሓደ ተፈላለየ ቋንቋ ፓኬጅ",
          "SMS መዘኻኸሪ ብዋጋ ቅርብ ናብ ዝኽፈል",
        ],
      },
      {
        id: "pro",
        name: "TeqBook Pro",
        price: "499 kr / ወርሒ",
        description:
          "ን3–6 ሰራሕተኛታት ዝርከቡ ሳሎናት ምርጫ፣ ናይ ኣፍታ መቆጣጠርን ትሕቲ መዝገብ ምቕራብን ዝፈልጡ።",
        features: [
          "ኩሉ ካብ Starter",
          "መለለዪ ቋንቋ ሙሉእ ንሰራሕተኛታትን ንዓማዊልን",
          "ላሕላይ ሪፖርታት ናይ ኣብርሃን፣ ናይ ካፓስቲ ጥቅምን ናይ no‑show መጠንን",
          "ሓደሽቲ መዘኻኸሪን መግለጺ ብሓቂ ብሓቂ",
          "ንብዙሕ ሰራሕተኛታት ዝገብር ምሕካምን ቀሊል ስፍት መደብ",
          "ቀሊል ማናጸፊ ናይ ምርታት ኣብ ሳሎን ዝሽየጡሉ",
          "ብሎጎኻን ቀለማትኻን ዝተምርሐ ገፅ መመዝገቢ",
        ],
        highlighted: true,
      },
      {
        id: "business",
        name: "TeqBook Business",
        price: "799 kr / ወርሒ",
        description:
          "ንሳሎናት ከቢድን ብዙሕ ግዜ ዝርከቡን ዝፈልጡ መዋቅር፣ ሚናታትን ላሕላይ ሪፖርትን።",
        features: [
          "ኩሉ ካብ Pro",
          "ሚናን መቆጣጠር መኽዘን (ባለቤት፣ ሓላፊ፣ ሬሴፕሽን፣ ሰራሕተኛ)",
          "ጥራሕ ስታቲስቲካን ንቆጸራ እና ሪፖርት ዝሕብር ኤክስፖርት",
          "ቅድሚ መረጋገጺ ዘለዎ ሓገዝ ምስ ጉዳይ ብጣዕሚ ሓሳስ ከሆነ",
        ],
      },
    ],
    stats: [
      {
        title: "ንክፍሊ ገንዘብ ኣብ ሳሎን ውሽጢ ዝተሰርሐ",
        body: "ኩሉ ጽሑፋትን ፍሉይ ስርሒታት ዝተቐመጡ እዮም ክፍሊ ገንዘብ ኣብ ሳሎን ንምግባር – ኣይኮነን ኣብ መስመር ላይ ክፍሊ ካርታ።",
      },
      {
        title: "ካብ መጀመርታ ጀሚሩ ብዙሕ ሳሎናት",
        body: "ሓደ TeqBook login ዝርከብ ብርቱዕ multi-tenancy ኣብ Supabase ዘለዎ ብርክት ብዙሕ ሳሎናት ምምሕዳር ይኽእል።",
      },
      {
        title: "ምስኻ ንምዓት ተዘጋጅቶ ኣሎ",
        body: "MVP ግልጺ ሮድማፕ ኣብ ዝሃበ እዩ ተሰሪሑ፦ መግለጺ ምኽንያታት፣ ሪፖርታትን ንምሕላፍ ኣብ ኣቕሓ ክፍሊ ስርዓታትን።",
      },
    ],
    faqTitle: "ብተዓዘብ ዝሕተቱ ሕቶታት",
    faq: [
      {
        q: "Online ካርታ ክፍሊ የድልየን ዶ?",
        a: "ኣይፋል. TeqBook ብፍጹም ንክፍሊ ገንዘብ ኣብ ሳሎን ውሽጢ ጥራሕ ዝተሰርሐ እዩ። ኣብ ማስታወሻ ክፍሊ ገንዘብ ትመዝግብ ትኽእል ኢኻ፣ ግን ካርታታት ብመስመር ላይ ኣይተሰርዙን።",
      },
      {
        q: "ብሓደ ኣካውንት ውሽጢ ብዙሕ ሳሎናት ክምህርይ ክእየ ዶ?",
        a: "እወ. TeqBook ስለዚ ንባልትራን ሳሎናት ይዕዝብ፣ ናይ ረው-ለቨል ስከውሪቲ (RLS) ብጣዕሚ ዝጥርጥር ተግባር ይጠቕም እዩ ዝህብ ንምንቅስቓስ ውሑድ ውሑድ ውሽጢ እዋን።",
      },
      {
        q: "SMSን ኢመይል መዘኻኸሪታትን እንታይ ኢዩ ዝገብር?",
        a: "እዚ ኣብ Phase 5 ይመጽእ። ሞዴል ዳታ ኣሎ ተዘጋጂ፣ ስለዚ መግለጺ ኣብ ድሕሪ ግዜ ብቐሊል ንምግባር ክንሕልፍ ንኽእል።",
      },
    ],
  },
  am: {
    brand: "TeqBook",
    heroTitle:
      "የሳሎን ቀጠሮ – ለበሳሎን ውስጥ ክፍያ የተቀየረ",
    heroSubtitle:
      "TeqBook ለሰሜን አውሮፓ ሳሎኖች ቀላል እና ዘመናዊ የቀጠሮ ስርዓት ነው። ደንበኞች ቀጠሮን በመስመር ላይ ይያዙ፣ ክፍያውን ግን ሁልጊዜ በሳሎኑ ውስጥ ይከፍላሉ።",
    ctaPrimary: "በነጻ ጀምር",
    ctaSecondary: "የዴሞ መግለጫ ይጠይቁ",
    badge: "ለሳሎኖች የተሠራ",
    pricingTitle: "የ TeqBook ፓኬጅ ይምረጡ ለሳሎንህ",
    pricingSubtitle:
      "ለአውሮፓ ውስጥ ያሉ ዓለም‑ስነተኛ ሳሎኖች የተመረጠ – በቀላሉ ጀምር እና እያደገ ፓኬጅህን ጨምር።",
    tiers: [
      {
        id: "starter",
        name: "TeqBook Starter",
        price: "299 kr / ወር",
        description:
          "1–2 ሰራተኞች ያሉ ማሳሌ፣ ባርበር፣ የፀጉር ሳሎን፣ ጥፍር ወይም ማሳጅ ሳሎኖች ለመጀመር ተስማሚ ነው።",
        features: [
          "መደበኛ የመስመር ላይ ቀጠሮ እና ቀን መቁጠሪያ",
          "የደንበኞች መዝገብ እና የአገልግሎት አስተዳደር",
          "ያለ ውስብስብ የመክፈያ ኢንተግሬሽን ውስጣዊ በሳሎን ክፍያ",
          "ኢንተርናሽናል ሳሎኖችን የሚያስተውሉ ሰዎች የWhatsApp ድጋፍ",
          "እንግሊዝኛ + አንድ ተጨማሪ የቋንቋ ፓኬጅ",
          "የSMS አስታዋሽ በዋጋ ቅርብ የሚከፈል",
        ],
      },
      {
        id: "pro",
        name: "TeqBook Pro",
        price: "499 kr / ወር",
        description:
          "3–6 ሰራተኞች ያሉ እና የቀጠሮ መቆጣጠር እና no‑shows መቀነስ የሚፈልጉ ሳሎኖች ለመቀጠል ይሻላል።",
        features: [
          "ነገር ሁሉ ካለው Starter",
          "ለሰራተኞችና ለደንበኞች ሙሉ በሙሉ በብዙ ቋንቋ የሚሰራ የUI ቅርጸ‑ተሞክሮ",
          "ስለ ገቢ፣ ስለ ካፓሲቲ አጠቃቀም እና ስለ no‑shows ዝርዝር ሪፖርቶች",
          "በራሱ የሚሄዱ ማስታወሻዎችና ማስጠንቀቂያዎች",
          "ለተጨማሪ ሰራተኞች ድጋፍ እና ቀላል የshift ሰሌዳ",
          "በሳሎኑ ውስጥ የሚሸጡትን ምርቶች ለማስተዳደር ቀላል የእቃ መዝገብ",
          "በእርስዎ ሎጎ እና ቀለም የተሰራ የቀጠሮ ገፅ",
        ],
        highlighted: true,
      },
      {
        id: "business",
        name: "TeqBook Business",
        price: "799 kr / ወር",
        description:
          "ከፍተኛ ግብዣ ያላቸውና ትልቅ የሆኑ ሳሎኖች የአዋጭ መዋቅር፣ ሚናዎች እና ጥራት ያለው ሪፖርት ሲፈልጉ ይጠቅማል።",
        features: [
          "ነገር ሁሉ ካለው Pro",
          "ክፍለ‑ስራዎች እና የመዳረሻ መቆጣጠሪያ (ባለቤት፣ ማኔጀር፣ ሬሴፕሽን፣ ሰራተኛ)",
          "ለሒሳብና ለሪፖርት ጥራት ያለው ስታቲስቲክስ እና ውጤት ማስወጣት",
          "በአስቸኳይ ጊዜ የሚሰጥ ቅድሚ‑የተሰጠ ድጋፍ",
        ],
      },
    ],
    stats: [
      {
        title: "ለበሳሎን ውስጥ ክፍያ የተሠራ",
        body: "ሁሉም ጽሑፎች እና የስርዓት እንቅስቃሴዎች ክፍያ በሳሎን ውስጥ እንዲሆን ተቀይረዋል – እንጂ በመስመር ላይ በካርታ አይደለም።",
      },
      {
        title: "ከመጀመሪያው ቀን ጀምሮ ብዙ ሳሎን ድጋፍ",
        body: "አንድ የ TeqBook መለያ በ Supabase ውስጥ በጥራት የተከፈለ የውስጥ ደረጃ ደህንነት ጋር ብዙ ሳሎኖችን ማስተዳደር ይችላል።",
      },
      {
        title: "ከእርስዎ ጋር ለመዳበር ዝግጁ",
        body: "MVP ለማስታወቂያዎች፣ ሪፖርትና የክፍያ ስርዓት ኢንተግሬሽኖች ግልጽ የሆነ መንገድ ካርታ ጋር ተገንብቷል።",
      },
    ],
    faqTitle: "ብዙ ጊዜ የሚጠየቁ ጥያቄዎች",
    faq: [
      {
        q: "በመስመር ላይ የካርታ ክፍያ ያስፈልገኛል?",
        a: "አይደለም። TeqBook በተለይ ለበሳሎን ውስጥ ክፍያ ብቻ ተዘጋጅቷል። ክፍያዎችን በማስታወሻ ላይ መከታተል ትችላለህ፣ ግን በመስመር ላይ ከካርታ ምንም ገንዘብ አይታጠፍም።",
      },
      {
        q: "በአንድ መለያ ብዙ ሳሎኖችን መቆጣጠር እችላለሁ?",
        a: "አዎን። TeqBook ለእያንዳንዱ ባለቤት ብዙ ሳሎኖችን ይደግፋል፣ መረጃው በሳሎኖች መካከል እንዳይቀላቀል ጠንካራ የ RLS መመሪያዎችን ይጠቀማል።",
      },
      {
        q: "የ SMS እና የኢሜይል አስታዋሽዎች ምንድን ሆነው?",
        a: "ይህ በ Phase 5 ይመጣል። የመረጃ ሞዴሉ አስቀድሞ ተዘጋጅቷል፣ ስለዚህ አስታዋሽዎችን በኋላ በቀላሉ መጨመር እንችላለን።",
      },
    ],
  },
  tr: {
    brand: "TeqBook",
    heroTitle: "Kuaför randevusu – salonda ödeme için tasarlandı",
    heroSubtitle:
      "TeqBook, İskandinav ülkelerindeki kuaför ve güzellik salonları için basit ve modern bir randevu sistemidir. Müşteriler online randevu alır, ödemeyi ise her zaman salonda yapar.",
    ctaPrimary: "Ücretsiz başla",
    ctaSecondary: "Demo talep et",
    badge: "Salonlar için üretildi",
    pricingTitle: "TeqBook planını seç",
    pricingSubtitle:
      "Batı’daki uluslararası salonlar için tasarlandı – basit başla, büyüdükçe planını genişlet.",
    tiers: [
      {
        id: "starter",
        name: "TeqBook Starter",
        price: "299 kr / ay",
        description:
          "1–2 çalışanı olan berber, kuaför, tırnak ya da masaj salonları için ideal.",
        features: [
          "Online randevu ve basit takvim",
          "Müşteri listesi ve hizmet yönetimi",
          "Karmaşık ödeme entegrasyonları olmadan salonda ödeme",
          "Uluslararası salonları anlayan bir ekipten WhatsApp desteği",
          "İngilizce + seçtiğiniz bir ek dil paketi",
          "Maliyetine yakın fiyatla SMS hatırlatmaları",
        ],
      },
      {
        id: "pro",
        name: "TeqBook Pro",
        price: "499 kr / ay",
        description:
          "3–6 çalışanı olan ve daha fazla kontrol ile daha az no‑show isteyen salonlar için.",
        features: [
          "Starter’daki her şey",
          "Çalışanlar ve müşteriler için tam çok dilli arayüz",
          "Ciro, kapasite kullanımı ve no‑show oranları için gelişmiş raporlar",
          "Otomatik hatırlatmalar ve bildirimler",
          "Daha fazla çalışan desteği ve basit vardiya planlama",
          "Salon içinde sattığınız ürünler için hafif stok takibi",
          "Logo ve renklerinize göre markalanmış randevu sayfası",
        ],
        highlighted: true,
      },
      {
        id: "business",
        name: "TeqBook Business",
        price: "799 kr / ay",
        description:
          "Daha büyük ve yoğun salonlar için; rol yapısı, yetki yönetimi ve güçlü raporlama isteyenler için.",
        features: [
          "Pro’daki her şey",
          "Roller ve erişim kontrolü (sahip, yönetici, resepsiyon, çalışan)",
          "Muhasebe ve raporlama için daha derin istatistikler ve dışa aktarma",
          "Acil durumlarda öncelikli destek",
        ],
      },
    ],
    stats: [
      {
        title: "Salonda ödeme için tasarlandı",
        body: "Tüm metinler ve akışlar, ödemenin salonda yapılmasına göre optimize edilmiştir – online kart ödemesi yok.",
      },
      {
        title: "İlk günden itibaren çoklu salon desteği",
        body: "Tek bir TeqBook girişi ile birden fazla salonu yönetebilir, Supabase'te tenant başına satır seviyesi güvenlik ile verileri ayırabilirsin.",
      },
      {
        title: "Seninle birlikte büyümeye hazır",
        body: "MVP; bildirimler, raporlama ve ödeme sistemleri entegrasyonları için net bir yol haritasıyla inşa edildi.",
      },
    ],
    faqTitle: "Sık sorulan sorular",
    faq: [
      {
        q: "Online kart ödemesine ihtiyacım var mı?",
        a: "Hayır. TeqBook özellikle sadece salonda ödeme için tasarlanmıştır. Ödemeleri notlar üzerinden takip edebilirsin, ancak kartlardan online çekim yapılmaz.",
      },
      {
        q: "Tek hesapla birden fazla salon yönetebilir miyim?",
        a: "Evet. TeqBook, her sahip için birden fazla salonu destekler; veriler salonlar arasında karışmasın diye sıkı RLS kuralları kullanılır.",
      },
      {
        q: "SMS ve e-posta hatırlatmaları ne durumda?",
        a: "Bu özellik Phase 5’te gelecek. Veri modeli şimdiden hazır, bu yüzden bildirimleri daha sonra kolayca ekleyebiliriz.",
      },
    ],
  },
  pl: {
    brand: "TeqBook",
    heroTitle: "Rezerwacje salonowe – stworzone z myślą o płatności w salonie",
    heroSubtitle:
      "TeqBook to prosty i nowoczesny system rezerwacji dla salonów fryzjerskich i kosmetycznych w krajach nordyckich. Klienci rezerwują online, ale płacą zawsze na miejscu.",
    ctaPrimary: "Rozpocznij za darmo",
    ctaSecondary: "Umów demo",
    badge: "Stworzone dla salonów",
    pricingTitle: "Wybierz plan TeqBook dla swojego salonu",
    pricingSubtitle:
      "Stworzone dla międzynarodowych salonów w Europie – zacznij prosto i rozwijaj się we własnym tempie.",
    tiers: [
      {
        id: "starter",
        name: "TeqBook Starter",
        price: "299 kr / miesiąc",
        description:
          "Idealny start dla barberów, fryzjerów, salonów paznokci lub masażu z 1–2 pracownikami.",
        features: [
          "Rezerwacje online i prosty kalendarz",
          "Baza klientów i zarządzanie usługami",
          "Płatność w salonie bez skomplikowanych integracji płatniczych",
          "Wsparcie na WhatsApp od ludzi, którzy znają realia międzynarodowych salonów",
          "Angielski + jeden dodatkowy pakiet językowy",
          "Powiadomienia SMS w cenie zbliżonej do kosztu wysyłki",
        ],
      },
      {
        id: "pro",
        name: "TeqBook Pro",
        price: "499 kr / miesiąc",
        description:
          "Dla salonów z 3–6 pracownikami, które chcą mieć więcej kontroli i mniej nieobecnych klientów.",
        features: [
          "Wszystko z pakietu Starter",
          "Pełny, wielojęzyczny interfejs dla pracowników i klientów",
          "Zaawansowane raporty o przychodach, wykorzystaniu czasu i no‑shows",
          "Automatyczne przypomnienia i powiadomienia",
          "Obsługa większej liczby pracowników i prosty grafik zmian",
          "Lekki moduł stanów magazynowych dla produktów sprzedawanych w salonie",
          "Strona rezerwacji z Twoim logo i kolorami",
        ],
        highlighted: true,
      },
      {
        id: "business",
        name: "TeqBook Business",
        price: "799 kr / miesiąc",
        description:
          "Dla większych, bardziej obciążonych salonów potrzebujących ról, uprawnień i lepszego raportowania.",
        features: [
          "Wszystko z pakietu Pro",
          "Role i kontrola dostępu (właściciel, menedżer, recepcja, pracownik)",
          "Głębsze statystyki oraz eksport danych do księgowości i raportów",
          "Wsparcie priorytetowe w sytuacjach krytycznych",
        ],
      },
    ],
    stats: [
      {
        title: "Stworzone z myślą o płatności w salonie",
        body: "Wszystkie teksty i przepływy są zoptymalizowane pod płatność w salonie – a nie płatności kartą online.",
      },
      {
        title: "Wiele salonów od pierwszego dnia",
        body: "Jedno konto TeqBook może zarządzać wieloma salonami, z bezpieczną separacją danych dzięki multi‑tenancy w Supabase.",
      },
      {
        title: "Gotowe, aby rosnąć razem z Tobą",
        body: "MVP zostało zbudowane z jasną mapą rozwoju: powiadomienia, raportowanie i integracje z systemami płatności.",
      },
    ],
    faqTitle: "Najczęściej zadawane pytania",
    faq: [
      {
        q: "Czy potrzebuję płatności kartą online?",
        a: "Nie. TeqBook jest zaprojektowane wyłącznie pod płatność w salonie. Nadal możesz notować informacje o płatności, ale żadne karty nie są obciążane online.",
      },
      {
        q: "Czy mogę zarządzać kilkoma salonami z jednego konta?",
        a: "Tak. TeqBook wspiera wiele salonów na jednego właściciela, z rygorystycznymi zasadami RLS, aby dane nigdy się nie mieszały.",
      },
      {
        q: "Co z przypomnieniami SMS i e‑mail?",
        a: "Pojawią się w fazie 5. Model danych jest już przygotowany, więc późniejsze podłączenie powiadomień będzie proste.",
      },
    ],
  },
  vi: {
    brand: "TeqBook",
    heroTitle:
      "Đặt lịch cho salon – được thiết kế cho thanh toán trực tiếp tại salon",
    heroSubtitle:
      "TeqBook là hệ thống đặt lịch đơn giản, hiện đại cho salon tóc và chăm sóc sắc đẹp ở Bắc Âu. Khách đặt lịch online, nhưng luôn thanh toán tại salon.",
    ctaPrimary: "Bắt đầu miễn phí",
    ctaSecondary: "Đặt lịch demo",
    badge: "Thiết kế riêng cho salon",
    pricingTitle: "Chọn gói TeqBook phù hợp cho salon của bạn",
    pricingSubtitle:
      "Được thiết kế cho các salon quốc tế tại châu Âu – bắt đầu đơn giản và nâng cấp khi bạn phát triển.",
    tiers: [
      {
        id: "starter",
        name: "TeqBook Starter",
        price: "299 kr / tháng",
        description:
          "Phù hợp cho barber, salon tóc, nails hoặc massage với 1–2 nhân viên.",
        features: [
          "Đặt lịch online và lịch làm việc đơn giản",
          "Danh sách khách hàng và quản lý dịch vụ",
          "Thanh toán trực tiếp tại salon, không cần tích hợp thanh toán phức tạp",
          "Hỗ trợ qua WhatsApp từ đội ngũ hiểu môi trường salon quốc tế",
          "Tiếng Anh + một gói ngôn ngữ bổ sung",
          "Tin nhắn SMS nhắc lịch với giá gần bằng giá gốc",
        ],
      },
      {
        id: "pro",
        name: "TeqBook Pro",
        price: "499 kr / tháng",
        description:
          "Dành cho salon có 3–6 nhân viên, muốn kiểm soát tốt hơn và giảm no‑show.",
        features: [
          "Tất cả tính năng trong gói Starter",
          "Giao diện đa ngôn ngữ đầy đủ cho cả nhân viên và khách",
          "Báo cáo nâng cao về doanh thu, công suất và tỉ lệ no‑show",
          "Nhắc nhở và thông báo tự động",
          "Hỗ trợ thêm nhân viên và lập lịch ca làm việc đơn giản",
          "Quản lý tồn kho đơn giản cho sản phẩm bán trong salon",
          "Trang đặt lịch mang thương hiệu của bạn (logo và màu sắc riêng)",
        ],
        highlighted: true,
      },
      {
        id: "business",
        name: "TeqBook Business",
        price: "799 kr / tháng",
        description:
          "Dành cho các salon lớn, đông khách cần cấu trúc rõ ràng, phân quyền và báo cáo tốt hơn.",
        features: [
          "Tất cả tính năng trong gói Pro",
          "Phân quyền và kiểm soát truy cập (chủ, quản lý, lễ tân, nhân viên)",
          "Thống kê chuyên sâu và xuất dữ liệu cho kế toán và báo cáo",
          "Hỗ trợ ưu tiên khi có vấn đề khẩn cấp",
        ],
      },
    ],
    stats: [
      {
        title: "Thiết kế cho thanh toán tại salon",
        body: "Mọi nội dung và luồng sử dụng đều được tối ưu cho thanh toán tại salon – không phải thanh toán thẻ online.",
      },
      {
        title: "Hỗ trợ nhiều salon ngay từ ngày đầu",
        body: "Một tài khoản TeqBook có thể quản lý nhiều salon, với multi‑tenancy an toàn trên Supabase để tách biệt dữ liệu.",
      },
      {
        title: "Sẵn sàng phát triển cùng bạn",
        body: "MVP được xây dựng với lộ trình rõ ràng: thông báo, báo cáo và tích hợp hệ thống thanh toán.",
      },
    ],
    faqTitle: "Câu hỏi thường gặp",
    faq: [
      {
        q: "Tôi có cần thanh toán thẻ online không?",
        a: "Không. TeqBook được thiết kế đặc biệt cho thanh toán trực tiếp tại salon. Bạn vẫn có thể ghi chú về thanh toán, nhưng không có giao dịch thẻ online.",
      },
      {
        q: "Tôi có thể quản lý nhiều salon bằng một tài khoản không?",
        a: "Có. TeqBook hỗ trợ nhiều salon cho mỗi chủ, với các luật RLS nghiêm ngặt để dữ liệu không bị lẫn giữa các salon.",
      },
      {
        q: "Còn nhắc nhở SMS và email thì sao?",
        a: "Tính năng này sẽ ra mắt ở Phase 5. Mô hình dữ liệu đã sẵn sàng, nên việc thêm thông báo sau này sẽ rất đơn giản.",
      },
    ],
  },
  zh: {
    brand: "TeqBook",
    heroTitle: "沙龙预约系统——为到店付款而设计",
    heroSubtitle:
      "TeqBook 是专为北欧地区美发和美容沙龙打造的简洁现代预约系统。顾客在线预约，但付款始终在沙龙现场完成。",
    ctaPrimary: "免费开始使用",
    ctaSecondary: "预约演示",
    badge: "为沙龙打造",
    pricingTitle: "为你的沙龙选择合适的 TeqBook 套餐",
    pricingSubtitle:
      "专为欧洲的国际沙龙打造 —— 先从简单开始，业务增长后再升级。",
    tiers: [
      {
        id: "starter",
        name: "TeqBook 入门版",
        price: "299 kr / 月",
        description:
          "非常适合 1–2 名员工的小型理发店、美发店、美甲或按摩工作室。",
        features: [
          "线上预约与简洁日历视图",
          "客户列表与服务项目管理",
          "无需复杂支付集成，顾客到店付款",
          "来自了解国际沙龙场景团队的 WhatsApp 支持",
          "英文界面 + 1 个额外语言包",
          "按成本价计费的短信提醒",
        ],
      },
      {
        id: "pro",
        name: "TeqBook 专业版",
        price: "499 kr / 月",
        description:
          "适合 3–6 名员工的沙龙，希望更好掌控预约并减少爽约情况。",
        features: [
          "包含入门版的全部功能",
          "为员工和顾客提供完整的多语言界面",
          "关于营收、利用率和爽约率的高级报表",
          "自动短信/邮件提醒与通知",
          "支持更多员工与简易排班管理",
          "适合沙龙内零售产品的轻量库存管理",
          "可使用自有 logo 与品牌色的专属预约页面",
        ],
        highlighted: true,
      },
      {
        id: "business",
        name: "TeqBook 商业版",
        price: "799 kr / 月",
        description:
          "为规模更大、客流更高的沙龙打造，需要更清晰的角色分工与更强报表能力。",
        features: [
          "包含专业版的全部功能",
          "角色与权限控制（拥有者、店长、前台、员工）",
          "更深入的统计数据与导出功能，方便财务与管理报表",
          "紧急情况时享有优先级技术支持",
        ],
      },
    ],
    stats: [
      {
        title: "专为到店付款设计",
        body: "所有文案和流程都围绕到店付款进行优化——而不是线上刷卡支付。",
      },
      {
        title: "从第一天起支持多家沙龙",
        body: "一个 TeqBook 登录即可管理多家沙龙，利用 Supabase 的 multi‑tenancy 安全地隔离数据。",
      },
      {
        title: "准备好与你一同成长",
        body: "MVP 基于清晰的路线图构建：通知、报表以及支付系统集成。",
      },
    ],
    faqTitle: "常见问题",
    faq: [
      {
        q: "我需要线上刷卡支付功能吗？",
        a: "不需要。TeqBook 专门为到店付款场景设计。你仍然可以在备注中记录付款信息，但系统不会进行任何线上扣款。",
      },
      {
        q: "我可以用一个账号管理多家沙龙吗？",
        a: "可以。TeqBook 支持同一拥有者名下的多家沙龙，并通过严格的 RLS 规则确保数据不会在沙龙之间泄露或混用。",
      },
      {
        q: "短信和邮件提醒怎么办？",
        a: "这会在第 5 阶段上线。数据模型已经为此做好准备，因此后续接入通知会很简单。",
      },
    ],
  },
  tl: {
    brand: "TeqBook",
    heroTitle:
      "Booking para sa mga salon – dinisenyo para sa bayad sa mismong salon",
    heroSubtitle:
      "Ang TeqBook ay isang simple at modernong booking system para sa mga salon sa Nordics. Nagbu-book ang mga kliyente online, pero laging sa salon sila nagbabayad.",
    ctaPrimary: "Magsimula nang libre",
    ctaSecondary: "Mag-book ng demo",
    badge: "Gawa para sa mga salon",
    pricingTitle: "Piliin ang TeqBook plan na bagay sa salon mo",
    pricingSubtitle:
      "Gawa para sa mga international na salon sa Europe – magsimula nang simple, saka ka mag-upgrade kapag lumalaki na ang negosyo mo.",
    tiers: [
      {
        id: "starter",
        name: "TeqBook Starter",
        price: "299 kr / buwan",
        description:
          "Sakto para sa barber, hair, nails o massage na may 1–2 empleyado.",
        features: [
          "Online booking at simpleng calendar",
          "Listahan ng mga customer at pamamahala ng mga serbisyo",
          "Bayad palagi sa salon – walang komplikadong payment integration",
          "WhatsApp support mula sa team na sanay sa international na mga salon",
          "English + isang karagdagang language pack",
          "SMS reminders na halos presyo‑gastos lang",
        ],
      },
      {
        id: "pro",
        name: "TeqBook Pro",
        price: "499 kr / buwan",
        description:
          "Para sa mga salon na may 3–6 empleyado na gustong mas kaunting no‑show at mas malinaw na kontrol.",
        features: [
          "Lahat mula sa Starter",
          "Buong multi‑lingual na UI para sa staff at customers",
          "Advanced na reports sa kita, kapasidad at no‑show rate",
          "Automatic na paalala at notifications",
          "Suporta sa mas maraming empleyado at simpleng shift scheduling",
          "Magaan na inventory tracking para sa mga produktong binebenta sa salon",
          "Booking page na naka‑brand sa logo at kulay ng salon mo",
        ],
        highlighted: true,
      },
      {
        id: "business",
        name: "TeqBook Business",
        price: "799 kr / buwan",
        description:
          "Para sa mas malalaki at mas busy na salon na kailangan ng roles, access control at mas malalim na reporting.",
        features: [
          "Lahat mula sa Pro",
          "Roles at access control (owner, manager, reception, staff)",
          "Mas detalyadong statistics at export para sa accounting at reporting",
          "Priority support kapag may urgent na isyu",
        ],
      },
    ],
    stats: [
      {
        title: "Dinisenyo para sa bayad sa salon",
        body: "Lahat ng kopya at flow ay naka-optimize para sa bayad sa salon – hindi para sa online card payment.",
      },
      {
        title: "Multi-salon mula sa unang araw",
        body: "Isang TeqBook login lang, puwede nang humawak ng maraming salon, gamit ang secure na multi‑tenancy sa Supabase.",
      },
      {
        title: "Handang lumaki kasama mo",
        body: "Ang MVP ay ginawa na may malinaw na roadmap: notifications, reporting, at POS integrations.",
      },
    ],
    faqTitle: "Mga madalas itanong",
    faq: [
      {
        q: "Kailangan ko ba ng online card payment?",
        a: "Hindi. Ang TeqBook ay sadyang ginawa para sa bayad sa mismong salon. Puwede ka pa ring magtala tungkol sa bayad sa notes, pero walang card na icha-charge online.",
      },
      {
        q: "Puwede ba akong mag-manage ng maraming salon sa isang account?",
        a: "Oo. Sinusuportahan ng TeqBook ang maraming salon per owner, na may mahigpit na RLS para hindi magkahalo ang data ng iba't ibang salon.",
      },
      {
        q: "Paano naman ang SMS at email reminders?",
        a: "Darating ito sa Phase 5. Naka-ready na ang data model, kaya madali na lang idagdag ang notifications sa susunod.",
      },
    ],
  },
  fa: {
    brand: "TeqBook",
    heroTitle: "سیستم نوبت‌دهی سالن – طراحی‌شده برای پرداخت در خود سالن",
    heroSubtitle:
      "TeqBook یک سیستم نوبت‌دهی ساده و مدرن برای سالن‌های زیبایی در کشورهای شمال اروپا است. مشتریان به صورت آنلاین نوبت می‌گیرند، اما پرداخت همیشه در خود سالن انجام می‌شود.",
    ctaPrimary: "رایگان شروع کنید",
    ctaSecondary: "درخواست دمو",
    badge: "ساخته‌شده برای سالن‌ها",
    pricingTitle: "پلن TeqBook مناسب سالن خود را انتخاب کنید",
    pricingSubtitle:
      "ویژه سالن‌های بین‌المللی در اروپا – ساده شروع کنید و هر زمان رشد کردید پلن خود را ارتقا دهید.",
    tiers: [
      {
        id: "starter",
        name: "TeqBook Starter",
        price: "299 کرون / ماه",
        description:
          "مناسب برای آرایشگاه‌ها، سالن‌های مو، ناخن یا ماساژ با ۱ تا ۲ نفر پرسنل.",
        features: [
          "نوبت‌دهی آنلاین و تقویم ساده",
          "دفترچه مشتریان و مدیریت خدمات",
          "پرداخت همیشه در سالن، بدون نیاز به اتصال پیچیده درگاه پرداخت",
          "پشتیبانی واتس‌اپ از تیمی که با سالن‌های بین‌المللی آشناست",
          "رابط انگلیسی + یک بسته زبان اضافی",
          "یادآورهای SMS با هزینه نزدیک به قیمت تمام‌شده",
        ],
      },
      {
        id: "pro",
        name: "TeqBook Pro",
        price: "499 کرون / ماه",
        description:
          "برای سالن‌هایی با ۳ تا ۶ کارمند که دنبال کنترل بیشتر و no‑show کمتر هستند.",
        features: [
          "همه چیز در پلن Starter",
          "رابط کاربری کاملاً چندزبانه برای پرسنل و مشتریان",
          "گزارش‌های پیشرفته درباره درآمد، ظرفیت و آمار عدم حضور",
          "یادآورها و نوتیفیکیشن‌های خودکار",
          "پشتیبانی از پرسنل بیشتر و برنامه‌ریزی ساده شیفت‌ها",
          "انبارداری سبک برای محصولاتی که در سالن می‌فروشید",
          "صفحه نوبت‌دهی با لوگو و رنگ‌های برند شما",
        ],
        highlighted: true,
      },
      {
        id: "business",
        name: "TeqBook Business",
        price: "799 کرون / ماه",
        description:
          "برای سالن‌های بزرگ‌تر و شلوغ‌تر که به ساختار، نقش‌ها و گزارش‌دهی قوی‌تر نیاز دارند.",
        features: [
          "همه چیز در پلن Pro",
          "نقش‌ها و کنترل دسترسی (مالک، مدیر، پذیرش، پرسنل)",
          "آمار و نمودارهای عمیق‌تر به همراه خروجی برای حسابداری و گزارش",
          "پشتیبانی اولویت‌دار در مواقع اضطراری",
        ],
      },
    ],
    stats: [
      {
        title: "طراحی‌شده برای پرداخت حضوری",
        body: "تمام متن‌ها و جریان‌ها برای پرداخت در سالن بهینه شده‌اند – نه برای پرداخت آنلاین با کارت.",
      },
      {
        title: "پشتیبانی چند سالن از روز اول",
        body: "یک ورود به TeqBook می‌تواند چندین سالن را مدیریت کند، با جداسازی امن داده‌ها برای هر سالن در Supabase.",
      },
      {
        title: "آماده رشد همراه با شما",
        body: "MVP با نقشه‌راه شفاف برای نوتیفیکیشن‌ها، گزارش‌گیری و یکپارچه‌سازی با سیستم‌های پرداخت ساخته شده است.",
      },
    ],
    faqTitle: "سؤالات متداول",
    faq: [
      {
        q: "آیا به پرداخت آنلاین با کارت نیاز دارم؟",
        a: "خیر. TeqBook مخصوص سناریوی پرداخت در خود سالن طراحی شده است. همچنان می‌توانید یادداشت‌هایی درباره پرداخت ثبت کنید، اما هیچ کارتی به صورت آنلاین شارژ نمی‌شود.",
      },
      {
        q: "آیا می‌توانم چند سالن را با یک حساب مدیریت کنم؟",
        a: "بله. TeqBook از چند سالن برای هر صاحب پشتیبانی می‌کند و با قوانین سخت‌گیرانه RLS تضمین می‌کند که داده‌ها بین سالن‌ها مخلوط نشوند.",
      },
      {
        q: "وضعیت یادآورهای SMS و ایمیل چگونه است؟",
        a: "این قابلیت در فاز ۵ اضافه خواهد شد. مدل داده‌ها از قبل آماده است، بنابراین افزودن نوتیفیکیشن‌ها در ادامه آسان خواهد بود.",
      },
    ],
  },
  dar: {
    brand: "TeqBook",
    heroTitle: "سیستم نوبت‌گیری سالون – ساخته‌شده برای پرداخت در خود سالون",
    heroSubtitle:
      "TeqBook یک سیستم ساده و عصری نوبت‌گیری برای سالون‌های زیبایی در کشورهای شمال اروپا است. مشتریان به طور آنلاین نوبت می‌گیرند، اما همیشه در خود سالون پول می‌پردازند.",
    ctaPrimary: "به شکل رایگان شروع کنید",
    ctaSecondary: "درخواست دمو",
    badge: "ساخته‌شده برای سالون‌ها",
    pricingTitle: "پلن TeqBook مناسب سالون خود را انتخاب کنید",
    pricingSubtitle:
      "برای سالون‌های بین‌المللی در اروپا ساخته شده است – ساده شروع کنید و هر وقت آماده بودید، پلن را ارتقا دهید.",
    tiers: [
      {
        id: "starter",
        name: "TeqBook Starter",
        price: "299 کرون / ماه",
        description:
          "مناسب برای نر سالون‌های برُبر، مو، ناخن یا ماساژ که ۱–۲ کارمند دارند.",
        features: [
          "نوبت‌گیری آنلاین و تقویم ساده",
          "ثبت مشتریان و مدیریت خدمات",
          "پرداخت همیشه در خود سالون، بدون ادغام‌های پیچیده پرداخت",
          "پشتیبانی واتس‌اپ از تیمی که سالون‌های بین‌المللی را می‌شناسد",
          "انگلیسی + یک بسته اضافی زبان",
          "یادآورهای SMS تقریباً به قیمت اصلی ارسال",
        ],
      },
      {
        id: "pro",
        name: "TeqBook Pro",
        price: "499 کرون / ماه",
        description:
          "برای سالون‌هایی با ۳–۶ کارمند که می‌خواهند کنترول بیشتر و no‑show کمتر داشته باشند.",
        features: [
          "همه چیز در پلن Starter",
          "رُخ‌نمای چندزبانه کامل برای کارمندان و مشتریان",
          "گزارش‌های پیشرفته درباره عاید، استفاده از ظرفیت و no‑show",
          "یادآورها و نوتیفیکیشن‌های خودکار",
          "پشتیبانی از کارمندان بیشتر و جدول شیفت ساده",
          "انبارداری ساده برای جنس‌هایی که در سالون می‌فروشید",
          "صفحه نوبت‌گیری با لوگو و رنگ‌های مخصوص سالون شما",
        ],
        highlighted: true,
      },
      {
        id: "business",
        name: "TeqBook Business",
        price: "799 کرون / ماه",
        description:
          "برای سالون‌های کلان و مصروف که به ساختار، رول‌ها و گزارش‌دهی قوی ضرورت دارند.",
        features: [
          "همه چیز در پلن Pro",
          "رول‌ها و کنترول دسترسی (مالک، مدیر، ریسپشن، کارمند)",
          "احصائیه‌های عمیق‌تر و برآمد معلومات برای حسابداری و راپور",
          "پشتیبانی در اولویت وقتی موضوع جدی و عاجل است",
        ],
      },
    ],
    stats: [
      {
        title: "ساخته‌شده برای پرداخت در سالون",
        body: "تمام متن‌ها و جریان‌ها برای پرداخت در خود سالون تنظیم شده‌اند – نه برای پرداخت کارت آنلاین.",
      },
      {
        title: "پشتیبانی چند سالون از روز اول",
        body: "یک حساب TeqBook می‌تواند چندین سالون را با multi‑tenancy امن در Supabase مدیریت کند.",
      },
      {
        title: "آماده برای رشد همراه با شما",
        body: "MVP با یک نقشه‌راه واضح برای نوتیفیکیشن‌ها، گزارش‌گیری و ادغام با سیستم‌های پرداخت ساخته شده است.",
      },
    ],
    faqTitle: "سوالات مکرر",
    faq: [
      {
        q: "آیا لازم است پرداخت آنلاین با کارت داشته باشم؟",
        a: "خیر. TeqBook به طور خاص برای سناریوی پرداخت در خود سالون طراحی شده است. شما می‌توانید در یادداشت‌ها در مورد پرداخت بنویسید، اما هیچ کارتی آنلاین چارج نمی‌شود.",
      },
      {
        q: "آیا می‌توانم چند سالون را با یک حساب مدیریت کنم؟",
        a: "بلی. TeqBook از چندین سالون برای هر صاحب حمایت می‌کند و با قوانین سختگیرانه RLS تضمین می‌کند که معلومات بین سالون‌ها مخلوط نشود.",
      },
      {
        q: "حالت یادآورهای SMS و ایمیل چه است؟",
        a: "این فیچر در فاز ۵ می‌آید. ما از قبل مدل معلومات را آماده کرده‌ایم، بناً اضافه‌کردن نوتیفیکیشن‌ها در آینده آسان خواهد بود.",
      },
    ],
  },
  ur: {
    brand: "TeqBook",
    heroTitle:
      "سیلونوں کے لیے بُکنگ سسٹم – جو خاص طور پر سیلون میں فزیکل ادائیگی کے لیے بنایا گیا ہے",
    heroSubtitle:
      "TeqBook نارڈکس کے سیلونز کے لیے ایک سادہ اور جدید بُکنگ سسٹم ہے۔ کسٹمرز آن لائن بُک کرتے ہیں، لیکن ہمیشہ سیلون پر آ کر ادائیگی کرتے ہیں۔",
    ctaPrimary: "مفت میں شروع کریں",
    ctaSecondary: "ڈیمو بُک کریں",
    badge: "سیلونز کے لیے بنایا گیا",
    pricingTitle: "TeqBook کا وہ پلان منتخب کریں جو آپ کے سیلون کو سوٹ کرے",
    pricingSubtitle:
      "یورپ کے انٹرنیشنل سیلونز کے لیے بنایا گیا — سادہ آغاز کریں اور جب بزنس بڑھے تو پلان اَپ گریڈ کریں۔",
    tiers: [
      {
        id: "starter",
        name: "TeqBook Starter",
        price: "299 کرون / مہینہ",
        description:
          "۱–۲ اسٹاف والے باربر، ہیئر، نیلز یا مساج سیلون کے لیے بہترین آغاز۔",
        features: [
          "آن لائن بُکنگ اور سادہ کیلنڈر",
          "کسٹمر لسٹ اور سروس مینجمنٹ",
          "بغیر کسی پیچیدہ پیمنٹ انٹیگریشن کے ہمیشہ سیلون پر ادائیگی",
          "WhatsApp سپورٹ اُن لوگوں سے جو انٹرنیشنل سیلونز کو سمجھتے ہیں",
          "انگریزی + ایک اضافی لینگوئج پیک",
          "SMS ریمائنڈرز تقریباً لاگت کے برابر قیمت پر",
        ],
      },
      {
        id: "pro",
        name: "TeqBook Pro",
        price: "499 کرون / مہینہ",
        description:
          "۳–۶ ملازمین والے سیلونز کے لیے جو زیادہ کنٹرول اور کم no‑show چاہتے ہیں۔",
        features: [
          "Starter میں موجود ہر چیز",
          "سٹاف اور کسٹمرز کے لیے مکمل ملٹی‑لنگول انٹرفیس",
          "آمدنی، کپیسٹی یوز اور no‑show ریٹ پر ایڈوانسڈ رپورٹس",
          "آٹو میٹک ریمائنڈرز اور نوٹیفیکیشنز",
          "زیادہ اسٹاف کے لیے سپورٹ اور سادہ شفٹ شیڈولنگ",
          "ان پراڈکٹس کے لیے ہلکی پھلکی انوینٹری جسے آپ سیلون میں بیچتے ہیں",
          "آپ کے لوگو اور کلرز کے ساتھ برانڈڈ بُکنگ پیج",
        ],
        highlighted: true,
      },
      {
        id: "business",
        name: "TeqBook Business",
        price: "799 کرون / مہینہ",
        description:
          "بڑے اور مصروف سیلونز کے لیے جنہیں اسٹرکچر، رولز اور مزید طاقتور رپورٹنگ چاہیے۔",
        features: [
          "Pro میں موجود ہر چیز",
          "رولز اور ایکسیس کنٹرول (اونر، مینیجر، ریسپشن، اسٹاف)",
          "اکاؤنٹنگ اور رپورٹنگ کے لیے زیادہ گہرے اسٹیٹس اور ڈیٹا ایکسپورٹ",
          "ایمرجنسی کی صورت میں ترجیحی سپورٹ",
        ],
      },
    ],
    stats: [
      {
        title: "سیلون میں ادائیگی کے لیے ڈیزائن کیا گیا",
        body: "تمام ٹیکسٹ اور فلو اس لیے بنائے گئے ہیں کہ ادائیگی سیلون میں ہو – آن لائن کارڈ پیمنٹ کے لیے نہیں۔",
      },
      {
        title: "پہلے دن سے ملٹی سیلون",
        body: "ایک ہی TeqBook لاگ اِن سے آپ کئی سیلونز چلا سکتے ہیں، Supabase کے محفوظ ملٹی ٹیننسی کے ساتھ۔",
      },
      {
        title: "آپ کے ساتھ بڑھنے کے لیے تیار",
        body: "MVP ایک واضح روڈ میپ کے ساتھ بنایا گیا ہے: نوٹیفکیشنز، رپورٹنگ اور POS انٹیگریشنز۔",
      },
    ],
    faqTitle: "اکثر پوچھے جانے والے سوالات",
    faq: [
      {
        q: "کیا مجھے آن لائن کارڈ پیمنٹ کی ضرورت ہے؟",
        a: "نہیں۔ TeqBook خاص طور پر اس کے لیے بنایا گیا ہے کہ کسٹمر سیلون میں آ کر ادائیگی کرے۔ آپ نوٹس میں ادائیگی کے بارے میں لکھ سکتے ہیں، مگر کوئی کارڈ آن لائن چارج نہیں ہوتا۔",
      },
      {
        q: "کیا میں ایک ہی اکاؤنٹ سے کئی سیلونز مینج کر سکتا ہوں؟",
        a: "جی ہاں۔ TeqBook ایک مالک کے تحت کئی سیلونز کی سپورٹ کرتا ہے، اور سخت RLS رولز کے ذریعے ڈیٹا کو سیلونز کے درمیان ملنے سے روکتا ہے۔",
      },
      {
        q: "ایس ایم ایس اور ای میل ریمائنڈرز کا کیا ہوگا؟",
        a: "یہ فیچر فیز ۵ میں آئے گا۔ ڈیٹا ماڈل پہلے سے تیار ہے، اس لیے بعد میں نوٹیفکیشنز شامل کرنا آسان ہوگا۔",
      },
    ],
  },
  hi: {
    brand: "TeqBook",
    heroTitle:
      "सैलून के लिए बुकिंग सिस्टम – जो खास तौर पर सैलून में नकद/कार्ड भुगतान के लिए बनाया गया है",
    heroSubtitle:
      "TeqBook नॉर्डिक देशों के सैलून के लिए एक सरल और आधुनिक बुकिंग सिस्टम है। ग्राहक ऑनलाइन समय बुक करते हैं, लेकिन भुगतान हमेशा सैलून पर ही करते हैं।",
    ctaPrimary: "फ्री में शुरू करें",
    ctaSecondary: "डेमो बुक करें",
    badge: "सैलून के लिए बनाया गया",
    pricingTitle: "अपने सैलून के लिए सही TeqBook प्लान चुनें",
    pricingSubtitle:
      "यूरोप के international सैलून के लिए बनाया गया — आसान शुरुआत करें और जब बिज़नेस बढ़े तो प्लान अपग्रेड करें।",
    tiers: [
      {
        id: "starter",
        name: "TeqBook Starter",
        price: "299 kr / महीना",
        description:
          "1–2 कर्मचारियों वाले छोटे barber, hair, nails या massage सैलून के लिए बेहतरीन शुरुआत।",
        features: [
          "ऑनलाइन बुकिंग और सरल कैलेंडर",
          "कस्टमर लिस्ट और सर्विस मैनेजमेंट",
          "बिना किसी complex payment integration के हमेशा सैलून में पेमेंट",
          "WhatsApp सपोर्ट, ऐसी टीम से जो international सैलून को समझती है",
          "English + एक extra language pack",
          "SMS रिमाइंडर, लगभग cost‑price पर",
        ],
      },
      {
        id: "pro",
        name: "TeqBook Pro",
        price: "499 kr / महीना",
        description:
          "3–6 स्टाफ वाले सैलून के लिए, जहाँ ज़्यादा कंट्रोल और कम no‑show की ज़रूरत है।",
        features: [
          "Starter के सारे फीचर्स",
          "स्टाफ और कस्टमर दोनों के लिए full multi‑lingual UI",
          "रेवेन्यू, capacity‑use और no‑show रेट पर एडवांस्ड रिपोर्ट्स",
          "ऑटोमैटिक रिमाइंडर और notifications",
          "ज़्यादा स्टाफ के लिए सपोर्ट और आसान shift scheduling",
          "सैलून में बिकने वाले products के लिए हल्की‑फुल्की inventory",
          "आपके लोगो और colours के साथ ब्रांडेड बुकिंग‑पेज",
        ],
        highlighted: true,
      },
      {
        id: "business",
        name: "TeqBook Business",
        price: "799 kr / महीना",
        description:
          "बड़े और busy सैलून के लिए, जिन्हें strong structure, roles और बेहतर reporting चाहिए।",
        features: [
          "Pro के सारे फीचर्स",
          "roles और access‑control (owner, manager, reception, staff)",
          "accounting और reporting के लिए deep stats और data‑export",
          "urgent cases में priority सपोर्ट",
        ],
      },
    ],
    stats: [
      {
        title: "सैलून में भुगतान के लिए डिज़ाइन किया गया",
        body: "सारी कॉपी और फ्लो इस विचार से बने हैं कि भुगतान सैलून में हो – ऑनलाइन कार्ड पेमेंट के लिए नहीं।",
      },
      {
        title: "पहले दिन से मल्टी‑सैलून",
        body: "एक TeqBook लॉगिन से आप कई सैलून चला सकते हैं, Supabase की सुरक्षित multi‑tenancy के साथ।",
      },
      {
        title: "आपके साथ बढ़ने के लिए तैयार",
        body: "MVP एक स्पष्ट रोडमैप के साथ बनाया गया है: नोटिफिकेशन, रिपोर्टिंग और POS इंटीग्रेशन।",
      },
    ],
    faqTitle: "अक्सर पूछे जाने वाले प्रश्न",
    faq: [
      {
        q: "क्या मुझे ऑनलाइन कार्ड पेमेंट की ज़रूरत है?",
        a: "नहीं। TeqBook खास तौर पर इस मॉडल के लिए बनाया गया है जिसमें ग्राहक सैलून पर ही भुगतान करते हैं। आप नोट्स में भुगतान की जानकारी लिख सकते हैं, लेकिन कोई कार्ड ऑनलाइन चार्ज नहीं होगा।",
      },
      {
        q: "क्या मैं एक अकाउंट से कई सैलून मैनेज कर सकता हूँ?",
        a: "हाँ। TeqBook एक मालिक के तहत कई सैलून सपोर्ट करता है, और सख्त RLS नियमों से डेटा को सैलून के बीच मिलाने से रोकता है।",
      },
      {
        q: "SMS और ई‑मेल रिमाइंडर का क्या?",
        a: "यह फीचर फेज़ 5 में आएगा। डेटा मॉडल पहले से तैयार है, इसलिए बाद में नोटिफिकेशन जोड़ना आसान होगा।",
      },
    ],
  },
} as const;

export default function LandingPage() {
  const [locale, setLocale] = useState<Locale>("nb");
  const t = copy[locale];

  const pricingPlans = t.tiers;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top nav */}
      <header className="sticky top-0 z-20 border-b bg-background/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <Image
              src="Favikon.svg"
              alt={t.brand}
              width={120}
              height={32}
              className="h-7 w-auto"
              priority
            />
            <span className="text-sm font-semibold tracking-tight">
              {t.brand}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1 rounded-full border bg-card px-2 py-1 text-[10px] font-medium text-muted-foreground sm:flex">
              <span>
                {locale === "nb"
                  ? "Språk"
                  : locale === "ar"
                    ? "اللغة"
                    : locale === "so"
                      ? "Luuqad"
                      : locale === "ti"
                        ? "ቋንቋ"
                        : locale === "am"
                          ? "ቋንቋ"
                          : locale === "tr"
                            ? "Dil"
                            : locale === "pl"
                              ? "Język"
                              : locale === "vi"
                                ? "Ngôn ngữ"
                                : locale === "zh"
                                  ? "语言"
                                  : locale === "tl"
                                    ? "Wika"
                                    : locale === "fa" || locale === "dar"
                                      ? "زبان"
                                      : "Language"}
                :
              </span>
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as Locale)}
                className="h-6 rounded-full border-none bg-transparent px-1 text-[10px] outline-none focus-visible:ring-0"
              >
                <option value="nb">🇳🇴 Norsk</option>
                <option value="en">🇬🇧 English</option>
                <option value="ar">🇸🇦 العربية</option>
                <option value="so">🇸🇴 Soomaali</option>
                <option value="ti">🇪🇷 ትግርኛ</option>
                <option value="am">🇪🇹 አማርኛ</option>
                <option value="tr">🇹🇷 Türkçe</option>
                <option value="pl">🇵🇱 Polski</option>
                <option value="vi">🇻🇳 Tiếng Việt</option>
                <option value="tl">🇵🇭 Tagalog</option>
                <option value="zh">🇨🇳 中文</option>
                <option value="fa">🇮🇷 فارسی</option>
                <option value="dar">🇦🇫 دری</option>
                <option value="ur">🇵🇰 اردو</option>
                <option value="hi">🇮🇳 हिन्दी</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/signup">
                <Button size="sm">
                  {locale === "nb"
                    ? "Opprett konto"
                    : locale === "ar"
                      ? "إنشاء حساب"
                      : locale === "so"
                        ? "Samee akoon"
                        : locale === "ti"
                          ? "ኣካውንት ፍጠር"
                          : locale === "am"
                            ? "መለያ ፍጠር"
                            : locale === "tr"
                              ? "Hesap oluştur"
                              : locale === "pl"
                                ? "Utwórz konto"
                                : locale === "vi"
                                  ? "Tạo tài khoản"
                                  : locale === "zh"
                                    ? "注册"
                                    : locale === "tl"
                                      ? "Gumawa ng account"
                                      : locale === "fa" || locale === "dar"
                                        ? "ایجاد حساب"
                                        : "Sign up"}
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="sm">
                  {locale === "nb"
                    ? "Logg inn"
                    : locale === "ar"
                      ? "تسجيل الدخول"
                      : locale === "so"
                        ? "Soo gal"
                        : locale === "ti"
                          ? "ናብ መንነት ኣብ ግባ"
                          : locale === "am"
                            ? "ግባ"
                            : locale === "tr"
                              ? "Giriş yap"
                              : locale === "pl"
                                ? "Zaloguj się"
                                : locale === "vi"
                                  ? "Đăng nhập"
                                  : locale === "zh"
                                    ? "登录"
                                    : locale === "tl"
                                      ? "Mag-log in"
                                      : locale === "fa" || locale === "dar"
                                        ? "ورود"
                                        : "Log in"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="border-b bg-card/60">
          <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:flex-row lg:items-center">
            <div className="flex-1 space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-emerald-800">
                {t.badge}
              </span>
              <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
                {t.heroTitle}
              </h1>
              <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
                {t.heroSubtitle}
              </p>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto">
                    {t.ctaPrimary}
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  type="button"
                >
                  {t.ctaSecondary}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {locale === "nb"
                  ? "Ingen kredittkort nødvendig. Betaling settes opp når du er klar."
                  : locale === "ar"
                    ? "لا حاجة لبطاقة ائتمان الآن. يتم إعداد الدفع عندما تكون مستعدًا."
                    : locale === "so"
                      ? "Kaararka deynta looma baahna. Lacag bixinta waxaa la dejinayaa marka aad diyaar noqoto."
                      : locale === "ti"
                        ? "ክሬዲት ካርታ ኣይድልየን። ክፍሊ ገንዘብ እንተዘይብሉ ኣብ ዝሓለፈ ግዜ ክተዘጋጅ እዩ።"
                        : locale === "am"
                          ? "የክሬዲት ካርድ መረጃ አያስፈልግም። ክፍያዎች ሲያስፈልጉ በኋላ ይዘጋጃሉ።"
                          : locale === "tr"
                            ? "Kredi kartı gerekmez. Ödemeler, hazır olduğunda yapılandırılır."
                            : locale === "pl"
                              ? "Karta kredytowa nie jest wymagana. Płatności skonfigurujesz, gdy będziesz gotowy."
                              : locale === "vi"
                                ? "Không cần thẻ tín dụng. Bạn có thể cấu hình thanh toán sau khi sẵn sàng."
                                : locale === "zh"
                                  ? "无需信用卡。你可以在准备好之后再配置付款方式。"
                    : locale === "tl"
                      ? "Hindi kailangan ng credit card. Maaari mong i-set up ang bayad kapag handa ka na."
                      : locale === "fa" || locale === "dar" || locale === "ur"
                        ? "نیازی به کارت اعتباری نیست. می‌توانید تنظیمات پرداخت را وقتی آماده بودید انجام دهید."
                        : "No credit card required. Payments are configured when you’re ready."}
              </p>
            </div>
            <div className="flex-1">
              <div className="mt-4 rounded-2xl border bg-background p-4 shadow-sm sm:p-5">
                <p className="text-xs font-medium text-muted-foreground">
                  {locale === "nb"
                        ? "Hvordan TeqBook passer inn i salongen din"
                    : locale === "ar"
                      ? "كيف ينسجم إيفو مع طريقة عمل صالونك"
                      : locale === "so"
                        ? "Sida TeqBook ugu habboon yahay saloonkaaga"
                        : locale === "ti"
                          ? "TeqBook ከመይ እዩ ኣብ ሳሎንኻ ዝሓተት?"
                          : locale === "am"
                            ? "TeqBook በሳሎንህ ውስጥ እንዴት እንደሚስማማ"
                            : locale === "tr"
                              ? "TeqBook, salonunun işleyişine nasıl uyum sağlar"
                              : "How TeqBook fits into your salon"}
                </p>
                <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                  <p>
                        1.{" "}
                        {locale === "nb"
                          ? "Kundene booker på nett"
                      : locale === "ar"
                        ? "العملاء يحجزون عبر الإنترنت"
                        : locale === "so"
                          ? "Macaamiishu waxay ballansadaan online"
                          : locale === "ti"
                            ? "ገበሬታት ብመስመር ላይ ይመዝገቡ"
                            : locale === "am"
                              ? "ደንበኞች ቀጠሮዎችን በመስመር ላይ ያዘዙ"
                              : locale === "tr"
                                ? "Müşteriler online randevu alır"
                                : "Clients book online"}{" "}
                    <code className="rounded bg-muted px-1 py-0.5 text-[10px]">
                      /book/[slug]
                    </code>
                    ).
                  </p>
                  <p>
                        2.{" "}
                        {locale === "nb"
                          ? "Du ser alle bookinger i TeqBook-kalenderen"
                      : locale === "ar"
                        ? "تدير جميع الحجوزات في تقويم إيفو"
                        : locale === "so"
                          ? "Waxaad arki kartaa dhammaan ballamaha kalandarka TeqBook"
                          : locale === "ti"
                            ? "ኩሉ መመዝገብታት ኣብ ካለንደር TeqBook ትመልከታለካ"
                            : locale === "am"
                              ? "ሁሉንም ቀጠሮዎች በ TeqBook ቀን መቁጠሪያ ውስጥ ታቆጣጠራለህ"
                              : locale === "tr"
                                ? "Tüm randevuları TeqBook takviminden yönetirsin"
                                : "You manage all bookings in the TeqBook calendar"}
                    .
                  </p>
                  <p>
                        3.{" "}
                        {locale === "nb"
                      ? "Kunden betaler fysisk i salong – akkurat som før"
                      : locale === "ar"
                        ? "العميل يدفع داخل الصالون – تمامًا كما هو الحال اليوم"
                        : locale === "so"
                          ? "Macmiilku wuxuu lacagta ku bixinayaa gudaha saloonka – sidii hore oo kale"
                          : locale === "ti"
                            ? "ደኣንነት ገንዘቡን ብቀጥታ ኣብ ሳሎን ይኸፍል – ከም ሕጂ እዩ"
                            : locale === "am"
                              ? "ደንበኛው ክፍያውን በቀጥታ በሳሎኑ ውስጥ ይከፍላል – እንደ ዛሬው ጊዜ"
                              : locale === "tr"
                                ? "Müşteri ödemeyi salonda yapar – bugün olduğu gibi"
                                : "Clients pay in-salon – just like today"}
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats / hvorfor TeqBook */}
        <section className="border-b bg-background">
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
            <Section>
              <StatsGrid>
                {t.stats.map((s: { title: string; body: string }) => (
                  <SectionCard key={s.title} title={s.title}>
                    <p className="text-sm text-muted-foreground">{s.body}</p>
                  </SectionCard>
                ))}
              </StatsGrid>
            </Section>
          </div>
        </section>

        {/* Pricing */}
        <section className="border-b bg-card/40">
          <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
            <Section
              title={t.pricingTitle}
              description={t.pricingSubtitle}
            >
              <p className="mb-6 text-center text-xs font-medium uppercase tracking-wide text-emerald-700">
                {locale === "nb"
                  ? "Rimelig. Enkelt. Bygget for internasjonale salonger."
                  : "Affordable. Simple. Built for international salons."}
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                {pricingPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`flex flex-col rounded-2xl border bg-background p-4 shadow-sm sm:p-5 ${
                      (plan as any).highlighted
                        ? "border-foreground shadow-md"
                        : ""
                    }`}
                  >
                    <div className="mb-3 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold tracking-tight">
                          {plan.name}
                        </h3>
                        {plan.badge && (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                            {plan.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {plan.description}
                      </p>
                    </div>
                    <p className="text-lg font-semibold">{plan.price}</p>
                    <ul className="mt-3 flex-1 space-y-1.5 text-xs text-muted-foreground">
                      {plan.features.map((f) => (
                        <li key={f} className="flex gap-1.5">
                          <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-foreground/60" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className="mt-4 w-full">
                      {locale === "nb"
                        ? "Start gratis prøveperiode"
                        : "Start free trial"}
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl border bg-background/80 p-4 text-xs text-muted-foreground sm:p-5">
                <h3 className="text-sm font-semibold tracking-tight">
                  {locale === "nb" ? "Add-ons" : "Add-ons"}
                </h3>
                <p className="mt-1 text-[11px]">
                  {locale === "nb"
                    ? "Bygg din egen TeqBook-pakke etter behov. Perfekt for salonger drevet av innvandrere som vil starte enkelt og vokse trygt."
                    : "Build the TeqBook setup that fits your salon. Ideal for international salon owners who want to start simple and grow safely."}
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border bg-card px-3 py-3">
                    <p className="text-xs font-semibold">
                      {locale === "nb"
                        ? "99 kr/mnd – Flerspråklig bookingside"
                        : "99 NOK / month – Multilingual booking page"}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {locale === "nb"
                        ? "Somali, Tigrinja, Urdu, Vietnamesisk, Arabisk, Tyrkisk m.fl."
                        : "Somali, Tigrinya, Urdu, Vietnamese, Arabic, Turkish and more."}
                    </p>
                  </div>
                  <div className="rounded-xl border bg-card px-3 py-3">
                    <p className="text-xs font-semibold">
                      {locale === "nb"
                        ? "49 kr/mnd per ekstra ansatt"
                        : "49 NOK / month per extra staff member"}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {locale === "nb"
                        ? "Skaler trygt når salongen vokser, uten store hopp i pris."
                        : "Scale your team as you grow, without big pricing jumps."}
                    </p>
                  </div>
                  <div className="rounded-xl border bg-card px-3 py-3">
                    <p className="text-xs font-semibold">
                      {locale === "nb"
                        ? "0,5–0,9 kr per SMS"
                        : "0.5–0.9 NOK per SMS"}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {locale === "nb"
                        ? "Du betaler kun for SMS du faktisk sender – ingen skjulte gebyrer."
                        : "Only pay for the SMS messages you actually send – no hidden fees."}
                    </p>
                  </div>
                </div>
              </div>
            </Section>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-background">
          <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
            <Section title={t.faqTitle}>
              <div className="space-y-4">
                    {t.faq.map((item: { q: string; a: string }) => (
                  <div
                    key={item.q}
                    className="rounded-lg border bg-card px-4 py-3 text-sm"
                  >
                    <p className="font-medium">{item.q}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/60">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-4 py-4 text-[11px] text-muted-foreground sm:flex-row sm:px-6">
          <span>© {new Date().getFullYear()} TeqBook.</span>
          <span>
            {locale === "nb"
              ? "Bygget med Supabase + Next.js, designet for salonger i Norden."
              : locale === "ar"
                ? "مبني باستخدام Supabase و Next.js، ومصمَّم خصيصًا لصالونات الشمال الأوروبي."
                : locale === "so"
                  ? "Waxaa lagu dhisay Supabase + Next.js, waxaana loo qaabeeyey saloonnada Waqooyiga Yurub."
                  : locale === "ti"
                    ? "ብ Supabase + Next.js ተስሪሑ እዮም፣ ንሳሎናት ናብ ሰሜን ኤውሮፓ ዝተሰርሑ እዮም።"
                    : locale === "am"
                      ? "በ Supabase + Next.js ተገንብቶ ለሰሜን አውሮፓ ሳሎኖች ተዘጋጅቷል።"
                      : locale === "tr"
                        ? "Supabase + Next.js ile geliştirildi, İskandinav salonları için tasarlandı."
                        : locale === "pl"
                          ? "Zbudowane w oparciu o Supabase + Next.js, zaprojektowane dla salonów w krajach nordyckich."
                          : locale === "vi"
                            ? "Xây dựng với Supabase + Next.js, được thiết kế cho các salon ở Bắc Âu."
                            : locale === "zh"
                              ? "基于 Supabase + Next.js 构建，专为北欧地区的沙龙设计。"
                              : locale === "tl"
                        ? "Gawa gamit ang Supabase + Next.js, dinisenyo para sa mga salon sa Nordics."
                        : locale === "fa" || locale === "dar" || locale === "ur"
                          ? "با استفاده از Supabase + Next.js ساخته شده، مخصوص سالن‌های کشورهای شمال اروپا."
                          : "Built with Supabase + Next.js, designed for Nordic salons."}
          </span>
        </div>
      </footer>
    </div>
  );
}


