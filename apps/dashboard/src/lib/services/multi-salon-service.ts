// Thin re-export wrapper — preserves the original public API
export {
  getDefaultPermissions,
  hasPermission,
  getUserSalons,
  getPortfolioSummary,
  compareSalons,
  getCurrentSalonId,
  setCurrentSalonId,
  clearCurrentSalonId,
  inviteOwner,
  acceptInvitation,
  getRoleDisplayName,
} from "./multi-salon/index";
