import type { TranslationNamespaces } from "../../types/namespaces";

export const notifications: TranslationNamespaces["notifications"] = {

    title: "Mga Abiso",
    noNotifications: "Walang mga abiso",
    markAllRead: "Markahan lahat bilang nabasa",
    viewAll: "Tingnan lahat ng mga abiso",
    justNow: "Ngayon lang",
    minutesAgo: "{count} minuto ang nakakaraan",
    hoursAgo: "{count} oras ang nakakaraan",
    daysAgo: "{count} araw ang nakakaraan",
    bookingConfirmedTitle: "Nakumpirma ang Appointment",
    bookingConfirmedBody: "Nakumpirma ang iyong appointment para sa {serviceName} sa {date} ng {time}.",
    bookingChangedTitle: "Na-update ang Appointment",
    bookingChangedBody: "Inilipat ang iyong appointment para sa {serviceName} sa {date} ng {time}.",
    bookingCancelledTitle: "Kinansela ang Appointment",
    bookingCancelledBody: "Kinansela ang iyong appointment para sa {serviceName} sa {date}.",
    reminder24hTitle: "Appointment Bukas",
    reminder24hBody: "Paalala: May appointment ka para sa {serviceName} bukas ng {time}.",
    reminder2hTitle: "Malapit na ang Appointment",
    reminder2hBody: "Paalala: Ang iyong appointment para sa {serviceName} ay sa loob ng 2 oras ng {time}.",
    newBookingTitle: "Bagong Appointment",
    newBookingBody: "Nag-book si {customerName} ng {serviceName} sa {date} ng {time}.",
};
