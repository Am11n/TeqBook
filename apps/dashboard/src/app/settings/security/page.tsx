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
    disableDialogTitle: t.twoFactorDisableDialogTitle,
    disableDialogDescription: t.twoFactorDisableDialogDescription,
    disableCodeLabel: t.twoFactorDisableCodeLabel,
    disableSubmit: t.twoFactorDisableSubmit,
    disableSubmitting: t.twoFactorDisableSubmitting,
    disableCancel: t.twoFactorDisableCancel,
    disableChallengeFailed: t.twoFactorDisableChallengeFailed,
    disablePreparing: t.twoFactorDisablePreparing,
    disableEnterCode: t.twoFactorDisableEnterCode,
    enrollment: {
      failedToGenerateSecret: t.twoFactorEnrollFailedToGenerateSecret ?? "Failed to generate 2FA secret",
      enterVerificationCode: t.twoFactorEnrollEnterVerificationCode ?? "Please enter the verification code",
      invalidVerificationCode: t.twoFactorEnrollInvalidVerificationCode ?? "Invalid verification code",
      scanQrTitle: t.twoFactorEnrollScanQrTitle ?? "Scan this QR code with your authenticator app:",
      manualSecretLabel: t.twoFactorEnrollManualSecretLabel ?? "Or enter this secret manually:",
      codeFieldLabel: t.twoFactorEnrollCodeFieldLabel ?? "Enter the 6-digit code from your authenticator app:",
      codePlaceholder: t.twoFactorEnrollCodePlaceholder ?? "000000",
      cancel: t.twoFactorEnrollCancel ?? "Cancel",
      verifyAndEnable: t.twoFactorEnrollVerifyAndEnable ?? "Verify and Enable",
      verifying: t.twoFactorEnrollVerifying ?? "Verifying...",
      enable2FA: t.twoFactorEnrollEnableButton ?? "Enable 2FA",
      generating: t.twoFactorEnrollGeneratingButton ?? "Generating...",
    },
  };

  const emailCardCopy = {
    title: t.emailCardTitle ?? "Email Verification",
    description: t.emailCardDescription ?? "Verify your email address",
    statusLabel: t.emailCardStatusLabel ?? "Status",
    statusVerified: t.emailCardStatusVerified ?? "Verified",
    statusNotVerified: t.emailCardStatusNotVerified ?? "Not verified",
    resendButton: t.emailCardResendButton ?? "Resend Verification",
    resendingButton: t.emailCardResendingButton ?? "Sending...",
    resendSuccess: t.emailCardResendSuccess ?? "Verification email sent. Please check your inbox.",
    warning:
      t.emailCardWarning ??
      "Your email address is not verified. Please check your inbox for a verification email.",
  };

  const sessionsCardCopy = {
    title: t.sessionsCardTitle ?? "Sessions",
    description: t.sessionsCardDescription ?? "Manage sign-in state for this browser and sign out other sessions.",
    statusLabel: t.sessionsCardStatusLabel ?? "Session state",
    statusValueCurrentOnly: t.sessionsCardStatusValueCurrentOnly ?? "Signed in on this browser",
    currentDevicePrefix: t.sessionsCardCurrentDevicePrefix ?? "Current device",
    signOutOthersButton: t.sessionsCardSignOutOthersButton ?? "Log out all other sessions",
    signingOut: t.sessionsCardSigningOutButton ?? "Signing out...",
    signOutOthersConfirm:
      t.sessionsCardSignOutOthersConfirm ??
      "Are you sure you want to sign out of all other sessions? You will remain signed in on this device.",
    signOutOthersSuccess:
      t.sessionsCardSignOutOthersSuccess ?? "All other sessions have been signed out",
    noOtherSessionsHint: t.sessionsCardNoOtherSessionsHint ?? "No active session found for this browser.",
    countDisclaimer:
      t.sessionsCardCountDisclaimer ??
      "Session count for other devices is not shown here yet. Use the action below to sign out other sessions.",
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
            <EmailVerificationCard emailVerified={emailVerified} copy={emailCardCopy} />
            <SessionsCard sessionsCount={sessionsCount} onReload={loadSecurityData} copy={sessionsCardCopy} />
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
