import type { TranslationNamespaces } from '../../types';

export const notifications: TranslationNamespaces['notifications'] = {
    title: "Notifications",
    noNotifications: "No notifications",
    markAllRead: "Mark all read",
    viewAll: "View all notifications",
    justNow: "Just now",
    minutesAgo: "{count}m ago",
    hoursAgo: "{count}h ago",
    daysAgo: "{count}d ago",
    bookingConfirmedTitle: "Booking Confirmed",
    bookingConfirmedBody: "Your appointment for {serviceName} on {date} at {time} has been confirmed.",
    bookingChangedTitle: "Booking Updated",
    bookingChangedBody: "Your appointment for {serviceName} has been updated to {date} at {time}.",
    bookingCancelledTitle: "Booking Cancelled",
    bookingCancelledBody: "Your appointment for {serviceName} on {date} has been cancelled.",
    reminder24hTitle: "Appointment Tomorrow",
    reminder24hBody: "Reminder: You have an appointment for {serviceName} tomorrow at {time}.",
    reminder2hTitle: "Appointment Soon",
    reminder2hBody: "Reminder: Your appointment for {serviceName} is in 2 hours at {time}.",
    newBookingTitle: "New Booking",
    newBookingBody: "{customerName} has booked {serviceName} for {date} at {time}.",
  };
