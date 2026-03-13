import type { LandingCopyEntry } from "../types";

export const tiAmCopy: { ti: LandingCopyEntry; am: LandingCopyEntry } = {
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
      "ንኹሉ ዓቐን ዘለዎም ሳሎናት ዝተሰርሐ — ብቐሊሉ ጀምር፣ ኣብ ዝደለኻዮ ግዜ ድማ ኣፕግሬድ ግበር።",
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
    addOnsDescription:
      "ናይ TeqBook ምድላይ ንሳሎንኩም ዝሰማማዕ ስርዓት ስርዑ። ንዓለምለኻዊ ሳሎን ወንጌላውያን ንኽጅምሩ ቀሊልን ብድሕነት ንኽዓብዩን ዝደሊ ዝተሓሰበ።",
    multilingualBookingTitle: "ብዙ ቋንቋ ቦኪንግ ገጽ",
    multilingualBookingDescription:
      "$10 / month — ክሊዕንት ብ Soomaali, Tigrinya, Urdu, Vietnamese, Arabic, Turkish ከምኡውን ካልኦት ቋንቋታት ንኽቦክኑ ፍቓድ ሃቦም።",
    extraStaffTitle: "ተወሳኺ ሰራዊት",
    extraStaffDescription:
      "$5 / month ንነፍሲ ወከፍ ተወሳኺ ሰራዊት — ንክሓብት ብዓቢ ዋጋ ዘይምልዓል ንክሓብት ንኽሓብት።",
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
    heroTitle: "የሳሎን ቀጠሮ – ለበሳሎን ውስጥ ክፍያ የተቀየረ",
    heroSubtitle:
      "TeqBook ለሰሜን አውሮፓ ሳሎኖች ቀላል እና ዘመናዊ የቀጠሮ ስርዓት ነው። ደንበኞች ቀጠሮን በመስመር ላይ ይያዙ፣ ክፍያውን ግን ሁልጊዜ በሳሎኑ ውስጥ ይከፍላሉ።",
    ctaPrimary: "በነጻ ጀምር",
    ctaSecondary: "የዴሞ መግለጫ ይጠይቁ",
    badge: "ለሳሎኖች የተሠራ",
    pricingTitle: "የ TeqBook ፓኬጅ ይምረጡ ለሳሎንህ",
    pricingSubtitle:
      "ለሁሉም መጠን ያሉ ሳሎኖች የተሰራ — በቀላሉ ጀምር እና በማንኛውም ጊዜ አፕግሬድ አድርግ።",
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
    addOnsDescription:
      "ለሳሎንዎ የሚስማማውን TeqBook ማዋቀር ይገንቡ። ቀላል ለመጀመር እና በደህንነት ለመድብር ለሚፈልጉ ዓለም አቀፍ ሳሎን ባለቤቶች ተስማሚ።",
    multilingualBookingTitle: "በብዙ ቋንቋዎች የመዘዝ ገጽ",
    multilingualBookingDescription:
      "$10 / month — ደንበኞች በ Soomaali, Tigrinya, Urdu, Vietnamese, Arabic, Turkish እና ሌሎች ቋንቋዎች እንዲዘዙ ያድርጉ።",
    extraStaffTitle: "ተጨማሪ ሰራዊት",
    extraStaffDescription:
      "$5 / month ለእያንዳንዱ ተጨማሪ ሰራዊት — በዋጋ ትልቅ ዝለው ሳይሆን ቡድንዎን ያሳድጉ።",
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
};
