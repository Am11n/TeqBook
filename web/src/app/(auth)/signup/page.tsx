"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase-client";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import { Eye, EyeOff } from "lucide-react";

export default function SignUpPage() {
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
  const signupT = translations[appLocale].signup;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    if (password !== confirmPassword) {
      setError(signupT.passwordMismatch);
      setStatus("error");
      return;
    }

    if (password.length < 6) {
      setError(
        appLocale === "nb"
          ? "Passordet må være minst 6 tegn"
          : "Password must be at least 6 characters"
      );
      setStatus("error");
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError || !data?.user) {
      setError(signUpError?.message ?? signupT.signupError);
      setStatus("error");
      return;
    }

    // Redirect to onboarding after successful signup
    router.push("/onboarding");
  }

  return (
    <div className="min-h-screen bg-[#EEF3FF]">
      {/* Background gradient layers */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-300/10 blur-3xl" />
      </div>

      {/* Watermark */}
      <div className="pointer-events-none fixed inset-0 -z-0 flex items-center justify-center">
        <Image
          src="Favikon.svg"
          alt=""
          width={800}
          height={800}
          className="h-[800px] w-[800px] opacity-[0.03] blur-[1.5px]"
          aria-hidden="true"
        />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-5xl items-center px-4 py-12 md:px-6">
        {/* Left side - Branding */}
        <div className="relative hidden flex-1 flex-col pr-10 md:flex">
          <div className="mb-8 flex items-center gap-3">
            <Image
              src="Favikon.svg"
              alt="TeqBook"
              width={120}
              height={32}
              className="h-8 w-auto"
              priority
            />
            <span className="text-2xl font-semibold tracking-tight text-slate-900">
              TeqBook
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-slate-900">
            {signupT.createAccountTitle}
          </h1>
          <p className="mt-3 max-w-md text-sm text-slate-600">
            {signupT.createAccountDescription}
          </p>
          <ul className="mt-6 space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-slate-400">•</span>
              <span>{signupT.bullet1}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-slate-400">•</span>
              <span>{signupT.bullet2}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-slate-400">•</span>
              <span>{signupT.bullet3}</span>
            </li>
          </ul>
        </div>

        {/* Right side - Form */}
        <div className="relative w-full flex-1 md:max-w-md">
          <div className="mx-auto w-full rounded-3xl border border-slate-100 bg-white/90 p-8 shadow-xl shadow-sky-900/5">
            <h2 className="text-xl font-semibold text-slate-900">{signupT.title}</h2>
            <p className="mt-1 text-sm text-slate-600">
              {signupT.formSubtitle}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="text-xs font-medium text-slate-700"
                >
                  {t.emailLabel}
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm outline-none ring-0 transition-colors focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200"
                  placeholder={t.emailPlaceholder}
                />
              </div>

              {/* Password with show/hide */}
              <div>
                <label
                  htmlFor="password"
                  className="text-xs font-medium text-slate-700"
                >
                  {t.passwordLabel}
                </label>
                <div className="mt-1 flex items-center rounded-xl border border-slate-200 bg-slate-50/80 transition-colors focus-within:border-sky-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-200">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl bg-transparent px-3 py-2 text-sm outline-none"
                    placeholder={t.passwordPlaceholder}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="pr-3 text-xs font-medium text-slate-500 transition-colors hover:text-slate-800"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password with show/hide */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="text-xs font-medium text-slate-700"
                >
                  {signupT.confirmPasswordLabel}
                </label>
                <div className="mt-1 flex items-center rounded-xl border border-slate-200 bg-slate-50/80 transition-colors focus-within:border-sky-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-200">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl bg-transparent px-3 py-2 text-sm outline-none"
                    placeholder={signupT.confirmPasswordPlaceholder}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="pr-3 text-xs font-medium text-slate-500 transition-colors hover:text-slate-800"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <p className="text-sm text-red-500" aria-live="polite">
                  {error}
                </p>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={status === "loading"}
                className="mt-2 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {status === "loading" ? signupT.signingUp : signupT.signupButton}
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-slate-500">
              {signupT.alreadyHaveAccount}{" "}
              <Link
                href="/login"
                className="font-medium text-slate-900 hover:underline"
              >
                {signupT.loginLink}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
