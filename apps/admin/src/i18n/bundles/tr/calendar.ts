import type { TranslationNamespaces } from "../../types/namespaces";

export const calendar: TranslationNamespaces["calendar"] = {

    title: "Takvim",
    description:
      "Gün ve çalışan başına basit bir iç takvim. Daha sonra sürükle-bırak ve gelişmiş görünümler için temel olarak kullanılacak.",
    mustBeLoggedIn: "Takvimi görmek için giriş yapmalısın.",
    noSalon:
      "Hesabına bağlı bir salon bulunamadı. Lütfen önce başlangıç adımlarını tamamla.",
    loadError: "Takvim verileri yüklenemedi.",
    selectedDayLabel: "Seçilen gün:",
    viewDay: "Day view",
    viewWeek: "Week view",
    filterEmployeeLabel: "Filter by employee",
    filterEmployeeAll: "All employees",    prev: "Önceki",
    today: "Bugün",
    next: "Sonraki",
    loading: "Takvim verileri yükleniyor…",
    noEmployeesTitle: "Henüz çalışan yok",
    noEmployeesDescription:
      "Önce çalışan oluştur, ardından takvimde görünecekler.",
    noBookingsTitle: "Bu gün için randevu yok",
    noBookingsDescription:
      "Başka bir tarih seç veya yeni randevu oluştur.",
    unknownService: "Bilinmeyen hizmet",
    unknownCustomer: "Bilinmeyen müşteri / yürüyen",
};
