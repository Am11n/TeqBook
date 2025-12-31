// =============================================================================
// Data Types
// =============================================================================

export interface RolePermissions {
  manageTeam: boolean
  manageBookings: boolean
  manageCustomers: boolean
  manageServices: boolean
  viewReports: boolean
  manageSettings: boolean
  manageBilling: boolean
  assignRoles: boolean
}

export interface Role {
  id: string
  name: string
  description: string
  permissions: RolePermissions
}

export interface PendingInvite {
  id: string
  email: string
  roleId: string
  roleName: string
  invitedBy: string
  invitedAt: string
  expiresAt: string
}

export type EmployeeStatus = 'active' | 'invited' | 'disabled'

export interface Employee {
  id: string
  userId: string | null
  name: string
  email: string
  phone: string
  roleId: string
  roleName: string
  status: EmployeeStatus
  avatarUrl: string | null
  joinedAt: string | null
  lastActiveAt: string | null
}

// =============================================================================
// Component Props
// =============================================================================

export interface TeamProps {
  /** The list of employees to display */
  employees: Employee[]
  /** Pending invitations that haven't been accepted yet */
  pendingInvites: PendingInvite[]
  /** Available roles with their permission sets */
  roles: Role[]
  /** Called when user wants to view an employee's profile */
  onView?: (id: string) => void
  /** Called when user wants to edit an employee */
  onEdit?: (id: string) => void
  /** Called when user wants to invite a new team member */
  onInvite?: (email: string, roleId: string) => void
  /** Called when user wants to resend a pending invite */
  onResendInvite?: (id: string) => void
  /** Called when user wants to revoke a pending invite */
  onRevokeInvite?: (id: string) => void
  /** Called when user wants to update an employee's role */
  onUpdateRole?: (employeeId: string, roleId: string) => void
  /** Called when user wants to update an employee's status */
  onUpdateStatus?: (employeeId: string, status: EmployeeStatus) => void
  /** Called when user wants to delete/remove an employee */
  onDelete?: (id: string) => void
  /** Called when user applies filters */
  onFilter?: (filters: {
    roleId?: string
    status?: EmployeeStatus
    search?: string
  }) => void
  /** Called when user wants to navigate to Shifts section for an employee */
  onViewShifts?: (employeeId: string) => void
}

