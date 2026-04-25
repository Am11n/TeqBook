"use client";

import { FormEvent, useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { translations } from "@/i18n/translations";
import { resolveNamespace } from "@/i18n/resolve-namespace";
import { challengeTOTP, verifyTOTPChallenge } from "@/lib/services/two-factor-service";
import { getProfileForUser } from "@/lib/services/profiles-service";
import { getCurrentUser } from "@/lib/services/auth-service";
import { initSession } from "@/lib/services/session-service";
import { logSecurity } from "@/lib/services/logger";

export default function Login2FAPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const factorId = searchParams.get("factorId");
  const redirectToParam = searchParams.get("redirectTo");
  const safeRedirectTo =
    redirectToParam && redirectToParam.startsWith("/") && !redirectToParam.startsWith("//")
      ? redirectToParam
      : "/";

  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const tl = useMemo(
    () => resolveNamespace("login", translations[appLocale].login),
    [appLocale],
  );

  const [code, setCode] = useState("");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function startChallenge() {
    if (!factorId) return;
    setStatus("loading");
    setError(null);
    const { data: challengeData, error: challengeError } = await challengeTOTP(factorId);
    if (challengeError || !challengeData) {
      setError(challengeError || tl.twoFactorChallengeFailed || "Challenge failed");
      setStatus("error");
      return;
    }
    setChallengeId(challengeData.challengeId);
    setStatus("idle");
  }

  useEffect(() => {
    if (factorId) {
      void startChallenge();
    } else {
      setError(tl.twoFactorMissingFactor || "Missing factor");
      setStatus("error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [factorId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!factorId || !challengeId || !code) {
      setError(tl.twoFactorEnterCode || "Enter the code");
      return;
    }
    setStatus("loading");
    setError(null);

    const { data: verified, error: verifyError } = await verifyTOTPChallenge(factorId, challengeId, code);

    if (verifyError || !verified) {
      logSecurity("Failed dashboard 2FA verification", { challengeId });
      setError(verifyError || tl.twoFactorInvalidCode || "Invalid code");
      setStatus("error");
      return;
    }

    logSecurity("Successful dashboard 2FA verification", { challengeId });
    initSession(false);

    const { data: user, error: userError } = await getCurrentUser();
    if (userError || !user) {
      setError(tl.twoFactorUserLoadFailed || "Could not load user");
      setStatus("error");
      return;
    }

    const { data: profile } = await getProfileForUser(user.id);
    if (!profile) {
      router.push("/onboarding");
      return;
    }
    if (profile.salon_id) {
      router.push(safeRedirectTo);
      return;
    }
    router.push("/onboarding");
  }

  const title = tl.twoFactorTitle ?? "Two-factor authentication";
  const description = tl.twoFactorDescription ?? "Enter the code from your authenticator app.";
  const codeLabel = tl.twoFactorCodeLabel ?? "Code";
  const placeholder = tl.twoFactorPlaceholder ?? "000000";
  const verifyLabel = tl.twoFactorVerify ?? "Verify";
  const verifyingLabel = tl.twoFactorVerifying ?? "Verifying…";
  const backLabel = tl.twoFactorBackToLogin ?? "Back to sign in";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm rounded-lg border bg-card p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>

        {error && (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="mfa-code" className="text-sm font-medium text-foreground">
              {codeLabel}
            </label>
            <input
              id="mfa-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              disabled={status === "loading" || !challengeId}
              placeholder={placeholder}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-center text-lg tracking-widest font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading" || code.length !== 6 || !challengeId}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-70"
          >
            {status === "loading" ? verifyingLabel : verifyLabel}
          </button>
        </form>

        <button
          type="button"
          onClick={() => router.push("/login")}
          className="mt-4 w-full text-sm text-muted-foreground hover:text-foreground"
        >
          {backLabel}
        </button>
      </div>
    </div>
  );
}
