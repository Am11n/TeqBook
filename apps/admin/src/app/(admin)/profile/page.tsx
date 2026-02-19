"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { AdminShell } from "@/components/layout/admin-shell";
import { PageLayout } from "@/components/layout/page-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfile } from "@/lib/hooks/profile/useProfile";
import { updatePassword, signOutOtherSessions } from "@/lib/services/auth-service";
import { generateTOTPSecret, verifyTOTPEnrollment, unenrollTOTP } from "@/lib/services/two-factor-service";
import type { MFAFactor } from "@/lib/hooks/profile/useProfile";
import {
  User,
  Upload,
  X,
  Shield,
  Mail,
  Lock,
  Smartphone,
  Monitor,
  Activity,
  Copy,
  Check,
  Globe,
  Calendar,
  ChevronRight,
  AlertCircle,
  Eye,
  EyeOff,
  LogOut,
  Loader2,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitials(firstName: string, lastName: string, email: string | null): string {
  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
  if (firstName) return firstName[0].toUpperCase();
  if (email) {
    const name = email.split("@")[0];
    return name.charAt(0).toUpperCase() + (name.length > 1 ? name.charAt(1).toUpperCase() : "");
  }
  return "A";
}

function relativeTime(iso: string | null | undefined): string {
  if (!iso) return "Unknown";
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return iso;
  }
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "Unknown";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function auditActionLabel(action: string | null | undefined): string {
  if (!action) return "Activity event";
  const map: Record<string, string> = {
    login: "Signed in",
    logout: "Signed out",
    password_updated: "Changed password",
    mfa_enrolled: "Enabled 2FA",
    mfa_unenrolled: "Disabled 2FA",
    create: "Created resource",
    update: "Updated resource",
    delete: "Deleted resource",
    status_change: "Changed status",
  };
  return map[action] || action.replace(/_/g, " ");
}

// ---------------------------------------------------------------------------
// Card-level skeleton
// ---------------------------------------------------------------------------

function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-2xl border bg-card p-6 shadow-sm ${className}`}>
      <div className="mb-4 h-4 w-32 rounded bg-muted" />
      <div className="space-y-3">
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-3/4 rounded bg-muted" />
        <div className="h-3 w-1/2 rounded bg-muted" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card-level inline error
// ---------------------------------------------------------------------------

function CardError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      {message}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toast (lightweight, profile-page scoped)
// ---------------------------------------------------------------------------

function useToast() {
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; variant: "success" | "error" }>>([]);

  function show(message: string, variant: "success" | "error" = "success") {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }

  function ToastContainer() {
    if (toasts.length === 0) return null;
    return (
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-in slide-in-from-bottom-2 fade-in rounded-lg px-4 py-2.5 text-sm font-medium shadow-lg ${
              t.variant === "success"
                ? "bg-emerald-600 text-white"
                : "bg-destructive text-destructive-foreground"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    );
  }

  return { show, ToastContainer };
}

// ---------------------------------------------------------------------------
// Change Password Section (inline expand)
// ---------------------------------------------------------------------------

function ChangePasswordSection({ onSuccess }: { onSuccess: (msg: string) => void }) {
  const [open, setOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  function reset() {
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    setShowCurrent(false);
    setShowNew(false);
    setInlineError(null);
    setOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setInlineError(null);

    if (newPw !== confirmPw) {
      setInlineError("Passwords do not match");
      return;
    }

    setLoading(true);
    const { error } = await updatePassword(currentPw, newPw);
    setLoading(false);

    if (error) {
      setInlineError(error);
      return;
    }

    onSuccess("Password changed successfully");
    reset();
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => setOpen(true)}>
        <Lock className="mr-2 h-4 w-4" />
        Change password
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border bg-muted/30 p-3">
      <div className="relative">
        <Input
          type={showCurrent ? "text" : "password"}
          placeholder="Current password"
          value={currentPw}
          onChange={(e) => setCurrentPw(e.target.value)}
          required
          autoComplete="current-password"
        />
        <button
          type="button"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={() => setShowCurrent(!showCurrent)}
          tabIndex={-1}
        >
          {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      <div className="relative">
        <Input
          type={showNew ? "text" : "password"}
          placeholder="New password"
          value={newPw}
          onChange={(e) => setNewPw(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />
        <button
          type="button"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={() => setShowNew(!showNew)}
          tabIndex={-1}
        >
          {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      <Input
        type={showNew ? "text" : "password"}
        placeholder="Confirm new password"
        value={confirmPw}
        onChange={(e) => setConfirmPw(e.target.value)}
        required
        minLength={8}
        autoComplete="new-password"
      />
      {inlineError && <CardError message={inlineError} />}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={loading || !currentPw || !newPw || !confirmPw}>
          {loading ? "Updating..." : "Update password"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={reset} disabled={loading}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// 2FA Toggle Section
// ---------------------------------------------------------------------------

function TwoFactorSection({
  mfaEnabled,
  mfaFactors,
  onSuccess,
  onError,
  onRefresh,
}: {
  mfaEnabled: boolean;
  mfaFactors: MFAFactor[] | null;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
  onRefresh: () => Promise<void>;
}) {
  const [enrolling, setEnrolling] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [confirmDisable, setConfirmDisable] = useState(false);
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

    const { error } = await verifyTOTPEnrollment(factorId, verifyCode);
    setVerifying(false);

    if (error) {
      setInlineError(error);
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

  async function handleDisable() {
    if (!mfaFactors || mfaFactors.length === 0) return;
    setDisabling(true);
    setInlineError(null);

    const firstFactor = mfaFactors[0];
    const { error } = await unenrollTOTP(firstFactor.id);
    setDisabling(false);
    setConfirmDisable(false);

    if (error) {
      onError(error);
      return;
    }

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

      {/* Enroll flow */}
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
            {/* QR code is a data URI from Supabase */}
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

      {/* Disable flow */}
      {mfaEnabled && !confirmDisable && (
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={() => setConfirmDisable(true)}
        >
          <Smartphone className="mr-2 h-4 w-4" />
          Disable 2FA
        </Button>
      )}

      {confirmDisable && (
        <div className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <p className="text-xs text-destructive">
            Are you sure? This will remove two-factor authentication from your account.
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="destructive" onClick={handleDisable} disabled={disabling}>
              {disabling ? "Disabling..." : "Yes, disable 2FA"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setConfirmDisable(false)} disabled={disabling}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sign Out All Sessions Section
// ---------------------------------------------------------------------------

function SignOutAllSection({
  sessionsCount,
  onSuccess,
  onError,
  onRefresh,
}: {
  sessionsCount: number | null;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
  onRefresh: () => Promise<void>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    const { error } = await signOutOtherSessions();
    setLoading(false);
    setConfirming(false);

    if (error) {
      onError(error);
      return;
    }

    onSuccess("All other sessions signed out");
    await onRefresh();
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Monitor className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">Active sessions</span>
        </div>
        <span className="text-sm font-medium">{sessionsCount ?? "-"}</span>
      </div>

      {!confirming && (
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={() => setConfirming(true)}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out all devices
        </Button>
      )}

      {confirming && (
        <div className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <p className="text-xs text-destructive">
            This will sign out all sessions including your current one. You will need to log in again.
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="destructive" onClick={handleSignOut} disabled={loading}>
              {loading ? "Signing out..." : "Yes, sign out all"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setConfirming(false)} disabled={loading}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// Profile Page
// ===========================================================================

export default function ProfilePage() {
  const {
    loading,
    saving,
    error,
    userId,
    userEmail,
    accountCreatedAt,
    profile,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    avatarUrl,
    uploadingAvatar,
    isDirty,
    fileInputRef,
    handleAvatarUpload,
    handleRemoveAvatar,
    handleSave,
    handleCancel,
    setError,
    setSuccess,
    securityLoading,
    securityError,
    mfaFactors,
    sessionsCount,
    refreshSecurityData,
    activityLoading,
    activityError,
    recentActivity,
  } = useProfile();

  const { show: showToast, ToastContainer } = useToast();
  const [copied, setCopied] = useState(false);

  async function handleCopyUserId() {
    if (!userId) return;
    try {
      await navigator.clipboard.writeText(userId);
      setCopied(true);
      showToast("User ID copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Failed to copy", "error");
    }
  }

  async function handleProfileSave() {
    await handleSave();
    showToast("Profile updated successfully");
  }

  // ---- Loading skeleton (profile critical path only) ----
  if (loading) {
    return (
      <ErrorBoundary>
        <AdminShell>
          <PageLayout title="My Profile" description="Update your personal information" showCard={false}>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="space-y-6">
                <div className="h-[420px] animate-pulse rounded-2xl bg-muted" />
              </div>
              <div className="space-y-6">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
            </div>
          </PageLayout>
        </AdminShell>
      </ErrorBoundary>
    );
  }

  const displayName = [firstName, lastName].filter(Boolean).join(" ") || "Admin User";
  const mfaEnabled = (mfaFactors?.length ?? 0) > 0;

  return (
    <ErrorBoundary>
      <AdminShell>
        <PageLayout title="My Profile" description="Update your personal information" showCard={false}>
          <ToastContainer />

          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
              <button onClick={() => setError(null)} className="ml-auto text-xs underline">
                Dismiss
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* ====== LEFT COLUMN ====== */}
            <div className="space-y-6">
              {/* Profile Card */}
              <Card className="overflow-hidden rounded-2xl border-t-2 border-t-primary shadow-sm">
                <CardContent className="p-6">
                  {/* Hero header */}
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                      {avatarUrl ? <AvatarImage src={avatarUrl} alt="Profile avatar" /> : null}
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-400 text-2xl font-semibold text-white">
                        {getInitials(firstName, lastName, userEmail)}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="mt-4 text-xl font-semibold tracking-tight">{displayName}</h2>
                    {profile?.is_superadmin ? (
                      <Badge variant="outline" className="mt-1.5 border-purple-200 bg-purple-50 text-purple-700">
                        Super Admin
                      </Badge>
                    ) : profile?.role ? (
                      <Badge variant="secondary" className="mt-1.5">
                        {profile.role.replace(/_/g, " ")}
                      </Badge>
                    ) : null}
                    <p className="mt-1 text-sm text-muted-foreground">{userEmail || "No email"}</p>
                  </div>

                  {/* Avatar actions */}
                  <div className="mt-5 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {uploadingAvatar ? "Uploading..." : "Upload photo"}
                    </Button>
                    {avatarUrl && (
                      <Button variant="outline" size="sm" onClick={handleRemoveAvatar} disabled={uploadingAvatar}>
                        <X className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                  <p className="mt-1.5 text-center text-xs text-muted-foreground">
                    JPG, PNG or WebP. Max 2MB.
                  </p>

                  {/* Editable fields */}
                  <div className="mt-6 space-y-4 border-t pt-6">
                    <div className="space-y-2">
                      <label htmlFor="first_name" className="text-sm font-medium">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="first_name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter your first name"
                        maxLength={50}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="last_name" className="text-sm font-medium">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="last_name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter your last name"
                        maxLength={50}
                      />
                    </div>
                  </div>

                  {/* Save actions */}
                  <div className="mt-6 flex items-center gap-3 border-t pt-5">
                    <Button onClick={handleProfileSave} disabled={!isDirty || saving} size="sm">
                      {saving ? "Saving..." : "Save changes"}
                    </Button>
                    {isDirty && (
                      <>
                        <Button variant="outline" size="sm" onClick={handleCancel} disabled={saving}>
                          Cancel
                        </Button>
                        <span className="flex items-center gap-1.5 text-xs text-amber-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          Unsaved changes
                        </span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ====== RIGHT COLUMN ====== */}
            <div className="space-y-6">
              {/* Security Card */}
              {securityLoading ? (
                <CardSkeleton />
              ) : (
                <Card className="rounded-2xl shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Shield className="h-5 w-5" />
                      Security
                    </CardTitle>
                    <CardDescription>Manage your account security</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {securityError && <CardError message={securityError} />}

                    {/* Password */}
                    <ChangePasswordSection
                      onSuccess={(msg) => {
                        showToast(msg);
                        setSuccess(msg);
                        setTimeout(() => setSuccess(null), 3000);
                      }}
                    />

                    <div className="border-t pt-4" />

                    {/* 2FA */}
                    <TwoFactorSection
                      mfaEnabled={mfaEnabled}
                      mfaFactors={mfaFactors}
                      onSuccess={(msg) => showToast(msg)}
                      onError={(msg) => showToast(msg, "error")}
                      onRefresh={refreshSecurityData}
                    />

                    <div className="border-t pt-4" />

                    {/* Sessions */}
                    <SignOutAllSection
                      sessionsCount={sessionsCount}
                      onSuccess={(msg) => showToast(msg)}
                      onError={(msg) => showToast(msg, "error")}
                      onRefresh={refreshSecurityData}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Recent Activity Card */}
              {activityLoading ? (
                <CardSkeleton />
              ) : (
                <Card className="rounded-2xl shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Activity className="h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription>Your latest actions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {activityError && <CardError message={activityError} />}

                    {!activityError && recentActivity && recentActivity.length === 0 && (
                      <div className="flex flex-col items-center py-6 text-center text-sm text-muted-foreground">
                        <Activity className="mb-2 h-8 w-8 opacity-30" />
                        No recent activity
                      </div>
                    )}

                    {recentActivity && recentActivity.length > 0 && (
                      <div className="space-y-1">
                        {recentActivity.map((log) => (
                          <div
                            key={log.id}
                            className="flex items-center justify-between rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted/50"
                          >
                            <span className="truncate">{auditActionLabel(log.action)}</span>
                            <span className="shrink-0 text-xs text-muted-foreground">
                              {relativeTime(log.created_at)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 border-t pt-3">
                      <Link
                        href="/audit-logs"
                        className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        View all activity
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Access & Info Card */}
              <Card className="rounded-2xl shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <User className="h-5 w-5" />
                    Access & Info
                  </CardTitle>
                  <CardDescription>Your admin account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Access Level */}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      Access Level
                    </span>
                    <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700">
                      {profile?.is_superadmin ? "Super Admin" : "Admin"}
                    </Badge>
                  </div>

                  {/* Scope */}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Globe className="h-4 w-4" />
                      Scope
                    </span>
                    <span className="text-sm font-medium">
                      {profile?.is_superadmin ? "Global access" : "Salon-level"}
                    </span>
                  </div>

                  {/* Account Created */}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Account created
                    </span>
                    <span className="text-sm">{formatDate(accountCreatedAt)}</span>
                  </div>

                  {/* User ID */}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      User ID
                    </span>
                    <button
                      onClick={handleCopyUserId}
                      className="flex items-center gap-1.5 rounded px-1.5 py-0.5 font-mono text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      title="Copy full User ID"
                    >
                      {userId ? `${userId.slice(0, 8)}...` : "-"}
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </PageLayout>
      </AdminShell>
    </ErrorBoundary>
  );
}
