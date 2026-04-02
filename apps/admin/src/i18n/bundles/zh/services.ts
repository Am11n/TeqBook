import type { TranslationNamespaces } from "../../types/namespaces";

export const services: TranslationNamespaces["services"] = {

    title: "服务",
    description:
      "定义服务、时长和价格，用于预约引擎。",
    mustBeLoggedIn: "你需要登录才能查看服务列表。",
    noSalon:
      "你的账号目前还没有关联到任何沙龙. 请先完成 onboarding.",
    addError: "添加服务失败。",
    updateError: "更新服务失败。",
    newService: "新服务",
    nameLabel: "名称",
    namePlaceholder: "例如：女士剪发",
    categoryLabel: "类别",
    categoryCut: "剪发",
    categoryBeard: "修胡",
    categoryColor: "染发",
    categoryNails: "美甲",
    categoryMassage: "按摩",
    categoryOther: "其他",
    durationLabel: "时长（分钟）",
    priceLabel: "价格（NOK）",
    sortOrderLabel: "排序顺序",
    loading: "正在加载服务…",
    emptyTitle: "尚未添加任何服务",
    emptyDescription:
      "请在左侧表单中添加服务。它们将用于计算预约时长和价格。",
    tableTitle: "你的服务",
    colName: "Name",
    colCategory: "Category",
    colDuration: "时长",
    colPrice: "价格",
    colStatus: "状态",
    colActions: "操作",
    active: "启用",
    inactive: "停用",
    delete: "删除",
};
