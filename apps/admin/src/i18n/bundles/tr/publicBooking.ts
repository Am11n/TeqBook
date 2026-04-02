import type { TranslationNamespaces } from "../../types/namespaces";

export const publicBooking: TranslationNamespaces["publicBooking"] = {

    notFound: "Bu salon bulunamadı veya herkese açık olarak işaretlenmemiş.",
    loadError: "Hizmetler / çalışanlar yüklenemedi.",
    loadingSalon: "Salon bilgileri yükleniyor…",
    headerSubtitle: "Randevu al – ödemeyi salonda yap.",
    payInSalonBadge: "Ödeme salonda",
    step1Title: "1. Hizmet seç",
    step1Description:
      "Önce bir hizmet seç, ardından çalışan ve saat seç.",
    serviceLabel: "Hizmet",
    servicePlaceholder: "Hizmet seç…",
    employeeLabel: "Çalışan",
    employeePlaceholder: "Çalışan seç…",
    dateLabel: "Tarih",
    loadSlots: "Müsait saatleri getir",
    loadingSlots: "Müsait saatler yükleniyor…",
    step2Label: "2. Saat seç",
    noSlotsYet: "Önce müsait saatleri getir",
    selectSlotPlaceholder: "Saat seç…",
    step3Title: "3. Bilgilerin",
    step3Description:
      "Bu bilgileri randevunu onaylamak ve istersen hatırlatma göndermek için kullanıyoruz. Ödeme her zaman salonda yapılır.",
    nameLabel: "İsim",
    emailLabel: "E-posta (opsiyonel)",
    emailPlaceholder: "you@example.com",
    phoneLabel: "Telefon (opsiyonel)",
    phonePlaceholder: "+47 99 99 99 99",
    submitSaving: "Talep gönderiliyor…",
    submitLabel: "Talebi onayla",
    payInfo:
      "Ödemeyi her zaman salonda yaparsın. Online kart ödemesi yok.",
    successMessage:
      "Randevun kaydedildi! Salon seninle iletişime geçip onaylayacak, ödeme salonda yapılacak.",
    createError: "Randevu oluşturulurken bir hata oluştu.",
    unavailableTitle: "Randevu sayfası gösterilemiyor",
    unavailableDescription:
      "Bu salon mevcut değil ya da herkese açık olarak işaretlenmemiş.",
};
