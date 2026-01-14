import { MoreVertical, Edit, UserX, Mail, UserPlus } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { StatusBadge } from './StatusBadge'
import { RoleBadge } from './RoleBadge'
import type { Employee, Role, EmployeeStatus } from '../types'

interface TeamRowProps {
  employee: Employee
  role: Role
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onUpdateStatus?: (id: string, status: EmployeeStatus) => void
  onResendInvite?: (id: string) => void
}

export function TeamRow({ employee, role, onView, onEdit, onUpdateStatus, onResendInvite }: TeamRowProps) {
  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
      <td className="px-4 py-3">
        <div>
          <div className="font-medium text-slate-900 dark:text-slate-50">{employee.name}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">{employee.email}</div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm text-slate-900 dark:text-slate-50">{employee.phone}</div>
      </td>
      <td className="px-4 py-3">
        <RoleBadge role={role} />
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={employee.status} />
      </td>
      <td className="px-4 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onView && (
              <DropdownMenuItem onClick={() => onView(employee.id)}>
                View Details
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(employee.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            )}
            {employee.status === 'invited' && onResendInvite && (
              <DropdownMenuItem onClick={() => onResendInvite(employee.id)}>
                <Mail className="mr-2 h-4 w-4" />
                Resend Invite
              </DropdownMenuItem>
            )}
            {onUpdateStatus && employee.status === 'active' && (
              <DropdownMenuItem
                onClick={() => onUpdateStatus(employee.id, 'disabled')}
                className="text-red-600 dark:text-red-400"
              >
                <UserX className="mr-2 h-4 w-4" />
                Disable
              </DropdownMenuItem>
            )}
            {onUpdateStatus && employee.status === 'disabled' && (
              <DropdownMenuItem onClick={() => onUpdateStatus(employee.id, 'active')}>
                <UserPlus className="mr-2 h-4 w-4" />
                Enable
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  )
}

