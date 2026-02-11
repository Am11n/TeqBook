"use client";

import { AdminShell } from "@/components/layout/admin-shell";
import { PageLayout } from "@/components/layout/page-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfile } from "@/lib/hooks/profile/useProfile";
import { User, Upload, X, Shield, Mail, Calendar } from "lucide-react";

function getInitials(firstName: string, lastName: string, email: string | null): string {
  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
  if (firstName) return firstName[0].toUpperCase();
  if (email) {
    const name = email.split("@")[0];
    return name.charAt(0).toUpperCase() + (name.length > 1 ? name.charAt(1).toUpperCase() : "");
  }
  return "A";
}

export default function ProfilePage() {
  const {
    loading,
    saving,
    error,
    success,
    userId,
    userEmail,
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
  } = useProfile();

  if (loading) {
    return (
      <ErrorBoundary>
        <AdminShell>
          <PageLayout title="My Profile" description="Update your personal information" showCard={false}>
            <div className="max-w-2xl space-y-6">
              <div className="h-64 animate-pulse rounded-xl bg-muted" />
              <div className="h-40 animate-pulse rounded-xl bg-muted" />
            </div>
          </PageLayout>
        </AdminShell>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <AdminShell>
        <PageLayout
          title="My Profile"
          description="Update your personal information"
          actions={
            <div className="flex items-center gap-2">
              {isDirty && (
                <Button variant="outline" size="sm" onClick={handleCancel} disabled={saving}>
                  Cancel
                </Button>
              )}
              <Button size="sm" onClick={handleSave} disabled={!isDirty || saving}>
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          }
          showCard={false}
        >
          {error && (
            <ErrorMessage message={error} onDismiss={() => setError(null)} variant="destructive" className="mb-6" />
          )}

          {success && (
            <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              {success}
            </div>
          )}

          <div className="max-w-2xl space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-5 w-5" />
                  Profile
                </CardTitle>
                <CardDescription>Your personal account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20 border-2 border-primary">
                    {avatarUrl ? <AvatarImage src={avatarUrl} alt="Profile avatar" /> : null}
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-400 text-xl font-semibold text-white">
                      {getInitials(firstName, lastName, userEmail)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploadingAvatar ? "Uploading..." : "Upload new"}
                      </Button>
                      {avatarUrl && (
                        <Button variant="outline" size="sm" onClick={handleRemoveAvatar} disabled={uploadingAvatar}>
                          <X className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG or WebP. Max 2MB.
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>

                {/* Readonly Info */}
                <div className="space-y-3 border-t pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </span>
                    <span className="text-sm font-medium">{userEmail || "No email"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Role
                    </span>
                    {profile?.is_superadmin ? (
                      <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700">
                        Super Admin
                      </Badge>
                    ) : profile?.role ? (
                      <Badge variant="secondary">
                        {profile.role.replace(/_/g, " ")}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">Not set</span>
                    )}
                  </div>
                </div>

                {/* Editable Fields */}
                <div className="space-y-4 border-t pt-6">
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
              </CardContent>
            </Card>

            {/* Admin Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="h-5 w-5" />
                  Admin Info
                </CardTitle>
                <CardDescription>Your admin account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Access Level
                  </span>
                  <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700">
                    {profile?.is_superadmin ? "Super Admin" : "Admin"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    User ID
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    {userId ? `${userId.slice(0, 8)}...` : "-"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </PageLayout>
      </AdminShell>
    </ErrorBoundary>
  );
}
