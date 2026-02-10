"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FAVICON_PATH } from "@/lib/constants";
import { signInWithPassword } from "@/lib/services/auth-service";
import { getProfileForUser } from "@/lib/services/profiles-service";
import { initSession } from "@/lib/services/session-service";
import { logSecurity, logError } from "@/lib/services/logger";
import { Shield } from "lucide-react";
import dynamic from "next/dynamic";

const MotionDiv = dynamic(
  () => import("framer-motion").then((mod) => mod.motion.div),
  { ssr: false }
);

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
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4 py-6 sm:py-10 md:py-12">
      <div className="relative w-full max-w-6xl overflow-hidden rounded-[32px] bg-gradient-to-br from-blue-100 via-blue-50 to-slate-50 shadow-[0_40px_120px_rgba(15,23,42,0.25)]">
        {/* Bakgrunns-sirkler */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-blue-200/30 blur-3xl" />

        <div className="relative grid gap-10 p-6 md:p-10 lg:grid-cols-[1.1fr_1.1fr] lg:p-12">
          {/* Venstre side: Brand / pitch */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-8">
              <Image
                src={FAVICON_PATH}
                alt="TeqBook logo"
                width={40}
                height={40}
                className="drop-shadow-[0_2px_8px_rgba(15,23,42,0.15)]"
              />
              <span className="text-xl font-semibold tracking-tight text-slate-900">
                TeqBook
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                <Shield className="h-3 w-3" />
                Admin
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight text-slate-900">
              Velkommen til{" "}
              <span className="text-blue-700">Admin Panel</span>
            </h1>

            <p className="mt-4 max-w-xl text-sm sm:text-base text-slate-600">
              Administrer salonger, brukere og systeminnstillinger. Kun for autoriserte superadministratorer.
            </p>

            <ul className="mt-6 space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-blue-600" />
                <span>Oversikt over alle salonger i systemet</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-blue-600" />
                <span>Administrer brukere og tilganger</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-blue-600" />
                <span>System-analyser og rapporter</span>
              </li>
            </ul>

            <p className="mt-8 text-xs text-slate-500">
              Sikker tilgang · Kun for superadministratorer
            </p>
          </div>

          {/* Høyre side: Login card */}
          <div className="flex items-center justify-center">
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full max-w-md rounded-3xl bg-white/90 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.18)] backdrop-blur-sm border border-slate-100"
            >
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  Admin Logg Inn
                  <Shield className="h-5 w-5 text-amber-500" />
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Skriv inn dine admin-legitimasjoner
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-slate-800"
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
                    className="w-full rounded-xl border border-slate-200/60 bg-blue-50/80 backdrop-blur-md px-3.5 py-2.5 text-sm text-slate-900 outline-none ring-0 transition focus:border-blue-600 focus:bg-white/90 focus:ring-2 focus:ring-blue-600/30"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-slate-800"
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
                      className="w-full rounded-xl border border-slate-200/60 bg-blue-50/80 backdrop-blur-md px-3.5 py-2.5 pr-10 text-sm text-slate-900 outline-none ring-0 transition focus:border-blue-600 focus:bg-white/90 focus:ring-2 focus:ring-blue-600/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-medium text-slate-600 hover:text-slate-900 transition-all hover:bg-slate-100/50 rounded-lg px-2 py-1 -mr-1"
                    >
                      {showPassword ? "Skjul" : "Vis"}
                    </button>
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <p className="text-sm text-red-500" aria-live="polite">
                    {error}
                  </p>
                )}

                {/* Button */}
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-[0_16px_40px_rgba(15,23,42,0.45)] transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {status === "loading" ? "Logger inn..." : "Logg inn som Admin"}
                </button>
              </form>

              <p className="mt-4 text-[11px] text-center text-slate-400">
                Sikker innlogging · TeqBook Admin Panel
              </p>
            </MotionDiv>
          </div>
        </div>
      </div>
    </div>
  );
}
