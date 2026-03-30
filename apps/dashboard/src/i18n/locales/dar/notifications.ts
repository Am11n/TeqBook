import type { TranslationNamespaces } from '../../types';

export const notifications: TranslationNamespaces['notifications'] = {
    title: "خبرتیاوې",
    noNotifications: "خبرتیا نشته",
    markAllRead: "ټول لوستل شوي نښه کړئ",
    viewAll: "ټولې خبرتیاوې وګورئ",
    justNow: "اوس مهال",
    minutesAgo: "{count} دقیقې مخکې",
    hoursAgo: "{count} ساعتونه مخکې",
    daysAgo: "{count} ورځې مخکې",
    bookingConfirmedTitle: "نوبت تایید شو",
    bookingConfirmedBody: "ستاسو نوبت د {serviceName} لپاره په {date} ساعت {time} تایید شو.",
    bookingChangedTitle: "نوبت تازه شو",
    bookingChangedBody: "ستاسو نوبت د {serviceName} لپاره {date} ساعت {time} ته بدل شو.",
    bookingCancelledTitle: "نوبت لغوه شو",
    bookingCancelledBody: "ستاسو نوبت د {serviceName} لپاره په {date} لغوه شو.",
    reminder24hTitle: "سبا نوبت",
    reminder24hBody: "یادونه: سبا ساعت {time} د {serviceName} لپاره نوبت لرئ.",
    reminder2hTitle: "نوبت نږدې دی",
    reminder2hBody: "یادونه: ستاسو د {serviceName} نوبت په 2 ساعتونو کې ساعت {time} دی.",
    newBookingTitle: "نوی نوبت",
    newBookingBody: "{customerName} د {serviceName} لپاره په {date} ساعت {time} نوبت واخیست.",
  };
