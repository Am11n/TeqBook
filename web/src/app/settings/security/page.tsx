"use client";

import { useEffect, useState } from "react";
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
import {
  updatePassword,
  getEmailVerificationStatus,
  resendEmailVerification,
  getActiveSessionsCount,
  signOutOtherSessions,
} from "@/lib/services/auth-service";
import { Shield, CheckCircle, XCircle, Lock, Mail, Monitor, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Field } from "@/components/form/Field";
import { StatusPill } from "@/components/profile/status-pill";
import { InfoRow } from "@/components/profile/info-row";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

export default function SecuritySettingsPage() {
  const { user, isReady } = useCurrentSalon();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [factors, setFactors] = useState<Array<{ id: string; type: string; friendlyName: string }>>([]);
  const [enrolling, setEnrolling] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [factorId, setFactorId] = useState<string | null>(null);
  
  // Email verification
  const [emailVerified, setEmailVerified] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  
  // Sessions
  const [sessionsCount, setSessionsCount] = useState(0);
  const [signingOut, setSigningOut] = useState(false);
  
  // Change password
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (isReady && user) {
      loadSecurityData();
    }
  }, [isReady, user]);

  async function loadSecurityData() {
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
    await loadSecurityData();
    setQrCode(null);
    setSecret(null);
    setVerificationCode("");
    setFactorId(null);
    setLoading(false);
    setSuccess("2FA has been enabled successfully");
    setTimeout(() => setSuccess(null), 5000);
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
    await loadSecurityData();
    setLoading(false);
    setSuccess("2FA has been disabled");
    setTimeout(() => setSuccess(null), 5000);
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    setChangingPassword(true);
    setError(null);

    const { error: updateError } = await updatePassword(currentPassword, newPassword);

    if (updateError) {
      setError(updateError);
      setChangingPassword(false);
      return;
    }

    setSuccess("Password updated successfully");
    setShowChangePassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setChangingPassword(false);
    setTimeout(() => setSuccess(null), 5000);
  }

  async function handleResendVerification() {
    setResendingEmail(true);
    setError(null);

    const { error: resendError } = await resendEmailVerification();

    if (resendError) {
      setError(resendError);
      setResendingEmail(false);
      return;
    }

    setSuccess("Verification email sent. Please check your inbox.");
    setResendingEmail(false);
    setTimeout(() => setSuccess(null), 5000);
  }

  async function handleSignOutOtherSessions() {
    if (!confirm("Are you sure you want to sign out of all other sessions? You will remain signed in on this device.")) {
      return;
    }

    setSigningOut(true);
    setError(null);

    const { error: signOutError } = await signOutOtherSessions();

    if (signOutError) {
      setError(signOutError);
      setSigningOut(false);
      return;
    }

    // Reload sessions count
    await loadSecurityData();
    setSigningOut(false);
    setSuccess("All other sessions have been signed out");
    setTimeout(() => setSuccess(null), 5000);
  }

  const has2FA = factors.length > 0;

  return (
    <ErrorBoundary>
      <Card className="p-6">
        {error && (
          <ErrorMessage
            message={error}
            onDismiss={() => setError(null)}
            variant="destructive"
            className="mb-6"
          />
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-900/20">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-400">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Security Settings</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Manage your account security settings including password, two-factor authentication, and sessions
            </p>
          </div>

          {/* Password Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Password
              </CardTitle>
              <CardDescription>
                Change your account password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow
                label="Password"
                value="••••••••"
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowChangePassword(true)}
                  >
                    Change Password
                  </Button>
                }
              />
            </CardContent>
          </Card>

          {/* 2FA Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Two-Factor Authentication (2FA)
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow
                label="Status"
                value={
                  has2FA ? (
                    <StatusPill status="enabled" label="Enabled" />
                  ) : (
                    <StatusPill status="disabled" label="Disabled" />
                  )
                }
              />

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

                      <Field
                        label="Enter the 6-digit code from your authenticator app:"
                      >
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
                      </Field>
                      <Button
                        onClick={handleVerifyEnrollment}
                        disabled={loading || verificationCode.length !== 6 || !factorId}
                        className="w-full"
                      >
                        {loading ? "Verifying..." : "Verify and Enable"}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Email Verification Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Verification
              </CardTitle>
              <CardDescription>
                Verify your email address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow
                label="Status"
                value={
                  emailVerified ? (
                    <StatusPill status="verified" label="Verified" />
                  ) : (
                    <StatusPill status="unverified" label="Not verified" />
                  )
                }
                action={
                  !emailVerified ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResendVerification}
                      disabled={resendingEmail}
                    >
                      {resendingEmail ? "Sending..." : "Resend Verification"}
                    </Button>
                  ) : null
                }
              />
              {!emailVerified && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Your email address is not verified. Please check your inbox for a verification email.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Sessions Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Active Sessions
              </CardTitle>
              <CardDescription>
                Manage your active sessions across devices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow
                label="Active Sessions"
                value={`${sessionsCount} active session${sessionsCount !== 1 ? "s" : ""}`}
                action={
                  sessionsCount > 1 ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSignOutOtherSessions}
                      disabled={signingOut}
                    >
                      {signingOut ? "Signing out..." : "Sign Out Other Sessions"}
                    </Button>
                  ) : null
                }
              />
              {sessionsCount <= 1 && (
                <p className="text-sm text-muted-foreground">
                  You are only signed in on this device.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Change Password Dialog */}
        <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
              <DialogDescription>
                Enter your current password and choose a new password
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <Field
                label="Current Password"
                htmlFor="current_password"
                required
              >
                <Input
                  id="current_password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </Field>

              <Field
                label="New Password"
                htmlFor="new_password"
                required
                description="Minimum 8 characters, at least one uppercase letter, one number, and one special character"
              >
                <Input
                  id="new_password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </Field>

              <Field
                label="Confirm New Password"
                htmlFor="confirm_password"
                required
              >
                <Input
                  id="confirm_password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </Field>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowChangePassword(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setError(null);
                }}
                disabled={changingPassword}
              >
                Cancel
              </Button>
              <Button onClick={handleChangePassword} disabled={changingPassword}>
                {changingPassword ? "Changing..." : "Change Password"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </ErrorBoundary>
  );
}
