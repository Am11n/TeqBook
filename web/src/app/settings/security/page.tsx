"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageLayout } from "@/components/layout/page-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrentSalon } from "@/components/salon-provider";
import {
  generateTOTPSecret,
  verifyTOTPEnrollment,
  getMFAFactors,
  unenrollTOTP,
} from "@/lib/services/two-factor-service";
import { Shield, CheckCircle, XCircle, QrCode } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SecuritySettingsPage() {
  const { user, isReady } = useCurrentSalon();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [factors, setFactors] = useState<Array<{ id: string; type: string; friendlyName: string }>>([]);
  const [enrolling, setEnrolling] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [factorId, setFactorId] = useState<string | null>(null);

  useEffect(() => {
    if (isReady && user) {
      loadFactors();
    }
  }, [isReady, user]);

  async function loadFactors() {
    setLoading(true);
    setError(null);

    const { data: factorsData, error: factorsError } = await getMFAFactors();

    if (factorsError) {
      setError(factorsError);
      setLoading(false);
      return;
    }

    setFactors(factorsData || []);
    setLoading(false);
  }

  async function handleEnable2FA() {
    setEnrolling(true);
    setError(null);

    const { data: totpData, error: totpError } = await generateTOTPSecret();

    if (totpError || !totpData) {
      setError(totpError || "Failed to generate 2FA secret");
      setEnrolling(false);
      return;
    }

    setQrCode(totpData.qrCode);
    setSecret(totpData.secret);
    setFactorId(totpData.factorId);
    setEnrolling(false);
  }

  async function handleVerifyEnrollment() {
    if (!factorId || !verificationCode) {
      setError("Please enter the verification code");
      return;
    }

    setLoading(true);
    setError(null);

    const { data: verified, error: verifyError } = await verifyTOTPEnrollment(
      factorId,
      verificationCode
    );

    if (verifyError || !verified) {
      setError(verifyError || "Invalid verification code");
      setLoading(false);
      return;
    }

    // Reload factors
    await loadFactors();
    setQrCode(null);
    setSecret(null);
    setVerificationCode("");
    setFactorId(null);
    setLoading(false);
  }

  async function handleDisable2FA(factorIdToRemove: string) {
    if (!confirm("Are you sure you want to disable 2FA? This will make your account less secure.")) {
      return;
    }

    setLoading(true);
    setError(null);

    const { data: unenrolled, error: unenrollError } = await unenrollTOTP(factorIdToRemove);

    if (unenrollError || !unenrolled) {
      setError(unenrollError || "Failed to disable 2FA");
      setLoading(false);
      return;
    }

    // Reload factors
    await loadFactors();
    setLoading(false);
  }

  const has2FA = factors.length > 0;

  return (
    <ErrorBoundary>
      <DashboardShell>
        <PageLayout
          title="Security Settings"
          description="Manage your account security settings including two-factor authentication"
        >
          {error && (
            <ErrorMessage
              message={error}
              onDismiss={() => setError(null)}
              variant="destructive"
              className="mb-4"
            />
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Two-Factor Authentication (2FA)
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account by requiring a code from your authenticator app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {has2FA ? (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      2FA is enabled for your account. You'll need to enter a code from your authenticator app when logging in.
                    </AlertDescription>
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
                        onClick={() => handleDisable2FA(factor.id)}
                        disabled={loading}
                      >
                        Disable
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert>
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      2FA is not enabled. Enable it to add an extra layer of security to your account.
                    </AlertDescription>
                  </Alert>

                  {!qrCode ? (
                    <Button onClick={handleEnable2FA} disabled={enrolling || loading}>
                      {enrolling ? "Generating..." : "Enable 2FA"}
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg bg-muted/50">
                        <p className="text-sm font-medium mb-2">Scan this QR code with your authenticator app:</p>
                        {qrCode && (
                          <div className="flex items-center justify-center p-4 bg-white rounded-lg">
                            <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                          </div>
                        )}
                        {secret && (
                          <div className="mt-4">
                            <p className="text-xs text-muted-foreground mb-1">Or enter this secret manually:</p>
                            <code className="text-xs bg-background px-2 py-1 rounded border">{secret}</code>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Enter the 6-digit code from your authenticator app:
                        </label>
                        <Input
                          type="text"
                          placeholder="000000"
                          maxLength={6}
                          value={verificationCode}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            setVerificationCode(value);
                            // Auto-submit when 6 digits entered
                            if (value.length === 6 && factorId) {
                              handleVerifyEnrollment();
                            }
                          }}
                          className="text-center text-lg tracking-widest"
                        />
                        <Button
                          onClick={handleVerifyEnrollment}
                          disabled={loading || verificationCode.length !== 6 || !factorId}
                          className="w-full"
                        >
                          {loading ? "Verifying..." : "Verify and Enable"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </PageLayout>
      </DashboardShell>
    </ErrorBoundary>
  );
}

