import type { TranslationNamespaces } from "../../types/namespaces";

export const customers: TranslationNamespaces["customers"] = {

    title: "客户",
    description:
      "适用于你的沙龙的简单客户列表，与预约记录配合使用。",
    mustBeLoggedIn: "你需要登录才能查看客户列表。",
    noSalon:
      "你的账号目前还没有关联到任何沙龙。请先完成 onboarding。",
    loadError: "加载客户失败。",
    addError: "添加客户失败。",
    newCustomer: "新客户",
    nameLabel: "姓名",
    namePlaceholder: "例如：张三",
    emailLabel: "邮箱（可选）",
    emailPlaceholder: "customer@example.com",
    phonePlaceholder: "+47 99 99 99 99",
    phoneLabel: "电话（可选）",
    notesLabel: "备注（可选）",
    notesPlaceholder: "例如：常用发型师、过敏情况、喜好等。",
    gdprLabel: "我已获得该客户的同意，可存储其数据并与其联系（GDPR）。",
    saving: "正在保存…",
    addButton: "添加客户",
    tableTitle: "你的客户",
    loading: "正在加载客户…",
    emptyTitle: "尚未添加任何客户",
    emptyDescription:
      "当你在左侧表单中添加客户后，他们会出现在这里，并可与预约记录关联。",
    mobileConsentYes: "已同意",
    mobileConsentNo: "未同意",
    delete: "删除",
    colName: "Name",
    colContact: "Contact",
    colNotes: "备注",
    colGdpr: "GDPR",
    colActions: "操作",
    consentYes: "是",
    consentNo: "否",
};
