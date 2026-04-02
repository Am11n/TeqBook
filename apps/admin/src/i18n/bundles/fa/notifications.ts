import type { TranslationNamespaces } from "../../types/namespaces";

export const notifications: TranslationNamespaces["notifications"] = {

    title: "اعلان‌ها",
    noNotifications: "اعلانی وجود ندارد",
    markAllRead: "همه را خوانده علامت بزن",
    viewAll: "مشاهده همه اعلان‌ها",
    justNow: "همین الان",
    minutesAgo: "{count} دقیقه پیش",
    hoursAgo: "{count} ساعت پیش",
    daysAgo: "{count} روز پیش",
    bookingConfirmedTitle: "رزرو تایید شد",
    bookingConfirmedBody: "نوبت شما برای {serviceName} در تاریخ {date} ساعت {time} تایید شد.",
    bookingChangedTitle: "رزرو به‌روزرسانی شد",
    bookingChangedBody: "نوبت شما برای {serviceName} به تاریخ {date} ساعت {time} تغییر یافت.",
    bookingCancelledTitle: "رزرو لغو شد",
    bookingCancelledBody: "نوبت شما برای {serviceName} در تاریخ {date} لغو شد.",
    reminder24hTitle: "نوبت فردا",
    reminder24hBody: "یادآوری: فردا ساعت {time} برای {serviceName} نوبت دارید.",
    reminder2hTitle: "نوبت نزدیک است",
    reminder2hBody: "یادآوری: نوبت شما برای {serviceName} تا 2 ساعت دیگر ساعت {time} است.",
    newBookingTitle: "رزرو جدید",
    newBookingBody: "{customerName} برای {serviceName} در تاریخ {date} ساعت {time} رزرو کرد.",
};
