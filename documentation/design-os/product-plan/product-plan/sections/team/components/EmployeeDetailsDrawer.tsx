import { X, Mail, Phone, Calendar, Clock, ExternalLink, Edit } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { StatusBadge } from './StatusBadge'
import { RoleBadge } from './RoleBadge'
import type { Employee, Role } from '../types'

interface EmployeeDetailsDrawerProps {
  employee: Employee | null
  role: Role | null
  open: boolean
  onClose: () => void
  onEdit?: (id: string) => void
  onViewShifts?: (employeeId: string) => void
}

export function EmployeeDetailsDrawer({
  employee,
  role,
  open,
  onClose,
  onEdit,
  onViewShifts,
}: EmployeeDetailsDrawerProps) {
  if (!employee || !role) return null

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-2xl">{employee.name}</SheetTitle>
              <SheetDescription className="mt-2">
                Employee profile and details
              </SheetDescription>
            </div>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(employee.id)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status and Role */}
          <div className="flex items-center gap-3">
            <StatusBadge status={employee.status} />
            <RoleBadge role={role} />
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-slate-400" />
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Email</div>
                  <div className="text-sm text-slate-900 dark:text-slate-50">{employee.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-slate-400" />
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Phone</div>
                  <div className="text-sm text-slate-900 dark:text-slate-50">{employee.phone}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Account Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-slate-400" />
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Joined</div>
                  <div className="text-sm text-slate-900 dark:text-slate-50">
                    {formatDate(employee.joinedAt)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-slate-400" />
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Last Active</div>
                  <div className="text-sm text-slate-900 dark:text-slate-50">
                    {formatDateTime(employee.lastActiveAt)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Working Hours / Shifts */}
          {onViewShifts && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onViewShifts(employee.id)}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Working Hours & Shifts
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

