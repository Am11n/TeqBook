// =====================================================
// Two-Factor Authentication Service
// =====================================================
// Service for managing TOTP-based 2FA using Supabase Auth

import { supabase } from "@/lib/supabase-client";
import { logSecurity, logError } from "@/lib/services/logger";

/**
 * Generate a TOTP secret for a user
 * This should be called when user enables 2FA
 */
export async function generateTOTPSecret(): Promise<{
  data: { secret: string; qrCode: string; factorId: string } | null;
  error: string | null;
}> {
  try {
    // Supabase Auth provides TOTP functionality
    // We'll use the factor API to generate a TOTP secret
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
    });

    if (error) {
      logError("Failed to generate TOTP secret", error);
      return { data: null, error: error.message };
    }

    if (!data) {
      return { data: null, error: "Failed to generate TOTP secret" };
    }

    return {
      data: {
        secret: data.secret || "",
        qrCode: data.qr_code || "",
        factorId: data.id || "",
      },
      error: null,
    };
  } catch (err) {
    logError("Exception generating TOTP secret", err);
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Verify TOTP code during enrollment
 */
export async function verifyTOTPEnrollment(
  factorId: string,
  code: string
): Promise<{ data: boolean | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.mfa.verify({
      factorId,
      code,
    });

    if (error) {
      logError("Failed to verify TOTP enrollment", error);
      return { data: null, error: error.message };
    }

    return { data: true, error: null };
  } catch (err) {
    logError("Exception verifying TOTP enrollment", err);
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Challenge TOTP during login
 * This should be called after password authentication succeeds
 */
export async function challengeTOTP(
  factorId: string
): Promise<{ data: { challengeId: string } | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.mfa.challenge({
      factorId,
    });

    if (error) {
      logError("Failed to challenge TOTP", error);
      return { data: null, error: error.message };
    }

    if (!data) {
      return { data: null, error: "Failed to create TOTP challenge" };
    }

    return {
      data: {
        challengeId: data.id || "",
      },
      error: null,
    };
  } catch (err) {
    logError("Exception challenging TOTP", err);
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Verify TOTP code during login challenge
 */
export async function verifyTOTPChallenge(
  challengeId: string,
  code: string
): Promise<{ data: boolean | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.mfa.verify({
      challengeId,
      code,
    });

    if (error) {
      logSecurity("Failed TOTP verification", { challengeId });
      logError("Failed to verify TOTP challenge", error);
      return { data: null, error: error.message };
    }

    logSecurity("Successful TOTP verification", { challengeId });
    return { data: true, error: null };
  } catch (err) {
    logError("Exception verifying TOTP challenge", err);
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Get all enrolled MFA factors for current user
 */
export async function getMFAFactors(): Promise<{
  data: Array<{ id: string; type: string; friendlyName: string }> | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase.auth.mfa.listFactors();

    if (error) {
      logError("Failed to list MFA factors", error);
      return { data: null, error: error.message };
    }

    if (!data) {
      return { data: null, error: "Failed to get MFA factors" };
    }

    return {
      data: data.all.map((factor) => ({
        id: factor.id,
        type: factor.type,
        friendlyName: factor.friendly_name || "TOTP",
      })),
      error: null,
    };
  } catch (err) {
    logError("Exception getting MFA factors", err);
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Unenroll (disable) a TOTP factor
 */
export async function unenrollTOTP(
  factorId: string
): Promise<{ data: boolean | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.mfa.unenroll({
      factorId,
    });

    if (error) {
      logError("Failed to unenroll TOTP", error);
      return { data: null, error: error.message };
    }

    logSecurity("TOTP factor unenrolled", { factorId });
    return { data: true, error: null };
  } catch (err) {
    logError("Exception unenrolling TOTP", err);
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

