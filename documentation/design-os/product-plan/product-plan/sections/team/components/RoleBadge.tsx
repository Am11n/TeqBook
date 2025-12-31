import { Badge } from '@/components/ui/badge'
import type { Role } from '../types'

interface RoleBadgeProps {
  role: Role
}

const roleConfig: Record<string, { className: string }> = {
  Admin: {
    className: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
  },
  Manager: {
    className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  },
  Staff: {
    className: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  },
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const config = roleConfig[role.name] || roleConfig.Staff
  return (
    <Badge variant="outline" className={config.className}>
      {role.name}
    </Badge>
  )
}

