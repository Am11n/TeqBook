"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signInWithPassword } from "@/lib/services/auth-service";
import { getProfileForUser } from "@/lib/services/profiles-service";
import { initSession } from "@/lib/services/session-service";
import { logSecurity, logError } from "@/lib/services/logger";
import { Shield } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    // Sign in using auth service
    const { data: signInData, error: signInError } = await signInWithPassword(
      email,
      password
    );

    if (signInError) {
      let errorMessage = signInError;

      if (signInError.includes("Invalid login credentials")) {
        errorMessage = "Ugyldig e-post eller passord.";
      } else if (signInError.includes("Email not confirmed")) {
        errorMessage = "Bekreft e-postadressen din før du logger inn.";
      }

      setError(errorMessage);
      setStatus("error");
      logSecurity("Failed admin login attempt", { email, error: signInError });
      logError("Admin login error", new Error(signInError), { email });
      return;
    }

    if (!signInData?.user) {
      setError("Innlogging feilet. Prøv igjen.");
      setStatus("error");
      return;
    }

    // Initialize session tracking
    initSession(false);

    // Get user profile
    const { data: profile, error: profileError } = await getProfileForUser(
      signInData.user.id
    );

    if (profileError) {
      setError("Kunne ikke laste brukerprofil.");
      setStatus("error");
      return;
    }

    if (!profile) {
      setError("Ingen profil funnet.");
      setStatus("error");
      return;
    }

    // Check if user is superadmin
    if (!profile.is_superadmin) {
      setError("Du har ikke tilgang til admin-panelet. Kun superadmins kan logge inn her.");
      setStatus("error");
      logSecurity("Non-superadmin attempted admin login", { email, userId: signInData.user.id });
      return;
    }

    // Log successful admin login
    logSecurity("Successful admin login", { email, userId: signInData.user.id });

    // Redirect to admin dashboard
    router.push("/admin");
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-6 sm:py-10 md:py-12">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-slate-800 shadow-2xl border border-slate-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-8 text-center border-b border-slate-600">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Image
                src="/Favikon.svg"
                alt="TeqBook logo"
                width={56}
                height={56}
                className="drop-shadow-[0_2px_8px_rgba(255,255,255,0.1)]"
              />
              <div className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-1">
                <Shield className="h-4 w-4 text-slate-900" />
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Logg Inn</h1>
          <p className="mt-2 text-sm text-slate-400">
            Kun for superadministratorer
          </p>
        </div>

        {/* Form */}
        <div className="px-6 py-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-slate-300"
              >
                E-post
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@teqbook.com"
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-slate-300"
              >
                Passord
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 pr-16 text-sm text-white placeholder-slate-500 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-xs font-medium text-slate-400 hover:text-white transition"
                >
                  {showPassword ? "Skjul" : "Vis"}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
                <p className="text-sm text-red-400" aria-live="polite">
                  {error}
                </p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-lg bg-amber-500 px-4 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-500/25 transition hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status === "loading" ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Logger inn...
                </span>
              ) : (
                "Logg inn som Admin"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-700 px-6 py-4 text-center">
          <p className="text-xs text-slate-500">
            Sikker innlogging · TeqBook Admin Panel
          </p>
        </div>
      </div>
    </div>
  );
}
