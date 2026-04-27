"use client";

import { useState, useEffect } from "react";
import { Shield, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/profile/status-pill";
import { InfoRow } from "@/components/profile/info-row";
import { TwoFactorEnrollment } from "./TwoFactorEnrollment";
import { challengeTOTP, verifyTOTPChallenge, unenrollTOTP } from "@/lib/services/two-factor-service";

export type TwoFactorCardCopy = {
  title: string;
  description: string;
  statusLabel: string;
  statusEnabled: string;
  statusDisabled: string;
  enabledAlert: string;
  disabledAlert: string;
  recommendShort: string;
  disableButton: string;
  /** Shown inside the disable dialog as extra context */
  confirmDisable: string;
  disableDialogTitle?: string;
  disableDialogDescription?: string;
  disableCodeLabel?: string;
  disableSubmit?: string;
  disableSubmitting?: string;
  disableCancel?: string;
  disableChallengeFailed?: string;
  disablePreparing?: string;
  disableEnterCode?: string;
  enrollment?: {
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
};

interface TwoFactorCardProps {
  factors: Array<{ id: string; type: string; friendlyName: string }>;
  loading: boolean;
  onReload: () => Promise<void>;
  copy: TwoFactorCardCopy;
}

export function TwoFactorCard({ factors, loading, onReload, copy }: TwoFactorCardProps) {
  const [enrolling, setEnrolling] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);

  const [disableTargetFactorId, setDisableTargetFactorId] = useState<string | null>(null);
  const [disableChallengeId, setDisableChallengeId] = useState<string | null>(null);
  const [disableCode, setDisableCode] = useState("");
  const [disablePhase, setDisablePhase] = useState<"idle" | "challenging" | "ready" | "submitting">("idle");
  const [disableError, setDisableError] = useState<string | null>(null);

  const disableDialogTitle = copy.disableDialogTitle ?? "Disable two-factor authentication";
  const disableDialogDescription =
    copy.disableDialogDescription ??
    "Enter the 6-digit code from your authenticator app to confirm. This removes 2FA from your account.";
  const disableCodeLabel = copy.disableCodeLabel ?? "Authentication code";
  const disableSubmit = copy.disableSubmit ?? "Disable 2FA";
  const disableSubmitting = copy.disableSubmitting ?? "Disabling…";
  const disableCancel = copy.disableCancel ?? "Cancel";
  const disableChallengeFailed =
    copy.disableChallengeFailed ?? "Could not start verification. Close and try again.";
  const disablePreparing = copy.disablePreparing ?? "Preparing verification…";
  const disableEnterCode = copy.disableEnterCode ?? "Please enter a valid 6-digit code.";

  const has2FA = factors.length > 0;

  useEffect(() => {
    if (!disableTargetFactorId) return;
    let cancelled = false;
    (async () => {
      setDisablePhase("challenging");
      setDisableError(null);
      setDisableChallengeId(null);
      setDisableCode("");
      const { data, error } = await challengeTOTP(disableTargetFactorId);
      if (cancelled) return;
      if (error || !data?.challengeId) {
        setDisableError(error || disableChallengeFailed);
        setDisablePhase("idle");
        return;
      }
      setDisableChallengeId(data.challengeId);
      setDisablePhase("ready");
    })();
    return () => {
      cancelled = true;
    };
  }, [disableTargetFactorId, disableChallengeFailed]);

  function closeDisableDialog() {
    setDisableTargetFactorId(null);
    setDisableChallengeId(null);
    setDisableCode("");
    setDisableError(null);
    setDisablePhase("idle");
  }

  async function handleConfirmDisable() {
    if (!disableTargetFactorId || !disableChallengeId || !/^\d{6}$/.test(disableCode.trim())) {
      setDisableError(disableEnterCode);
      return;
    }

    setDisablePhase("submitting");
    setDisableError(null);

    const { error: verifyError } = await verifyTOTPChallenge(
      disableTargetFactorId,
      disableChallengeId,
      disableCode.trim(),
    );

    if (verifyError) {
      setDisableError(verifyError);
      const { data: nextChallenge, error: chError } = await challengeTOTP(disableTargetFactorId);
      if (chError || !nextChallenge?.challengeId) {
        setDisableError(chError || disableChallengeFailed);
        setDisablePhase("idle");
        setDisableChallengeId(null);
        return;
      }
      setDisableChallengeId(nextChallenge.challengeId);
      setDisableCode("");
      setDisablePhase("ready");
      return;
    }

    const { error: unenrollError } = await unenrollTOTP(disableTargetFactorId);
    if (unenrollError) {
      setDisableError(unenrollError);
      setDisablePhase("ready");
      return;
    }

    closeDisableDialog();
    await onReload();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          {copy.title}
        </CardTitle>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <InfoRow
          label={copy.statusLabel}
          value={
            has2FA ? (
              <StatusPill status="enabled" label={copy.statusEnabled} />
            ) : (
              <StatusPill status="disabled" label={copy.statusDisabled} />
            )
          }
        />

        {has2FA ? (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{copy.enabledAlert}</AlertDescription>
            </Alert>

            {factors.map((factor) => (
              <div key={factor.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{factor.friendlyName}</p>
                  <p className="text-sm text-muted-foreground">{factor.type.toUpperCase()}</p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDisableTargetFactorId(factor.id)}
                  disabled={loading}
                >
                  {copy.disableButton}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription>{copy.disabledAlert}</AlertDescription>
            </Alert>
            <p className="text-xs text-muted-foreground">{copy.recommendShort}</p>

            {!qrCode ? (
              <TwoFactorEnrollment
                copy={copy.enrollment}
                onEnrollmentStart={(qr, sec, fid) => {
                  setQrCode(qr);
                  setSecret(sec);
                  setFactorId(fid);
                }}
                enrolling={enrolling}
                setEnrolling={setEnrolling}
              />
            ) : (
              <TwoFactorEnrollment
                copy={copy.enrollment}
                qrCode={qrCode}
                secret={secret}
                factorId={factorId}
                onEnrollmentComplete={async () => {
                  await onReload();
                  setQrCode(null);
                  setSecret(null);
                  setFactorId(null);
                }}
                onCancel={() => {
                  setQrCode(null);
                  setSecret(null);
                  setFactorId(null);
                }}
              />
            )}
          </div>
        )}
      </CardContent>

      <Dialog open={disableTargetFactorId !== null} onOpenChange={(open) => !open && closeDisableDialog()}>
        <DialogContent className="sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>{disableDialogTitle}</DialogTitle>
            <DialogDescription className="whitespace-pre-line sm:text-left">
              {`${copy.confirmDisable}\n\n${disableDialogDescription}`}
            </DialogDescription>
          </DialogHeader>

          {disableError && (
            <Alert variant="destructive">
              <AlertDescription>{disableError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label htmlFor="two-factor-disable-code" className="text-sm font-medium">
              {disableCodeLabel}
            </label>
            <Input
              id="two-factor-disable-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ""))}
              disabled={disablePhase === "challenging" || disablePhase === "submitting" || disablePhase === "idle"}
              placeholder="000000"
              className="text-center text-lg tracking-widest font-mono"
            />
            {disablePhase === "challenging" && (
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                {disablePreparing}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={closeDisableDialog} disabled={disablePhase === "submitting"}>
              {disableCancel}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void handleConfirmDisable()}
              disabled={disablePhase !== "ready" || disableCode.length !== 6}
            >
              {disablePhase === "submitting" ? disableSubmitting : disableSubmit}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
