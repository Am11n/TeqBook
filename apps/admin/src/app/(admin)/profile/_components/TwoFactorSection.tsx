"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { generateTOTPSecret, challengeTOTP, verifyTOTPChallenge, unenrollTOTP } from "@/lib/services/two-factor-service";
import type { MFAFactor } from "@/lib/hooks/profile/useProfile";
import { Smartphone, Loader2 } from "lucide-react";
import { CardError } from "./shared";

interface TwoFactorSectionProps {
  mfaEnabled: boolean;
  mfaFactors: MFAFactor[] | null;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
  onRefresh: () => Promise<void>;
}

export function TwoFactorSection({
  mfaEnabled,
  mfaFactors,
  onSuccess,
  onError,
  onRefresh,
}: TwoFactorSectionProps) {
  const [enrolling, setEnrolling] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [confirmDisable, setConfirmDisable] = useState(false);
  const [disableChallengeId, setDisableChallengeId] = useState<string | null>(null);
  const [disableCode, setDisableCode] = useState("");
  const [disableChallengeLoading, setDisableChallengeLoading] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  async function handleStartEnroll() {
    setEnrolling(true);
    setInlineError(null);
    const { data, error } = await generateTOTPSecret();
    if (error || !data) {
      setInlineError(error || "Failed to generate 2FA secret");
      setEnrolling(false);
      return;
    }
    setQrCode(data.qrCode);
    setFactorId(data.factorId);
  }

  async function handleVerifyEnroll(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId || !verifyCode) return;
    setVerifying(true);
    setInlineError(null);

    const { data: challengeData, error: challengeError } = await challengeTOTP(factorId);
    if (challengeError || !challengeData) {
      setInlineError(challengeError || "Failed to create verification challenge");
      setVerifying(false);
      return;
    }

    const { error: verifyError } = await verifyTOTPChallenge(factorId, challengeData.challengeId, verifyCode);
    setVerifying(false);

    if (verifyError) {
      setInlineError(verifyError);
      return;
    }

    setEnrolling(false);
    setQrCode(null);
    setFactorId(null);
    setVerifyCode("");
    onSuccess("Two-factor authentication enabled");
    await onRefresh();
  }

  function handleCancelEnroll() {
    setEnrolling(false);
    setQrCode(null);
    setFactorId(null);
    setVerifyCode("");
    setInlineError(null);
  }

  function resetDisableFlow() {
    setConfirmDisable(false);
    setDisableChallengeId(null);
    setDisableCode("");
    setDisableChallengeLoading(false);
    setInlineError(null);
  }

  async function beginDisableFlow() {
    if (!mfaFactors || mfaFactors.length === 0) return;
    setInlineError(null);
    setConfirmDisable(true);
    setDisableCode("");
    setDisableChallengeId(null);
    setDisableChallengeLoading(true);

    const firstFactor = mfaFactors[0];
    const { data: challengeData, error: challengeError } = await challengeTOTP(firstFactor.id);
    setDisableChallengeLoading(false);

    if (challengeError || !challengeData?.challengeId) {
      setInlineError(challengeError || "Could not start verification. Try again.");
      setConfirmDisable(false);
      return;
    }

    setDisableChallengeId(challengeData.challengeId);
  }

  async function handleConfirmDisable() {
    if (!mfaFactors || mfaFactors.length === 0) return;
    const firstFactor = mfaFactors[0];
    if (!disableChallengeId || !/^\d{6}$/.test(disableCode.trim())) {
      setInlineError("Enter the 6-digit code from your authenticator app.");
      return;
    }

    setDisabling(true);
    setInlineError(null);

    const { error: verifyError } = await verifyTOTPChallenge(
      firstFactor.id,
      disableChallengeId,
      disableCode.trim(),
    );

    if (verifyError) {
      setInlineError(verifyError);
      const { data: nextChallenge, error: chError } = await challengeTOTP(firstFactor.id);
      if (chError || !nextChallenge?.challengeId) {
        setInlineError(chError || "Could not refresh verification. Try again.");
        setDisabling(false);
        return;
      }
      setDisableChallengeId(nextChallenge.challengeId);
      setDisableCode("");
      setDisabling(false);
      return;
    }

    const { error: unenrollError } = await unenrollTOTP(firstFactor.id);
    setDisabling(false);

    if (unenrollError) {
      onError(unenrollError);
      return;
    }

    resetDisableFlow();
    onSuccess("Two-factor authentication disabled");
    await onRefresh();
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">Two-Factor Authentication</span>
        </div>
        {mfaEnabled ? (
          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
            Enabled
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-muted-foreground">
            Disabled
          </Badge>
        )}
      </div>

      {inlineError && <CardError message={inlineError} />}

      {!mfaEnabled && !enrolling && (
        <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleStartEnroll}>
          <Smartphone className="mr-2 h-4 w-4" />
          Enable 2FA
        </Button>
      )}

      {enrolling && qrCode && (
        <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">
            Scan this QR code with your authenticator app, then enter the 6-digit code below.
          </p>
          <div className="flex justify-center">
            <img src={qrCode} alt="2FA QR Code" className="h-40 w-40 rounded-md border" />
          </div>
          <form onSubmit={handleVerifyEnroll} className="flex gap-2">
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="6-digit code"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
              required
              className="font-mono tracking-widest"
            />
            <Button type="submit" size="sm" disabled={verifying || verifyCode.length !== 6}>
              {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
            </Button>
          </form>
          <Button type="button" variant="ghost" size="sm" onClick={handleCancelEnroll} className="w-full text-xs">
            Cancel
          </Button>
        </div>
      )}

      {enrolling && !qrCode && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {mfaEnabled && !confirmDisable && (
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={() => void beginDisableFlow()}
        >
          <Smartphone className="mr-2 h-4 w-4" />
          Disable 2FA
        </Button>
      )}

      {confirmDisable && (
        <div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <p className="text-xs text-destructive">
            This removes two-factor authentication from your account. Enter the 6-digit code from your authenticator app
            to confirm.
          </p>
          {disableChallengeLoading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Preparing verification…
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <label htmlFor="admin-disable-mfa-code" className="text-xs font-medium text-foreground">
                  Authentication code
                </label>
                <Input
                  id="admin-disable-mfa-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="000000"
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ""))}
                  disabled={!disableChallengeId || disabling}
                  className="font-mono tracking-widest text-center"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => void handleConfirmDisable()}
                  disabled={disabling || disableCode.length !== 6 || !disableChallengeId}
                >
                  {disabling ? "Disabling…" : "Verify and disable 2FA"}
                </Button>
                <Button size="sm" variant="outline" onClick={resetDisableFlow} disabled={disabling}>
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
