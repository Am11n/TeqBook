"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
      setError(challengeError || "Could not start verification. Try signing in again.");
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
      setError("Missing verification setup. Please sign in again.");
      setStatus("error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [factorId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!factorId || !challengeId || !code) {
      setError("Enter the 6-digit code.");
      return;
    }
    setStatus("loading");
    setError(null);

    const { data: verified, error: verifyError } = await verifyTOTPChallenge(factorId, challengeId, code);

    if (verifyError || !verified) {
      logSecurity("Failed admin 2FA verification", { challengeId });
      setError(verifyError || "Invalid code.");
      setStatus("error");
      return;
    }

    logSecurity("Successful admin 2FA verification", { challengeId });
    initSession(false);

    const { data: user, error: userError } = await getCurrentUser();
    if (userError || !user) {
      setError("Signed in but could not load your account.");
      setStatus("error");
      return;
    }

    const { data: profile, error: profileError } = await getProfileForUser(user.id);
    if (profileError || !profile?.is_superadmin) {
      setError("Access denied.");
      setStatus("error");
      return;
    }

    router.push(safeRedirectTo);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900">Two-factor authentication</h1>
        <p className="mt-1 text-sm text-slate-600">
          Enter the 6-digit code from your authenticator app to finish signing in.
        </p>

        {error && (
          <p className="mt-4 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="admin-mfa-code" className="text-sm font-medium text-slate-800">
              Authentication code
            </label>
            <input
              id="admin-mfa-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              disabled={status === "loading" || !challengeId}
              placeholder="000000"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-center text-lg tracking-widest font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading" || code.length !== 6 || !challengeId}
            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-70"
          >
            {status === "loading" ? "Verifying…" : "Verify and continue"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => router.push("/login")}
          className="mt-4 w-full text-sm text-slate-600 hover:text-slate-900"
        >
          Back to sign in
        </button>
      </div>
    </div>
  );
}
