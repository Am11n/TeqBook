"use client";

import { useEffect, useState, useRef } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrentSalon } from "@/components/salon-provider";
import { getCurrentUser } from "@/lib/services/auth-service";
import { getProfileForUser, updateProfile } from "@/lib/services/profiles-service";
import { uploadAvatar, deleteAvatar } from "@/lib/services/storage-service";
import { getRoleDisplayName } from "@/lib/utils/access-control";
import { translations } from "@/i18n/translations";
import { User, Upload, X, Settings } from "lucide-react";
import Link from "next/link";
import { Field } from "@/components/form/Field";
import { InfoRow } from "@/components/profile/info-row";
import { Badge } from "@/components/ui/badge";
export default function ProfilePage() {
  const { user, salon, isReady, refreshSalon } = useCurrentSalon();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<{
    role?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    avatar_url?: string | null;
    is_superadmin?: boolean;
  } | null>(null);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (!isReady) return;

      setLoading(true);
      setError(null);

      try {
        // Get current user email
        const { data: currentUser } = await getCurrentUser();
        if (currentUser?.email) {
          setUserEmail(currentUser.email);
        }

        // Get profile if user exists
        if (user?.id) {
          const { data: profileData, error: profileError } = await getProfileForUser(user.id);
          if (profileError) {
            setError(profileError);
          } else if (profileData) {
            setProfile(profileData);
            setFirstName(profileData.first_name || "");
            setLastName(profileData.last_name || "");
            setAvatarUrl(profileData.avatar_url || null);
            setIsDirty(false);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user?.id, isReady]);

  // Track dirty state
  useEffect(() => {
    if (!profile) return;
    const hasChanges =
      firstName !== (profile.first_name || "") ||
      lastName !== (profile.last_name || "") ||
      avatarUrl !== (profile.avatar_url || null);
    setIsDirty(hasChanges);
  }, [firstName, lastName, avatarUrl, profile]);

  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (userEmail) {
      const name = userEmail.split("@")[0];
      return name.charAt(0).toUpperCase() + (name.length > 1 ? name.charAt(1).toUpperCase() : "");
    }
    return "U";
  };

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    setUploadingAvatar(true);
    setError(null);

    try {
      // Delete old avatar if exists
      if (avatarUrl) {
        await deleteAvatar(avatarUrl, user.id);
      }

      const { data, error: uploadError } = await uploadAvatar(file, user.id);

      if (uploadError || !data) {
        setError(uploadError || "Failed to upload avatar");
        setUploadingAvatar(false);
        return;
      }

      setAvatarUrl(data.url);
      setIsDirty(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleRemoveAvatar() {
    if (!avatarUrl || !user?.id) return;

    setUploadingAvatar(true);
    setError(null);

    try {
      await deleteAvatar(avatarUrl, user.id);
      setAvatarUrl(null);
      setIsDirty(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove avatar");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSave() {
    if (!user?.id) return;

    // Validation
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    if (!trimmedFirstName) {
      setError("First name is required");
      return;
    }

    if (!trimmedLastName) {
      setError("Last name is required");
      return;
    }

    if (trimmedFirstName.length > 50) {
      setError("First name must be 50 characters or less");
      return;
    }

    if (trimmedLastName.length > 50) {
      setError("Last name must be 50 characters or less");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const { error: updateError } = await updateProfile(user.id, {
        first_name: trimmedFirstName || null,
        last_name: trimmedLastName || null,
        avatar_url: avatarUrl || null,
      });

      if (updateError) {
        setError(updateError);
        setSaving(false);
        return;
      }

      // Reload profile
      const { data: profileData } = await getProfileForUser(user.id);
      if (profileData) {
        setProfile(profileData);
        setIsDirty(false);
      }

      setSuccess("Profile updated successfully");
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    if (!profile) return;
    setFirstName(profile.first_name || "");
    setLastName(profile.last_name || "");
    setAvatarUrl(profile.avatar_url || null);
    setIsDirty(false);
    setError(null);
  }

  if (loading) {
    return (
      <PageLayout
        title="My Profile"
        description="Update your personal information"
        showCard={false}
      >
        <div className="max-w-4xl space-y-8">
          <div className="h-64 animate-pulse rounded-xl bg-muted" />
          <div className="h-48 animate-pulse rounded-xl bg-muted" />
        </div>
      </PageLayout>
    );
  }

  return (
    <ErrorBoundary>
      <PageLayout
        title="My Profile"
        description="Update your personal information"
        actions={
          <div className="flex items-center gap-2">
            {isDirty && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!isDirty || saving}
            >
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        }
        showCard={false}
      >
        {error && (
          <ErrorMessage
            message={error}
            onDismiss={() => setError(null)}
            variant="destructive"
            className="mb-6"
          />
        )}

        {success && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
            {success}
          </div>
        )}

        <div className="max-w-4xl space-y-8">
          {/* Card 1: Profile (Editable) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
              <CardDescription>
                Your personal account information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20 border-2 border-primary">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt="Profile avatar" />
                    ) : null}
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-400 text-xl font-semibold text-white">
                      {getInitials()}
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRemoveAvatar}
                          disabled={uploadingAvatar}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG or WebP. Max 2MB. Square images work best.
                    </p>
                  </div>
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
              <div className="space-y-4 border-t pt-6">
                <InfoRow
                  label="Email"
                  value={userEmail || "No email"}
                />
                <InfoRow
                  label="Role"
                  value={
                    profile?.is_superadmin ? (
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
                        Super Admin
                      </Badge>
                    ) : profile?.role ? (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                        {getRoleDisplayName(profile.role)}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">Not set</span>
                    )
                  }
                />
              </div>

              {/* Editable Fields */}
              <div className="space-y-6 border-t pt-6">
                <Field
                  label="First Name"
                  htmlFor="first_name"
                  required
                >
                  <Input
                    id="first_name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter your first name"
                    maxLength={50}
                  />
                </Field>

                <Field
                  label="Last Name"
                  htmlFor="last_name"
                  required
                >
                  <Input
                    id="last_name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter your last name"
                    maxLength={50}
                  />
                </Field>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Workspace (Readonly) */}
          <Card>
            <CardHeader>
              <CardTitle>Workspace</CardTitle>
              <CardDescription>
                Your salon and workspace information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {salon ? (
                <>
                  <InfoRow
                    label="Salon Name"
                    value={salon.name || "Not set"}
                  />
                  <InfoRow
                    label="Salon Type"
                    value={salon.salon_type || "Not set"}
                  />
                  <div className="pt-4 border-t">
                    <Button asChild variant="ghost" size="sm" className="w-full">
                      <Link href="/settings/general">
                        <Settings className="h-4 w-4 mr-2" />
                        Go to Salon Settings
                      </Link>
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No salon assigned</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    </ErrorBoundary>
  );
}
