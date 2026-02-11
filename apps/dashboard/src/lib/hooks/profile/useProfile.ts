import { useState, useEffect, useRef } from "react";
import { useCurrentSalon } from "@/components/salon-provider";
import { getCurrentUser, updateUserMetadata } from "@/lib/services/auth-service";
import { getProfileForUser, updateProfile } from "@/lib/services/profiles-service";
import { uploadAvatar, deleteAvatar } from "@/lib/services/storage-service";

export function useProfile() {
  const { user, isReady, refreshSalon } = useCurrentSalon();
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
        // Get current user email and metadata
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
            let resolvedFirstName = profileData.first_name || "";
            let resolvedLastName = profileData.last_name || "";

            // Auto-sync: if profile is missing name but auth user_metadata has it, use that and save
            const meta = currentUser?.user_metadata;
            if (meta && (!resolvedFirstName || !resolvedLastName)) {
              const metaFirst = meta.first_name as string | undefined;
              const metaLast = meta.last_name as string | undefined;
              let needsSync = false;

              if (!resolvedFirstName && metaFirst) {
                resolvedFirstName = metaFirst;
                needsSync = true;
              }
              if (!resolvedLastName && metaLast) {
                resolvedLastName = metaLast;
                needsSync = true;
              }

              // Persist the synced names to the profile so this only runs once
              if (needsSync) {
                await updateProfile(user.id, {
                  first_name: resolvedFirstName || null,
                  last_name: resolvedLastName || null,
                });
              }
            }

            setProfile({
              ...profileData,
              first_name: resolvedFirstName || null,
              last_name: resolvedLastName || null,
            });
            setFirstName(resolvedFirstName);
            setLastName(resolvedLastName);
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

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("File size must be less than 2MB");
      return;
    }

    setUploadingAvatar(true);
    setError(null);

    try {
      const { data: uploadData, error: uploadError } = await uploadAvatar(file, user.id);
      if (uploadError || !uploadData) {
        setError(uploadError || "Failed to upload avatar");
        setUploadingAvatar(false);
        return;
      }

      setAvatarUrl(uploadData.url);
      setIsDirty(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleRemoveAvatar() {
    if (!user?.id || !avatarUrl) return;

    setUploadingAvatar(true);
    setError(null);

    try {
      const { error: deleteError } = await deleteAvatar(avatarUrl, user.id);
      if (deleteError) {
        setError(deleteError);
        setUploadingAvatar(false);
        return;
      }

      setAvatarUrl(null);
      setIsDirty(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove avatar");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSave() {
    if (!user?.id || !isDirty) return;

    setSaving(true);
    setError(null);

    try {
      const { error: updateError } = await updateProfile(user.id, {
        first_name: firstName || null,
        last_name: lastName || null,
        avatar_url: avatarUrl || null,
      });

      if (updateError) {
        setError(updateError);
        setSaving(false);
        return;
      }

      // Also sync name to auth user_metadata so it's always recoverable
      await updateUserMetadata({
        first_name: firstName || null,
        last_name: lastName || null,
      });

      // Reload profile
      const { data: profileData } = await getProfileForUser(user.id);
      if (profileData) {
        setProfile(profileData);
        setIsDirty(false);
      }

      await refreshSalon();
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

  return {
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
  };
}

