/**
 * Technical included quota for Postgres RPC when admin leaves SMS enabled with no numeric cap.
 * Keeps overage at zero for any realistic send volume (INTEGER max).
 */
export const SMS_UNLIMITED_INCLUDED_QUOTA = 2_147_483_647 as const;

export function includedQuotaForRpc(included: number | null): number {
  return included === null ? SMS_UNLIMITED_INCLUDED_QUOTA : included;
}

export function isStoredUnlimitedIncludedQuota(stored: number): boolean {
  return stored >= SMS_UNLIMITED_INCLUDED_QUOTA;
}
