"use client";

import { FormEvent, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { translations } from "@/i18n/translations";
import { resolveNamespace } from "@/i18n/resolve-namespace";
import { signInWithPassword } from "@/lib/services/auth-service";
import { getProfileForUser } from "@/lib/services/profiles-service";
import { initSession } from "@/lib/services/session-service";

/**
 * Minimal login page for dashboard (E2E and direct access).
 * Uses same Supabase auth as public app; redirects to /dashboard or /onboarding.
 */
export default function DashboardLoginPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const tl = useMemo(
    () => resolveNamespace("login", translations[appLocale].login),
    [appLocale],
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const title = tl.dashboardDirectLoginTitle ?? tl.title;
  const subtitle = tl.dashboardDirectLoginSubtitle ?? tl.formSubtitle;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    const { data: signInData, error: signInError } = await signInWithPassword(email, password);

    if (signInError) {
      setError(signInError || tl.loginError);
      setStatus("error");
      return;
    }

    if (!signInData?.user) {
      setError(tl.loginGenericFailure ?? tl.loginError);
      setStatus("error");
      return;
    }

    initSession(false);

    const { data: profile } = await getProfileForUser(signInData.user.id);

    if (!profile) {
      router.push("/onboarding");
      return;
    }

    if (profile.salon_id) {
      router.push("/");
      return;
    }

    router.push("/onboarding");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm rounded-lg border bg-card p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              {tl.emailLabel}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              {tl.passwordLabel}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-70"
          >
            {status === "loading" ? tl.loggingIn : tl.loginButton}
          </button>
        </form>
      </div>
    </div>
  );
}
