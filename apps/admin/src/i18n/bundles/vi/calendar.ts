import type { TranslationNamespaces } from "../../types/namespaces";

export const calendar: TranslationNamespaces["calendar"] = {

    title: "Lịch",
    description:
      "Lịch nội bộ đơn giản theo ngày và theo nhân viên. Đây sẽ là nền tảng cho chế độ kéo‑thả và các view nâng cao hơn.",
    mustBeLoggedIn: "Bạn cần đăng nhập để xem lịch.",
    noSalon:
      "Tài khoản của bạn chưa được gắn với salon nào. Hãy hoàn tất onboarding trước.",
    loadError: "Không tải được dữ liệu lịch.",
    selectedDayLabel: "Ngày đã chọn:",
    viewDay: "Day view",
    viewWeek: "Week view",
    filterEmployeeLabel: "Filter by employee",
    filterEmployeeAll: "All employees",    prev: "Trước",
    today: "Hôm nay",
    next: "Tiếp",
    loading: "Đang tải dữ liệu lịch…",
    noEmployeesTitle: "Chưa có nhân viên",
    noEmployeesDescription:
      "Hãy thêm nhân viên trước, sau đó họ sẽ xuất hiện trong lịch.",
    noBookingsTitle: "Không có đặt lịch trong ngày này",
    noBookingsDescription:
      "Chọn ngày khác hoặc tạo đặt lịch mới.",
    unknownService: "Dịch vụ không rõ",
    unknownCustomer: "Khách vãng lai / không xác định",
};
