export type { Resource, Action, Permission, RolePermissions } from "./permissions/index";
export {
  DEFAULT_PERMISSIONS, getAllResources, getAllActions, getResourceDisplayName, getActionDisplayName,
  hasDefaultPermission, hasPermission, hasPermissionSync, requirePermission,
  getPermissionsForRole, getPermissionMatrix,
  canView, canCreate, canEdit, canDelete,
  invalidatePermissionsCache,
} from "./permissions/index";
