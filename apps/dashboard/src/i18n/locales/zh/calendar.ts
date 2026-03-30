import type { TranslationNamespaces } from '../../types';

export const calendar: TranslationNamespaces['calendar'] = {
    title: "日历",
    description:
      "按天和员工查看的简单内部日历，是拖拽排班和高级视图的基础。",
    mustBeLoggedIn: "你需要登录才能查看日历。",
    noSalon:
      "你的账号目前还没有关联到任何沙龙。请先完成 onboarding。",
    loadError: "加载日历数据失败。",
    selectedDayLabel: "已选择日期：",
    viewDay: "Day view",
    viewWeek: "Week view",
    filterEmployeeLabel: "Filter by employee",
    filterEmployeeAll: "All employees",    prev: "上一天",
    today: "今天",
    next: "下一天",
    loading: "正在加载日历数据…",
    noEmployeesTitle: "尚未添加员工",
    noEmployeesDescription: "请先添加员工，他们才会出现在日历中。",
    noBookingsTitle: "当天暂无预约",
    noBookingsDescription: "选择其他日期或创建新的预约。",
    unknownService: "未知服务",
    unknownCustomer: "路客 / 未知客户",
  };
