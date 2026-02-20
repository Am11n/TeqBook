"use client";

import { useState } from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { PageLayout } from "@/components/layout/page-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfile } from "@/lib/hooks/profile/useProfile";
import { Upload, X, Shield, AlertCircle } from "lucide-react";
import { CardSkeleton, getInitials, useToast } from "./_components/shared";
import { ChangePasswordSection } from "./_components/ChangePasswordSection";
import { TwoFactorSection } from "./_components/TwoFactorSection";
import { SignOutAllSection } from "./_components/SignOutAllSection";
import { ActivityCard } from "./_components/ActivityCard";
import { AccessInfoCard } from "./_components/AccessInfoCard";

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
  const displayName = [firstName, lastName].filter(Boolean).join(" ") || "Admin User";
  const mfaEnabled = (mfaFactors?.length ?? 0) > 0;

  async function handleProfileSave() {
    await handleSave();
    showToast("Profile updated successfully");
  }

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
            {/* Left column: Profile card */}
            <div className="space-y-6">
              <Card className="overflow-hidden rounded-2xl border-t-2 border-t-primary shadow-sm">
                <CardContent className="p-6">
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

            {/* Right column: Security, Activity, Access */}
            <div className="space-y-6">
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
                    {securityError && (
                      <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        {securityError}
                      </div>
                    )}
                    <ChangePasswordSection
                      onSuccess={(msg) => {
                        showToast(msg);
                        setSuccess(msg);
                        setTimeout(() => setSuccess(null), 3000);
                      }}
                    />
                    <div className="border-t pt-4" />
                    <TwoFactorSection
                      mfaEnabled={mfaEnabled}
                      mfaFactors={mfaFactors}
                      onSuccess={(msg) => showToast(msg)}
                      onError={(msg) => showToast(msg, "error")}
                      onRefresh={refreshSecurityData}
                    />
                    <div className="border-t pt-4" />
                    <SignOutAllSection
                      sessionsCount={sessionsCount}
                      onSuccess={(msg) => showToast(msg)}
                      onError={(msg) => showToast(msg, "error")}
                      onRefresh={refreshSecurityData}
                    />
                  </CardContent>
                </Card>
              )}

              {activityLoading ? (
                <CardSkeleton />
              ) : (
                <ActivityCard
                  error={activityError}
                  recentActivity={recentActivity}
                />
              )}

              <AccessInfoCard
                isSuperadmin={!!profile?.is_superadmin}
                accountCreatedAt={accountCreatedAt}
                userId={userId}
                onCopySuccess={() => showToast("User ID copied")}
                onCopyError={() => showToast("Failed to copy", "error")}
              />
            </div>
          </div>
        </PageLayout>
      </AdminShell>
    </ErrorBoundary>
  );
}
