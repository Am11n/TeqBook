"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FAVICON_PATH } from "@/lib/constants";
import { signInWithPassword } from "@/lib/services/auth-service";
import { getProfileForUser } from "@/lib/services/profiles-service";
import { initSession } from "@/lib/services/session-service";
import { logSecurity, logError } from "@/lib/services/logger";
import { Shield } from "lucide-react";
import dynamic from "next/dynamic";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import type { AppLocale } from "@/i18n/translations";
import { useAdminConsoleMessages } from "@/i18n/use-admin-console-messages";
import { useDocumentLangDir } from "@/i18n/use-document-lang-dir";

const MotionDiv = dynamic(
  () => import("framer-motion").then((mod) => mod.motion.div),
  { ssr: false }
);

export default function AdminLoginPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale) as AppLocale;
  useDocumentLangDir(appLocale);
  const t = useAdminConsoleMessages();
  const L = t.adminLogin;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    const { data: signInData, error: signInError } = await signInWithPassword(
      email,
      password
    );

    if (signInError) {
      let errorMessage = signInError;

      if (signInError.includes("Invalid login credentials")) {
        errorMessage = L.errInvalidCredentials;
      } else if (signInError.includes("Email not confirmed")) {
        errorMessage = L.errEmailNotConfirmed;
      }

      setError(errorMessage);
      setStatus("error");
      logSecurity("Failed admin login attempt", { email, error: signInError });
      logError("Admin login error", new Error(signInError), { email });
      return;
    }

    if (!signInData?.user) {
      setError(L.errGenericSignIn);
      setStatus("error");
      return;
    }

    initSession(false);

    const { data: profile, error: profileError } = await getProfileForUser(
      signInData.user.id
    );

    if (profileError) {
      setError(L.errProfileLoad);
      setStatus("error");
      return;
    }

    if (!profile) {
      setError(L.errNoProfile);
      setStatus("error");
      return;
    }

    if (!profile.is_superadmin) {
      setError(L.errNotSuperAdmin);
      setStatus("error");
      logSecurity("Non-superadmin attempted admin login", { email, userId: signInData.user.id });
      return;
    }

    logSecurity("Successful admin login", { email, userId: signInData.user.id });

    router.push("/");
  }

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4 py-6 sm:py-10 md:py-12">
      <div className="relative w-full max-w-6xl overflow-hidden rounded-[32px] bg-gradient-to-br from-blue-100 via-blue-50 to-slate-50 shadow-[0_40px_120px_rgba(15,23,42,0.25)]">
        <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-blue-200/30 blur-3xl" />

        <div className="relative grid gap-10 p-6 md:p-10 lg:grid-cols-[1.1fr_1.1fr] lg:p-12">
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-8">
              <Image
                src={FAVICON_PATH}
                alt={L.logoAlt}
                width={40}
                height={40}
                className="drop-shadow-[0_2px_8px_rgba(15,23,42,0.15)]"
              />
              <span className="text-xl font-semibold tracking-tight text-slate-900">
                {L.brandName}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                <Shield className="h-3 w-3" />
                {L.adminBadge}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight text-slate-900">
              {L.heroTitlePrefix}{" "}
              <span className="text-blue-700">{L.heroTitleHighlight}</span>
            </h1>

            <p className="mt-4 max-w-xl text-sm sm:text-base text-slate-600">
              {L.heroDescription}
            </p>

            <ul className="mt-6 space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-blue-600" />
                <span>{L.bulletSalons}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-blue-600" />
                <span>{L.bulletUsers}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-blue-600" />
                <span>{L.bulletAnalytics}</span>
              </li>
            </ul>

            <p className="mt-8 text-xs text-slate-500">{L.trustFootnote}</p>
          </div>

          <div className="flex items-center justify-center">
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full max-w-md rounded-3xl bg-white/90 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.18)] backdrop-blur-sm border border-slate-100"
            >
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  {L.cardTitle}
                  <Shield className="h-5 w-5 text-amber-500" />
                </h2>
                <p className="mt-1 text-sm text-slate-600">{L.cardSubtitle}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-slate-800">
                    {L.emailLabel}
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={L.emailPlaceholder}
                    className="w-full rounded-xl border border-slate-200/60 bg-blue-50/80 backdrop-blur-md px-3.5 py-2.5 text-sm text-slate-900 outline-none ring-0 transition focus:border-blue-600 focus:bg-white/90 focus:ring-2 focus:ring-blue-600/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-sm font-medium text-slate-800">
                    {L.passwordLabel}
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={L.passwordPlaceholder}
                      className="w-full rounded-xl border border-slate-200/60 bg-blue-50/80 backdrop-blur-md px-3.5 py-2.5 pr-10 text-sm text-slate-900 outline-none ring-0 transition focus:border-blue-600 focus:bg-white/90 focus:ring-2 focus:ring-blue-600/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-medium text-slate-600 hover:text-slate-900 transition-all hover:bg-slate-100/50 rounded-lg px-2 py-1 -mr-1"
                    >
                      {showPassword ? L.hidePassword : L.showPassword}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-500" aria-live="polite">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-[0_16px_40px_rgba(15,23,42,0.45)] transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {status === "loading" ? L.submitLoading : L.submitIdle}
                </button>
              </form>

              <p className="mt-4 text-[11px] text-center text-slate-400">{L.cardFooter}</p>
            </MotionDiv>
          </div>
        </div>
      </div>
    </div>
  );
}
