// Thin re-export wrapper — preserves the original public API
export type { User } from "./auth/index";
export {
  getCurrentUser,
  signInWithPassword,
  signUp,
  signOut,
  updatePassword,
  getSession,
  updateUserMetadata,
  getEmailVerificationStatus,
  resendEmailVerification,
  getActiveSessionsCount,
  signOutOtherSessions,
  subscribeToAuthChanges,
} from "./auth/index";
