import type { TranslationNamespaces } from "../../types/namespaces";

export const home: TranslationNamespaces["home"] = {

    title: "Genel bakış",
    description:
      "Salonun için hızlı bir durum özeti. Buradaki rakamlar yakında randevu motorundan gelecek.",
    welcomeBack: "Welcome back, {name}.",
    welcomeSubtitle:
      "Here's an overview of your salon – staff, appointments, customers and performance.",
    todaysBookings: "Today's bookings",
    viewCalendar: "View calendar",
    noBookingsYet: "No bookings yet.",
    noBookingsYetSubtitle: "New appointments will appear here.",
    createFirstBooking: "Create your first booking",
    yourStaff: "Your staff",
    manageStaff: "Manage staff",
    online: "Online",
    offline: "Offline",
    quickActions: "Quick actions",
    addNewBooking: "Add new booking",
    addNewCustomer: "Add new customer",
    addNewService: "Add new service",
    inviteNewStaff: "Invite new staff member",
    // Performance snapshot
    thisWeek: "This week",
    bookingsLabel: "Bookings",
    newCustomersLabel: "New customers",
    topServiceLabel: "Top service",
    mostBookedStaffLabel: "Most booked staff",
    noInsightsYet:
      "Your salon insights will appear here once bookings start coming in.",
    // KPI labels
    totalBookingsThisWeek: "Bu hafta toplam rezervasyonlar",
    returningCustomers: "Dönen müşteriler",
    revenueEstimate: "Gelir tahmini (manuel ödemeler)",
    // Staff empty state
    manageStaffPermissions: "Personel izinlerini ve rollerini yönetin",
    // Announcements
    // Announcements
    announcements: "Duyurular",
    announcementWalkIn: "Artık walk-in rezervasyonları kabul edebilirsiniz.",
    announcementLanguages: "Yeni diller mevcut: Türkçe, Arapça",
    announcementDashboardUpdate: "Yeni dashboard güncellemesi yayınlandı.",
    viewAllUpdates: "Tüm güncellemeleri görüntüle",
    // Legacy (deprecated)
    nextStepTitle: "Sonraki adım",
    nextStepDescription: "Teknik kurulum",
    nextStepBodyTitle: "Supabase’e bağlan",
    nextStepBodyText:
      "Supabase anahtarlarını .env.local dosyasına ekle ve multi-tenancy’yi etkinleştir.",
    onboardingTitle: "Başlangıç",
    onboardingDescription: "İlk salon",
    onboardingBodyTitle: "İlk salonunu oluştur",
    onboardingBodyText:
      "İleride isim, adres ve sahip bilgileri için basit bir sihirbaz ekleyeceğiz.",
    bookingTitle: "Randevu",
    bookingDescription: "Yakında",
    bookingBodyTitle: "İç takvim & halka açık randevu sayfası",
    bookingBodyText:
      "Bu kart daha sonra gerçek randevu verileriyle değiştirilecek.",
};
