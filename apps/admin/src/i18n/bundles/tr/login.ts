import type { TranslationNamespaces } from "../../types/namespaces";

export const login: TranslationNamespaces["login"] = {

    title: "TeqBook’a giriş yap",
    description:
      "Yerel geliştirme için: Supabase dashboard’da e-posta ve şifreyle bir kullanıcı oluştur, ardından burada e-posta doğrulaması olmadan giriş yap.",
    emailLabel: "E-posta",
    emailPlaceholder: "you@salon.com",
    passwordLabel: "Şifre",
    passwordPlaceholder: "En az 6 karakter",
    loginError: "Giriş yapılamadı.",
    loggingIn: "Giriş yapılıyor...",
    loginButton: "Giriş yap",
    tip: "İpucu: Supabase içinde, yeni kullanıcıların doğrudan giriş yapabilmesi için Auth > Authentication > Email altında e-posta doğrulamayı geçici olarak kapatabilirsin.",
    welcomeBackTitle: "TeqBook'a tekrar hoş geldiniz",
    welcomeBackDescription: "Takviminizi, müşterilerinizi ve personelinizi senkronize tutan basit salon yazılımı.",
    bullet1: "Düzenli müşteriler için hızlı rezervasyon ve yeniden rezervasyon",
    bullet2: "Tek ve çoklu konumlu salonlar için çalışır",
    bullet3: "Salon içi ödeme işletmeleri için inşa edilmiştir",
    trustLine: "Günlerinin sadece çalışması gereken meşgul salonlar tarafından güvenilir.",
    formSubtitle: "Salon panonuzu erişmek için TeqBook hesabınızı kullanın.",
    forgotPassword: "Şifrenizi mi unuttunuz?",
    keepMeLoggedIn: "Beni oturum açık tut",
    dontHaveAccount: "Hesabınız yok mu?",
    createOne: "Bir tane oluşturun",
    secureLoginLine: "Güvenli giriş. Şifreniz asla düz metin olarak saklanmaz.",
};
