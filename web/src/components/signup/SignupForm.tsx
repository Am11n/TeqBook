"use client";

import { FormEvent } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Field } from "@/components/form/Field";

const MotionDiv = dynamic(() => import("framer-motion").then((mod) => mod.motion.div), { ssr: false });

interface SignupFormProps {
  firstName: string;
  setFirstName: (name: string) => void;
  lastName: string;
  setLastName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (password: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (show: boolean) => void;
  agreeToTerms: boolean;
  setAgreeToTerms: (agree: boolean) => void;
  status: "idle" | "loading" | "error";
  error: string | null;
  onSubmit: (e: FormEvent) => void;
  locale: string;
  translations: {
    title: string;
    formSubtitle: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    passwordHint: string;
    confirmPasswordLabel: string;
    confirmPasswordPlaceholder: string;
    termsAgreement: string;
    signingUp: string;
    signupButton: string;
    alreadyHaveAccount: string;
    loginLink: string;
    secureLoginLine: string;
  };
}

export function SignupForm({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  agreeToTerms,
  setAgreeToTerms,
  status,
  error,
  onSubmit,
  locale,
  translations,
}: SignupFormProps) {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-[420px] rounded-3xl bg-white/90 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.18)] backdrop-blur-sm border border-slate-100"
    >
      {/* Progress indicator */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3.5">
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Step 1 of 2</span>
          <span className="text-[10px] text-slate-400">Create account</span>
        </div>
        <div className="h-[2.5px] w-full bg-slate-100/80 rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full" />
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">{translations.title}</h2>
        <p className="mt-1 text-sm text-slate-600">{translations.formSubtitle}</p>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Field label={locale === "nb" ? "Fornavn" : "First Name"} htmlFor="firstName" required>
          <input
            id="firstName"
            type="text"
            autoComplete="given-name"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder={locale === "nb" ? "Ditt fornavn" : "Your first name"}
            className="w-full rounded-xl border border-slate-200/60 bg-blue-50/80 backdrop-blur-md px-3.5 py-2.5 text-sm text-slate-900 outline-none ring-0 transition focus:border-blue-600 focus:bg-white/90 focus:ring-2 focus:ring-blue-600/30"
          />
        </Field>

        <Field label={locale === "nb" ? "Etternavn" : "Last Name"} htmlFor="lastName" required>
          <input
            id="lastName"
            type="text"
            autoComplete="family-name"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder={locale === "nb" ? "Ditt etternavn" : "Your last name"}
            className="w-full rounded-xl border border-slate-200/60 bg-blue-50/80 backdrop-blur-md px-3.5 py-2.5 text-sm text-slate-900 outline-none ring-0 transition focus:border-blue-600 focus:bg-white/90 focus:ring-2 focus:ring-blue-600/30"
          />
        </Field>

        <Field label={translations.emailLabel} htmlFor="email" required>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={translations.emailPlaceholder}
            className="w-full rounded-xl border border-slate-200/60 bg-blue-50/80 backdrop-blur-md px-3.5 py-2.5 text-sm text-slate-900 outline-none ring-0 transition focus:border-blue-600 focus:bg-white/90 focus:ring-2 focus:ring-blue-600/30"
          />
        </Field>

        <Field label={translations.passwordLabel} htmlFor="password" required>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={translations.passwordPlaceholder}
              className="w-full rounded-xl border border-slate-200/60 bg-blue-50/80 backdrop-blur-md px-3.5 py-2.5 pr-10 text-sm text-slate-900 outline-none ring-0 transition focus:border-blue-600 focus:bg-white/90 focus:ring-2 focus:ring-blue-600/30"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-medium text-slate-600 hover:text-slate-900 transition-all hover:bg-slate-100/50 rounded-lg px-2 py-1 -mr-1"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-500/80">{translations.passwordHint}</p>
        </Field>

        <Field label={translations.confirmPasswordLabel} htmlFor="confirmPassword" required>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={translations.confirmPasswordPlaceholder}
              className="w-full rounded-xl border border-slate-200/60 bg-blue-50/80 backdrop-blur-md px-3.5 py-2.5 pr-10 text-sm text-slate-900 outline-none ring-0 transition focus:border-blue-600 focus:bg-white/90 focus:ring-2 focus:ring-blue-600/30"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-medium text-slate-600 hover:text-slate-900 transition-all hover:bg-slate-100/50 rounded-lg px-2 py-1 -mr-1"
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>
        </Field>

        {error && (
          <p className="text-sm text-red-500" aria-live="polite">
            {error}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-300 text-sky-600 focus:ring-2 focus:ring-sky-200"
            />
            <span className="text-slate-600">{translations.termsAgreement}</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={status === "loading" || !agreeToTerms}
          className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.75 text-sm font-medium text-white shadow-[0_16px_40px_rgba(15,23,42,0.45)] transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status === "loading" ? translations.signingUp : translations.signupButton}
        </button>
      </form>

      <div className="mt-4 text-center text-xs text-slate-600">
        {translations.alreadyHaveAccount}{" "}
        <Link href="/login" className="font-semibold text-blue-600 hover:underline">
          {translations.loginLink}
        </Link>
      </div>

      <p className="mt-4 text-[11px] text-center text-slate-400">{translations.secureLoginLine}</p>
    </MotionDiv>
  );
}

