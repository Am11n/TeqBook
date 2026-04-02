import type { TranslationNamespaces } from "../../types/namespaces";

export const home: TranslationNamespaces["home"] = {

    title: "总览",
    description:
      "快速了解你的沙龙状况。未来这里的数字会直接来自预约引擎。",
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
    totalBookingsThisWeek: "本周总预约",
    returningCustomers: "回头客",
    revenueEstimate: "收入估算（手动付款）",
    // Staff empty state
    manageStaffPermissions: "管理员工权限和角色",
    // Announcements
    // Announcements
    announcements: "公告",
    announcementWalkIn: "您现在可以接受临时预约了。",
    announcementLanguages: "新语言可用：土耳其语、阿拉伯语",
    announcementDashboardUpdate: "新的仪表板更新已发布。",
    viewAllUpdates: "查看所有更新",
    // Legacy (deprecated)
    nextStepTitle: "下一步",
    nextStepDescription: "技术配置",
    nextStepBodyTitle: "连接 Supabase",
    nextStepBodyText:
      "将 Supabase 密钥添加到 .env.local，并开启 multi‑tenancy。",
    onboardingTitle: "Onboarding",
    onboardingDescription: "第一个沙龙",
    onboardingBodyTitle: "创建你的第一个沙龙",
    onboardingBodyText:
      "之后我们会添加简单向导，用于名称、地址和拥有者信息。",
    bookingTitle: "预约",
    bookingDescription: "即将上线",
    bookingBodyTitle: "内部日历和公共预约页面",
    bookingBodyText: "稍后此卡片会被真实预约数据替代。",
};
