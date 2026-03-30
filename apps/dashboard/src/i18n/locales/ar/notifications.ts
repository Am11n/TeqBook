import type { TranslationNamespaces } from '../../types';

export const notifications: TranslationNamespaces['notifications'] = {
    title: "الإشعارات",
    noNotifications: "لا توجد إشعارات",
    markAllRead: "تحديد الكل كمقروء",
    viewAll: "عرض جميع الإشعارات",
    justNow: "الآن",
    minutesAgo: "منذ {count} دقيقة",
    hoursAgo: "منذ {count} ساعة",
    daysAgo: "منذ {count} يوم",
    bookingConfirmedTitle: "تم تأكيد الحجز",
    bookingConfirmedBody: "تم تأكيد موعدك لـ {serviceName} في {date} الساعة {time}.",
    bookingChangedTitle: "تم تحديث الحجز",
    bookingChangedBody: "تم تحديث موعدك لـ {serviceName} إلى {date} الساعة {time}.",
    bookingCancelledTitle: "تم إلغاء الحجز",
    bookingCancelledBody: "تم إلغاء موعدك لـ {serviceName} في {date}.",
    reminder24hTitle: "موعد غداً",
    reminder24hBody: "تذكير: لديك موعد لـ {serviceName} غداً الساعة {time}.",
    reminder2hTitle: "موعد قريباً",
    reminder2hBody: "تذكير: موعدك لـ {serviceName} بعد ساعتين الساعة {time}.",
    newBookingTitle: "حجز جديد",
    newBookingBody: "{customerName} حجز {serviceName} في {date} الساعة {time}.",
  };
