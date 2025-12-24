"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signInWithPassword } from "@/lib/services/auth-service";
import { getProfileForUser } from "@/lib/services/profiles-service";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import { motion } from "framer-motion";
import {
  recordFailedAttempt,
  clearRateLimit,
  isRateLimited,
  formatTimeRemaining,
  getTimeUntilReset,
} from "@/lib/services/rate-limit-service";
import { initSession } from "@/lib/services/session-service";
import { logSecurity, logError } from "@/lib/services/logger";

// Rate limit configuration (matches rate-limit-service.ts)
const MAX_LOGIN_ATTEMPTS = 5;

export default function LoginPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const appLocale =
    locale === "nb"
      ? "nb"
      : locale === "ar"
        ? "ar"
        : locale === "so"
          ? "so"
          : locale === "ti"
            ? "ti"
            : locale === "am"
              ? "am"
              : locale === "tr"
                ? "tr"
                : locale === "pl"
                  ? "pl"
                  : locale === "vi"
                    ? "vi"
                    : locale === "zh"
                      ? "zh"
                      : locale === "tl"
                        ? "tl"
                        : locale === "fa"
                          ? "fa"
                          : locale === "dar"
                            ? "dar"
                            : locale === "ur"
                              ? "ur"
                              : locale === "hi"
                                ? "hi"
                                : "en";
  const t = translations[appLocale].login;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    limited: boolean;
    remainingAttempts: number;
    resetTime: number | null;
  } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    // Check rate limiting before attempting login
    if (email) {
      const rateLimitCheck = isRateLimited(email);
      setRateLimitInfo(rateLimitCheck);

      if (rateLimitCheck.limited) {
        const timeRemaining = getTimeUntilReset(rateLimitCheck.resetTime);
        setError(
          `Too many failed login attempts. Please try again in ${formatTimeRemaining(timeRemaining)}.`
        );
        setStatus("error");
        return;
      }
    }

    // Sign in using auth service
    const { data: signInData, error: signInError } = await signInWithPassword(
      email,
      password,
    );

    // Check if 2FA is required
    if (signInData?.requiresMFA && signInData.factorId) {
      // Redirect to 2FA page
      router.push(`/login-2fa?factorId=${signInData.factorId}`);
      return;
    }

    if (signInError) {
      // Record failed attempt
      if (email) {
        const rateLimitResult = recordFailedAttempt(email);
        setRateLimitInfo({
          limited: rateLimitResult.blocked,
          remainingAttempts: rateLimitResult.remainingAttempts,
          resetTime: rateLimitResult.resetTime,
        });

        if (rateLimitResult.blocked) {
          const timeRemaining = getTimeUntilReset(rateLimitResult.resetTime);
          setError(
            `Too many failed login attempts. Your account has been temporarily blocked. Please try again in ${formatTimeRemaining(timeRemaining)}.`
          );
          setStatus("error");
          return;
        }

        if (rateLimitResult.remainingAttempts < MAX_LOGIN_ATTEMPTS) {
          // Show warning about remaining attempts
          const timeRemaining = getTimeUntilReset(rateLimitResult.resetTime);
          let errorMessage = signInError;
          
          if (signInError.includes("Invalid login credentials")) {
            errorMessage = `Invalid email or password. ${rateLimitResult.remainingAttempts} attempt${rateLimitResult.remainingAttempts !== 1 ? "s" : ""} remaining.`;
          } else if (signInError.includes("Email not confirmed")) {
            errorMessage = "Please confirm your email address before logging in. Check your inbox for a confirmation email.";
          } else if (signInError.includes("User not found")) {
            errorMessage = "No account found with this email address.";
          }
          
          setError(errorMessage);
          setStatus("error");
          console.error("Login error:", signInError);
          return;
        }
      }

      // Provide more specific error messages
      let errorMessage = signInError;
      
      if (signInError.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password. Please check your credentials.";
      } else if (signInError.includes("Email not confirmed")) {
        errorMessage = "Please confirm your email address before logging in. Check your inbox for a confirmation email.";
      } else if (signInError.includes("User not found")) {
        errorMessage = "No account found with this email address.";
      }
      
      setError(errorMessage);
      setStatus("error");
      logSecurity("Failed login attempt", { email, error: signInError });
      logError("Login error", new Error(signInError), { email });
      return;
    }

    if (!signInData?.user) {
      // Record failed attempt
      if (email) {
        recordFailedAttempt(email);
      }
      setError("Login failed. Please try again.");
      setStatus("error");
      return;
    }

    // Check if 2FA is required (before clearing rate limit)
    if (signInData.requiresMFA && signInData.factorId) {
      // Redirect to 2FA page
      router.push(`/login-2fa?factorId=${signInData.factorId}`);
      return;
    }

    // Clear rate limit on successful login
    if (email) {
      clearRateLimit(email);
      setRateLimitInfo(null);
    }

    // Initialize session tracking
    initSession(keepLoggedIn);

    // Log successful login
    logSecurity("Successful login", { email, userId: signInData.user.id });

    // Get user profile using profiles service
    const { data: profile, error: profileError } = await getProfileForUser(
      signInData.user.id
    );

    if (profileError) {
      setError("Could not load user profile.");
      setStatus("error");
      return;
    }

    if (!profile) {
      // No profile found, redirect to onboarding
      router.push("/onboarding");
      return;
    }

    // If user is superadmin, redirect to admin dashboard
    if (profile.is_superadmin) {
      router.push("/admin");
      return;
    }

    // If user has a salon, redirect to dashboard
    if (profile.salon_id) {
      router.push("/dashboard");
      return;
    }

    // No salon and not superadmin, redirect to onboarding
    router.push("/onboarding");
  }

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4 py-6 sm:py-10 md:py-12">
      <div className="relative w-full max-w-6xl overflow-hidden rounded-[32px] bg-gradient-to-br from-blue-100 via-blue-50 to-slate-50 shadow-[0_40px_120px_rgba(15,23,42,0.25)]">
        {/* Bakgrunns-sirkler */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-blue-200/30 blur-3xl" />

        <div className="relative grid gap-10 p-6 md:p-10 lg:grid-cols-[1.1fr_1.1fr] lg:p-12">
          {/* Venstre side: Brand / pitch */}
          <div className="flex flex-col justify-center">
            <Link href="/" className="flex items-center gap-3 mb-8 hover:opacity-80 transition-opacity">
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
            </Link>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight text-slate-900">
              {t.welcomeBackTitle.includes("TeqBook") ? (
                <>
                  {t.welcomeBackTitle.split("TeqBook")[0]}
                  <span className="text-blue-700">TeqBook</span>
                  {t.welcomeBackTitle.split("TeqBook")[1] || ""}
                </>
              ) : (
                <>
                  {t.welcomeBackTitle.split(" ").slice(0, -1).join(" ")}{" "}
                  <span className="text-blue-700">TeqBook</span>
                </>
              )}
            </h1>

            <p className="mt-4 max-w-xl text-sm sm:text-base text-slate-600">
              {t.welcomeBackDescription}
            </p>

            <ul className="mt-6 space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-blue-600" />
                <span>{t.bullet1}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-blue-600" />
                <span>{t.bullet2}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-blue-600" />
                <span>{t.bullet3}</span>
              </li>
            </ul>

            <p className="mt-8 text-xs text-slate-500">
              {t.trustLine}
            </p>
          </div>

          {/* Høyre side: Login card */}
          <div className="flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full max-w-md rounded-3xl bg-white/90 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.18)] backdrop-blur-sm border border-slate-100"
            >
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900">
                  {t.title}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {t.formSubtitle}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-slate-800"
                  >
                    {t.emailLabel}
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    className="w-full rounded-xl border border-slate-200/60 bg-blue-50/80 backdrop-blur-md px-3.5 py-2.5 text-sm text-slate-900 outline-none ring-0 transition focus:border-blue-600 focus:bg-white/90 focus:ring-2 focus:ring-blue-600/30"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-slate-800"
                  >
                    {t.passwordLabel}
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t.passwordPlaceholder}
                      className="w-full rounded-xl border border-slate-200/60 bg-blue-50/80 backdrop-blur-md px-3.5 py-2.5 pr-10 text-sm text-slate-900 outline-none ring-0 transition focus:border-blue-600 focus:bg-white/90 focus:ring-2 focus:ring-blue-600/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-medium text-slate-600 hover:text-slate-900 transition-all hover:bg-slate-100/50 rounded-lg px-2 py-1 -mr-1"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <p className="text-sm text-red-500" aria-live="polite">
                    {error}
                  </p>
                )}

                {/* Options row */}
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={keepLoggedIn}
                      onChange={(e) => setKeepLoggedIn(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-600/40"
                    />
                    <span>{t.keepMeLoggedIn}</span>
                  </label>
                  <Link
                    href="#"
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {t.forgotPassword}
                  </Link>
                </div>

                {/* Button */}
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.75 text-sm font-medium text-white shadow-[0_16px_40px_rgba(15,23,42,0.45)] transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {status === "loading" ? t.loggingIn : t.loginButton}
                </button>
              </form>

              {/* Bottom text */}
              <div className="mt-4 text-center text-xs text-slate-600">
                {t.dontHaveAccount}{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-blue-600 hover:underline"
                >
                  {t.createOne}
                </Link>
              </div>

              <p className="mt-4 text-[11px] text-center text-slate-400">
                {t.secureLoginLine}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
