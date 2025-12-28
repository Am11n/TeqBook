"use client";

import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { useSignup } from "@/lib/hooks/signup/useSignup";
import { SignupBranding } from "@/components/signup/SignupBranding";
import { SignupForm } from "@/components/signup/SignupForm";

export default function SignUpPage() {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale].login;
  const signupT = translations[appLocale].signup;

  const signup = useSignup({
    locale: appLocale,
    translations: {
      passwordMismatch: signupT.passwordMismatch,
    },
  });

  return (
    <main className="min-h-screen bg-blue-50 flex items-center justify-center px-4 py-6 sm:py-10 md:py-12">
      <div className="relative w-full max-w-6xl overflow-hidden rounded-[32px] bg-gradient-to-br from-blue-100 via-blue-50 to-slate-50 shadow-[0_40px_120px_rgba(15,23,42,0.25)]">
        {/* Bakgrunns-sirkler */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-blue-200/30 blur-3xl" />

        <div className="relative grid gap-8 sm:gap-12 p-8 md:p-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:p-16">
          <SignupBranding
            translations={{
              headline: signupT.headline,
              subheadline: signupT.subheadline,
              bullet1: signupT.bullet1,
              bullet2: signupT.bullet2,
              bullet3: signupT.bullet3,
              trustLine: signupT.trustLine,
            }}
          />

          <section className="flex items-center justify-center">
            <SignupForm
              firstName={signup.firstName}
              setFirstName={signup.setFirstName}
              lastName={signup.lastName}
              setLastName={signup.setLastName}
              email={signup.email}
              setEmail={signup.setEmail}
              password={signup.password}
              setPassword={signup.setPassword}
              confirmPassword={signup.confirmPassword}
              setConfirmPassword={signup.setConfirmPassword}
              showPassword={signup.showPassword}
              setShowPassword={signup.setShowPassword}
              showConfirmPassword={signup.showConfirmPassword}
              setShowConfirmPassword={signup.setShowConfirmPassword}
              agreeToTerms={signup.agreeToTerms}
              setAgreeToTerms={signup.setAgreeToTerms}
              status={signup.status}
              error={signup.error}
              onSubmit={signup.handleSubmit}
              locale={appLocale}
              translations={{
                title: signupT.title,
                formSubtitle: signupT.formSubtitle,
                emailLabel: t.emailLabel,
                emailPlaceholder: t.emailPlaceholder,
                passwordLabel: t.passwordLabel,
                passwordPlaceholder: signupT.passwordPlaceholder,
                passwordHint: signupT.passwordHint,
                confirmPasswordLabel: signupT.confirmPasswordLabel,
                confirmPasswordPlaceholder: signupT.confirmPasswordPlaceholder,
                termsAgreement: signupT.termsAgreement,
                signingUp: signupT.signingUp,
                signupButton: signupT.signupButton,
                alreadyHaveAccount: signupT.alreadyHaveAccount,
                loginLink: signupT.loginLink,
                secureLoginLine: signupT.secureLoginLine,
              }}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
