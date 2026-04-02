import type { TranslationNamespaces } from "../../types/namespaces";

export const shifts: TranslationNamespaces["shifts"] = {

    title: "الورديات وساعات العمل",
    description:
      "عرّف ساعات العمل الثابتة لكل موظف. تُستخدم لاحقًا لحساب الأوقات المتاحة للحجز.",
    mustBeLoggedIn: "يجب تسجيل الدخول لعرض الورديات.",
    noSalon:
      "لا يوجد أي صالون مرتبط بحسابك. يرجى إكمال إعداد الصالون أولًا.",
    loadError: "تعذر تحميل الورديات.",
    addError: "تعذر إضافة وردية.",
    newShift: "وردية جديدة",
    employeeLabel: "الموظف",
    employeePlaceholder: "اختر موظفًا…",
    weekdayLabel: "اليوم",
    startLabel: "البدء",
    endLabel: "الانتهاء",
    saving: "جارٍ الحفظ…",
    addButton: "إضافة وردية",
    needEmployeeHint:
      "يجب أولًا إنشاء موظف واحد على الأقل قبل إضافة الورديات.",
    tableTitle: "وردياتك",
    loading: "جارٍ تحميل الورديات…",
    emptyTitle: "لا توجد ورديات مسجَّلة بعد",
    emptyDescription:
      "عند إضافة الورديات في النموذج على اليسار، ستظهر هنا، وسيتم استخدامها لاحقًا لحساب الأوقات المتاحة.",
    mobileUnknownEmployee: "موظف غير معروف",
    desktopUnknownEmployee: "موظف غير معروف",
    colEmployee: "الموظف",
    colDay: "اليوم",
    colTime: "الوقت",
    colActions: "إجراءات",
    delete: "حذف",
};
