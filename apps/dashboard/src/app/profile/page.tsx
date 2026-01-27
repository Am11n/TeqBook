"use client";

import { PageLayout } from "@/components/layout/page-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { Button } from "@/components/ui/button";
import { useCurrentSalon } from "@/components/salon-provider";
import { useProfile } from "@/lib/hooks/profile/useProfile";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { WorkspaceCard } from "@/components/profile/WorkspaceCard";

export default function ProfilePage() {
  const { salon } = useCurrentSalon();
  const {
    loading,
    saving,
    error,
    success,
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
    setSuccess,
  } = useProfile();

  if (loading) {
    return (
      <PageLayout title="My Profile" description="Update your personal information" showCard={false}>
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
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
            {success}
          </div>
        )}

        <div className="max-w-4xl space-y-8">
          <ProfileCard
            firstName={firstName}
            setFirstName={setFirstName}
            lastName={lastName}
            setLastName={setLastName}
            avatarUrl={avatarUrl}
            userEmail={userEmail}
            profile={profile}
            uploadingAvatar={uploadingAvatar}
            fileInputRef={fileInputRef}
            onAvatarUpload={handleAvatarUpload}
            onRemoveAvatar={handleRemoveAvatar}
          />

          <WorkspaceCard salon={salon} />
        </div>
      </PageLayout>
    </ErrorBoundary>
  );
}
