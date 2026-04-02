import type { TranslationNamespaces } from "../../types/namespaces";

export const login: TranslationNamespaces["login"] = {

    title: "登录 TeqBook",
    description:
      "本地开发环境：在 Supabase 中创建带邮箱和密码的用户，然后在此处登录，无需邮箱验证。",
    emailLabel: "邮箱",
    emailPlaceholder: "you@salon.com",
    passwordLabel: "密码",
    passwordPlaceholder: "至少 6 个字符",
    loginError: "登录失败。",
    loggingIn: "正在登录…",
    loginButton: "登录",
    tip: "提示：在 Supabase 中的 Auth > Authentication > Email 可以暂时关闭邮箱验证，方便新用户立即登录。",
    welcomeBackTitle: "欢迎回到 TeqBook",
    welcomeBackDescription: "简单的沙龙软件，让您的日历、客户和员工保持同步。",
    bullet1: "为常客提供快速预订和重新预订",
    bullet2: "适用于单店和多店沙龙",
    bullet3: "专为沙龙内支付业务而建",
    trustLine: "受到需要日常顺畅运行的繁忙沙龙的信任。",
    formSubtitle: "使用您的 TeqBook 账户访问沙龙仪表板。",
    forgotPassword: "忘记密码？",
    keepMeLoggedIn: "保持登录状态",
    dontHaveAccount: "没有账户？",
    createOne: "创建一个",
    secureLoginLine: "安全登录。您的密码永远不会以明文形式存储。",
};
