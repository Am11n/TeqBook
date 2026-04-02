import type { TranslationNamespaces } from "../../types/namespaces";

export const customers: TranslationNamespaces["customers"] = {

    title: "Müşteriler",
    description:
      "Salonun için basit bir müşteri kaydı. Randevularla beraber kullanılır.",
    mustBeLoggedIn: "Müşterileri görmek için giriş yapmalısın.",
    noSalon:
      "Hesabına bağlı bir salon bulunamadı. Lütfen önce başlangıç adımlarını tamamla.",
    loadError: "Müşteriler yüklenemedi.",
    addError: "Müşteri eklenemedi.",
    newCustomer: "Yeni müşteri",
    nameLabel: "İsim",
    namePlaceholder: "Örn. Ali Yılmaz",
    emailLabel: "E-posta (opsiyonel)",
    emailPlaceholder: "customer@example.com",
    phonePlaceholder: "+47 99 99 99 99",
    phoneLabel: "Telefon (opsiyonel)",
    notesLabel: "Notlar (opsiyonel)",
    notesPlaceholder:
      "Örn. tercih ettiği kuaför, alerjiler vb.",
    gdprLabel:
      "Bu müşterinin verilerini saklamak ve onunla iletişime geçmek için onayım var (GDPR).",
    saving: "Kaydediliyor…",
    addButton: "Müşteri ekle",
    tableTitle: "Müşterilerin",
    loading: "Müşteriler yükleniyor…",
    emptyTitle: "Henüz müşteri eklenmedi",
    emptyDescription:
      "Soldaki formdan müşteri eklediğinde burada görünecek. Daha sonra randevulara bağlanabilir.",
    mobileConsentYes: "Onay kaydedildi",
    mobileConsentNo: "Onay yok",
    delete: "Sil",
    colName: "Name",
    colContact: "Contact",
    colNotes: "Notlar",
    colGdpr: "GDPR",
    colActions: "İşlemler",
    consentYes: "Evet",
    consentNo: "Hayır",
};
