"use client";

import { FormEvent, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { createBrowserSupabaseClient } from "@teqbook/shared";
import { getProfileForUser } from "@/lib/services/profiles-service";
import { initSession } from "@/lib/services/session-service";
import { logSecurity, logError } from "@/lib/services/logger";
import { Shield } from "lucide-react";
import dynamic from "next/dynamic";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { getPublicPageTranslations } from "@/i18n/public-pages";

const MotionDiv = dynamic(
  () => import("framer-motion").then((mod) => mod.motion.div),
  { ssr: false },
);

/** Cookie name must match apps/admin/src/lib/supabase/client.ts */
const ADMIN_COOKIE_NAME = "sb-admin-auth-token";

export default function AdminLoginPage() {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = getPublicPageTranslations(appLocale).adminLogin;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  // Create a Supabase client that stores the session in the admin cookie
  // so the admin app on :3003 can read it
  const adminSupabase = useRef(createBrowserSupabaseClient(ADMIN_COOKIE_NAME));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    if (!email || !password) {
      setError(t.missingCredentials);
      setStatus("error");
      return;
    }

    try {
      // Sign in using the admin-specific Supabase client
      const { data, error: signInError } =
        await adminSupabase.current.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) {
        let errorMessage = signInError.message;

        if (signInError.message.includes("Invalid login credentials")) {
          errorMessage = t.invalidCredentials;
        } else if (signInError.message.includes("Email not confirmed")) {
          errorMessage = t.confirmEmail;
        }

        setError(errorMessage);
        setStatus("error");
        logSecurity("Failed admin login attempt", {
          email,
          error: signInError.message,
        });
        logError("Admin login error", new Error(signInError.message), {
          email,
        });
        return;
      }

      if (!data?.user) {
        setError(t.loginFailed);
        setStatus("error");
        return;
      }

      // Initialize session tracking
      initSession(false);

      // Get user profile
      const { data: profile, error: profileError } = await getProfileForUser(
        data.user.id,
      );

      if (profileError) {
        setError(t.profileLoadFailed);
        setStatus("error");
        return;
      }

      if (!profile) {
        setError(t.profileMissing);
        setStatus("error");
        return;
      }

      // Check if user is superadmin
      if (!profile.is_superadmin) {
        setError(
          t.notSuperAdmin,
        );
        setStatus("error");
        logSecurity("Non-superadmin attempted admin login", {
          email,
          userId: data.user.id,
        });
        return;
      }

      // Log successful admin login
      logSecurity("Successful admin login", {
        email,
        userId: data.user.id,
      });

      // Full page navigation to admin dashboard (must bypass client-side router
      // because /admin/ is served via a server-level rewrite to the admin app)
      window.location.href = "/admin/";
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t.unknownError,
      );
      setStatus("error");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-50 px-4 py-6 sm:py-10 md:py-12">
      <div className="relative w-full max-w-6xl overflow-hidden rounded-[32px] bg-gradient-to-br from-blue-100 via-blue-50 to-slate-50 shadow-[0_40px_120px_rgba(15,23,42,0.25)]">
        {/* Bakgrunns-sirkler */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-blue-200/30 blur-3xl" />

        <div className="relative grid gap-10 p-6 md:p-10 lg:grid-cols-[1.1fr_1.1fr] lg:p-12">
          {/* Venstre side: Brand / pitch */}
          <div className="flex flex-col justify-center">
            <Link
              href="/"
              className="mb-8 flex items-center gap-3 transition-opacity hover:opacity-80"
            >
              <Image
                src="/Favikon.svg"
                alt="TeqBook logo"
                width={40}
                height={40}
                className="drop-shadow-[0_2px_8px_rgba(15,23,42,0.15)]"
              />
              <span className="text-xl font-semibold tracking-tight text-slate-900">
                TeqBook
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                <Shield className="h-3 w-3" />
                Admin
              </span>
            </Link>

            <h1 className="text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
              {t.heading.split("Admin Panel")[0]}
              <span className="text-blue-700">Admin Panel</span>
              {t.heading.split("Admin Panel")[1] ?? ""}
            </h1>

            <p className="mt-4 max-w-xl text-sm text-slate-600 sm:text-base">
              {t.subtitle}
            </p>

            <ul className="mt-6 space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-blue-600" />
                <span>{t.bulletSalons}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-blue-600" />
                <span>{t.bulletUsers}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-blue-600" />
                <span>{t.bulletReports}</span>
              </li>
            </ul>

            <p className="mt-8 text-xs text-slate-500">
              {t.secureLine}
            </p>
          </div>

          {/* Høyre side: Login card */}
          <div className="flex items-center justify-center">
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full max-w-md rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.18)] backdrop-blur-sm"
            >
              <div className="mb-6">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
                  {t.cardTitle}
                  <Shield className="h-5 w-5 text-amber-500" />
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {t.cardSubtitle}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="admin-email"
                    className="text-sm font-medium text-slate-800"
                  >
                    {t.emailLabel}
                  </label>
                  <input
                    id="admin-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@teqbook.com"
                    className="w-full rounded-xl border border-slate-200/60 bg-blue-50/80 px-3.5 py-2.5 text-sm text-slate-900 outline-none ring-0 backdrop-blur-md transition focus:border-blue-600 focus:bg-white/90 focus:ring-2 focus:ring-blue-600/30"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="admin-password"
                    className="text-sm font-medium text-slate-800"
                  >
                    {t.passwordLabel}
                  </label>
                  <div className="relative">
                    <input
                      id="admin-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-200/60 bg-blue-50/80 px-3.5 py-2.5 pr-10 text-sm text-slate-900 outline-none ring-0 backdrop-blur-md transition focus:border-blue-600 focus:bg-white/90 focus:ring-2 focus:ring-blue-600/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="-mr-1 absolute inset-y-0 right-0 flex items-center rounded-lg px-2 py-1 pr-3 text-xs font-medium text-slate-600 transition-all hover:bg-slate-100/50 hover:text-slate-900"
                    >
                      {showPassword ? t.hide : t.show}
                    </button>
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <p className="text-sm text-red-500" aria-live="polite">
                    {error}
                  </p>
                )}

                {/* Button */}
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-[0_16px_40px_rgba(15,23,42,0.45)] transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {status === "loading"
                    ? t.submitting
                    : t.submit}
                </button>
              </form>

              <p className="mt-4 text-center text-[11px] text-slate-400">
                {t.secureFooter}
              </p>
            </MotionDiv>
          </div>
        </div>
      </div>
    </div>
  );
}
