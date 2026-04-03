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
import { resolveSettings } from "@/app/settings/_helpers/resolve-settings";

export default function SecurityPage() {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = resolveSettings(translations[appLocale].settings);
  const passwordCopy = {
    cardTitle: t.passwordCardTitle ?? "Password",
    cardDescription: t.passwordCardDescription ?? "Change your account password",
    rowLabel: t.passwordRowLabel ?? "Password",
    changeAction: t.passwordChangeAction ?? "Change Password",
    dialog: {
      dialogTitle: t.changePasswordDialogTitle ?? "Change Password",
      dialogDescription:
        t.changePasswordDialogDescription ??
        "Enter your current password and choose a new password",
      mismatchError: t.changePasswordMismatchError ?? "New passwords do not match",
      tooShortError: t.changePasswordTooShortError ?? "Password must be at least 8 characters long",
      success: t.changePasswordSuccess ?? "Password changed successfully",
      currentLabel: t.changePasswordCurrentLabel ?? "Current Password",
      currentPlaceholder: t.changePasswordCurrentPlaceholder ?? "Enter current password",
      newLabel: t.changePasswordNewLabel ?? "New Password",
      newDescription:
        t.changePasswordNewDescription ??
        "Minimum 8 characters, at least one uppercase letter, one number, and one special character",
      newPlaceholder: t.changePasswordNewPlaceholder ?? "Enter new password",
      confirmLabel: t.changePasswordConfirmLabel ?? "Confirm New Password",
      confirmPlaceholder: t.changePasswordConfirmPlaceholder ?? "Confirm new password",
      cancel: t.changePasswordCancel ?? "Cancel",
      submitting: t.changePasswordSubmitting ?? "Changing...",
      submit: t.changePasswordSubmit ?? "Change Password",
    },
  };
  const { loading, error, factors, emailVerified, sessionsCount, loadSecurityData } =
    useSecurityData();

  const twoFactorCopy = {
    title: t.twoFactorCardTitle,
    description: t.twoFactorCardDescription,
    statusLabel: t.twoFactorStatusLabel,
    statusEnabled: t.twoFactorStatusEnabled,
    statusDisabled: t.twoFactorStatusDisabled,
    enabledAlert: t.twoFactorEnabledAlert,
    disabledAlert: t.twoFactorDisabledAlert,
    recommendShort: t.twoFactorRecommendShort,
    disableButton: t.twoFactorDisableButton,
    confirmDisable: t.twoFactorConfirmDisable,
  };

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
          <PasswordCard copy={passwordCopy} />
          <TwoFactorCard
            factors={factors}
            loading={loading}
            onReload={loadSecurityData}
            copy={twoFactorCopy}
          />
        </div>
      </SettingsGrid>
    </ErrorBoundary>
  );
}
