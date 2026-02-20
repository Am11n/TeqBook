"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPassword } from "@/lib/services/auth-service";
import { getProfileForUser } from "@/lib/services/profiles-service";
import {
  recordFailedAttempt, clearRateLimit, isRateLimited,
  formatTimeRemaining, getTimeUntilReset,
  checkRateLimit, incrementRateLimit, resetRateLimit,
} from "@/lib/services/rate-limit-service";
import { initSession } from "@/lib/services/session-service";
import { logSecurity, logError } from "@/lib/services/logger";

const MAX_LOGIN_ATTEMPTS = 5;

export function useLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    limited: boolean; remainingAttempts: number; resetTime: number | null;
  } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    if (email) {
      try {
        const serverRateLimit = await checkRateLimit(email, "login");
        setRateLimitInfo({ limited: !serverRateLimit.allowed, remainingAttempts: serverRateLimit.remainingAttempts, resetTime: serverRateLimit.resetTime });
        if (!serverRateLimit.allowed) {
          setError(`Too many failed login attempts. Please try again in ${formatTimeRemaining(getTimeUntilReset(serverRateLimit.resetTime))}.`);
          setStatus("error");
          return;
        }
      } catch (error) {
        console.error("Error checking server-side rate limit:", error);
        const clientRateLimit = isRateLimited(email);
        setRateLimitInfo(clientRateLimit);
        if (clientRateLimit.limited) {
          setError(`Too many failed login attempts. Please try again in ${formatTimeRemaining(getTimeUntilReset(clientRateLimit.resetTime))}.`);
          setStatus("error");
          return;
        }
      }
    }

    const { data: signInData, error: signInError } = await signInWithPassword(email, password);

    if (signInData?.requiresMFA && signInData.factorId) {
      router.push(`/login-2fa?factorId=${signInData.factorId}`);
      return;
    }

    if (signInError) {
      if (email) {
        try {
          const serverRL = await incrementRateLimit(email, "login");
          setRateLimitInfo({ limited: !serverRL.allowed, remainingAttempts: serverRL.remainingAttempts, resetTime: serverRL.resetTime });
          if (!serverRL.allowed) {
            setError(`Too many failed login attempts. Your account has been temporarily blocked. Please try again in ${formatTimeRemaining(getTimeUntilReset(serverRL.resetTime))}.`);
            setStatus("error");
            return;
          }
        } catch (error) {
          console.error("Error incrementing server-side rate limit:", error);
          const clientRL = recordFailedAttempt(email);
          setRateLimitInfo({ limited: clientRL.blocked, remainingAttempts: clientRL.remainingAttempts, resetTime: clientRL.resetTime });
          if (clientRL.blocked) {
            setError(`Too many failed login attempts. Your account has been temporarily blocked. Please try again in ${formatTimeRemaining(getTimeUntilReset(clientRL.resetTime))}.`);
            setStatus("error");
            return;
          }
          if (email) {
            const currentRL = rateLimitInfo || { limited: false, remainingAttempts: MAX_LOGIN_ATTEMPTS, resetTime: null };
            if (currentRL.remainingAttempts < MAX_LOGIN_ATTEMPTS && !currentRL.limited) {
              let errorMsg = signInError;
              if (signInError.includes("Invalid login credentials")) errorMsg = `Invalid email or password. ${currentRL.remainingAttempts} attempt${currentRL.remainingAttempts !== 1 ? "s" : ""} remaining.`;
              else if (signInError.includes("Email not confirmed")) errorMsg = "Please confirm your email address before logging in. Check your inbox for a confirmation email.";
              else if (signInError.includes("User not found")) errorMsg = "No account found with this email address.";
              setError(errorMsg);
              setStatus("error");
              logError("Login error", signInError, { email });
              return;
            }
          }
        }
      }

      let errorMsg = signInError;
      if (signInError.includes("Invalid login credentials")) errorMsg = "Invalid email or password. Please check your credentials.";
      else if (signInError.includes("Email not confirmed")) errorMsg = "Please confirm your email address before logging in. Check your inbox for a confirmation email.";
      else if (signInError.includes("User not found")) errorMsg = "No account found with this email address.";
      setError(errorMsg);
      setStatus("error");
      logSecurity("Failed login attempt", { email, error: signInError });
      logError("Login error", new Error(signInError), { email });
      return;
    }

    if (!signInData?.user) {
      if (email) { try { await incrementRateLimit(email, "login"); } catch { recordFailedAttempt(email); } }
      setError("Login failed. Please try again.");
      setStatus("error");
      return;
    }

    if (signInData.requiresMFA && signInData.factorId) {
      router.push(`/login-2fa?factorId=${signInData.factorId}`);
      return;
    }

    if (email) { try { await resetRateLimit(email, "login"); } catch { clearRateLimit(email); } setRateLimitInfo(null); }
    initSession(keepLoggedIn);
    logSecurity("Successful login", { email, userId: signInData.user.id });

    const { data: profile, error: profileError } = await getProfileForUser(signInData.user.id);
    if (profileError) { setError("Could not load user profile."); setStatus("error"); return; }
    if (!profile) { router.push("/onboarding"); return; }
    if (profile.is_superadmin) { router.push("/admin/"); return; }
    if (profile.salon_id) { router.push("/dashboard/"); return; }
    router.push("/onboarding");
  }

  return {
    email, setEmail, password, setPassword,
    showPassword, setShowPassword, keepLoggedIn, setKeepLoggedIn,
    status, error, handleSubmit,
  };
}
