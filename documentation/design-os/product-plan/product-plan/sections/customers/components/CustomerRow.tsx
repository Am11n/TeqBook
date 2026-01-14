import { MoreVertical, Edit, Trash2, Eye } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { TagBadge } from './TagBadge'
import type { Customer } from '../types'

interface CustomerRowProps {
  customer: Customer
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function CustomerRow({ customer, onView, onEdit, onDelete }: CustomerRowProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
      <td className="px-4 py-3">
        <div>
          <div className="font-medium text-slate-900 dark:text-slate-50">{customer.name}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">{customer.email}</div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm text-slate-900 dark:text-slate-50">{customer.phone}</div>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm text-slate-900 dark:text-slate-50">
          {formatDate(customer.lastBookingDate)}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {customer.tags.length > 0 ? (
            customer.tags.slice(0, 2).map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))
          ) : (
            <span className="text-xs text-slate-400 dark:text-slate-500">No tags</span>
          )}
          {customer.tags.length > 2 && (
            <span className="text-xs text-slate-400 dark:text-slate-500">
              +{customer.tags.length - 2}
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {customer.marketingConsent.email && (
            <span className="text-xs text-slate-500 dark:text-slate-400" title="Email opt-in">
              📧
            </span>
          )}
          {customer.marketingConsent.sms && (
            <span className="text-xs text-slate-500 dark:text-slate-400" title="SMS opt-in">
              💬
            </span>
          )}
          {!customer.marketingConsent.email && !customer.marketingConsent.sms && (
            <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
          )}
        </div>
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
              <DropdownMenuItem onClick={() => onView(customer.id)}>
                <Eye className="mr-2 h-4 w-4" />
                View Profile
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(customer.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            )}
            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(customer.id)}
                  className="text-red-600 dark:text-red-400"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  )
}

