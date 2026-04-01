import type { TranslationNamespaces } from '../../types';

export const notifications: TranslationNamespaces['notifications'] = {
    bookingCancelledBody: "تم إلغاء موعدك لـ {serviceName} في {date}.",
    bookingCancelledTitle: "تم إلغاء الحجز",
    bookingChangedBody: "تم تحديث موعدك لـ {serviceName} إلى {date} الساعة {time}.",
    bookingChangedTitle: "تم تحديث الحجز",
    bookingConfirmedBody: "تم تأكيد موعدك لـ {serviceName} في {date} الساعة {time}.",
    bookingConfirmedTitle: "تم تأكيد الحجز",
    daysAgo: "منذ {count} يوم",
    hoursAgo: "منذ {count} ساعة",
    justNow: "الآن",
    markAllRead: "تحديد الكل كمقروء",
    minutesAgo: "منذ {count} دقيقة",
    newBookingBody: "{customerName} حجز {serviceName} في {date} الساعة {time}.",
    newBookingTitle: "حجز جديد",
    noNotifications: "لا توجد إشعارات",
    reminder24hBody: "تذكير: لديك موعد لـ {serviceName} غداً الساعة {time}.",
    reminder24hTitle: "موعد غداً",
    reminder2hBody: "تذكير: موعدك لـ {serviceName} بعد ساعتين الساعة {time}.",
    reminder2hTitle: "موعد قريباً",
    title: "الإشعارات",
    viewAll: "عرض جميع الإشعارات",
  };
