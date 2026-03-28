import type { LandingCopyEntry } from "../types";

export const viZhCopy: { vi: LandingCopyEntry; zh: LandingCopyEntry } = {
  vi: {
    brand: "TeqBook",
    heroTitle:
      "Đặt lịch cho salon – được thiết kế cho thanh toán trực tiếp tại salon",
    heroSubtitle:
      "TeqBook là hệ thống đặt lịch đơn giản, hiện đại cho salon tóc và chăm sóc sắc đẹp ở Bắc Âu. Khách đặt lịch online, nhưng luôn thanh toán tại salon.",
    ctaPrimary: "Bắt đầu miễn phí",
    ctaSecondary: "Đặt lịch demo",
    badge: "Thiết kế riêng cho salon",
    pricingTitle: "Chọn gói TeqBook phù hợp cho salon của bạn",
    pricingSubtitle:
      "Được xây dựng cho salon ở mọi quy mô — bắt đầu đơn giản, rồi nâng cấp bất cứ lúc nào.",
    tiers: [
      {
        id: "starter",
        name: "TeqBook Starter",
        price: "$25 / month",
        description:
          "Phù hợp cho barber, salon tóc, nails hoặc massage với 1–2 nhân viên.",
        features: [
          "Đặt lịch online và lịch làm việc đơn giản",
          "Danh sách khách hàng và quản lý dịch vụ",
          "Thanh toán trực tiếp tại salon, không cần tích hợp thanh toán phức tạp",
          "Hỗ trợ qua WhatsApp từ đội ngũ hiểu môi trường salon quốc tế",
          "Tiếng Anh + một gói ngôn ngữ bổ sung",
          "Tin nhắn SMS nhắc lịch với giá gần bằng giá gốc",
        ],
      },
      {
        id: "pro",
        name: "TeqBook Pro",
        price: "$50 / month",
        description:
          "Dành cho salon có 3–6 nhân viên, muốn kiểm soát tốt hơn và giảm no‑show.",
        features: [
          "Tất cả tính năng trong gói Starter",
          "Giao diện đa ngôn ngữ đầy đủ cho cả nhân viên và khách",
          "Báo cáo nâng cao về doanh thu, công suất và tỉ lệ no‑show",
          "Nhắc nhở và thông báo tự động",
          "Hỗ trợ thêm nhân viên và lập lịch ca làm việc đơn giản",
          "Quản lý tồn kho đơn giản cho sản phẩm bán trong salon",
          "Trang đặt lịch mang thương hiệu của bạn (logo và màu sắc riêng)",
        ],
        highlighted: true,
      },
      {
        id: "business",
        name: "TeqBook Business",
        price: "$75 / month",
        description:
          "Dành cho các salon lớn, đông khách cần cấu trúc rõ ràng, phân quyền và báo cáo tốt hơn.",
        features: [
          "Tất cả tính năng trong gói Pro",
          "Phân quyền và kiểm soát truy cập (chủ, quản lý, lễ tân, nhân viên)",
          "Thống kê chuyên sâu và xuất dữ liệu cho kế toán và báo cáo",
          "Lịch sử đặt lịch đầy đủ của khách",
        ],
      },
    ],
    stats: [
      {
        title: "Thiết kế cho thanh toán tại salon",
        body: "Mọi nội dung và luồng sử dụng đều được tối ưu cho thanh toán tại salon – không phải thanh toán thẻ online.",
      },
      {
        title: "Hỗ trợ nhiều salon ngay từ ngày đầu",
        body: "Một tài khoản TeqBook có thể quản lý nhiều salon, với multi‑tenancy an toàn trên Supabase để tách biệt dữ liệu.",
      },
      {
        title: "Sẵn sàng phát triển cùng bạn",
        body: "MVP được xây dựng với lộ trình rõ ràng: thông báo, báo cáo và tích hợp hệ thống thanh toán.",
      },
    ],
    affordableSimple:
      "Giá cả phải chăng. Đơn giản. Được xây dựng cho các salon quốc tế.",
    startFreeTrial: "Bắt đầu dùng thử miễn phí",
    addOnsTitle: "Tiện ích bổ sung",
    newBooking: "Đặt chỗ mới",
    exampleCustomerName: "Maria Hansen",
    exampleService: "Cắt & tạo kiểu",
    exampleDate: "15 tháng 3, 2:00 PM",
    today: "Hôm nay",
    bookingsCount: "3 đặt chỗ",
    cutService: "Cắt",
    signUpButton: "Tạo tài khoản",
    logInButton: "Đăng nhập",
    addOnsDescription:
      "Xây dựng thiết lập TeqBook phù hợp với salon của bạn. Lý tưởng cho chủ salon quốc tế muốn bắt đầu đơn giản và phát triển an toàn.",
    multilingualBookingTitle: "Trang đặt chỗ đa ngôn ngữ",
    multilingualBookingDescription:
      "$10 / month — Cho phép khách hàng đặt chỗ bằng tiếng Somali, Tigrinya, Urdu, Việt Nam, Ả Rập, Thổ Nhĩ Kỳ và nhiều hơn nữa.",
    extraStaffTitle: "Nhân viên bổ sung",
    extraStaffDescription:
      "$5 / month cho mỗi nhân viên bổ sung — Mở rộng nhóm của bạn mà không có sự tăng giá lớn.",
    faqTitle: "Câu hỏi thường gặp",
    faq: [
      {
        q: "Tôi có cần thanh toán thẻ online không?",
        a: "Không. TeqBook được thiết kế đặc biệt cho thanh toán trực tiếp tại salon. Bạn vẫn có thể ghi chú về thanh toán, nhưng không có giao dịch thẻ online.",
      },
      {
        q: "Tôi có thể quản lý nhiều salon bằng một tài khoản không?",
        a: "Có. TeqBook hỗ trợ nhiều salon cho mỗi chủ, với các luật RLS nghiêm ngặt để dữ liệu không bị lẫn giữa các salon.",
      },
      {
        q: "Còn nhắc nhở SMS và email thì sao?",
        a: "Tính năng này sẽ ra mắt ở Phase 5. Mô hình dữ liệu đã sẵn sàng, nên việc thêm thông báo sau này sẽ rất đơn giản.",
      },
    ],
  },
  zh: {
    brand: "TeqBook",
    heroTitle: "沙龙预约系统——为到店付款而设计",
    heroSubtitle:
      "TeqBook 是专为北欧地区美发和美容沙龙打造的简洁现代预约系统。顾客在线预约，但付款始终在沙龙现场完成。",
    ctaPrimary: "免费开始使用",
    ctaSecondary: "预约演示",
    badge: "为沙龙打造",
    pricingTitle: "为你的沙龙选择合适的 TeqBook 套餐",
    pricingSubtitle: "为各种规模的沙龙打造——先从简单开始，随时都可升级。",
    tiers: [
      {
        id: "starter",
        name: "TeqBook 入门版",
        price: "$25 / month",
        description: "非常适合 1–2 名员工的小型理发店、美发店、美甲或按摩工作室。",
        features: [
          "线上预约与简洁日历视图",
          "客户列表与服务项目管理",
          "无需复杂支付集成，顾客到店付款",
          "来自了解国际沙龙场景团队的 WhatsApp 支持",
          "英文界面 + 1 个额外语言包",
          "按成本价计费的短信提醒",
        ],
      },
      {
        id: "pro",
        name: "TeqBook 专业版",
        price: "$50 / month",
        description: "适合 3–6 名员工的沙龙，希望更好掌控预约并减少爽约情况。",
        features: [
          "包含入门版的全部功能",
          "为员工和顾客提供完整的多语言界面",
          "关于营收、利用率和爽约率的高级报表",
          "自动短信/邮件提醒与通知",
          "支持更多员工与简易排班管理",
          "适合沙龙内零售产品的轻量库存管理",
          "可使用自有 logo 与品牌色的专属预约页面",
        ],
        highlighted: true,
      },
      {
        id: "business",
        name: "TeqBook 商业版",
        price: "$75 / month",
        description:
          "为规模更大、客流更高的沙龙打造，需要更清晰的角色分工与更强报表能力。",
        features: [
          "包含专业版的全部功能",
          "角色与权限控制（拥有者、店长、前台、员工）",
          "更深入的统计数据与导出功能，方便财务与管理报表",
          "完整的客户预约历史记录",
        ],
      },
    ],
    stats: [
      {
        title: "专为到店付款设计",
        body: "所有文案和流程都围绕到店付款进行优化——而不是线上刷卡支付。",
      },
      {
        title: "从第一天起支持多家沙龙",
        body: "一个 TeqBook 登录即可管理多家沙龙，利用 Supabase 的 multi‑tenancy 安全地隔离数据。",
      },
      {
        title: "准备好与你一同成长",
        body: "MVP 基于清晰的路线图构建：通知、报表以及支付系统集成。",
      },
    ],
    affordableSimple: "价格实惠。简单。专为国际沙龙打造。",
    startFreeTrial: "开始免费试用",
    addOnsTitle: "附加功能",
    newBooking: "新预订",
    exampleCustomerName: "Maria Hansen",
    exampleService: "剪发和造型",
    exampleDate: "3月15日，下午2:00",
    today: "今天",
    bookingsCount: "3个预订",
    cutService: "剪发",
    signUpButton: "创建账户",
    logInButton: "登录",
    addOnsDescription:
      "构建适合您沙龙的 TeqBook 设置。适合希望简单开始并安全发展的国际沙龙所有者。",
    multilingualBookingTitle: "多语言预订页面",
    multilingualBookingDescription:
      "$10 / month — 让客户使用索马里语、提格雷语、乌尔都语、越南语、阿拉伯语、土耳其语等语言进行预订。",
    extraStaffTitle: "额外员工",
    extraStaffDescription:
      "$5 / month 每位额外员工 — 在不大幅涨价的情况下扩展您的团队。",
    faqTitle: "常见问题",
    faq: [
      {
        q: "我需要线上刷卡支付功能吗？",
        a: "不需要。TeqBook 专门为到店付款场景设计。你仍然可以在备注中记录付款信息，但系统不会进行任何线上扣款。",
      },
      {
        q: "我可以用一个账号管理多家沙龙吗？",
        a: "可以。TeqBook 支持同一拥有者名下的多家沙龙，并通过严格的 RLS 规则确保数据不会在沙龙之间泄露或混用。",
      },
      {
        q: "短信和邮件提醒怎么办？",
        a: "这会在第 5 阶段上线。数据模型已经为此做好准备，因此后续接入通知会很简单。",
      },
    ],
  },
};
