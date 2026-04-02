import type { TranslationNamespaces } from "../../types/namespaces";

export const shifts: TranslationNamespaces["shifts"] = {

    title: "班次与营业时间",
    description:
      "为每位员工定义固定的工作时间，用于计算可用预约时间。",
    mustBeLoggedIn: "你需要登录才能查看班次。",
    noSalon:
      "你的账号目前还没有关联到任何沙龙。请先完成 onboarding。",
    loadError: "加载班次失败。",
    addError: "添加班次失败。",
    newShift: "新班次",
    employeeLabel: "员工",
    employeePlaceholder: "选择员工…",
    weekdayLabel: "星期",
    startLabel: "开始时间",
    endLabel: "结束时间",
    saving: "正在保存…",
    addButton: "添加班次",
    needEmployeeHint: "在添加班次前，你需要至少有一名员工。",
    tableTitle: "你的班次",
    loading: "正在加载班次…",
    emptyTitle: "尚未添加任何班次",
    emptyDescription:
      "当你在左侧表单中添加班次后，它们会出现在这里，并用于计算可用时间。",
    mobileUnknownEmployee: "未知员工",
    desktopUnknownEmployee: "未知员工",
    colEmployee: "员工",
    colDay: "星期",
    colTime: "时间",
    colActions: "操作",
    delete: "删除",
};
