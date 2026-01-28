// Re-export shared session service
export {
  initSession,
  updateActivity,
  isSessionExpired,
  getTimeUntilExpiry,
  shouldShowWarning,
  clearSession,
  extendSession,
  formatSessionTimeRemaining,
} from "@teqbook/shared";
