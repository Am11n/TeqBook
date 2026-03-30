import type { TranslationNamespaces } from '../../types';

export const notifications: TranslationNamespaces['notifications'] = {
    title: "通知",
    noNotifications: "暂无通知",
    markAllRead: "全部标为已读",
    viewAll: "查看所有通知",
    justNow: "刚刚",
    minutesAgo: "{count}分钟前",
    hoursAgo: "{count}小时前",
    daysAgo: "{count}天前",
    bookingConfirmedTitle: "预约已确认",
    bookingConfirmedBody: "您在{date} {time}的{serviceName}预约已确认。",
    bookingChangedTitle: "预约已更新",
    bookingChangedBody: "您的{serviceName}预约已更改为{date} {time}。",
    bookingCancelledTitle: "预约已取消",
    bookingCancelledBody: "您在{date}的{serviceName}预约已取消。",
    reminder24hTitle: "明天有预约",
    reminder24hBody: "提醒：您明天{time}有{serviceName}预约。",
    reminder2hTitle: "预约即将开始",
    reminder2hBody: "提醒：您的{serviceName}预约将在2小时后{time}开始。",
    newBookingTitle: "新预约",
    newBookingBody: "{customerName}已预约{date} {time}的{serviceName}。",
  };
