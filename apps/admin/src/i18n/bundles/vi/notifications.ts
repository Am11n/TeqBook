import type { TranslationNamespaces } from "../../types/namespaces";

export const notifications: TranslationNamespaces["notifications"] = {

    title: "Thông báo",
    noNotifications: "Không có thông báo",
    markAllRead: "Đánh dấu tất cả đã đọc",
    viewAll: "Xem tất cả thông báo",
    justNow: "Vừa xong",
    minutesAgo: "{count} phút trước",
    hoursAgo: "{count} giờ trước",
    daysAgo: "{count} ngày trước",
    bookingConfirmedTitle: "Đặt lịch đã xác nhận",
    bookingConfirmedBody: "Lịch hẹn {serviceName} của bạn vào ngày {date} lúc {time} đã được xác nhận.",
    bookingChangedTitle: "Đặt lịch đã cập nhật",
    bookingChangedBody: "Lịch hẹn {serviceName} của bạn đã được đổi sang ngày {date} lúc {time}.",
    bookingCancelledTitle: "Đặt lịch đã hủy",
    bookingCancelledBody: "Lịch hẹn {serviceName} của bạn vào ngày {date} đã bị hủy.",
    reminder24hTitle: "Lịch hẹn ngày mai",
    reminder24hBody: "Nhắc nhở: Bạn có lịch hẹn {serviceName} vào ngày mai lúc {time}.",
    reminder2hTitle: "Lịch hẹn sắp tới",
    reminder2hBody: "Nhắc nhở: Lịch hẹn {serviceName} của bạn còn 2 tiếng nữa lúc {time}.",
    newBookingTitle: "Đặt lịch mới",
    newBookingBody: "{customerName} đã đặt {serviceName} vào ngày {date} lúc {time}.",
};
