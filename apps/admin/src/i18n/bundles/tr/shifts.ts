import type { TranslationNamespaces } from "../../types/namespaces";

export const shifts: TranslationNamespaces["shifts"] = {

    title: "Vardiyalar & çalışma saatleri",
    description:
      "Her çalışan için sabit çalışma saatlerini tanımla. Daha sonra randevuya açık saatleri hesaplamak için kullanılacak.",
    mustBeLoggedIn: "Vardiyaları görmek için giriş yapmalısın.",
    noSalon:
      "Hesabına bağlı bir salon bulunamadı. Lütfen önce başlangıç adımlarını tamamla.",
    loadError: "Vardiyalar yüklenemedi.",
    addError: "Vardiya eklenemedi.",
    newShift: "Yeni vardiya",
    employeeLabel: "Çalışan",
    employeePlaceholder: "Çalışan seç…",
    weekdayLabel: "Gün",
    startLabel: "Başlangıç",
    endLabel: "Bitiş",
    saving: "Kaydediliyor…",
    addButton: "Vardiya ekle",
    needEmployeeHint:
      "Vardiya eklemeden önce en az bir çalışan oluşturmalısın.",
    tableTitle: "Vardiyaların",
    loading: "Vardiyalar yükleniyor…",
    emptyTitle: "Henüz vardiya eklenmedi",
    emptyDescription:
      "Soldaki formdan vardiya eklediğinde burada görünecek ve daha sonra müsait saatleri hesaplamak için kullanılacak.",
    mobileUnknownEmployee: "Bilinmeyen çalışan",
    desktopUnknownEmployee: "Bilinmeyen çalışan",
    colEmployee: "Çalışan",
    colDay: "Gün",
    colTime: "Saat",
    colActions: "İşlemler",
    delete: "Sil",
};
