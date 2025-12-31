import { useState, useMemo } from 'react'
import { Plus, UserPlus, Loader2, AlertCircle, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TeamFilters } from './TeamFilters'
import { TeamRow } from './TeamRow'
import { EmployeeDetailsDrawer } from './EmployeeDetailsDrawer'
import { InviteModal } from './InviteModal'
import type { TeamProps, Employee, EmployeeStatus } from '../types'

export function TeamList({
  employees,
  pendingInvites,
  roles,
  onView,
  onEdit,
  onInvite,
  onResendInvite,
  onRevokeInvite,
  onUpdateRole,
  onUpdateStatus,
  onDelete,
  onFilter,
  onViewShifts,
}: TeamProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [filters, setFilters] = useState<{
    roleId?: string
    status?: EmployeeStatus
    search?: string
  }>({})

  // Filter employees based on current filters
  const filteredEmployees = useMemo(() => {
    let filtered = [...employees]

    if (filters.roleId) {
      filtered = filtered.filter((e) => e.roleId === filters.roleId)
    }
    if (filters.status) {
      filtered = filtered.filter((e) => e.status === filters.status)
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (e) =>
          e.name.toLowerCase().includes(searchLower) ||
          e.email.toLowerCase().includes(searchLower)
      )
    }

    return filtered
  }, [employees, filters])

  const handleFilter = (newFilters: Parameters<NonNullable<typeof onFilter>>[0]) => {
    setIsLoading(true)
    setError(null)

    // Simulate filtering
    setTimeout(() => {
      setFilters(newFilters)
      setIsLoading(false)
      onFilter?.(newFilters)
    }, 300)
  }

  const handleView = (id: string) => {
    const employee = employees.find((e) => e.id === id)
    if (employee) {
      setSelectedEmployee(employee)
      setIsDrawerOpen(true)
      onView?.(id)
    }
  }

  const handleInvite = (email: string, roleId: string) => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      onInvite?.(email, roleId)
      setIsLoading(false)
      setIsInviteModalOpen(false)
    }, 500)
  }

  const selectedRole = selectedEmployee
    ? roles.find((r) => r.id === selectedEmployee.roleId) || null
    : null

  // Loading state
  if (isLoading && filteredEmployees.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
          <p className="text-sm text-slate-600 dark:text-slate-400">Loading team...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
                Error Loading Team
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{error}</p>
              <Button
                onClick={() => {
                  setError(null)
                  setFilters({})
                }}
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Empty state
  if (filteredEmployees.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Team</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Manage your team members and access
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onInvite && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsInviteModalOpen(true)}
                  className="bg-white dark:bg-slate-900"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
                <Button onClick={() => setIsInviteModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Employee
                </Button>
              </>
            )}
          </div>
        </div>

        <TeamFilters roles={roles} onFilter={handleFilter} />

        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
                  {employees.length === 0 ? 'No team members yet' : 'No matching team members'}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  {employees.length === 0
                    ? "Get started by inviting your first team member."
                    : "Try adjusting your filters to see more results."}
                </p>
                {onInvite && employees.length === 0 && (
                  <Button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Team Member
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <InviteModal
          open={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          roles={roles}
          onInvite={handleInvite}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Team</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {filteredEmployees.length} {filteredEmployees.length === 1 ? 'member' : 'members'}
            {pendingInvites.length > 0 && ` • ${pendingInvites.length} pending ${pendingInvites.length === 1 ? 'invite' : 'invites'}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onInvite && (
            <>
              <Button
                variant="outline"
                onClick={() => setIsInviteModalOpen(true)}
                className="bg-white dark:bg-slate-900"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
              <Button onClick={() => setIsInviteModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <TeamFilters roles={roles} onFilter={handleFilter} />

      {/* Pending Invites Section */}
      {pendingInvites.length > 0 && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border-b border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                Pending Invitations ({pendingInvites.length})
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {pendingInvites.map((inv) => inv.email).join(', ')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {onResendInvite && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => pendingInvites.forEach((inv) => onResendInvite?.(inv.id))}
                >
                  Resend All
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => {
                  const role = roles.find((r) => r.id === employee.roleId)
                  if (!role) return null
                  return (
                    <TeamRow
                      key={employee.id}
                      employee={employee}
                      role={role}
                      onView={handleView}
                      onEdit={onEdit}
                      onUpdateStatus={onUpdateStatus}
                      onResendInvite={onResendInvite}
                    />
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Employee Details Drawer */}
      <EmployeeDetailsDrawer
        employee={selectedEmployee}
        role={selectedRole}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onEdit={onEdit}
        onViewShifts={onViewShifts}
      />

      {/* Invite Modal */}
      <InviteModal
        open={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        roles={roles}
        onInvite={handleInvite}
      />
    </div>
  )
}

