"use client";

import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { SettingsGrid } from "@/components/settings/SettingsGrid";
import { PasswordCard } from "@/components/security/PasswordCard";
import { TwoFactorCard } from "@/components/security/TwoFactorCard";
import { EmailVerificationCard } from "@/components/security/EmailVerificationCard";
import { SessionsCard } from "@/components/security/SessionsCard";
import { useSecurityData } from "@/lib/hooks/security/useSecurityData";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";

export default function SecurityPage() {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale].settings;
  const { loading, error, factors, emailVerified, sessionsCount, loadSecurityData } =
    useSecurityData();

  return (
    <ErrorBoundary>
      {error && (
        <ErrorMessage
          message={error}
          onDismiss={() => {}}
          variant="destructive"
          className="mb-6"
        />
      )}

      <SettingsGrid
        aside={
          <div className="space-y-6">
            <EmailVerificationCard emailVerified={emailVerified} />
            <SessionsCard sessionsCount={sessionsCount} onReload={loadSecurityData} />
          </div>
        }
      >
        <div className="space-y-6">
          <PasswordCard />
          <TwoFactorCard factors={factors} loading={loading} onReload={loadSecurityData} />
        </div>
      </SettingsGrid>
    </ErrorBoundary>
  );
}
