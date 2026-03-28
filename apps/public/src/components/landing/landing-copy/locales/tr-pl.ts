import type { LandingCopyEntry } from "../types";

export const trPlCopy: { tr: LandingCopyEntry; pl: LandingCopyEntry } = {
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
      "Her ölçekteki salonlar için tasarlandı — sade başlayın, istediğiniz zaman yükseltin.",
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
          "Rezervasyon sayfasında salon ve müşteri arasında WhatsApp iletisimi",
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
          "Tam müşteri rezervasyon geçmişi",
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
    addOnsDescription:
      "Salonunuza uygun TeqBook kurulumunu oluşturun. Basit başlamak ve güvenle büyümek isteyen uluslararası salon sahipleri için ideal.",
    multilingualBookingTitle: "Çok dilli rezervasyon sayfası",
    multilingualBookingDescription:
      "$10 / month — Müşterilerin Somali, Tigrinya, Urdu, Vietnamca, Arapça, Türkçe ve daha fazlasıyla rezervasyon yapmasına izin verin.",
    extraStaffTitle: "Ekstra personel",
    extraStaffDescription:
      "$5 / month per ekstra personel — Fiyatlarda büyük artışlar olmadan ekibinizi ölçeklendirin.",
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
      "Stworzone dla salonów każdej wielkości — zacznij prosto i ulepsz plan w dowolnym momencie.",
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
          "Komunikacja WhatsApp miedzy salonem a klientem na stronie rezerwacji",
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
          "Pełna historia rezerwacji klienta",
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
    affordableSimple:
      "Przystępne. Proste. Zbudowane dla międzynarodowych salonów.",
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
    addOnsDescription:
      "Zbuduj konfigurację TeqBook, która pasuje do Twojego salonu. Idealne dla międzynarodowych właścicieli salonów, którzy chcą zacząć prosto i bezpiecznie rosnąć.",
    multilingualBookingTitle: "Wielojęzyczna strona rezerwacji",
    multilingualBookingDescription:
      "$10 / month — Pozwól klientom rezerwować w języku somalijskim, tigrinia, urdu, wietnamskim, arabskim, tureckim i innych.",
    extraStaffTitle: "Dodatkowy personel",
    extraStaffDescription:
      "$5 / month za każdego dodatkowego pracownika — Skaluj swój zespół bez dużych skoków w cenach.",
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
};
