import type { TranslationNamespaces } from '../../types';

export const notifications: TranslationNamespaces['notifications'] = {
    title: "Varsler",
    noNotifications: "Ingen varsler",
    markAllRead: "Merk alle som lest",
    viewAll: "Se alle varsler",
    justNow: "Akkurat nå",
    minutesAgo: "{count}m siden",
    hoursAgo: "{count}t siden",
    daysAgo: "{count}d siden",
    bookingConfirmedTitle: "Time bekreftet",
    bookingConfirmedBody: "Din avtale for {serviceName} den {date} kl. {time} er bekreftet.",
    bookingChangedTitle: "Time endret",
    bookingChangedBody: "Din avtale for {serviceName} er endret til {date} kl. {time}.",
    bookingCancelledTitle: "Time kansellert",
    bookingCancelledBody: "Din avtale for {serviceName} den {date} er kansellert.",
    reminder24hTitle: "Avtale i morgen",
    reminder24hBody: "Påminnelse: Du har en avtale for {serviceName} i morgen kl. {time}.",
    reminder2hTitle: "Avtale snart",
    reminder2hBody: "Påminnelse: Din avtale for {serviceName} er om 2 timer kl. {time}.",
    newBookingTitle: "Ny booking",
    newBookingBody: "{customerName} har booket {serviceName} den {date} kl. {time}.",
  };
