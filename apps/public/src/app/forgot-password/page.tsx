"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { requestPasswordReset } from "@/lib/services/auth-service";

function resolveResetRedirectTo(): string {
  const fallbackBase =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "https://teqbook.com");

  return new URL("/reset-password", fallbackBase).toString();
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    setSuccessMessage(null);

    const { error: resetError } = await requestPasswordReset(
      email.trim(),
      resolveResetRedirectTo(),
    );

    if (resetError) {
      setError(resetError);
      setStatus("error");
      return;
    }

    setSuccessMessage(
      "We sent you a password reset link. Check your email and follow the link to set a new password.",
    );
    setStatus("success");
  };

  return (
    <main className="min-h-screen bg-blue-50 flex items-center justify-center px-4 py-6 sm:py-10 md:py-12">
      <div className="w-full max-w-md rounded-3xl bg-white/90 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.18)] backdrop-blur-sm border border-slate-100">
        <h1 className="text-xl font-semibold text-slate-900">Forgot password</h1>
        <p className="mt-1 text-sm text-slate-600">
          Enter your account email and we will send you a reset link.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-slate-800">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-xl border border-slate-200/60 bg-blue-50/80 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white/90 focus:ring-2 focus:ring-blue-600/30"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500" aria-live="polite">
              {error}
            </p>
          )}

          {successMessage && (
            <p
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
              aria-live="polite"
            >
              {successMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.75 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === "loading" ? "Sending reset link..." : "Send reset link"}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-slate-600">
          <Link href="/login" className="font-semibold text-blue-600 hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </main>
  );
}
