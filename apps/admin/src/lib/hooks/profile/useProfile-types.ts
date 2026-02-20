import type { AuditLog } from "@/lib/repositories/audit-log";

export type MFAFactor = { id: string; type: string; friendlyName: string };

export interface ProfileState {
  role?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  is_superadmin?: boolean;
}

export interface ProfileFormState {
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  uploadingAvatar: boolean;
  isDirty: boolean;
}

export interface SecurityState {
  loading: boolean;
  error: string | null;
  mfaFactors: MFAFactor[] | null;
  sessionsCount: number | null;
}

export interface ActivityState {
  loading: boolean;
  error: string | null;
  recentActivity: AuditLog[] | null;
}
