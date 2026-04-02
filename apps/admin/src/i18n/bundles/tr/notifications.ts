import type { TranslationNamespaces } from "../../types/namespaces";

export const notifications: TranslationNamespaces["notifications"] = {

    title: "Bildirimler",
    noNotifications: "Bildirim yok",
    markAllRead: "Tümünü okundu işaretle",
    viewAll: "Tüm bildirimleri görüntüle",
    justNow: "Şimdi",
    minutesAgo: "{count} dakika önce",
    hoursAgo: "{count} saat önce",
    daysAgo: "{count} gün önce",
    bookingConfirmedTitle: "Randevu Onaylandı",
    bookingConfirmedBody: "{serviceName} için {date} tarihinde saat {time}'deki randevunuz onaylandı.",
    bookingChangedTitle: "Randevu Güncellendi",
    bookingChangedBody: "{serviceName} için randevunuz {date} tarihinde saat {time}'e güncellendi.",
    bookingCancelledTitle: "Randevu İptal Edildi",
    bookingCancelledBody: "{serviceName} için {date} tarihindeki randevunuz iptal edildi.",
    reminder24hTitle: "Yarın Randevunuz Var",
    reminder24hBody: "Hatırlatma: Yarın saat {time}'de {serviceName} için randevunuz var.",
    reminder2hTitle: "Randevunuz Yaklaşıyor",
    reminder2hBody: "Hatırlatma: {serviceName} için randevunuz 2 saat içinde saat {time}'de.",
    newBookingTitle: "Yeni Randevu",
    newBookingBody: "{customerName}, {date} tarihinde saat {time}'de {serviceName} için randevu aldı.",
};
