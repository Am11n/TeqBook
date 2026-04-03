import type { TranslationNamespaces } from '../../types';

export const notifications: TranslationNamespaces['notifications'] = {
  title: "Mga abiso",
  noNotifications: "Walang abiso",
  markAllRead: "Markahan lahat na nabasa",
  viewAll: "Tingnan lahat ng abiso",
  justNow: "Ngayon lang",
  minutesAgo: "{count} min ang nakalipas",
  hoursAgo: "{count} oras ang nakalipas",
  daysAgo: "{count} araw ang nakalipas",
  bookingConfirmedTitle: "Nakumpirma ang booking",
  bookingConfirmedBody:
    "Nakumpirma ang appointment mo para sa {serviceName} sa {date} nang {time}.",
  bookingChangedTitle: "Na-update ang booking",
  bookingChangedBody:
    "Na-update ang appointment mo para sa {serviceName} sa {date} nang {time}.",
  bookingCancelledTitle: "Kinansela ang booking",
  bookingCancelledBody:
    "Kinansela ang appointment mo para sa {serviceName} sa {date}.",
  reminder24hTitle: "Bukas ang appointment",
  reminder24hBody:
    "Paalala: May appointment ka para sa {serviceName} bukas nang {time}.",
  reminder2hTitle: "Malapit na ang appointment",
  reminder2hBody:
    "Paalala: Ang appointment mo para sa {serviceName} ay sa loob ng 2 oras nang {time}.",
  newBookingTitle: "Bagong booking",
  newBookingBody:
    "Si {customerName} ay nag-book ng {serviceName} sa {date} nang {time}.",
};
