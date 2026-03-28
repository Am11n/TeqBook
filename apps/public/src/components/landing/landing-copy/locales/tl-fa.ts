import type { LandingCopyEntry } from "../types";

export const tlFaCopy: { tl: LandingCopyEntry; fa: LandingCopyEntry } = {
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
      "Ginawa para sa mga salon ng lahat ng laki — magsimula nang simple, tapos mag-upgrade anumang oras.",
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
          "Buong booking history ng customer",
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
    affordableSimple:
      "Abot-kaya. Simple. Ginawa para sa international na salon.",
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
    addOnsDescription:
      "Bumuo ng TeqBook setup na akma sa iyong salon. Perpekto para sa international na salon owners na gustong magsimula nang simple at lumaki nang ligtas.",
    multilingualBookingTitle: "Multi-language booking page",
    multilingualBookingDescription:
      "$10 / month — Hayaan ang mga client na mag-book sa Somali, Tigrinya, Urdu, Vietnamese, Arabic, Turkish at iba pa.",
    extraStaffTitle: "Extra staff member",
    extraStaffDescription:
      "$5 / month bawat karagdagang staff — Palakihin ang iyong team nang walang malaking pagtaas sa presyo.",
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
      "برای سالن‌ها در هر اندازه ساخته شده است — ساده شروع کنید و هر زمان خواستید ارتقا دهید.",
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
          "تاریخچه کامل رزرو مشتری",
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
    affordableSimple:
      "مقرون به صرفه. ساده. ساخته شده برای سالن‌های بین‌المللی.",
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
    addOnsDescription:
      "پیکربندی TeqBook را بسازید که با سالن شما سازگار باشد. ایده‌آل برای صاحبان سالن‌های بین‌المللی که می‌خواهند ساده شروع کنند و با امنیت رشد کنند.",
    multilingualBookingTitle: "صفحه رزرو چند زبانه",
    multilingualBookingDescription:
      "$10 / month — به مشتریان اجازه دهید به زبان‌های صومالی، تیگرینیا، اردو، ویتنامی، عربی، ترکی و بیشتر رزرو کنند.",
    extraStaffTitle: "عضو تیم اضافی",
    extraStaffDescription:
      "$5 / month برای هر کارمند اضافی — تیم خود را بدون افزایش زیاد قیمت گسترش دهید.",
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
};
