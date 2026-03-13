import type { LandingCopyEntry } from "../types";

export const arSoCopy: { ar: LandingCopyEntry; so: LandingCopyEntry } = {
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
      "مصمم لصالونات بجميع الأحجام — ابدأ ببساطة ثم قم بالترقية في أي وقت.",
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
    addOnsDescription:
      "قم ببناء إعداد TeqBook الذي يناسب صالونك. مثالي لأصحاب الصالونات الدولية الذين يريدون البدء ببساطة والنمو بأمان.",
    multilingualBookingTitle: "صفحة حجز متعددة اللغات",
    multilingualBookingDescription:
      "$10 / month — دع العملاء يحجزون بالصومالية والتغرينية والأردية والفيتنامية والعربية والتركية والمزيد.",
    extraStaffTitle: "عضو فريق إضافي",
    extraStaffDescription:
      "$5 / month لكل موظف إضافي — قم بتوسيع فريقك دون قفزات كبيرة في الأسعار.",
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
      "Waxaa loo dhisay saloonnada cabbir kasta leh — si fudud ku bilow, kadibna kor u qaad mar kasta.",
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
    addOnsDescription:
      "Dhis qaabka TeqBook ee u habboon saloonkaaga. Wanaagsan milkiilayaasha saloonnada caalamiga ah ee doonaya inay si fudud u bilowaan oo si amaan ah u koraan.",
    multilingualBookingTitle: "Bogga ballansashada luuqadaha badan",
    multilingualBookingDescription:
      "$10 / month — U ogolow macaamiisha inay ballanshaadaan Soomaali, Tigrinya, Urdu, Vietnamese, Arabic, Turkish iyo kuwo kale.",
    extraStaffTitle: "Shaqaale dheeraad ah",
    extraStaffDescription:
      "$5 / month shaqaale kasta oo dheeraad ah — Kor u qaad kooxdaada iyadoon qiimo weyn u kordhin.",
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
};
