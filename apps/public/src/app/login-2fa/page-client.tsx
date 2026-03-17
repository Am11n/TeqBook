"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { challengeTOTP, verifyTOTPChallenge } from "@/lib/services/two-factor-service";
import { getProfileForUser } from "@/lib/services/profiles-service";
import { getCurrentUser } from "@/lib/services/auth-service";
import { logError, logSecurity } from "@/lib/services/logger";
import { initSession } from "@/lib/services/session-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/form/Field";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { getPublicPageTranslations } from "@/i18n/public-pages";

export default function Login2FAPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const factorId = searchParams.get("factorId");
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = getPublicPageTranslations(appLocale).login2fa;
  const [code, setCode] = useState("");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleChallenge() {
    if (!factorId) return;

    setStatus("loading");
    setError(null);

    const { data: challengeData, error: challengeError } = await challengeTOTP(factorId);

    if (challengeError || !challengeData) {
      setError(challengeError || t.failedChallenge);
      setStatus("error");
      return;
    }

    setChallengeId(challengeData.challengeId);
    setStatus("idle");
  }

  useEffect(() => {
    // Challenge TOTP when component mounts
    if (factorId) {
      handleChallenge();
    } else {
      setError(t.missingFactorId);
      setStatus("error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [factorId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!challengeId || !code) {
      setError(t.enterCode);
      return;
    }

    setStatus("loading");
    setError(null);

    const { data: verified, error: verifyError } = await verifyTOTPChallenge(challengeId, code);

    if (verifyError || !verified) {
      logSecurity("Failed 2FA verification", { challengeId });
      setError(verifyError || t.invalidCode);
      setStatus("error");
      return;
    }

    // 2FA verified, continue with login flow
    logSecurity("Successful 2FA verification", { challengeId });

    // Get user profile to determine redirect
    const { data: user, error: userError } = await getCurrentUser();
    if (userError || !user) {
      setError(t.failedUser);
      setStatus("error");
      return;
    }

    const { data: profile, error: profileError } = await getProfileForUser(user.id);

    if (profileError) {
      logError("2FA profile lookup failed; routing to onboarding fallback", new Error(profileError), {
        userId: user.id,
      });
      router.push("/onboarding");
      return;
    }

    if (!profile) {
      router.push("/onboarding");
      return;
    }

    // Initialize session tracking (no keepLoggedIn option on 2FA page, use default)
    initSession(false);

    // If user is superadmin, redirect to admin (trailing slash = stay on teqbook.com)
    if (profile.is_superadmin) {
      router.push("/admin/");
      return;
    }

    // If user has a salon, redirect to dashboard (trailing slash = stay on teqbook.com)
    if (profile.salon_id) {
      router.push("/dashboard/");
      return;
    }

    // No salon and not superadmin, redirect to onboarding
    router.push("/onboarding");
  }

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4 py-6 sm:py-10 md:py-12">
      <div className="relative w-full max-w-md overflow-hidden rounded-[32px] bg-gradient-to-br from-blue-100 via-blue-50 to-slate-50 shadow-[0_40px_120px_rgba(15,23,42,0.25)]">
        <div className="p-8 sm:p-10">
          <Link href="/" className="flex items-center gap-3 mb-8 hover:opacity-80 transition-opacity">
            <Image
              src="/Favikon.svg"
              alt="TeqBook logo"
              width={40}
              height={40}
              className="drop-shadow-[0_2px_8px_rgba(15,23,42,0.15)]"
            />
            <span className="text-xl font-semibold tracking-tight text-slate-900">TeqBook</span>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-semibold leading-tight text-slate-900 mb-2">
            {t.title}
          </h1>
          <p className="text-sm text-slate-600 mb-6">
            {t.description}
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Field
              label={t.authCodeLabel}
              htmlFor="code"
              required
              error={error || undefined}
            >
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setCode(value);
                }}
                placeholder={t.placeholder}
                className="text-center text-2xl tracking-widest font-mono"
                disabled={status === "loading" || !challengeId}
                autoFocus
              />
            </Field>

            <Button
              type="submit"
              className="w-full"
              disabled={status === "loading" || code.length !== 6 || !challengeId}
            >
              {status === "loading" ? t.verifying : t.verify}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => router.push("/login")}
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              {t.backToLogin}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

