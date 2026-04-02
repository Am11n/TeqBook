import type { TranslationNamespaces } from "../../types/namespaces";

export const services: TranslationNamespaces["services"] = {

    title: "Hizmetler",
    description:
      "Süre ve fiyatla birlikte hizmetleri tanımla. Randevu motorunda kullanılacak.",
    mustBeLoggedIn: "Hizmetleri görmek için giriş yapmalısın.",
    noSalon:
      "Hesabına bağlı bir salon bulunamadı. Lütfen önce başlangıç adımlarını tamamla.",
    addError: "Hizmet eklenemedi.",
    updateError: "Hizmet güncellenemedi.",
    newService: "Yeni hizmet",
    nameLabel: "İsim",
    namePlaceholder: "Örn. Bayan saç kesimi",
    categoryLabel: "Kategori",
    categoryCut: "Kesim",
    categoryBeard: "Sakal",
    categoryColor: "Renk",
    categoryNails: "Tırnak",
    categoryMassage: "Masaj",
    categoryOther: "Diğer",
    durationLabel: "Süre (dakika)",
    priceLabel: "Fiyat (NOK)",
    sortOrderLabel: "Sıralama düzeni",
    loading: "Hizmetler yükleniyor…",
    emptyTitle: "Henüz hizmet eklenmedi",
    emptyDescription:
      "Soldaki formdan hizmet ekle. Randevu motorunda süre ve fiyat hesaplamak için kullanılacak.",
    tableTitle: "Hizmetlerin",
    colName: "Name",
    colCategory: "Category",
    colDuration: "Süre",
    colPrice: "Fiyat",
    colStatus: "Durum",
    colActions: "İşlemler",
    active: "Aktif",
    inactive: "Pasif",
    delete: "Sil",
};
