"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Field } from "@/components/form/Field";
import { generateTOTPSecret, verifyTOTPEnrollment } from "@/lib/services/two-factor-service";
import { CheckCircle } from "lucide-react";

interface TwoFactorEnrollmentProps {
  qrCode?: string | null;
  secret?: string | null;
  factorId?: string | null;
  enrolling?: boolean;
  setEnrolling?: (enrolling: boolean) => void;
  onEnrollmentStart?: (qrCode: string, secret: string, factorId: string) => void;
  onEnrollmentComplete?: () => Promise<void>;
  onCancel?: () => void;
  copy?: {
    failedToGenerateSecret: string;
    enterVerificationCode: string;
    invalidVerificationCode: string;
    scanQrTitle: string;
    manualSecretLabel: string;
    codeFieldLabel: string;
    codePlaceholder: string;
    cancel: string;
    verifyAndEnable: string;
    verifying: string;
    enable2FA: string;
    generating: string;
  };
}

export function TwoFactorEnrollment({
  qrCode,
  secret,
  factorId,
  enrolling = false,
  setEnrolling,
  onEnrollmentStart,
  onEnrollmentComplete,
  onCancel,
  copy,
}: TwoFactorEnrollmentProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");

  const ui = {
    failedToGenerateSecret: copy?.failedToGenerateSecret ?? "Failed to generate 2FA secret",
    enterVerificationCode: copy?.enterVerificationCode ?? "Please enter the verification code",
    invalidVerificationCode: copy?.invalidVerificationCode ?? "Invalid verification code",
    scanQrTitle: copy?.scanQrTitle ?? "Scan this QR code with your authenticator app:",
    manualSecretLabel: copy?.manualSecretLabel ?? "Or enter this secret manually:",
    codeFieldLabel: copy?.codeFieldLabel ?? "Enter the 6-digit code from your authenticator app:",
    codePlaceholder: copy?.codePlaceholder ?? "000000",
    cancel: copy?.cancel ?? "Cancel",
    verifyAndEnable: copy?.verifyAndEnable ?? "Verify and Enable",
    verifying: copy?.verifying ?? "Verifying...",
    enable2FA: copy?.enable2FA ?? "Enable 2FA",
    generating: copy?.generating ?? "Generating...",
  };

  async function handleEnable2FA() {
    if (!setEnrolling) return;

    setEnrolling(true);
    setError(null);

    const { data: totpData, error: totpError } = await generateTOTPSecret();

    if (totpError || !totpData) {
      setError(totpError || ui.failedToGenerateSecret);
      setEnrolling(false);
      return;
    }

    if (onEnrollmentStart) {
      onEnrollmentStart(totpData.qrCode, totpData.secret, totpData.factorId);
    }
    setEnrolling(false);
  }

  async function handleVerifyEnrollment() {
    if (!factorId || !verificationCode) {
      setError(ui.enterVerificationCode);
      return;
    }

    setLoading(true);
    setError(null);

    const { data: verified, error: verifyError } = await verifyTOTPEnrollment(
      factorId,
      verificationCode
    );

    if (verifyError || !verified) {
      setError(verifyError || ui.invalidVerificationCode);
      setLoading(false);
      return;
    }

    if (onEnrollmentComplete) {
      await onEnrollmentComplete();
    }
    setVerificationCode("");
    setLoading(false);
  }

  if (qrCode && secret && factorId) {
    return (
      <div className="space-y-4">
        <div className="p-4 border rounded-lg bg-muted/50">
          <p className="text-sm font-medium mb-2">{ui.scanQrTitle}</p>
          <div className="flex items-center justify-center p-4 bg-white rounded-lg">
            <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
          </div>
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-1">{ui.manualSecretLabel}</p>
            <code className="text-xs bg-background px-2 py-1 rounded border">{secret}</code>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Field label={ui.codeFieldLabel}>
          <Input
            type="text"
            placeholder={ui.codePlaceholder}
            maxLength={6}
            value={verificationCode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              setVerificationCode(value);
            }}
            className="text-center text-lg tracking-widest"
          />
        </Field>
        <div className="flex gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel} className="flex-1">
              {ui.cancel}
            </Button>
          )}
          <Button
            onClick={handleVerifyEnrollment}
            disabled={loading || verificationCode.length !== 6 || !factorId}
            className="flex-1"
          >
            {loading ? ui.verifying : ui.verifyAndEnable}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button onClick={handleEnable2FA} disabled={enrolling || loading}>
      {enrolling ? ui.generating : ui.enable2FA}
    </Button>
  );
}

