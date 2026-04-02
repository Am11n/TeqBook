import type { TranslationNamespaces } from "../../types/namespaces";

export const shifts: TranslationNamespaces["shifts"] = {

    title: "Ca làm và giờ mở cửa",
    description:
      "Định nghĩa giờ làm cố định cho từng nhân viên. Dùng để tính giờ trống.",
    mustBeLoggedIn: "Bạn cần đăng nhập để xem ca làm.",
    noSalon:
      "Tài khoản của bạn chưa được gắn với salon nào. Hãy hoàn tất onboarding trước.",
    loadError: "Không tải được ca làm.",
    addError: "Không thêm được ca làm.",
    newShift: "Ca làm mới",
    employeeLabel: "Nhân viên",
    employeePlaceholder: "Chọn nhân viên…",
    weekdayLabel: "Thứ trong tuần",
    startLabel: "Bắt đầu",
    endLabel: "Kết thúc",
    saving: "Đang lưu…",
    addButton: "Thêm ca làm",
    needEmployeeHint:
      "Bạn cần có ít nhất một nhân viên trước khi thêm ca làm.",
    tableTitle: "Các ca làm của bạn",
    loading: "Đang tải ca làm…",
    emptyTitle: "Chưa thêm ca làm nào",
    emptyDescription:
      "Khi bạn thêm ca làm ở form bên trái, chúng sẽ xuất hiện ở đây và được dùng để tính giờ trống.",
    mobileUnknownEmployee: "Nhân viên không rõ",
    desktopUnknownEmployee: "Nhân viên không rõ",
    colEmployee: "Nhân viên",
    colDay: "Ngày",
    colTime: "Giờ",
    colActions: "Hành động",
    delete: "Xóa",
};
