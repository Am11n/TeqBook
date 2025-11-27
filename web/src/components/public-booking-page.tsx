"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { useLocale } from "@/components/locale-provider";

type PublicBookingPageProps = {
  slug: string;
};

type Salon = {
  id: string;
  name: string;
};

type Service = {
  id: string;
  name: string;
};

type Employee = {
  id: string;
  full_name: string;
};

type Slot = {
  start: string;
  end: string;
  label: string;
};

export default function PublicBookingPage({ slug }: PublicBookingPageProps) {
  const { locale, setLocale } = useLocale();

  const tNb = {
    notFound: "Fant ikke denne salongen eller den er ikke offentlig.",
    loadError: "Kunne ikke laste tjenester/ansatte.",
    loadingSalon: "Laster salong…",
    headerSubtitle: "Book time – betal fysisk i salong.",
    payInSalonBadge: "Betal i salong",
    step1Title: "1. Velg behandling",
    step1Description:
      "Start med å velge tjeneste, deretter ansatt og tidspunkt.",
    serviceLabel: "Tjeneste",
    servicePlaceholder: "Velg tjeneste…",
    employeeLabel: "Ansatt",
    employeePlaceholder: "Velg ansatt…",
    dateLabel: "Dato",
    loadSlots: "Hent ledige tider",
    loadingSlots: "Laster ledige tider…",
    step2Label: "2. Velg tidspunkt",
    noSlotsYet: "Hent først ledige tider",
    selectSlotPlaceholder: "Velg et tidspunkt…",
    step3Title: "3. Dine detaljer",
    step3Description:
      "Vi bruker dette til å bekrefte bookingen og eventuelt sende en påminnelse. Betaling skjer alltid i salong.",
    nameLabel: "Navn",
    emailLabel: "E-post (valgfri)",
    emailPlaceholder: "deg@eksempel.no",
    phoneLabel: "Telefon (valgfri)",
    phonePlaceholder: "+47 99 99 99 99",
    submitSaving: "Sender forespørsel…",
    submitLabel: "Bekreft forespørsel",
    payInfo:
      "Du betaler alltid fysisk i salong. Ingen kortbetaling på nett.",
    successMessage:
      "Bookingen er registrert! Du får bekreftelse fra salongen, og betaling skjer i salong.",
    createError: "Noe gikk galt ved opprettelse av booking.",
    unavailableTitle: "Kan ikke vise bookingside",
    unavailableDescription:
      "Denne salongen finnes ikke, eller er ikke satt som offentlig.",
  } as const;

  const tEn = {
    notFound: "Could not find this salon or it is not marked as public.",
    loadError: "Could not load services/employees.",
    loadingSalon: "Loading salon…",
    headerSubtitle: "Book an appointment – pay physically in the salon.",
    payInSalonBadge: "Pay in salon",
    step1Title: "1. Choose treatment",
    step1Description:
      "Start by choosing a service, then employee and time.",
    serviceLabel: "Service",
    servicePlaceholder: "Select service…",
    employeeLabel: "Employee",
    employeePlaceholder: "Select employee…",
    dateLabel: "Date",
    loadSlots: "Load available times",
    loadingSlots: "Loading available times…",
    step2Label: "2. Choose time",
    noSlotsYet: "Load available times first",
    selectSlotPlaceholder: "Select a time…",
    step3Title: "3. Your details",
    step3Description:
      "We use this to confirm your booking and optionally send a reminder. Payment always happens in the salon.",
    nameLabel: "Name",
    emailLabel: "Email (optional)",
    emailPlaceholder: "you@example.com",
    phoneLabel: "Phone (optional)",
    phonePlaceholder: "+47 99 99 99 99",
    submitSaving: "Sending request…",
    submitLabel: "Confirm request",
    payInfo:
      "You always pay physically in the salon. No online card payments.",
    successMessage:
      "Your booking has been registered! The salon will confirm, and payment happens in the salon.",
    createError: "Something went wrong while creating the booking.",
    unavailableTitle: "Cannot show booking page",
    unavailableDescription:
      "This salon does not exist or is not marked as public.",
  } as const;

  // Enkle maskin-oversettelser for nye språk (kan finpusses senere)
  const tAr = {
    ...tEn,
    headerSubtitle: "احجز موعدًا – الدفع يكون في الصالون.",
    payInSalonBadge: "ادفع في الصالون",
    step1Title: "١. اختر الخدمة",
    step1Description:
      "ابدأ باختيار الخدمة، ثم الموظف والوقت.",
    serviceLabel: "الخدمة",
    servicePlaceholder: "اختر خدمة…",
    employeeLabel: "الموظف",
    employeePlaceholder: "اختر موظفًا…",
    dateLabel: "التاريخ",
    step2Label: "٢. اختر الوقت",
    noSlotsYet: "قم بتحميل الأوقات المتاحة أولاً",
    selectSlotPlaceholder: "اختر وقتًا…",
    step3Title: "٣. بياناتك",
    step3Description:
      "نستخدم هذه البيانات لتأكيد الحجز وربما إرسال تذكير. الدفع يتم دائمًا في الصالون.",
    nameLabel: "الاسم",
    emailLabel: "البريد الإلكتروني (اختياري)",
    phoneLabel: "رقم الهاتف (اختياري)",
    submitSaving: "...جاري إرسال الطلب",
    submitLabel: "تأكيد الطلب",
    payInfo: "الدفع دائمًا يكون في الصالون. لا يوجد دفع بالبطاقة عبر الإنترنت.",
  } as const;

  const tSo = {
    ...tEn,
    headerSubtitle: "Samee ballan – lacag bixintu waxay ka dhacdaa salonka.",
    payInSalonBadge: "Ku bixi salonka",
    step1Title: "1. Dooro adeegga",
    step1Description:
      "Ku bilow doorashada adeegga, ka dibna shaqaalaha iyo waqtiga.",
    serviceLabel: "Adeeg",
    servicePlaceholder: "Dooro adeeg…",
    employeeLabel: "Shaqaale",
    employeePlaceholder: "Dooro shaqaale…",
    dateLabel: "Taariikh",
    step2Label: "2. Dooro waqtiga",
    noSlotsYet: "Marka hore soo qaado waqtiyada bannaan",
    selectSlotPlaceholder: "Dooro waqti…",
    step3Title: "3. Xogtaada",
    step3Description:
      "Waxaan u isticmaalnaa xogtan in aan ku xaqiijino ballanta oo aan kuu dirno xusuusin haddii loo baahdo. Lacag bixintu had iyo jeer waxay ka dhacdaa salonka.",
    nameLabel: "Magac",
    emailLabel: "Email (ikhtiyaari)",
    phoneLabel: "Telefon (ikhtiyaari)",
    submitSaving: "Codsiga ayaa la dirayaa…",
    submitLabel: "Xaqiiji codsiga",
    payInfo:
      "Had iyo jeer waxaad lacagta ku bixisaa salonka. Ma jiro lacag bixin khadka tooska ah.",
  } as const;

  const tTi = {
    ...tEn,
    headerSubtitle: "ናይ ቆርበት ግዜ ኣርእዩ – ክፍሊት ብቀጥታ ኣብ ሳሎን እዩ።",
    payInSalonBadge: "ኣብ ሳሎን ክፍሊት",
    step1Title: "1. ኣገልግሎት ምረፅ",
    step1Description:
      "ኣብ መጀመርታ ኣገልግሎት ምረፅ፣ ንድሕሪኡ ሰራሕተኛን ግዜን ምረፅ።",
    serviceLabel: "ኣገልግሎት",
    servicePlaceholder: "ኣገልግሎት ምረፅ…",
    employeeLabel: "ሰራሕተኛ",
    employeePlaceholder: "ሰራሕተኛ ምረፅ…",
    dateLabel: "ዕለት",
    step2Label: "2. ግዜ ምረፅ",
    noSlotsYet: "ቀዳማይ ናይ ባዕሉ ግዜታት ኣርእይ",
    selectSlotPlaceholder: "ግዜ ምረፅ…",
    step3Title: "3. ዝርዝር መረጃኻ",
    step3Description:
      "እዚ መረጃ ንማረጋገጺ ቆርበትኻን ንመኽሪ መልእኽቲ (እንተደሊኻ) ንምልኣኽ ንጥቀም። ክፍሊት ክሳብ መወዳእታ ኣብ ሳሎን ይከኣል።",
    nameLabel: "ስም",
    emailLabel: "ኢመይል (እንታይም ዘይግድእ)",
    phoneLabel: "ተሌፎን (እንታይም ዘይግድእ)",
    submitSaving: "መልእኽቲ ይልከ…",
    submitLabel: "መራገጺ ቆርበት",
    payInfo:
      "ክፍሊት ብቀጥታ ኣብ ሳሎን እዩ። ናይ መራኸቢ ክፍሊት ኣሎኒ ኣይኮነን።",
  } as const;

  const tAm = {
    ...tEn,
    headerSubtitle: "መቀመጫ ያስመዝግቡ – ክፍያው በሳሎኑ ውስጥ ይደረጋል።",
    payInSalonBadge: "በሳሎኑ ይክፈሉ",
    step1Title: "1. አገልግሎት ይምረጡ",
    step1Description:
      "መጀመሪያ አገልግሎት ይምረጡ፣ ከዛ ሰራተኛ እና ጊዜ ይምረጡ።",
    serviceLabel: "አገልግሎት",
    servicePlaceholder: "አገልግሎት ይምረጡ…",
    employeeLabel: "ሰራተኛ",
    employeePlaceholder: "ሰራተኛ ይምረጡ…",
    dateLabel: "ቀን",
    step2Label: "2. ጊዜ ይምረጡ",
    noSlotsYet: "መጀመሪያ ነፃ ጊዜዎችን ያመጡ",
    selectSlotPlaceholder: "ጊዜ ይምረጡ…",
    step3Title: "3. የእርስዎ ዝርዝር",
    step3Description:
      "ይህን መረጃ ለመቆራኘት እና ማስታወሻ ለመላክ (ካለ ፈቃድ) እንጠቀማለን። ክፍያ ሁልጊዜ በሳሎኑ ውስጥ ይደረጋል።",
    nameLabel: "ስም",
    emailLabel: "ኢሜይል (እንደፈለጉ)",
    phoneLabel: "ስልክ (እንደፈለጉ)",
    submitSaving: "ጥያቄ በመላክ ላይ…",
    submitLabel: "ጥያቄውን ያረጋግጡ",
    payInfo:
      "ክፍያ ሁልጊዜ በቀጥታ በሳሎኑ ውስጥ ነው። በመስመር ላይ ክፍያ የለም።",
  } as const;

  const tTr = {
    ...tEn,
    headerSubtitle: "Randevu oluşturun – ödemenizi salonda yapın.",
    payInSalonBadge: "Salonda öde",
    step1Title: "1. Hizmet seçin",
    step1Description:
      "Önce hizmeti, ardından personeli ve saati seçin.",
    serviceLabel: "Hizmet",
    servicePlaceholder: "Hizmet seçin…",
    employeeLabel: "Personel",
    employeePlaceholder: "Personel seçin…",
    dateLabel: "Tarih",
    step2Label: "2. Saat seçin",
    noSlotsYet: "Önce uygun saatleri getirin",
    selectSlotPlaceholder: "Bir saat seçin…",
    step3Title: "3. Bilgileriniz",
    step3Description:
      "Bu bilgileri randevunuzu onaylamak ve gerekirse hatırlatma göndermek için kullanıyoruz. Ödeme her zaman salonda yapılır.",
    nameLabel: "Ad Soyad",
    emailLabel: "E-posta (isteğe bağlı)",
    phoneLabel: "Telefon (isteğe bağlı)",
    submitSaving: "İstek gönderiliyor…",
    submitLabel: "İsteği onayla",
    payInfo:
      "Ödemeyi her zaman salonda yaparsınız. Çevrimiçi kartla ödeme yoktur.",
  } as const;

  const tPl = {
    ...tEn,
    headerSubtitle: "Umów wizytę – zapłać bezpośrednio w salonie.",
    payInSalonBadge: "Płać w salonie",
    step1Title: "1. Wybierz usługę",
    step1Description:
      "Najpierw wybierz usługę, potem pracownika i godzinę.",
    serviceLabel: "Usługa",
    servicePlaceholder: "Wybierz usługę…",
    employeeLabel: "Pracownik",
    employeePlaceholder: "Wybierz pracownika…",
    dateLabel: "Data",
    step2Label: "2. Wybierz godzinę",
    noSlotsYet: "Najpierw pobierz dostępne godziny",
    selectSlotPlaceholder: "Wybierz godzinę…",
    step3Title: "3. Twoje dane",
    step3Description:
      "Używamy tych danych, aby potwierdzić wizytę i ewentualnie wysłać przypomnienie. Płatność zawsze odbywa się w salonie.",
    nameLabel: "Imię i nazwisko",
    emailLabel: "E-mail (opcjonalnie)",
    phoneLabel: "Telefon (opcjonalnie)",
    submitSaving: "Wysyłanie prośby…",
    submitLabel: "Potwierdź prośbę",
    payInfo:
      "Zawsze płacisz bezpośrednio w salonie. Brak płatności kartą online.",
  } as const;

  const tVi = {
    ...tEn,
    headerSubtitle: "Đặt lịch hẹn – thanh toán trực tiếp tại salon.",
    payInSalonBadge: "Thanh toán tại salon",
    step1Title: "1. Chọn dịch vụ",
    step1Description:
      "Bắt đầu bằng cách chọn dịch vụ, sau đó chọn nhân viên và thời gian.",
    serviceLabel: "Dịch vụ",
    servicePlaceholder: "Chọn dịch vụ…",
    employeeLabel: "Nhân viên",
    employeePlaceholder: "Chọn nhân viên…",
    dateLabel: "Ngày",
    step2Label: "2. Chọn thời gian",
    noSlotsYet: "Hãy tải thời gian trống trước",
    selectSlotPlaceholder: "Chọn thời gian…",
    step3Title: "3. Thông tin của bạn",
    step3Description:
      "Chúng tôi dùng thông tin này để xác nhận lịch hẹn và có thể gửi nhắc nhở. Thanh toán luôn được thực hiện tại salon.",
    nameLabel: "Họ và tên",
    emailLabel: "Email (tuỳ chọn)",
    phoneLabel: "Số điện thoại (tuỳ chọn)",
    submitSaving: "Đang gửi yêu cầu…",
    submitLabel: "Xác nhận yêu cầu",
    payInfo:
      "Bạn luôn thanh toán trực tiếp tại salon. Không có thanh toán thẻ trực tuyến.",
  } as const;

  const tTl = {
    ...tEn,
    headerSubtitle: "Mag-book ng schedule – bayad sa salon mismo.",
    payInSalonBadge: "Magbayad sa salon",
    step1Title: "1. Piliin ang serbisyo",
    step1Description:
      "Unahin piliin ang serbisyo, pagkatapos ang staff at oras.",
    serviceLabel: "Serbisyo",
    servicePlaceholder: "Pumili ng serbisyo…",
    employeeLabel: "Staff",
    employeePlaceholder: "Pumili ng staff…",
    dateLabel: "Petsa",
    step2Label: "2. Piliin ang oras",
    noSlotsYet: "Kunin muna ang mga available na oras",
    selectSlotPlaceholder: "Pumili ng oras…",
    step3Title: "3. Iyong detalye",
    step3Description:
      "Gagamitin namin ito para kumpirmahin ang booking at kung kailangan, magpadala ng paalala. Laging sa salon ang bayad.",
    nameLabel: "Pangalan",
    emailLabel: "Email (opsyonal)",
    phoneLabel: "Telepono (opsyonal)",
    submitSaving: "Nagpapadala ng request…",
    submitLabel: "Kumpirmahin ang request",
    payInfo:
      "Lagi kang nagbabayad nang personal sa salon. Walang online card payment.",
  } as const;

  const tZh = {
    ...tEn,
    headerSubtitle: "预约服务——到店付款。",
    payInSalonBadge: "到店付款",
    step1Title: "1. 选择服务",
    step1Description: "先选择服务，然后选择员工和时间。",
    serviceLabel: "服务",
    servicePlaceholder: "请选择服务…",
    employeeLabel: "员工",
    employeePlaceholder: "请选择员工…",
    dateLabel: "日期",
    step2Label: "2. 选择时间",
    noSlotsYet: "请先加载可用时间",
    selectSlotPlaceholder: "请选择时间…",
    step3Title: "3. 您的资料",
    step3Description:
      "我们会使用这些信息来确认预约，并在需要时发送提醒。付款始终在店内完成。",
    nameLabel: "姓名",
    emailLabel: "邮箱（可选）",
    phoneLabel: "电话（可选）",
    submitSaving: "正在发送请求…",
    submitLabel: "确认预约请求",
    payInfo: "您始终在店内付款，不支持在线刷卡支付。",
  } as const;

  const tFa = {
    ...tEn,
    headerSubtitle: "نوبت رزرو کنید – پرداخت در خود سالن انجام می‌شود.",
    payInSalonBadge: "پرداخت در سالن",
    step1Title: "1. انتخاب خدمات",
    step1Description:
      "ابتدا خدمات، سپس پرسنل و زمان را انتخاب کنید.",
    serviceLabel: "خدمات",
    servicePlaceholder: "یک خدمت انتخاب کنید…",
    employeeLabel: "پرسنل",
    employeePlaceholder: "یک پرسنل انتخاب کنید…",
    dateLabel: "تاریخ",
    step2Label: "2. انتخاب زمان",
    noSlotsYet: "ابتدا زمان‌های خالی را دریافت کنید",
    selectSlotPlaceholder: "یک زمان انتخاب کنید…",
    step3Title: "3. اطلاعات شما",
    step3Description:
      "ما از این اطلاعات برای تأیید نوبت و در صورت نیاز برای ارسال یادآوری استفاده می‌کنیم. پرداخت همیشه در سالن انجام می‌شود.",
    nameLabel: "نام",
    emailLabel: "ایمیل (اختیاری)",
    phoneLabel: "شماره تلفن (اختیاری)",
    submitSaving: "در حال ارسال درخواست…",
    submitLabel: "تأیید درخواست",
    payInfo:
      "پرداخت همیشه به صورت حضوری در سالن انجام می‌شود. پرداخت آنلاین با کارت وجود ندارد.",
  } as const;

  const tDar = {
    ...tEn,
    headerSubtitle: "وقت خود را رزرو کنید – پرداخت در خود سالن انجام می‌شود.",
    payInSalonBadge: "پرداخت در سالن",
    step1Title: "1. انتخاب خدمت",
    step1Description:
      "اول خدمت، بعد کارمند و زمان را انتخاب کنید.",
    serviceLabel: "خدمت",
    servicePlaceholder: "یک خدمت انتخاب کنید…",
    employeeLabel: "کارمند",
    employeePlaceholder: "یک کارمند انتخاب کنید…",
    dateLabel: "تاریخ",
    step2Label: "2. انتخاب وقت",
    noSlotsYet: "اول وقت‌های خالی را دریافت کنید",
    selectSlotPlaceholder: "یک وقت انتخاب کنید…",
    step3Title: "3. معلومات شما",
    step3Description:
      "از این معلومات برای تأیید وقت و در صورت ضرورت برای ارسال یادآوری استفاده می‌شود. پرداخت همیشه در سالن انجام می‌شود.",
    nameLabel: "نام",
    emailLabel: "ایمیل (اختیاری)",
    phoneLabel: "شماره تلفن (اختیاری)",
    submitSaving: "در حال ارسال درخواست…",
    submitLabel: "درخواست را تأیید کنید",
    payInfo:
      "پرداخت همیشه به صورت حضوری در سالن انجام می‌شود. پرداخت آنلاین وجود ندارد.",
  } as const;

  const tUr = {
    ...tEn,
    headerSubtitle: "اپائنٹمنٹ بُک کریں – ادائیگی سیلون میں کی جائے گی۔",
    payInSalonBadge: "سیلون میں ادائیگی",
    step1Title: "1. سروس منتخب کریں",
    step1Description:
      "پہلے سروس، پھر اسٹاف اور وقت منتخب کریں۔",
    serviceLabel: "سروس",
    servicePlaceholder: "سروس منتخب کریں…",
    employeeLabel: "اسٹاف",
    employeePlaceholder: "اسٹاف منتخب کریں…",
    dateLabel: "تاریخ",
    step2Label: "2. وقت منتخب کریں",
    noSlotsYet: "پہلے دستیاب اوقات حاصل کریں",
    selectSlotPlaceholder: "وقت منتخب کریں…",
    step3Title: "3. آپ کی تفصیلات",
    step3Description:
      "ہم اِن معلومات کو بُکنگ کنفرم کرنے اور ضرورت پڑنے پر یاد دہانی بھیجنے کے لئے استعمال کرتے ہیں۔ ادائیگی ہمیشہ سیلون میں ہوتی ہے۔",
    nameLabel: "نام",
    emailLabel: "ای میل (اختیاری)",
    phoneLabel: "فون نمبر (اختیاری)",
    submitSaving: "درخواست بھیجی جا رہی ہے…",
    submitLabel: "درخواست کی تصدیق کریں",
    payInfo:
      "ادائیگی ہمیشہ سیلون میں براہِ راست کی جاتی ہے۔ آن لائن کارڈ پیمنٹ موجود نہیں ہے۔",
  } as const;

  const tHi = {
    ...tEn,
    headerSubtitle: "अपॉइंटमेंट बुक करें – भुगतान हमेशा सैलून में होगा।",
    payInSalonBadge: "सैलून में भुगतान",
    step1Title: "1. सेवा चुनें",
    step1Description:
      "पहले सेवा चुनें, फिर कर्मचारी और समय चुनें।",
    serviceLabel: "सेवा",
    servicePlaceholder: "सेवा चुनें…",
    employeeLabel: "कर्मचारी",
    employeePlaceholder: "कर्मचारी चुनें…",
    dateLabel: "तारीख",
    step2Label: "2. समय चुनें",
    noSlotsYet: "पहले उपलब्ध समय देखें",
    selectSlotPlaceholder: "समय चुनें…",
    step3Title: "3. आपकी जानकारी",
    step3Description:
      "हम इस जानकारी का उपयोग आपकी बुकिंग की पुष्टि करने और ज़रूरत पड़ने पर रिमाइंडर भेजने के लिए करते हैं। भुगतान हमेशा सैलून में किया जाएगा।",
    nameLabel: "नाम",
    emailLabel: "ईमेल (वैकल्पिक)",
    phoneLabel: "फ़ोन (वैकल्पिक)",
    submitSaving: "अनुरोध भेजा जा रहा है…",
    submitLabel: "अनुरोध की पुष्टि करें",
    payInfo:
      "भुगतान हमेशा सीधे सैलून में किया जाता है। ऑनलाइन कार्ड से भुगतान उपलब्ध नहीं है।",
  } as const;

  const t =
    locale === "nb"
      ? tNb
      : locale === "ar"
      ? tAr
      : locale === "so"
      ? tSo
      : locale === "ti"
      ? tTi
      : locale === "am"
      ? tAm
      : locale === "tr"
      ? tTr
      : locale === "pl"
      ? tPl
      : locale === "vi"
      ? tVi
      : locale === "tl"
      ? tTl
      : locale === "zh"
      ? tZh
      : locale === "fa"
      ? tFa
      : locale === "dar"
      ? tDar
      : locale === "ur"
      ? tUr
      : locale === "hi"
      ? tHi
      : tEn;
  const [salon, setSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [serviceId, setServiceId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [date, setDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const canLoadSlots = useMemo(
    () => !!(salon && serviceId && employeeId && date),
    [salon, serviceId, employeeId, date],
  );

  useEffect(() => {
    async function loadInitial() {
      setLoading(true);
      setError(null);

      const { data: salonData, error: salonError } = await supabase
        .from("salons")
        .select("id, name")
        .eq("slug", slug)
        .eq("is_public", true)
        .maybeSingle();

      if (salonError || !salonData) {
        setError(t.notFound);
        setLoading(false);
        return;
      }

      setSalon(salonData as Salon);

      const [{ data: servicesData, error: servicesError }, { data: employeesData, error: employeesError }] =
        await Promise.all([
          supabase
            .from("services")
            .select("id, name")
            .eq("salon_id", salonData.id)
            .eq("is_active", true)
            .order("name", { ascending: true }),
          supabase
            .from("employees")
            .select("id, full_name")
            .eq("salon_id", salonData.id)
            .eq("is_active", true)
            .order("full_name", { ascending: true }),
        ]);

      if (servicesError || employeesError) {
        setError(
          servicesError?.message ??
            employeesError?.message ??
            t.loadError,
        );
        setLoading(false);
        return;
      }

      setServices(servicesData ?? []);
      setEmployees(employeesData ?? []);
      setLoading(false);
    }

    loadInitial();
  }, [slug]);

  async function handleLoadSlots(e: FormEvent) {
    e.preventDefault();
    if (!salon || !canLoadSlots) return;

    setLoadingSlots(true);
    setError(null);
    setSlots([]);
    setSelectedSlot("");

    const { data, error: rpcError } = await supabase.rpc(
      "generate_availability",
      {
        p_salon_id: salon.id,
        p_employee_id: employeeId,
        p_service_id: serviceId,
        p_day: date,
      },
    );

    if (rpcError) {
      setError(rpcError.message);
      setLoadingSlots(false);
      return;
    }

    const mapped =
      (data as { slot_start: string; slot_end: string }[])?.map((slot) => {
        const start = new Date(slot.slot_start);
        const end = new Date(slot.slot_end);
        const label = `${start.toLocaleTimeString(
          locale === "nb" ? "nb-NO" : "en-US",
          {
            hour: "2-digit",
            minute: "2-digit",
          },
        )} – ${end.toLocaleTimeString(
          locale === "nb" ? "nb-NO" : "en-US",
          {
            hour: "2-digit",
            minute: "2-digit",
          },
        )}`;
        return { start: slot.slot_start, end: slot.slot_end, label };
      }) ?? [];

    setSlots(mapped);
    setLoadingSlots(false);
  }

  async function handleSubmitBooking(e: FormEvent) {
    e.preventDefault();
    if (!salon || !serviceId || !employeeId || !selectedSlot) return;

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { error: rpcError } = await supabase.rpc(
        "create_booking_with_validation",
        {
          p_salon_id: salon.id,
          p_employee_id: employeeId,
          p_service_id: serviceId,
          p_start_time: selectedSlot,
          p_customer_full_name: customerName,
          p_customer_email: customerEmail,
          p_customer_phone: customerPhone,
          p_customer_notes: null,
        },
      );

      if (rpcError) {
        setError(rpcError.message);
        setSaving(false);
        return;
      }

      setSuccessMessage(t.successMessage);
      setSaving(false);
    } catch (err) {
      setError(t.createError);
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">{t.loadingSalon}</p>
      </div>
    );
  }

  if (error || !salon) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md">
          <EmptyState
            title={t.unavailableTitle}
            description={error ?? t.unavailableDescription}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b bg-card/80 px-4 py-4 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              {salon.name}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <p className="text-xs text-muted-foreground">
                {t.headerSubtitle}
              </p>
              <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-800">
                {t.payInSalonBadge}
              </span>
            </div>
          </div>

          {/* Språkvelger for offentlige kunder */}
          <div className="mt-2 flex items-center gap-2 text-[11px] sm:mt-0">
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as any)}
              className="h-8 rounded-full border bg-background px-2 text-[11px] outline-none ring-ring/0 transition focus-visible:ring-2"
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
              <option value="dar">🇦🇫 دری (Dari)</option>
              <option value="ur">🇵🇰 اردو</option>
              <option value="hi">🇮🇳 हिन्दी</option>
            </select>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 py-6 sm:px-6">
        {/* Steg 1–3: valg av service, ansatt, tidspunkt */}
        <section className="space-y-4 rounded-2xl border bg-card p-4 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-sm font-medium tracking-tight">
              {t.step1Title}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t.step1Description}
            </p>
          </div>

          <form onSubmit={handleLoadSlots} className="space-y-4">
            <div className="space-y-2 text-sm">
              <label className="font-medium" htmlFor="service">
                {t.serviceLabel}
              </label>
              <select
                id="service"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="h-9 w-full rounded-md border bg-background px-2 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
                required
              >
                <option value="">{t.servicePlaceholder}</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 text-sm">
              <label className="font-medium" htmlFor="employee">
                {t.employeeLabel}
              </label>
              <select
                id="employee"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="h-9 w-full rounded-md border bg-background px-2 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
                required
              >
                <option value="">{t.employeePlaceholder}</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 text-sm">
              <label className="font-medium" htmlFor="date">
                {t.dateLabel}
              </label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!canLoadSlots || loadingSlots}
            >
              {loadingSlots ? t.loadingSlots : t.loadSlots}
            </Button>
          </form>

          <div className="space-y-2 text-sm">
            <label className="font-medium" htmlFor="slot">
              {t.step2Label}
            </label>
            <select
              id="slot"
              value={selectedSlot}
              onChange={(e) => setSelectedSlot(e.target.value)}
              className="h-9 w-full rounded-md border bg-background px-2 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
              required
            >
              <option value="">
                {slots.length === 0
                  ? t.noSlotsYet
                  : t.selectSlotPlaceholder}
              </option>
              {slots.map((slot) => (
                <option key={slot.start} value={slot.start}>
                  {slot.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Steg 4: kundedetaljer (ingen lagring enda) */}
        <section className="space-y-4 rounded-2xl border bg-card p-4 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-sm font-medium tracking-tight">
              {t.step3Title}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t.step3Description}
            </p>
          </div>

          <form onSubmit={handleSubmitBooking} className="space-y-3">
            <div className="space-y-1 text-sm">
              <label className="font-medium" htmlFor="customer_name">
                {t.nameLabel}
              </label>
              <Input
                id="customer_name"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1 text-sm">
              <label className="font-medium" htmlFor="customer_email">
                {t.emailLabel}
              </label>
              <Input
                id="customer_email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
              />
            </div>
            <div className="space-y-1 text-sm">
              <label className="font-medium" htmlFor="customer_phone">
                {t.phoneLabel}
              </label>
              <Input
                id="customer_phone"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder={t.phonePlaceholder}
              />
            </div>

            {error && (
              <p className="text-sm text-red-500" aria-live="polite">
                {error}
              </p>
            )}

            {successMessage && (
              <p className="text-sm text-emerald-600" aria-live="polite">
                {successMessage}
              </p>
            )}

            <Button
              type="submit"
              className="mt-1 w-full"
              disabled={!selectedSlot || !customerName || saving}
            >
              {saving ? t.submitSaving : t.submitLabel}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground">
            {t.payInfo}
          </p>
        </section>
      </main>
    </div>
  );
}


