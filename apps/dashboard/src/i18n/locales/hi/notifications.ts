import type { TranslationNamespaces } from '../../types';

export const notifications: TranslationNamespaces['notifications'] = {
    title: "सूचनाएं",
    noNotifications: "कोई सूचना नहीं",
    markAllRead: "सभी को पढ़ा गया चिह्नित करें",
    viewAll: "सभी सूचनाएं देखें",
    justNow: "अभी",
    minutesAgo: "{count} मिनट पहले",
    hoursAgo: "{count} घंटे पहले",
    daysAgo: "{count} दिन पहले",
    bookingConfirmedTitle: "बुकिंग की पुष्टि",
    bookingConfirmedBody: "आपकी {serviceName} की अपॉइंटमेंट {date} को {time} बजे की पुष्टि हो गई।",
    bookingChangedTitle: "बुकिंग अपडेट",
    bookingChangedBody: "आपकी {serviceName} की अपॉइंटमेंट {date} को {time} बजे में बदल दी गई।",
    bookingCancelledTitle: "बुकिंग रद्द",
    bookingCancelledBody: "आपकी {serviceName} की अपॉइंटमेंट {date} को रद्द कर दी गई।",
    reminder24hTitle: "कल अपॉइंटमेंट",
    reminder24hBody: "याद दिलाना: आपकी कल {time} बजे {serviceName} की अपॉइंटमेंट है।",
    reminder2hTitle: "अपॉइंटमेंट जल्द",
    reminder2hBody: "याद दिलाना: आपकी {serviceName} की अपॉइंटमेंट 2 घंटे में {time} बजे है।",
    newBookingTitle: "नई बुकिंग",
    newBookingBody: "{customerName} ने {date} को {time} बजे {serviceName} की बुकिंग की।",
  };
