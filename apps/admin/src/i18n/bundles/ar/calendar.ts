import type { TranslationNamespaces } from "../../types/namespaces";

export const calendar: TranslationNamespaces["calendar"] = {

    title: "التقويم",
    description:
      "تقويم داخلي بسيط لكل يوم ولكل موظف. سيكون أساسًا للسحب والإفلات وعروض أكثر تقدمًا لاحقًا.",
    mustBeLoggedIn: "يجب تسجيل الدخول لعرض التقويم.",
    noSalon:
      "لا يوجد أي صالون مرتبط بحسابك. يرجى إكمال إعداد الصالون أولًا.",
    loadError: "تعذر تحميل بيانات التقويم.",
    selectedDayLabel: "اليوم المحدد:",
    viewDay: "عرض اليوم",
    viewWeek: "عرض الأسبوع",
    filterEmployeeLabel: "تصفية حسب الموظف",
    filterEmployeeAll: "جميع الموظفين",
    prev: "السابق",
    today: "اليوم",
    next: "التالي",
    loading: "جارٍ تحميل بيانات التقويم…",
    noEmployeesTitle: "لا يوجد موظفون بعد",
    noEmployeesDescription:
      "قم بإضافة الموظفين أولًا حتى يظهروا في التقويم.",
    noBookingsTitle: "لا توجد حجوزات في هذا اليوم",
    noBookingsDescription:
      "اختر تاريخًا آخر أو أنشئ حجوزات جديدة.",
    unknownService: "خدمة غير معروفة",
    unknownCustomer: "زيارة بدون حجز / غير معروف",
};
