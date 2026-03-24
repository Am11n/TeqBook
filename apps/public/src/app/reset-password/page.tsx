"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { completePasswordReset } from "@/lib/services/auth-service";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [checkingLink, setCheckingLink] = useState(true);
  const [canReset, setCanReset] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const bootstrapRecoverySession = async () => {
      try {
        const currentUrl = new URL(window.location.href);
        const tokenHash = currentUrl.searchParams.get("token_hash");
        const resetType = currentUrl.searchParams.get("type");
        const code = currentUrl.searchParams.get("code");

        if (tokenHash && resetType === "recovery") {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: "recovery",
          });
          if (verifyError) throw verifyError;
          currentUrl.searchParams.delete("token_hash");
          currentUrl.searchParams.delete("type");
          window.history.replaceState({}, "", `${currentUrl.pathname}${currentUrl.search}`);
        } else if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
          currentUrl.searchParams.delete("code");
          window.history.replaceState({}, "", `${currentUrl.pathname}${currentUrl.search}`);
        } else if (currentUrl.hash) {
          const hashParams = new URLSearchParams(currentUrl.hash.replace(/^#/, ""));
          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");

          if (accessToken && refreshToken) {
            const { error: setSessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (setSessionError) throw setSessionError;
            window.history.replaceState({}, "", `${currentUrl.pathname}${currentUrl.search}`);
          }
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!cancelled) {
          if (session) {
            setCanReset(true);
            setError(null);
          } else {
            setCanReset(false);
            setError("Reset link is invalid or expired. Please request a new password reset email.");
          }
        }
      } catch (err) {
        if (!cancelled) {
          setCanReset(false);
          const rawError = err instanceof Error ? err.message : "";
          if (/pkce code verifier not found/i.test(rawError)) {
            setError("Reset link is invalid or expired. Please request a new password reset email.");
          } else {
            setError(rawError || "Reset link is invalid or expired.");
          }
        }
      } finally {
        if (!cancelled) setCheckingLink(false);
      }
    };

    bootstrapRecoverySession();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    if (password !== confirmPassword) {
      setStatus("error");
      setError("Passwords do not match.");
      return;
    }

    const { error: resetError } = await completePasswordReset(password);
    if (resetError) {
      setStatus("error");
      setError(resetError);
      return;
    }

    setStatus("success");
    await supabase.auth.signOut();
    router.push("/login?reset=1");
  };

  return (
    <main className="min-h-screen bg-blue-50 flex items-center justify-center px-4 py-6 sm:py-10 md:py-12">
      <div className="w-full max-w-md rounded-3xl bg-white/90 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.18)] backdrop-blur-sm border border-slate-100">
        <h1 className="text-xl font-semibold text-slate-900">Set new password</h1>
        <p className="mt-1 text-sm text-slate-600">
          Choose a new password for your account.
        </p>

        {checkingLink ? (
          <p className="mt-6 text-sm text-slate-600" aria-live="polite">
            Verifying reset link...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-slate-800">
                New password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200/60 bg-blue-50/80 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white/90 focus:ring-2 focus:ring-blue-600/30"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-800">
                Confirm new password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200/60 bg-blue-50/80 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white/90 focus:ring-2 focus:ring-blue-600/30"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500" aria-live="polite">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!canReset || status === "loading"}
              className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.75 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status === "loading" ? "Updating password..." : "Save new password"}
            </button>
          </form>
        )}

        <div className="mt-4 text-center text-xs text-slate-600">
          <Link href="/login" className="font-semibold text-blue-600 hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </main>
  );
}
