"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signUp } from "@/lib/services/auth-service";
import { updateProfile } from "@/lib/services/profiles-service";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";
// Lazy load framer-motion for better initial load performance
import dynamic from "next/dynamic";
const MotionDiv = dynamic(
  () => import("framer-motion").then((mod) => mod.motion.div),
  { ssr: false }
);

export default function SignUpPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale].login;
  const signupT = translations[appLocale].signup;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    // Validation
    if (!firstName.trim()) {
      setError(
        appLocale === "nb"
          ? "Fornavn er påkrevd"
          : "First name is required"
      );
      setStatus("error");
      return;
    }

    if (!lastName.trim()) {
      setError(
        appLocale === "nb"
          ? "Etternavn er påkrevd"
          : "Last name is required"
      );
      setStatus("error");
      return;
    }

    if (password !== confirmPassword) {
      setError(signupT.passwordMismatch);
      setStatus("error");
      return;
    }

    // Password validation (matches auth-service.ts)
    if (password.length < 8) {
      setError(
        appLocale === "nb"
          ? "Passordet må være minst 8 tegn"
          : "Password must be at least 8 characters"
      );
      setStatus("error");
      return;
    }
    
    if (!/[A-Z]/.test(password)) {
      setError(
        appLocale === "nb"
          ? "Passordet må inneholde minst én stor bokstav"
          : "Password must contain at least one uppercase letter"
      );
      setStatus("error");
      return;
    }
    
    if (!/[0-9]/.test(password)) {
      setError(
        appLocale === "nb"
          ? "Passordet må inneholde minst ett tall"
          : "Password must contain at least one number"
      );
      setStatus("error");
      return;
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      setError(
        appLocale === "nb"
          ? "Passordet må inneholde minst ett spesialtegn"
          : "Password must contain at least one special character"
      );
      setStatus("error");
      return;
    }

    const { data: signUpData, error: signUpError } = await signUp(email, password);

    if (signUpError || !signUpData?.user) {
      setError(signUpError ?? signupT.signupError);
      setStatus("error");
      return;
    }

    // Save first name and last name to profile
    // Note: This may fail if database migration hasn't been run yet, but that's OK
    // The user can update their profile later, and the fallback in getProfileByUserId
    // will handle missing columns gracefully
    if (signUpData.user?.id) {
      try {
        const { error: profileError } = await updateProfile(signUpData.user.id, {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        });

        if (profileError) {
          // Log error but don't block signup - user can update profile later
          // This is expected if database migration hasn't been run yet
          console.warn("Failed to save name to profile (this is OK if migration not run):", profileError);
        }
      } catch (err) {
        // Silently ignore errors - signup should succeed even if profile update fails
        console.warn("Exception saving name to profile:", err);
      }
    }

    // Redirect to onboarding after successful signup
    router.push("/onboarding");
  }

  return (
    <main className="min-h-screen bg-blue-50 flex items-center justify-center px-4 py-6 sm:py-10 md:py-12">
      <div className="relative w-full max-w-6xl overflow-hidden rounded-[32px] bg-gradient-to-br from-blue-100 via-blue-50 to-slate-50 shadow-[0_40px_120px_rgba(15,23,42,0.25)]">
        {/* Bakgrunns-sirkler - nøyaktig samme som login */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-blue-200/30 blur-3xl" />

        <div className="relative grid gap-8 sm:gap-12 p-8 md:p-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:p-16">
          {/* Left side */}
          <section className="flex flex-col justify-center">
            {/* Logo row */}
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

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight text-slate-900">
              {signupT.createAccountTitle.includes("TeqBook") ? (
                <>
                  {signupT.createAccountTitle.split("TeqBook")[0]}
                  <span className="text-blue-700">TeqBook</span>
                  {signupT.createAccountTitle.split("TeqBook")[1]?.trim() && (
                    <>
                      <br />
                      {signupT.createAccountTitle.split("TeqBook")[1].trim()}
                    </>
                  )}
                </>
              ) : (
                <>
                  {signupT.createAccountTitle.split(" ").slice(0, -1).join(" ")}{" "}
                  <span className="text-blue-700">TeqBook</span>
                  <br />
                  {signupT.createAccountTitle.split(" ").slice(-1)[0]}
                </>
              )}
            </h1>

            {/* Description */}
            <p className="mt-4 max-w-xl text-sm sm:text-base text-slate-600">
              {signupT.createAccountDescription}
            </p>

            {/* Bullets */}
            <ul className="mt-6 space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-blue-600" />
                <span>{signupT.bullet1}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-blue-600" />
                <span>{signupT.bullet2}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-blue-600" />
                <span>{signupT.bullet3}</span>
              </li>
            </ul>

            {/* Trust line */}
            <p className="mt-8 text-xs text-slate-500">
              {signupT.trustLine}
            </p>
          </section>

          {/* Right side - signup card */}
          <section className="flex items-center justify-center">
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full max-w-[420px] rounded-3xl bg-white/90 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.18)] backdrop-blur-sm border border-slate-100"
            >
              {/* Progress indicator */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-3.5">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                    Step 1 of 2
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Create account
                  </span>
                </div>
                <div className="h-[2.5px] w-full bg-slate-100/80 rounded-full overflow-hidden">
                  <div className="h-full w-1/2 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full" />
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900">
                  {signupT.title}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {signupT.formSubtitle}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {/* First Name */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="firstName"
                    className="text-sm font-medium text-slate-800"
                  >
                    {appLocale === "nb" ? "Fornavn" : "First Name"}
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={appLocale === "nb" ? "Ditt fornavn" : "Your first name"}
                    className="w-full rounded-xl border border-slate-200/60 bg-blue-50/80 backdrop-blur-md px-3.5 py-2.5 text-sm text-slate-900 outline-none ring-0 transition focus:border-blue-600 focus:bg-white/90 focus:ring-2 focus:ring-blue-600/30"
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="lastName"
                    className="text-sm font-medium text-slate-800"
                  >
                    {appLocale === "nb" ? "Etternavn" : "Last Name"}
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={appLocale === "nb" ? "Ditt etternavn" : "Your last name"}
                    className="w-full rounded-xl border border-slate-200/60 bg-blue-50/80 backdrop-blur-md px-3.5 py-2.5 text-sm text-slate-900 outline-none ring-0 transition focus:border-blue-600 focus:bg-white/90 focus:ring-2 focus:ring-blue-600/30"
                  />
                </div>

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
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={signupT.passwordPlaceholder}
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
                  <p className="mt-1 text-xs text-slate-500/80">
                    {signupT.passwordHint}
                  </p>
                </div>

                {/* Confirm password */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-slate-800"
                  >
                    {signupT.confirmPasswordLabel}
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={signupT.confirmPasswordPlaceholder}
                      className="w-full rounded-xl border border-slate-200/60 bg-blue-50/80 backdrop-blur-md px-3.5 py-2.5 pr-10 text-sm text-slate-900 outline-none ring-0 transition focus:border-blue-600 focus:bg-white/90 focus:ring-2 focus:ring-blue-600/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-medium text-slate-600 hover:text-slate-900 transition-all hover:bg-slate-100/50 rounded-lg px-2 py-1 -mr-1"
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <p className="text-sm text-red-500" aria-live="polite">
                    {error}
                  </p>
                )}

                {/* Terms agreement */}
                <div className="mt-3 flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-slate-300 text-sky-600 focus:ring-2 focus:ring-sky-200"
                    />
                    <span className="text-slate-600">{signupT.termsAgreement}</span>
                  </label>
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
                  disabled={status === "loading" || !agreeToTerms}
                  className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.75 text-sm font-medium text-white shadow-[0_16px_40px_rgba(15,23,42,0.45)] transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {status === "loading" ? signupT.signingUp : signupT.signupButton}
                </button>
              </form>

              <div className="mt-4 text-center text-xs text-slate-600">
                {signupT.alreadyHaveAccount}{" "}
                <Link
                  href="/login"
                  className="font-semibold text-blue-600 hover:underline"
                >
                  {signupT.loginLink}
                </Link>
              </div>

              <p className="mt-4 text-[11px] text-center text-slate-400">
                {signupT.secureLoginLine}
              </p>
            </MotionDiv>
          </section>
        </div>
      </div>
    </main>
  );
}
