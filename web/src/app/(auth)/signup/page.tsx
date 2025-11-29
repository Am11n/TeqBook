"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase-client";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import { Button } from "@/components/ui/button";

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
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm">
        <h1 className="text-lg font-semibold tracking-tight">{signupT.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{signupT.description}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2 text-sm">
            <label htmlFor="email" className="font-medium">
              {t.emailLabel}
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
              placeholder={t.emailPlaceholder}
            />
          </div>

          <div className="space-y-2 text-sm">
            <label htmlFor="password" className="font-medium">
              {t.passwordLabel}
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
              placeholder={t.passwordPlaceholder}
            />
          </div>

          <div className="space-y-2 text-sm">
            <label htmlFor="confirmPassword" className="font-medium">
              {signupT.confirmPasswordLabel}
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
              placeholder={signupT.confirmPasswordPlaceholder}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500" aria-live="polite">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === "loading" ? signupT.signingUp : signupT.signupButton}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          {signupT.alreadyHaveAccount}{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            {signupT.loginLink}
          </Link>
        </p>
      </div>
    </div>
  );
}

