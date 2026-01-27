import { useState, useEffect } from "react";
import { useCurrentSalon } from "@/components/salon-provider";
import {
  getMFAFactors,
} from "@/lib/services/two-factor-service";
import {
  getEmailVerificationStatus,
  getActiveSessionsCount,
} from "@/lib/services/auth-service";

export function useSecurityData() {
  const { user, isReady } = useCurrentSalon();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [factors, setFactors] = useState<Array<{ id: string; type: string; friendlyName: string }>>([]);
  const [emailVerified, setEmailVerified] = useState(false);
  const [sessionsCount, setSessionsCount] = useState(0);

  async function loadSecurityData() {
    if (!isReady || !user) return;

    setLoading(true);
    setError(null);

    try {
      // Load 2FA factors
      const { data: factorsData, error: factorsError } = await getMFAFactors();
      if (factorsError) {
        setError(factorsError);
      } else {
        setFactors(factorsData || []);
      }

      // Load email verification status
      const { data: emailStatus } = await getEmailVerificationStatus();
      if (emailStatus) {
        setEmailVerified(emailStatus.verified);
      }

      // Load sessions count
      const { data: sessions } = await getActiveSessionsCount();
      if (sessions !== null) {
        setSessionsCount(sessions);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load security data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isReady && user) {
      loadSecurityData();
    }
  }, [isReady, user]);

  return {
    loading,
    error,
    factors,
    emailVerified,
    sessionsCount,
    loadSecurityData,
  };
}

