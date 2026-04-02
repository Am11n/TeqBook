import type { TranslationNamespaces } from "../../types/namespaces";

export const notifications: TranslationNamespaces["notifications"] = {

    title: "ማስታወቂያዎች",
    noNotifications: "ማስታወቂያ የለም",
    markAllRead: "ሁሉንም እንደተነበበ ምልክት አድርግ",
    viewAll: "ሁሉንም ማስታወቂያዎች ይመልከቱ",
    justNow: "አሁን",
    minutesAgo: "ከ {count} ደቂቃዎች በፊት",
    hoursAgo: "ከ {count} ሰዓታት በፊት",
    daysAgo: "ከ {count} ቀናት በፊት",
    bookingConfirmedTitle: "ቦታ ማስፈንጠር ተረጋግጧል",
    bookingConfirmedBody: "የእርስዎ ቀጠሮ ለ {serviceName} በ {date} ሰዓት {time} ተረጋግጧል።",
    bookingChangedTitle: "ቦታ ማስፈንጠር ተቀይሯል",
    bookingChangedBody: "የእርስዎ ቀጠሮ ለ {serviceName} ወደ {date} ሰዓት {time} ተቀይሯል።",
    bookingCancelledTitle: "ቦታ ማስፈንጠር ተሰርዟል",
    bookingCancelledBody: "የእርስዎ ቀጠሮ ለ {serviceName} በ {date} ተሰርዟል።",
    reminder24hTitle: "ቀጠሮ ነገ",
    reminder24hBody: "ማስታወሻ: ነገ ሰዓት {time} ለ {serviceName} ቀጠሮ አለዎት።",
    reminder2hTitle: "ቀጠሮ በቅርቡ",
    reminder2hBody: "ማስታወሻ: ለ {serviceName} ቀጠሮዎ በ2 ሰዓት ውስጥ ሰዓት {time} ነው።",
    newBookingTitle: "አዲስ ቦታ ማስፈንጠር",
    newBookingBody: "{customerName} ለ {serviceName} በ {date} ሰዓት {time} ቦታ አስመዝግበዋል።",
};
