"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { StatsGrid } from "@/components/stats-grid";
import { Section, SectionCard } from "@/components/layout/section";
import { Check, Sparkles, Calendar, Users, Clock, User, Scissors, CreditCard, TrendingUp, Globe, UserPlus, Waves, Hand, Paintbrush } from "lucide-react";
import { LogoLoop } from "@/components/ui/logo-loop";

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
    affordableSimple: string;
    startFreeTrial: string;
    addOnsTitle: string;
    newBooking: string;
    exampleCustomerName: string;
    exampleService: string;
    exampleDate: string;
    today: string;
    bookingsCount: string;
    cutService: string;
    signUpButton: string;
    logInButton: string;
    addOnsDescription: string;
    multilingualBookingTitle: string;
    multilingualBookingDescription: string;
    extraStaffTitle: string;
    extraStaffDescription: string;
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
        price: "$25 / month",
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
        price: "$50 / month",
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
        price: "$75 / month",
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
    affordableSimple: "Rimelig. Enkelt. Bygget for internasjonale salonger.",
    startFreeTrial: "Start gratis prøveperiode",
    addOnsTitle: "Add-ons",
    newBooking: "Ny booking",
    exampleCustomerName: "Maria Hansen",
    exampleService: "Klipp & styling",
    exampleDate: "15. mars, 14:00",
    today: "I dag",
    bookingsCount: "3 bookinger",
    cutService: "Klipp",
    signUpButton: "Opprett konto",
    logInButton: "Logg inn",
    addOnsDescription: "Bygg din egen TeqBook-pakke etter behov. Perfekt for salonger drevet av innvandrere som vil starte enkelt og vokse trygt.",
    multilingualBookingTitle: "Flerspråklig bookingside",
    multilingualBookingDescription: "$10 / month — Somali, Tigrinja, Urdu, Vietnamesisk, Arabisk, Tyrkisk m.fl.",
    extraStaffTitle: "Ekstra ansatt",
    extraStaffDescription: "$5 / month per ekstra ansatt — Skaler trygt når salongen vokser, uten store hopp i pris.",
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
    heroTitle: "Finally, a booking system that understands how real salons work.",
    heroSubtitle:
      "TeqBook keeps your day organized, your customers happy, and your business running smoothly — without complicated software or online payment requirements.",
    ctaPrimary: "Get started for free",
    ctaSecondary: "Book a demo",
    badge: "Built for salons",
    pricingTitle: "Choose your TeqBook plan",
    pricingSubtitle:
      "Built for salons of all sizes — start simple, then upgrade anytime.",
    tiers: [
      {
        id: "starter",
        name: "TeqBook Starter",
        price: "$25 / month",
        description:
          "Perfect for 1–2 person salons.",
        features: [
          "Online booking and calendar",
          "Customer list and service management",
          "Pay-in-salon flow",
          "WhatsApp support",
          "One additional language pack",
          "SMS reminders at cost price",
        ],
      },
      {
        id: "pro",
        name: "TeqBook Pro",
        price: "$50 / month",
        description:
          "For salons with 3–6 staff who want more control and fewer no-shows.",
        features: [
          "Includes everything in Starter, plus:",
          "Fully multilingual interface for staff and clients",
          "Advanced reports on revenue and capacity",
          "Automatic reminders and notifications",
          "Shift planning and staff scheduling",
          "Lightweight inventory for products you sell",
          "Branded booking page with your logo and colors",
        ],
        highlighted: true,
      },
      {
        id: "business",
        name: "TeqBook Business",
        price: "$75 / month",
        description:
          "For larger salons that need structure, roles and full reporting.",
        features: [
          "Includes everything in Pro, plus:",
          "Roles and access control (owner, manager, staff)",
          "Deeper statistics and export for accounting",
          "Priority support",
        ],
      },
    ],
    stats: [
      {
        title: "Designed for real salons",
        body: "Simple, practical workflows built for barbers, hairdressers, nail and beauty salons.",
      },
      {
        title: "Perfect for pay-in-salon businesses",
        body: "No forced online payments or extra fees. Just a clean booking flow that fits how real salons operate.",
      },
      {
        title: "Grows with your salon",
        body: "Add staff, manage multiple locations, and keep your business organized as you expand.",
      },
    ],
    affordableSimple: "Affordable. Simple. Built for international salons.",
    startFreeTrial: "Start free trial",
    addOnsTitle: "Add-ons",
    newBooking: "New booking",
    exampleCustomerName: "Maria Hansen",
    exampleService: "Cut & styling",
    exampleDate: "March 15, 2:00 PM",
    today: "Today",
    bookingsCount: "3 bookings",
    cutService: "Cut",
    signUpButton: "Sign up",
    logInButton: "Log in",
    addOnsDescription: "Build the TeqBook setup that fits your salon. Ideal for international salon owners who want to start simple and grow safely.",
    multilingualBookingTitle: "Multilingual booking page",
    multilingualBookingDescription: "$10 / month — Let clients book in Somali, Tigrinya, Urdu, Vietnamese, Arabic, Turkish and more.",
    extraStaffTitle: "Extra staff member",
    extraStaffDescription: "$5 / month per additional staff — Scale your team without big jumps in pricing.",
    faqTitle: "Frequently asked questions",
    faq: [
      {
        q: "Do I need online card payments?",
        a: "No. TeqBook is built for pay-in-salon workflows. You can still track payments, but nothing is charged online.",
      },
      {
        q: "Can I manage multiple salons under one account?",
        a: "Yes. You can manage several locations safely and securely in one place.",
      },
      {
        q: "What about SMS and email reminders?",
        a: "Yes — reminders are fully supported so clients never forget their appointments.",
      },
    ],
  },
  ar: {
    brand: "TeqBook",
    heroTitle: "حجوزات للصالونات – مصمَّمة للدفع داخل الصالون",
    heroSubtitle:
      "TeqBook هو نظام حجز بسيط وحديث لصالونات التجميل في الشمال الأوروبي. يحجز العملاء عبر الإنترنت، لكن الدفع يتم دائمًا في الصالون.",
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
        price: "$25 / month",
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
        price: "$50 / month",
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
        price: "$75 / month",
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
        body: "يمكن لاسم مستخدم واحد في TeqBook إدارة عدة صالونات مع عزل صارم للبيانات لكل صالون في Supabase.",
      },
      {
        title: "جاهز للنمو معك",
        body: "تم بناء الـ MVP مع خارطة طريق واضحة: تنبيهات، تقارير وتكاملات مع أنظمة نقاط البيع.",
      },
    ],
    affordableSimple: "بأسعار معقولة. بسيط. مصمم للصالونات الدولية.",
    startFreeTrial: "ابدأ التجربة المجانية",
    addOnsTitle: "الإضافات",
    newBooking: "حجز جديد",
    exampleCustomerName: "ماريا هانسن",
    exampleService: "قص وتصفيف",
    exampleDate: "15 مارس، 2:00 مساءً",
    today: "اليوم",
    bookingsCount: "3 حجوزات",
    cutService: "قص",
    signUpButton: "إنشاء حساب",
    logInButton: "تسجيل الدخول",
    addOnsDescription: "قم ببناء إعداد TeqBook الذي يناسب صالونك. مثالي لأصحاب الصالونات الدولية الذين يريدون البدء ببساطة والنمو بأمان.",
    multilingualBookingTitle: "صفحة حجز متعددة اللغات",
    multilingualBookingDescription: "$10 / month — دع العملاء يحجزون بالصومالية والتغرينية والأردية والفيتنامية والعربية والتركية والمزيد.",
    extraStaffTitle: "عضو فريق إضافي",
    extraStaffDescription: "$5 / month لكل موظف إضافي — قم بتوسيع فريقك دون قفزات كبيرة في الأسعار.",
    faqTitle: "الأسئلة الشائعة",
    faq: [
      {
        q: "هل أحتاج إلى دفع بالبطاقة عبر الإنترنت؟",
        a: "لا. TeqBook مصمم صراحة للدفع داخل الصالون فقط. يمكنك مع ذلك تدوين ملاحظات عن المدفوعات، لكن لا يتم سحب أي بطاقات عبر الإنترنت.",
      },
      {
        q: "هل يمكنني إدارة عدة صالونات في حساب واحد؟",
        a: "نعم. يدعم TeqBook عدة صالونات لكل مالك، مع قواعد RLS صارمة لضمان عدم اختلاط البيانات بين الصالونات.",
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
        price: "$25 / month",
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
        price: "$50 / month",
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
        price: "$75 / month",
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
    affordableSimple: "Qiimo jaban. Fudud. Loo dhisay saloonnada caalamiga ah.",
    startFreeTrial: "Bilow free trial",
    addOnsTitle: "Ku-darid",
    newBooking: "Ballansasho cusub",
    exampleCustomerName: "Maria Hansen",
    exampleService: "Goos & qaabayn",
    exampleDate: "Maarso 15, 2:00 PM",
    today: "Maanta",
    bookingsCount: "3 ballanshado",
    cutService: "Goos",
    signUpButton: "Samee akoon",
    logInButton: "Soo gal",
    addOnsDescription: "Dhis qaabka TeqBook ee u habboon saloonkaaga. Wanaagsan milkiilayaasha saloonnada caalamiga ah ee doonaya inay si fudud u bilowaan oo si amaan ah u koraan.",
    multilingualBookingTitle: "Bogga ballansashada luuqadaha badan",
    multilingualBookingDescription: "$10 / month — U ogolow macaamiisha inay ballanshaadaan Soomaali, Tigrinya, Urdu, Vietnamese, Arabic, Turkish iyo kuwo kale.",
    extraStaffTitle: "Shaqaale dheeraad ah",
    extraStaffDescription: "$5 / month shaqaale kasta oo dheeraad ah — Kor u qaad kooxdaada iyadoon qiimo weyn u kordhin.",
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
        price: "$25 / month",
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
        price: "$50 / month",
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
        price: "$75 / month",
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
    affordableSimple: "ዋጋ ዝተመዝነን። ቀሊል። ንዓለምለኻዊ ሳሎናት ዝተሃንጸ።",
    startFreeTrial: "ናይ ነጻ ሙከራ ጀምር",
    addOnsTitle: "ወሳኒታት",
    newBooking: "ሓድሽ ቦኪንግ",
    exampleCustomerName: "Maria Hansen",
    exampleService: "ጭራር & ስታይሊንግ",
    exampleDate: "15 መጋቢት፣ 2:00 PM",
    today: "ሎሚ",
    bookingsCount: "3 ቦኪንግ",
    cutService: "ጭራር",
    signUpButton: "ኣካውንት ፍጠር",
    logInButton: "መግቢ",
    addOnsDescription: "ናይ TeqBook ምድላይ ንሳሎንኩም ዝሰማማዕ ስርዓት ስርዑ። ንዓለምለኻዊ ሳሎን ወንጌላውያን ንኽጅምሩ ቀሊልን ብድሕነት ንኽዓብዩን ዝደሊ ዝተሓሰበ።",
    multilingualBookingTitle: "ብዙ ቋንቋ ቦኪንግ ገጽ",
    multilingualBookingDescription: "$10 / month — ክሊዕንት ብ Soomaali, Tigrinya, Urdu, Vietnamese, Arabic, Turkish ከምኡውን ካልኦት ቋንቋታት ንኽቦክኑ ፍቓድ ሃቦም።",
    extraStaffTitle: "ተወሳኺ ሰራዊት",
    extraStaffDescription: "$5 / month ንነፍሲ ወከፍ ተወሳኺ ሰራዊት — ንክሓብት ብዓቢ ዋጋ ዘይምልዓል ንክሓብት ንኽሓብት።",
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
        price: "$25 / month",
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
        price: "$50 / month",
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
        price: "$75 / month",
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
    affordableSimple: "ተመጣጣኝ ዋጋ። ቀላል። ለዓለም አቀፍ ሳሎኖች የተገነባ።",
    startFreeTrial: "ነጻ ሙከራ ይጀምሩ",
    addOnsTitle: "ተጨማሪዎች",
    newBooking: "አዲስ ማስቀመጥ",
    exampleCustomerName: "Maria Hansen",
    exampleService: "መቁረጥ እና ስታይሊንግ",
    exampleDate: "ማርች 15፣ 2:00 PM",
    today: "ዛሬ",
    bookingsCount: "3 ማስቀመጥ",
    cutService: "መቁረጥ",
    signUpButton: "መለያ ፍጠር",
    logInButton: "ይግቡ",
    addOnsDescription: "ለሳሎንዎ የሚስማማውን TeqBook ማዋቀር ይገንቡ። ቀላል ለመጀመር እና በደህንነት ለመድብር ለሚፈልጉ ዓለም አቀፍ ሳሎን ባለቤቶች ተስማሚ።",
    multilingualBookingTitle: "በብዙ ቋንቋዎች የመዘዝ ገጽ",
    multilingualBookingDescription: "$10 / month — ደንበኞች በ Soomaali, Tigrinya, Urdu, Vietnamese, Arabic, Turkish እና ሌሎች ቋንቋዎች እንዲዘዙ ያድርጉ።",
    extraStaffTitle: "ተጨማሪ ሰራዊት",
    extraStaffDescription: "$5 / month ለእያንዳንዱ ተጨማሪ ሰራዊት — በዋጋ ትልቅ ዝለው ሳይሆን ቡድንዎን ያሳድጉ።",
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
        price: "$25 / month",
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
        price: "$50 / month",
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
        price: "$75 / month",
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
    affordableSimple: "Uygun fiyatlı. Basit. Uluslararası salonlar için yapılmış.",
    startFreeTrial: "Ücretsiz denemeyi başlat",
    addOnsTitle: "Eklentiler",
    newBooking: "Yeni rezervasyon",
    exampleCustomerName: "Maria Hansen",
    exampleService: "Kesim & şekillendirme",
    exampleDate: "15 Mart, 14:00",
    today: "Bugün",
    bookingsCount: "3 rezervasyon",
    cutService: "Kesim",
    signUpButton: "Hesap oluştur",
    logInButton: "Giriş yap",
    addOnsDescription: "Salonunuza uygun TeqBook kurulumunu oluşturun. Basit başlamak ve güvenle büyümek isteyen uluslararası salon sahipleri için ideal.",
    multilingualBookingTitle: "Çok dilli rezervasyon sayfası",
    multilingualBookingDescription: "$10 / month — Müşterilerin Somali, Tigrinya, Urdu, Vietnamca, Arapça, Türkçe ve daha fazlasıyla rezervasyon yapmasına izin verin.",
    extraStaffTitle: "Ekstra personel",
    extraStaffDescription: "$5 / month per ekstra personel — Fiyatlarda büyük artışlar olmadan ekibinizi ölçeklendirin.",
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
        price: "$25 / month",
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
        price: "$50 / month",
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
        price: "$75 / month",
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
    affordableSimple: "Przystępne. Proste. Zbudowane dla międzynarodowych salonów.",
    startFreeTrial: "Rozpocznij bezpłatny okres próbny",
    addOnsTitle: "Dodatki",
    newBooking: "Nowa rezerwacja",
    exampleCustomerName: "Maria Hansen",
    exampleService: "Strzyżenie i stylizacja",
    exampleDate: "15 marca, 14:00",
    today: "Dzisiaj",
    bookingsCount: "3 rezerwacje",
    cutService: "Strzyżenie",
    signUpButton: "Utwórz konto",
    logInButton: "Zaloguj się",
    addOnsDescription: "Zbuduj konfigurację TeqBook, która pasuje do Twojego salonu. Idealne dla międzynarodowych właścicieli salonów, którzy chcą zacząć prosto i bezpiecznie rosnąć.",
    multilingualBookingTitle: "Wielojęzyczna strona rezerwacji",
    multilingualBookingDescription: "$10 / month — Pozwól klientom rezerwować w języku somalijskim, tigrinia, urdu, wietnamskim, arabskim, tureckim i innych.",
    extraStaffTitle: "Dodatkowy personel",
    extraStaffDescription: "$5 / month za każdego dodatkowego pracownika — Skaluj swój zespół bez dużych skoków w cenach.",
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
        price: "$25 / month",
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
        price: "$50 / month",
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
        price: "$75 / month",
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
    affordableSimple: "Giá cả phải chăng. Đơn giản. Được xây dựng cho các salon quốc tế.",
    startFreeTrial: "Bắt đầu dùng thử miễn phí",
    addOnsTitle: "Tiện ích bổ sung",
    newBooking: "Đặt chỗ mới",
    exampleCustomerName: "Maria Hansen",
    exampleService: "Cắt & tạo kiểu",
    exampleDate: "15 tháng 3, 2:00 PM",
    today: "Hôm nay",
    bookingsCount: "3 đặt chỗ",
    cutService: "Cắt",
    signUpButton: "Tạo tài khoản",
    logInButton: "Đăng nhập",
    addOnsDescription: "Xây dựng thiết lập TeqBook phù hợp với salon của bạn. Lý tưởng cho chủ salon quốc tế muốn bắt đầu đơn giản và phát triển an toàn.",
    multilingualBookingTitle: "Trang đặt chỗ đa ngôn ngữ",
    multilingualBookingDescription: "$10 / month — Cho phép khách hàng đặt chỗ bằng tiếng Somali, Tigrinya, Urdu, Việt Nam, Ả Rập, Thổ Nhĩ Kỳ và nhiều hơn nữa.",
    extraStaffTitle: "Nhân viên bổ sung",
    extraStaffDescription: "$5 / month cho mỗi nhân viên bổ sung — Mở rộng nhóm của bạn mà không có sự tăng giá lớn.",
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
        price: "$25 / month",
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
        price: "$50 / month",
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
        price: "$75 / month",
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
    affordableSimple: "价格实惠。简单。专为国际沙龙打造。",
    startFreeTrial: "开始免费试用",
    addOnsTitle: "附加功能",
    newBooking: "新预订",
    exampleCustomerName: "Maria Hansen",
    exampleService: "剪发和造型",
    exampleDate: "3月15日，下午2:00",
    today: "今天",
    bookingsCount: "3个预订",
    cutService: "剪发",
    signUpButton: "创建账户",
    logInButton: "登录",
    addOnsDescription: "构建适合您沙龙的 TeqBook 设置。适合希望简单开始并安全发展的国际沙龙所有者。",
    multilingualBookingTitle: "多语言预订页面",
    multilingualBookingDescription: "$10 / month — 让客户使用索马里语、提格雷语、乌尔都语、越南语、阿拉伯语、土耳其语等语言进行预订。",
    extraStaffTitle: "额外员工",
    extraStaffDescription: "$5 / month 每位额外员工 — 在不大幅涨价的情况下扩展您的团队。",
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
        price: "$25 / month",
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
        price: "$50 / month",
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
        price: "$75 / month",
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
    affordableSimple: "Abot-kaya. Simple. Ginawa para sa international na salon.",
    startFreeTrial: "Simulan ang libreng trial",
    addOnsTitle: "Mga add-on",
    newBooking: "Bagong booking",
    exampleCustomerName: "Maria Hansen",
    exampleService: "Gupit & styling",
    exampleDate: "Marso 15, 2:00 PM",
    today: "Ngayon",
    bookingsCount: "3 booking",
    cutService: "Gupit",
    signUpButton: "Gumawa ng account",
    logInButton: "Mag-log in",
    addOnsDescription: "Bumuo ng TeqBook setup na akma sa iyong salon. Perpekto para sa international na salon owners na gustong magsimula nang simple at lumaki nang ligtas.",
    multilingualBookingTitle: "Multi-language booking page",
    multilingualBookingDescription: "$10 / month — Hayaan ang mga client na mag-book sa Somali, Tigrinya, Urdu, Vietnamese, Arabic, Turkish at iba pa.",
    extraStaffTitle: "Extra staff member",
    extraStaffDescription: "$5 / month bawat karagdagang staff — Palakihin ang iyong team nang walang malaking pagtaas sa presyo.",
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
        price: "$25 / month",
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
        price: "$50 / month",
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
        price: "$75 / month",
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
    affordableSimple: "مقرون به صرفه. ساده. ساخته شده برای سالن‌های بین‌المللی.",
    startFreeTrial: "شروع دوره آزمایشی رایگان",
    addOnsTitle: "افزونه‌ها",
    newBooking: "رزرو جدید",
    exampleCustomerName: "Maria Hansen",
    exampleService: "اصلاح و استایل",
    exampleDate: "۱۵ مارس، ۲:۰۰ بعدازظهر",
    today: "امروز",
    bookingsCount: "۳ رزرو",
    cutService: "اصلاح",
    signUpButton: "ایجاد حساب",
    logInButton: "ورود",
    addOnsDescription: "پیکربندی TeqBook را بسازید که با سالن شما سازگار باشد. ایده‌آل برای صاحبان سالن‌های بین‌المللی که می‌خواهند ساده شروع کنند و با امنیت رشد کنند.",
    multilingualBookingTitle: "صفحه رزرو چند زبانه",
    multilingualBookingDescription: "$10 / month — به مشتریان اجازه دهید به زبان‌های صومالی، تیگرینیا، اردو، ویتنامی، عربی، ترکی و بیشتر رزرو کنند.",
    extraStaffTitle: "عضو تیم اضافی",
    extraStaffDescription: "$5 / month برای هر کارمند اضافی — تیم خود را بدون افزایش زیاد قیمت گسترش دهید.",
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
        price: "$25 / month",
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
        price: "$50 / month",
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
        price: "$75 / month",
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
    affordableSimple: "مقرون به صرفه. ساده. ساخته شده برای سالون‌های بین‌المللی.",
    startFreeTrial: "شروع دوره آزمایشی رایگان",
    addOnsTitle: "افزونه‌ها",
    newBooking: "رزرو جدید",
    exampleCustomerName: "Maria Hansen",
    exampleService: "اصلاح و استایل",
    exampleDate: "۱۵ مارس، ۲:۰۰ بعدازظهر",
    today: "امروز",
    bookingsCount: "۳ رزرو",
    cutService: "اصلاح",
    signUpButton: "ایجاد حساب",
    logInButton: "ورود",
    addOnsDescription: "پیکربندی TeqBook را بسازید که با سالون شما سازگار باشد. ایده‌آل برای صاحبان سالون‌های بین‌المللی که می‌خواهند ساده شروع کنند و با امنیت رشد کنند.",
    multilingualBookingTitle: "صفحه رزرو چند زبانه",
    multilingualBookingDescription: "$10 / month — به مشتریان اجازه دهید به زبان‌های صومالی، تیگرینیا، اردو، ویتنامی، عربی، ترکی و بیشتر رزرو کنند.",
    extraStaffTitle: "عضو تیم اضافی",
    extraStaffDescription: "$5 / month برای هر کارمند اضافی — تیم خود را بدون افزایش زیاد قیمت گسترش دهید.",
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
        price: "$25 / month",
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
        price: "$50 / month",
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
        price: "$75 / month",
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
    affordableSimple: "قابلِ برداشت۔ سادہ۔ بین الاقوامی سالنوں کے لیے بنایا گیا۔",
    startFreeTrial: "مفت آزمائش شروع کریں",
    addOnsTitle: "اضافی خصوصیات",
    newBooking: "نیا بکنگ",
    exampleCustomerName: "Maria Hansen",
    exampleService: "کٹنگ اور اسٹائلنگ",
    exampleDate: "15 مارچ، 2:00 PM",
    today: "آج",
    bookingsCount: "3 بکنگ",
    cutService: "کٹنگ",
    signUpButton: "اکاؤنٹ بنائیں",
    logInButton: "لاگ اِن",
    addOnsDescription: "TeqBook سیٹ اپ بنائیں جو آپ کے سالن کے لیے موزوں ہو۔ بین الاقوامی سالن مالکان کے لیے مثالی جو سادہ شروع کرنا چاہتے ہیں اور محفوظ طریقے سے بڑھنا چاہتے ہیں۔",
    multilingualBookingTitle: "کثیر لسانی بکنگ پیج",
    multilingualBookingDescription: "$10 / month — کلائنٹس کو Somali, Tigrinya, Urdu, Vietnamese, Arabic, Turkish اور مزید زبانوں میں بکنگ کرنے دیں۔",
    extraStaffTitle: "اضافی عملہ",
    extraStaffDescription: "$5 / month ہر اضافی عملے کے لیے — قیمتوں میں بڑی چھلانگ کے بغیر اپنی ٹیم کو بڑھائیں۔",
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
        price: "$25 / month",
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
        price: "$50 / month",
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
        price: "$75 / month",
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
    affordableSimple: "सस्ती। सरल। अंतर्राष्ट्रीय सैलून के लिए बनाया गया।",
    startFreeTrial: "मुफ्त परीक्षण शुरू करें",
    addOnsTitle: "एड-ऑन",
    newBooking: "नई बुकिंग",
    exampleCustomerName: "Maria Hansen",
    exampleService: "कटिंग और स्टाइलिंग",
    exampleDate: "15 मार्च, 2:00 PM",
    today: "आज",
    bookingsCount: "3 बुकिंग",
    cutService: "कटिंग",
    signUpButton: "खाता बनाएँ",
    logInButton: "लॉग इन करें",
    addOnsDescription: "अपने सैलून के अनुरूप TeqBook सेटअप बनाएं। अंतर्राष्ट्रीय सैलून मालिकों के लिए आदर्श जो सरल शुरुआत करना चाहते हैं और सुरक्षित रूप से बढ़ना चाहते हैं।",
    multilingualBookingTitle: "बहुभाषी बुकिंग पेज",
    multilingualBookingDescription: "$10 / month — ग्राहकों को Somali, Tigrinya, Urdu, Vietnamese, Arabic, Turkish और अधिक भाषाओं में बुकिंग करने दें।",
    extraStaffTitle: "अतिरिक्त स्टाफ सदस्य",
    extraStaffDescription: "$5 / month प्रत्येक अतिरिक्त स्टाफ के लिए — मूल्य में बड़ी वृद्धि के बिना अपनी टीम को बढ़ाएं।",
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
  const [locale, setLocale] = useState<Locale>("en");
  const [scrolled, setScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const t = copy[locale];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    // Check on mount and use a small delay to ensure window is available
    if (typeof window !== 'undefined') {
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrolled = currentScrollY > 20;
      setScrolled(isScrolled);
      setScrollY(currentScrollY);
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calculate scroll progress for smooth animations (0 to 1)
  const scrollProgress = Math.min(scrollY / 100, 1);
  
  // Logo size: large at top (1.8x), normal when scrolled (1x)
  const logoScale = 1.8 - (scrollProgress * 0.8);
  const headerHeight = scrolled ? "py-3" : "pt-12 pb-6";
  const logoTextSize = 1.8 - (scrollProgress * 0.8); // rem units

  const pricingPlans = t.tiers;

  // Language flags for logo loop in Multilingual booking page add-on
  // All languages supported by TeqBook
  const languageLogos = [
    { emoji: "🇳🇴", alt: "Norwegian" },
    { emoji: "🇬🇧", alt: "English" },
    { emoji: "🇸🇦", alt: "Arabic" },
    { emoji: "🇸🇴", alt: "Somali" },
    { emoji: "🇪🇷", alt: "Tigrinya" },
    { emoji: "🇪🇹", alt: "Amharic" },
    { emoji: "🇹🇷", alt: "Turkish" },
    { emoji: "🇵🇱", alt: "Polish" },
    { emoji: "🇻🇳", alt: "Vietnamese" },
    { emoji: "🇵🇭", alt: "Tagalog" },
    { emoji: "🇨🇳", alt: "Chinese" },
    { emoji: "🇮🇷", alt: "Persian" },
    { emoji: "🇦🇫", alt: "Dari" },
    { emoji: "🇵🇰", alt: "Urdu" },
    { emoji: "🇮🇳", alt: "Hindi" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 via-blue-50/30 to-blue-50/20">
      {/* Gradient background layers */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-300/10 blur-3xl" />
      </div>

      {/* Top nav */}
      <header 
        className={`sticky top-0 z-20 transition-all duration-300 ${
          scrolled 
            ? "border-b border-blue-200/50 bg-white/70 backdrop-blur-xl backdrop-saturate-150" 
            : "border-b border-transparent bg-transparent backdrop-blur-none backdrop-saturate-100"
        }`}
      >
        <div className={`mx-auto flex max-w-5xl items-center justify-between pl-4 pr-4 transition-all duration-300 sm:px-6 ${headerHeight}`}>
          <motion.div 
            className="flex items-center gap-0.5 sm:gap-0.5 md:gap-0.5 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
            animate={{
              scale: isMobile ? 1 : logoScale, // No scale animation on mobile/tablet
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <Image
              src="/Favikon.svg"
              alt={t.brand}
              width={150}
              height={40}
              className="h-11 w-auto sm:h-13 flex-shrink-0"
              priority
            />
            <span 
              className="font-semibold tracking-tight transition-all duration-300 text-sm sm:text-base truncate"
              style={{
                fontSize: isMobile ? '0.875rem' : `${logoTextSize}rem`,
              }}
            >
              {t.brand}
            </span>
          </motion.div>
          <div className="flex items-center gap-2">
            {/* Desktop: Language selector and buttons */}
            <div className="hidden sm:flex items-center gap-2">
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as Locale)}
                className="h-8 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 outline-none transition-colors hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
              <Link href="/signup">
                <Button size="sm">
                  {t.signUpButton}
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="sm">
                  {t.logInButton}
                </Button>
              </Link>
            </div>
            
            {/* Mobile: Hamburger menu button */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-lg sm:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <span className="flex flex-col gap-1.5">
                <span className="block h-0.5 w-5 rounded bg-current" />
                <span className="block h-0.5 w-5 rounded bg-current" />
                <span className="block h-0.5 w-5 rounded bg-current" />
              </span>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm sm:hidden">
          {/* Clickable backdrop */}
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 h-full w-full cursor-default"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Sliding panel */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col gap-6 border-r bg-white px-5 py-6 shadow-xl"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <Image
                  src="/Favikon.svg"
                  alt={t.brand}
                  width={120}
                  height={32}
                  className="h-8 w-auto"
                  priority
                />
                <span className="text-sm font-semibold tracking-tight text-slate-900">
                  {t.brand}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <span className="relative block h-5 w-5">
                  <span className="absolute top-1/2 left-1/2 block h-0.5 w-4 rotate-45 rounded bg-slate-700 -translate-x-1/2 -translate-y-1/2" />
                  <span className="absolute top-1/2 left-1/2 block h-0.5 w-4 -rotate-45 rounded bg-slate-700 -translate-x-1/2 -translate-y-1/2" />
                </span>
              </Button>
            </div>

            <div className="flex flex-col gap-4">
              {/* Language selector */}
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-600">
                  {locale === "nb" ? "Språk" : "Language"}
                </label>
                <select
                  value={locale}
                  onChange={(e) => {
                    setLocale(e.target.value as Locale);
                    setMobileMenuOpen(false);
                  }}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition-colors hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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

              {/* Buttons */}
              <div className="flex flex-col gap-2">
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full" size="sm">
                    {t.signUpButton}
                  </Button>
                </Link>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full" size="sm">
                    {t.logInButton}
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Hero */}
      <main className="flex-1 relative">
        <section className="relative -mt-[120px] pt-[120px] border-b border-blue-200/30 overflow-hidden bg-blue-50 min-h-[calc(100vh-120px)]">
          {/* Abstract gradient background layers */}
          <div className="pointer-events-none absolute inset-0 top-0">
            {/* Base gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-100" />
            
            {/* Large blurred blobs for depth */}
            <motion.div
              className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-indigo-400/30 blur-3xl"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.4, 0.3],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute -bottom-56 -left-10 h-96 w-96 rounded-full bg-sky-300/25 blur-3xl"
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.25, 0.35, 0.25],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-indigo-500/8 blur-3xl" />
            
            {/* Ghost watermark logo */}
            <div className="absolute top-1/2 left-[55%] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <Image
                src="/Favikon.svg"
                alt=""
                width={1000}
                height={1000}
                className="w-[1000px] h-[1000px] opacity-[0.04] blur-[1.5px] select-none"
                priority
                aria-hidden="true"
              />
            </div>
            
            {/* Subtle diagonal grid pattern */}
            <div className="absolute inset-0 opacity-[0.08]">
              <svg
                className="h-full w-full"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern
                    id="grid-pattern"
                    x="0"
                    y="0"
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 40 0 L 0 0 0 40"
                      fill="none"
                      stroke="currentColor"
                      className="text-indigo-600"
                      strokeWidth="1"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-pattern)" />
              </svg>
            </div>
          </div>

          <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12 md:py-16 lg:flex-row lg:items-center lg:gap-16">
            <motion.div
              className="flex-1 space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.span
                className="inline-flex items-center gap-2 rounded-full border border-blue-200/50 bg-white/70 px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-blue-700 shadow-sm backdrop-blur-md"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                {t.badge}
              </motion.span>
              <motion.h1
                className="text-balance bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-4xl font-semibold leading-tight tracking-tight text-transparent sm:text-5xl md:text-6xl lg:text-7xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                {t.heroTitle}
              </motion.h1>
              <motion.p
                className="max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                {t.heroSubtitle}
              </motion.p>
              
              {/* CTA Buttons */}
              <motion.div
                className="flex flex-col gap-4 sm:flex-row"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-10 py-7 text-base font-semibold text-white transition-all duration-300 hover:scale-[1.02] sm:w-auto"
                    style={{
                      boxShadow: "0 10px 40px rgba(99, 102, 241, 0.25), 0 0 0 1px rgba(99, 102, 241, 0.05), 0 0 60px rgba(99, 102, 241, 0.06)",
                    }}
                  >
                    <span className="relative z-10">{t.ctaPrimary}</span>
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="group w-full rounded-xl border-2 border-slate-200 bg-white px-8 py-6 text-base font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-md sm:w-auto"
                  type="button"
                >
                  {t.ctaSecondary}
                </Button>
              </motion.div>
              <motion.p
                className="text-xs text-slate-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.4 }}
              >
                  {locale === "nb"
                    ? "Ingen kredittkort nødvendig."
                    : locale === "ar"
                      ? "لا حاجة لبطاقة ائتمان."
                      : locale === "so"
                        ? "Kaararka deynta looma baahna."
                        : locale === "ti"
                          ? "ክሬዲት ካርታ ኣይድልየን።"
                          : locale === "am"
                            ? "የክሬዲት ካርድ መረጃ አያስፈልግም።"
                            : locale === "tr"
                              ? "Kredi kartı gerekmez."
                              : locale === "pl"
                                ? "Karta kredytowa nie jest wymagana."
                                : locale === "vi"
                                  ? "Không cần thẻ tín dụng."
                                  : locale === "zh"
                                    ? "无需信用卡。"
                        : locale === "tl"
                          ? "Hindi kailangan ng credit card."
                          : locale === "fa" || locale === "dar" || locale === "ur"
                            ? "نیازی به کارت اعتباری نیست."
                            : "No credit card required."}
              </motion.p>
            </motion.div>

            {/* Floating UI Cards */}
            <motion.div
              className="relative flex-1 lg:min-h-[500px] flex items-start justify-center pt-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {/* Card 1: Booking Example */}
              <motion.div
                className="group relative z-10 mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-[0_6px_20px_rgba(0,0,0,0.04)] backdrop-blur-md sm:p-6"
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="relative">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-xs font-medium text-slate-600">
                        {t.newBooking}
                      </span>
                    </div>
                    <Calendar className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">
                          {t.exampleCustomerName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {t.exampleService}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Clock className="h-3.5 w-3.5 text-indigo-600" />
                      <span>
                        {t.exampleDate}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Card 2: Calendar View */}
              <motion.div
                className="absolute top-56 right-0 z-0 w-full max-w-xs overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-[0_6px_20px_rgba(0,0,0,0.04)] backdrop-blur-md sm:p-5"
                animate={{
                  y: [0, 6, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              >
                <div className="relative">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">
                      {t.today}
                    </h3>
                    <span className="text-xs text-slate-500">
                      {t.bookingsCount}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 rounded-lg bg-indigo-50/50 px-2 py-1.5"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                        <span className="text-xs text-slate-700">
                          {`${9 + i * 2}:00 - ${t.cutService}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Stats / hvorfor TeqBook */}
        <section className="relative border-b border-blue-200/30 bg-white/40 backdrop-blur-sm">
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
            <Section>
              <StatsGrid>
                {t.stats.map((s: { title: string; body: string }, index: number) => {
                  const icons = [Scissors, CreditCard, TrendingUp];
                  const Icon = icons[index] || Scissors;
                  
                  return (
                    <motion.div
                      key={s.title}
                      className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-md transition-all duration-300 hover:shadow-lg sm:p-8"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      style={{
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                      }}
                    >
                      {/* Gradient border */}
                      <div 
                        className="absolute inset-0 rounded-xl"
                        style={{
                          padding: "1px",
                          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.1))",
                          WebkitMask: "linear-gradient(white 0 0) content-box, linear-gradient(white 0 0)",
                          WebkitMaskComposite: "xor",
                          maskComposite: "exclude",
                        }}
                      />
                      <div className="relative">
                        <div className="mb-4 flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 text-indigo-600">
                            <Icon className="h-5 w-5" />
                          </div>
                          <h3 className="text-sm font-semibold text-slate-900 sm:text-base">
                            {s.title}
                          </h3>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-600">
                          {s.body}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </StatsGrid>
            </Section>
          </div>
        </section>

        {/* Pricing */}
        <section className="relative border-b border-blue-200/30 bg-gradient-to-b from-white/60 via-blue-50/20 to-blue-50/20 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
                {t.pricingTitle}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
                {t.pricingSubtitle}
              </p>
              <p className="mt-6 text-center text-sm font-semibold uppercase tracking-wide text-blue-600">
                {t.affordableSimple}
              </p>
            </motion.div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {pricingPlans.map((plan, index) => {
                const isHighlighted = (plan as any).highlighted;

                return (
                  <motion.div
                    key={plan.id}
                    className={`group relative flex flex-col overflow-hidden rounded-3xl border-2 p-6 shadow-lg transition-all duration-300 sm:p-8 ${
                      isHighlighted
                        ? "border-blue-500 bg-gradient-to-br from-white via-blue-50/50 to-blue-50/50 shadow-2xl shadow-blue-500/20 ring-2 ring-blue-500/20"
                        : "border-blue-200/50 bg-white/80 backdrop-blur-sm hover:border-blue-300 hover:shadow-xl"
                    }`}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                  >
                    {isHighlighted && (
                      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-blue-400/30 to-blue-500/30 blur-2xl" />
                    )}
                    <div className="relative">
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/90 shadow-lg shadow-blue-500/20">
                            <Image
                              src="/Favikon.svg"
                              alt="TeqBook"
                              width={24}
                              height={24}
                              className="h-6 w-6"
                            />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">
                              {plan.name}
                            </h3>
                          </div>
                        </div>
                        {plan.badge && (
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              isHighlighted
                                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {plan.badge}
                          </span>
                        )}
                      </div>
                      <p className="mb-4 text-sm text-slate-600">
                        {plan.description}
                      </p>
                      <div className="mb-6">
                        <span className="text-3xl font-bold text-slate-900">
                          {plan.price.split(" /")[0]}
                        </span>
                        <span className="text-sm text-slate-500">
                          {" /" + plan.price.split(" /")[1]}
                        </span>
                      </div>
                      <ul className="mb-6 flex-1 space-y-3 text-sm">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-start gap-3">
                            <Check
                              className={`mt-0.5 h-5 w-5 shrink-0 ${
                                isHighlighted
                                  ? "text-blue-600"
                                  : "text-blue-500"
                              }`}
                            />
                            <span className="text-slate-700">{f}</span>
                          </li>
                        ))}
                      </ul>
                      <Link href="/signup" className="w-full">
                        <Button
                          className={`w-full ${
                            isHighlighted
                              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40"
                              : "bg-slate-900 text-white hover:bg-slate-800"
                          }`}
                          size="lg"
                        >
                          {t.startFreeTrial}
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              className="mt-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900">
                  {t.addOnsTitle}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {t.addOnsDescription}
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    icon: Globe,
                    title: t.multilingualBookingTitle,
                    desc: t.multilingualBookingDescription,
                    isMultilingual: true,
                  },
                  {
                    icon: UserPlus,
                    title: t.extraStaffTitle,
                    desc: t.extraStaffDescription,
                    isMultilingual: false,
                    staffAvatars: [
                      { icon: Scissors, label: "Barber" },
                      { icon: Waves, label: "Massage therapist" },
                      { icon: Hand, label: "Nail technician" },
                      { icon: Paintbrush, label: "Makeup artist" },
                    ],
                  },
                ].map((addon, idx) => {
                  const Icon = addon.icon;
                  
                  return (
                    <motion.div
                      key={idx}
                      className="group relative flex flex-col overflow-hidden rounded-xl bg-gradient-to-br from-white via-indigo-50/30 to-blue-50/20 p-6 shadow-md transition-all duration-300 hover:shadow-lg sm:p-8 min-h-[160px]"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1, duration: 0.5 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      style={{
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                      }}
                    >
                      {/* Gradient border */}
                      <div 
                        className="absolute inset-0 rounded-xl"
                        style={{
                          padding: "1px",
                          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.1))",
                          WebkitMask: "linear-gradient(white 0 0) content-box, linear-gradient(white 0 0)",
                          WebkitMaskComposite: "xor",
                          maskComposite: "exclude",
                        }}
                      />
                      <div className="relative flex flex-col flex-1">
                        <div className="mb-4 flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 text-indigo-600">
                            <Icon className="h-5 w-5" />
                          </div>
                          <h4 className="text-sm font-semibold text-slate-900 sm:text-base">
                            {addon.title}
                          </h4>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-600 mb-4">
                          {addon.desc}
                        </p>
                        <div className="mt-auto">
                          {addon.isMultilingual && (
                            <div className="h-12 relative overflow-hidden w-full">
                              <LogoLoop
                                logos={languageLogos}
                                speed={40}
                                direction="left"
                                logoHeight={24}
                                gap={24}
                                fadeOut
                                fadeOutColor="rgba(255, 255, 255, 0.9)"
                                className="h-full w-full"
                              />
                            </div>
                          )}
                          {addon.staffAvatars && (
                            <div className="flex items-center justify-center gap-3 pt-2">
                              {addon.staffAvatars.map((staff, staffIdx) => {
                                const StaffIcon = staff.icon;
                                return (
                                  <div
                                    key={staffIdx}
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 via-indigo-50/80 to-blue-100 text-indigo-600 transition-transform hover:scale-110"
                                    title={staff.label}
                                  >
                                    <StaffIcon className="h-5 w-5" />
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>

        {/* FAQ */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white/60 to-slate-50/40 backdrop-blur-sm">
          <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {t.faqTitle}
              </h2>
            </motion.div>
            <div className="mt-12 space-y-6">
              {t.faq.map((item: { q: string; a: string }, index) => (
              <motion.div
                key={item.q}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm transition-all hover:border-slate-300 hover:shadow-md sm:p-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                whileHover={{ scale: 1.01 }}
              >
                  <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">
                    {item.q}
                  </h3>
                  <p className="mt-5 text-base leading-relaxed text-slate-600">
                    {item.a}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-blue-200/50 bg-white/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6 sm:text-base">
          <span>© {new Date().getFullYear()} TeqBook.</span>
          <span>
            {locale === "nb"
              ? "Hjelper salonger med å holde seg organisert, selvsikre og fullt booket — globalt."
              : locale === "ar"
                ? "مساعدة الصالونات على البقاء منظمة وواثقة ومحجوزة بالكامل — عالميًا."
                : locale === "so"
                  ? "Waxaan ka caawinaynaa saloonnada inay sii wadaan oo ay u noqdaan mid habaysan, kalsooni leh oo buuxa — adduunka oo dhan."
                  : locale === "ti"
                    ? "ንሳሎናት ንኽሳለሉ፣ ንኽርእዩ ከምኡውን ንኽምሉኡ ዝሕግዙ — ኣብ ምሉእ ዓለም።"
                    : locale === "am"
                      ? "ሳሎኖች የተደራጁ፣ በራስ የሚታመኑ እና ሙሉ በሙሉ የተዘጋጁ እንዲሆኑ ማገዝ — በዓለም አቀፍ ደረጃ።"
                      : locale === "tr"
                        ? "Salonların organize, kendinden emin ve tamamen rezerve kalmasına yardımcı oluyoruz — küresel olarak."
                        : locale === "pl"
                          ? "Pomagamy salonom pozostać zorganizowanym, pewnym siebie i w pełni zarezerwowanym — globalnie."
                          : locale === "vi"
                            ? "Giúp các salon luôn có tổ chức, tự tin và được đặt đầy đủ — trên toàn cầu."
                            : locale === "zh"
                              ? "帮助沙龙保持有序、自信和完全预订 — 全球。"
                              : locale === "tl"
                        ? "Tumutulong sa mga salon na manatiling organisado, kumpiyansa at ganap na naka-book — sa buong mundo."
                        : locale === "fa" || locale === "dar" || locale === "ur"
                          ? "کمک به سالن‌ها برای منظم، مطمئن و کاملاً رزرو شده ماندن — در سطح جهانی."
                          : "Helping salons stay organized, confident and fully booked — globally."}
          </span>
        </div>
      </footer>
    </div>
  );
}


