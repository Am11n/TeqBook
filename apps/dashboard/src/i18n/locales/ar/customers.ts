import type { TranslationNamespaces } from '../../types';

export const customers: TranslationNamespaces['customers'] = {
    title: "العملاء",
    description:
      "سجل عملاء بسيط لصالونك. يُستخدم مع نظام الحجوزات.",
    mustBeLoggedIn: "يجب تسجيل الدخول لعرض العملاء.",
    noSalon:
      "لا يوجد أي صالون مرتبط بحسابك. يرجى إكمال إعداد الصالون أولًا.",
    loadError: "تعذر تحميل العملاء.",
    addError: "تعذر إضافة العميل.",
    newCustomer: "عميل جديد",
    nameLabel: "الاسم",
    namePlaceholder: "مثال: أحمد محمد",
    emailLabel: "البريد الإلكتروني (اختياري)",
    emailPlaceholder: "customer@example.com",
    phoneLabel: "رقم الهاتف (اختياري)",
    phonePlaceholder: "+47 99 99 99 99",
    notesLabel: "ملاحظات (اختياري)",
    notesPlaceholder:
      "مثال: المصفف المفضَّل، الحساسية، إلخ.",
    gdprLabel:
      "أملك موافقة لتخزين بيانات هذا العميل والتواصل معه (GDPR).",
    saving: "جارٍ الحفظ…",
    addButton: "إضافة عميل",
    tableTitle: "عملاؤك",
    loading: "جارٍ تحميل العملاء…",
    emptyTitle: "لا يوجد عملاء مسجَّلون بعد",
    emptyDescription:
      "عند إضافة العملاء في النموذج على اليسار، سيظهرون هنا ويمكن ربطهم بالحجوزات لاحقًا.",
    mobileConsentYes: "تم حفظ الموافقة",
    mobileConsentNo: "بدون موافقة",
    delete: "حذف",
    colName: "الاسم",
    colContact: "التواصل",
    colNotes: "ملاحظات",
    colGdpr: "GDPR",
    colActions: "إجراءات",
    consentYes: "نعم",
    consentNo: "لا",
    dialogTitle: "إضافة عميل",
    dialogDescription: "أدخل بيانات العميل.",
    cancel: "إلغاء",
  };
