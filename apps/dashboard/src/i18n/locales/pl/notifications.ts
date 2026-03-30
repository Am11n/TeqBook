import type { TranslationNamespaces } from '../../types';

export const notifications: TranslationNamespaces['notifications'] = {
    title: "Powiadomienia",
    noNotifications: "Brak powiadomień",
    markAllRead: "Oznacz wszystkie jako przeczytane",
    viewAll: "Zobacz wszystkie powiadomienia",
    justNow: "Właśnie teraz",
    minutesAgo: "{count} min temu",
    hoursAgo: "{count} godz. temu",
    daysAgo: "{count} dni temu",
    bookingConfirmedTitle: "Rezerwacja potwierdzona",
    bookingConfirmedBody: "Twoja wizyta na {serviceName} w dniu {date} o {time} została potwierdzona.",
    bookingChangedTitle: "Rezerwacja zaktualizowana",
    bookingChangedBody: "Twoja wizyta na {serviceName} została zmieniona na {date} o {time}.",
    bookingCancelledTitle: "Rezerwacja anulowana",
    bookingCancelledBody: "Twoja wizyta na {serviceName} w dniu {date} została anulowana.",
    reminder24hTitle: "Wizyta jutro",
    reminder24hBody: "Przypomnienie: Masz wizytę na {serviceName} jutro o {time}.",
    reminder2hTitle: "Wizyta wkrótce",
    reminder2hBody: "Przypomnienie: Twoja wizyta na {serviceName} za 2 godziny o {time}.",
    newBookingTitle: "Nowa rezerwacja",
    newBookingBody: "{customerName} zarezerwował {serviceName} na {date} o {time}.",
  };
