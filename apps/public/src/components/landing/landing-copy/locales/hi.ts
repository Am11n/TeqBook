import type { LandingCopyEntry } from "../types";

export const hiCopy: { hi: LandingCopyEntry } = {
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
      "हर आकार के सैलून के लिए बनाया गया है — सरल शुरुआत करें, फिर कभी भी अपग्रेड करें।",
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
          "पूरी ग्राहक बुकिंग हिस्ट्री",
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
    addOnsDescription:
      "अपने सैलून के अनुरूप TeqBook सेटअप बनाएं। अंतर्राष्ट्रीय सैलून मालिकों के लिए आदर्श जो सरल शुरुआत करना चाहते हैं और सुरक्षित रूप से बढ़ना चाहते हैं।",
    multilingualBookingTitle: "बहुभाषी बुकिंग पेज",
    multilingualBookingDescription:
      "$10 / month — ग्राहकों को Somali, Tigrinya, Urdu, Vietnamese, Arabic, Turkish और अधिक भाषाओं में बुकिंग करने दें।",
    extraStaffTitle: "अतिरिक्त स्टाफ सदस्य",
    extraStaffDescription:
      "$5 / month प्रत्येक अतिरिक्त स्टाफ के लिए — मूल्य में बड़ी वृद्धि के बिना अपनी टीम को बढ़ाएं।",
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
};
