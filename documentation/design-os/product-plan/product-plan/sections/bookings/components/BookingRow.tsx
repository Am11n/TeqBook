import { MoreVertical, Edit, Trash2, CheckCircle2, XCircle, Clock } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { StatusBadge } from './StatusBadge'
import type { Booking, BookingStatus } from '../types'

interface BookingRowProps {
  booking: Booking
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onStatusChange?: (id: string, status: BookingStatus) => void
}

export function BookingRow({ booking, onView, onEdit, onDelete, onStatusChange }: BookingRowProps) {
  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`)
    return {
      date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    }
  }

  const { date, time } = formatDateTime(booking.date, booking.time)

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
      <td className="px-4 py-3">
        <div>
          <div className="font-medium text-slate-900 dark:text-slate-50">{booking.customerName}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">{booking.customerId}</div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm text-slate-900 dark:text-slate-50">{booking.serviceName}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400">{booking.duration} min</div>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm text-slate-900 dark:text-slate-50">{booking.employeeName}</div>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm text-slate-900 dark:text-slate-50">{date}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400">{time}</div>
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={booking.status} />
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
              <DropdownMenuItem onClick={() => onView(booking.id)}>
                View Details
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(booking.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {onStatusChange && booking.status !== 'confirmed' && (
              <DropdownMenuItem onClick={() => onStatusChange(booking.id, 'confirmed')}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark as Confirmed
              </DropdownMenuItem>
            )}
            {onStatusChange && booking.status !== 'completed' && (
              <DropdownMenuItem onClick={() => onStatusChange(booking.id, 'completed')}>
                <Clock className="mr-2 h-4 w-4" />
                Mark as Completed
              </DropdownMenuItem>
            )}
            {onStatusChange && booking.status !== 'cancelled' && (
              <DropdownMenuItem
                onClick={() => onStatusChange(booking.id, 'cancelled')}
                className="text-red-600 dark:text-red-400"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancel Booking
              </DropdownMenuItem>
            )}
            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(booking.id)}
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

