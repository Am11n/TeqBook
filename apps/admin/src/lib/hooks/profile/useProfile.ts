import { useState, useEffect, useRef, useCallback } from "react";
import { useCurrentSalon } from "@/components/salon-provider";
import { getCurrentUser, getActiveSessionsCount } from "@/lib/services/auth-service";
import { getProfileForUser, updateProfile } from "@/lib/services/profiles-service";
import { uploadAvatar, deleteAvatar } from "@/lib/services/storage-service";
import { getMFAFactors } from "@/lib/services/two-factor-service";
import { getAuditLogsForUser } from "@/lib/services/audit-log-service";
import type { AuditLog } from "@/lib/repositories/audit-log";
import type { MFAFactor } from "./useProfile-types";
export type { MFAFactor };

export function useProfile() {
  const { user, isReady, refreshSalon } = useCurrentSalon();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [accountCreatedAt, setAccountCreatedAt] = useState<string | null>(null);
  const [profile, setProfile] = useState<{
    role?: string | null; first_name?: string | null; last_name?: string | null;
    avatar_url?: string | null; is_superadmin?: boolean;
  } | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [securityLoading, setSecurityLoading] = useState(true);
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [mfaFactors, setMfaFactors] = useState<MFAFactor[] | null>(null);
  const [sessionsCount, setSessionsCount] = useState<number | null>(null);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [recentActivity, setRecentActivity] = useState<AuditLog[] | null>(null);

  useEffect(() => {
    async function loadProfile() {
      if (!isReady) return;

      setLoading(true);
      setError(null);

      try {
        const { data: currentUser } = await getCurrentUser();
        if (currentUser?.email) {
          setUserEmail(currentUser.email);
        }
        if (currentUser?.created_at) {
          setAccountCreatedAt(currentUser.created_at);
        }

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

      // After profile loads, fire security + activity in parallel (non-blocking)
      if (user?.id) {
        loadSecondaryData(user.id);
      }
    }

    loadProfile();
  }, [user?.id, isReady]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadSecondaryData(userId: string) {
    setSecurityLoading(true);
    setActivityLoading(true);

    const [securityResult, activityResult] = await Promise.allSettled([
      loadSecurityData(),
      loadActivityData(userId),
    ]);

    if (securityResult.status === "rejected") {
      setSecurityError("Could not load security data");
    }
    setSecurityLoading(false);

    if (activityResult.status === "rejected") {
      setActivityError("Could not load activity data");
    }
    setActivityLoading(false);
  }

  async function loadSecurityData() {
    try {
      const [mfaResult, sessionsResult] = await Promise.allSettled([
        getMFAFactors(),
        getActiveSessionsCount(),
      ]);

      // MFA: empty array or error -> treat as "disabled" (no factors), not an error
      if (mfaResult.status === "fulfilled") {
        const { data, error: mfaErr } = mfaResult.value;
        if (mfaErr || !data) {
          setMfaFactors([]);
        } else {
          setMfaFactors(data);
        }
      } else {
        setMfaFactors([]);
      }

      if (sessionsResult.status === "fulfilled") {
        const { data, error: sessErr } = sessionsResult.value;
        if (sessErr) {
          setSessionsCount(null);
        } else {
          setSessionsCount(data);
        }
      } else {
        setSessionsCount(null);
      }
    } catch {
      setSecurityError("Could not load security data");
      setMfaFactors([]);
      setSessionsCount(null);
    }
  }

  async function loadActivityData(userId: string) {
    try {
      const { data, error: actErr } = await getAuditLogsForUser(userId, { limit: 5 });
      if (actErr || !data) {
        setActivityError(actErr || "Could not load activity");
        setRecentActivity([]);
      } else {
        setRecentActivity(data);
        setActivityError(null);
      }
    } catch {
      setActivityError("Could not load activity data");
      setRecentActivity([]);
    }
  }

  const refreshSecurityData = useCallback(async () => {
    setSecurityLoading(true);
    await loadSecurityData();
    setSecurityLoading(false);
  }, []);

  const refreshActivityData = useCallback(async () => {
    if (!user?.id) return;
    setActivityLoading(true);
    await loadActivityData(user.id);
    setActivityLoading(false);
  }, [user?.id]);

  useEffect(() => {
    if (!profile) return;
    setIsDirty(
      firstName !== (profile.first_name || "") ||
      lastName !== (profile.last_name || "") ||
      avatarUrl !== (profile.avatar_url || null)
    );
  }, [firstName, lastName, avatarUrl, profile]);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

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
    loading, saving, error, success, userId: user?.id ?? null, userEmail,
    accountCreatedAt, profile, firstName, setFirstName, lastName, setLastName,
    avatarUrl, uploadingAvatar, isDirty, fileInputRef, handleAvatarUpload,
    handleRemoveAvatar, handleSave, handleCancel, setError, setSuccess,
    securityLoading, securityError, mfaFactors, sessionsCount, refreshSecurityData,
    activityLoading, activityError, recentActivity, refreshActivityData,
  };
}
