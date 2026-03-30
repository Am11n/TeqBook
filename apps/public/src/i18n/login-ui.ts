import type { AppLocale } from "./translations";

export type LoginUiMessages = {
  confirmedBanner: string;
  passwordResetBanner: string;
};

const en: LoginUiMessages = {
  confirmedBanner: "Your signup is confirmed. Welcome to TeqBook - you can log in now.",
  passwordResetBanner: "Your password has been reset successfully. You can log in now.",
};

export const loginUiByLocale: Record<AppLocale, LoginUiMessages> = {
  en,
  nb: {
    confirmedBanner: "Du har bekreftet sign up. Velkommen til TeqBook - du kan logge inn nå.",
    passwordResetBanner: "Passordet ditt er oppdatert. Du kan logge inn nå.",
  },
  ar: {
    confirmedBanner: "تم تأكيد تسجيلك. مرحبًا بك في TeqBook — يمكنك تسجيل الدخول الآن.",
    passwordResetBanner: "تم إعادة تعيين كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.",
  },
  so: {
    confirmedBanner: "Diiwaangelintaada waa la xaqiijiyay. Ku soo dhawow TeqBook — hadda waad gali kartaa.",
    passwordResetBanner: "Lambarka sirta waa la cusboonaysiiyay. Hadda waad gali kartaa.",
  },
  ti: {
    confirmedBanner: "መዝገብካ ተረጋጊጹ። ናብ TeqBook እንከይደና — ሕጂ ክትእተወ ትኽእል።",
    passwordResetBanner: "መሕለፊ ቃልካ ተሓዲሱ። ሕጂ ክትእተወ ትኽእል።",
  },
  am: {
    confirmedBanner: "መዝግብዎ ተረጋግጧል። ወደ TeqBook እንኳን ደህና መጡ — አሁን መግባት ይቻላል።",
    passwordResetBanner: "የይለፍ ቃልዎ በተሳካ ሁኔታ ተቀይሯል። አሁን መግባት ይቻላል።",
  },
  tr: {
    confirmedBanner: "Kaydınız onaylandı. TeqBook'a hoş geldiniz — şimdi giriş yapabilirsiniz.",
    passwordResetBanner: "Şifreniz başarıyla sıfırlandı. Şimdi giriş yapabilirsiniz.",
  },
  pl: {
    confirmedBanner: "Twoja rejestracja została potwierdzona. Witamy w TeqBook — możesz się teraz zalogować.",
    passwordResetBanner: "Hasło zostało pomyślnie zresetowane. Możesz się teraz zalogować.",
  },
  vi: {
    confirmedBanner: "Đăng ký của bạn đã được xác nhận. Chào mừng đến với TeqBook — bạn có thể đăng nhập ngay.",
    passwordResetBanner: "Mật khẩu của bạn đã được đặt lại thành công. Bạn có thể đăng nhập ngay.",
  },
  zh: {
    confirmedBanner: "您的注册已确认。欢迎使用 TeqBook — 您现在可以登录。",
    passwordResetBanner: "您的密码已成功重置。您现在可以登录。",
  },
  tl: {
    confirmedBanner: "Nakumpirma na ang signup mo. Maligayang pagdating sa TeqBook — puwede ka nang mag-log in.",
    passwordResetBanner: "Matagumpay na na-reset ang password mo. Puwede ka nang mag-log in.",
  },
  fa: {
    confirmedBanner: "ثبت‌نام شما تأیید شد. به TeqBook خوش آمدید — اکنون می‌توانید وارد شوید.",
    passwordResetBanner: "رمز عبور با موفقیت بازنشانی شد. اکنون می‌توانید وارد شوید.",
  },
  dar: {
    confirmedBanner: "ثبت‌نام شما تأیید شد. به TeqBook خوش آمدید — می‌تواند اکنون وارد شوید.",
    passwordResetBanner: "رمز عبور با موفقیت بازنشانی شد. اکنون می‌توانید وارد شوید.",
  },
  ur: {
    confirmedBanner: "آپ کا سائن اپ تصدیق ہو گیا۔ TeqBook میں خوش آمدید — اب آپ لاگ اِن کر سکتے ہیں۔",
    passwordResetBanner: "پاس ورڈ کامیابی سے دوبارہ سیٹ ہو گیا۔ اب آپ لاگ اِن کر سکتے ہیں۔",
  },
  hi: {
    confirmedBanner: "आपका साइनअप कन्फर्म हो गया। TeqBook में आपका स्वागत है — अब आप लॉग इन कर सकते हैं।",
    passwordResetBanner: "आपका पासवर्ड सफलतापूर्वक रीसेट हो गया। अब आप लॉग इन कर सकते हैं।",
  },
};
