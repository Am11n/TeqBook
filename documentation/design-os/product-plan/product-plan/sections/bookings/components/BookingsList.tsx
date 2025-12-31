import { useState } from 'react'
import { Calendar, List, Plus, Loader2, AlertCircle, CalendarDays } from 'lucide-react'
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
import { BookingFilters } from './BookingFilters'
import { BookingRow } from './BookingRow'
import type { BookingsProps } from '../types'

export function BookingsList({
  bookings,
  services,
  employees,
  customers,
  onView,
  onCreate,
  onEdit,
  onDelete,
  onStatusChange,
  onFilter,
  onViewChange,
}: BookingsProps) {
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filteredBookings, setFilteredBookings] = useState(bookings)

  const handleViewChange = (newView: 'list' | 'calendar') => {
    setView(newView)
    onViewChange?.(newView)
  }

  const handleFilter = (filters: Parameters<NonNullable<typeof onFilter>>[0]) => {
    setIsLoading(true)
    setError(null)

    // Simulate filtering
    setTimeout(() => {
      let filtered = [...bookings]

      if (filters.employeeId) {
        filtered = filtered.filter((b) => b.employeeId === filters.employeeId)
      }
      if (filters.serviceId) {
        filtered = filtered.filter((b) => b.serviceId === filters.serviceId)
      }
      if (filters.status) {
        filtered = filtered.filter((b) => b.status === filters.status)
      }
      if (filters.dateFrom) {
        filtered = filtered.filter((b) => b.date >= filters.dateFrom!)
      }
      if (filters.dateTo) {
        filtered = filtered.filter((b) => b.date <= filters.dateTo!)
      }
      if (filters.customerId) {
        filtered = filtered.filter((b) => b.customerId === filters.customerId)
      }

      setFilteredBookings(filtered)
      setIsLoading(false)
      onFilter?.(filters)
    }, 300)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
          <p className="text-sm text-slate-600 dark:text-slate-400">Loading bookings...</p>
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
                Error Loading Bookings
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{error}</p>
              <Button
                onClick={() => {
                  setError(null)
                  setFilteredBookings(bookings)
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
  if (filteredBookings.length === 0) {
    return (
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Bookings</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Manage appointments and schedules
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-800 rounded-lg p-1">
              <Button
                variant={view === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewChange('list')}
                className="h-8"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={view === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewChange('calendar')}
                className="h-8"
              >
                <Calendar className="h-4 w-4" />
              </Button>
            </div>
            {onCreate && (
              <Button onClick={onCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                New Booking
              </Button>
            )}
          </div>
        </div>

        <BookingFilters services={services} employees={employees} customers={customers} onFilter={handleFilter} />

        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6">
              <div className="text-center">
                <CalendarDays className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
                  No bookings found
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  {bookings.length === 0
                    ? "Get started by creating your first booking."
                    : "Try adjusting your filters to see more results."}
                </p>
                {onCreate && bookings.length === 0 && (
                  <Button onClick={onCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Booking
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Bookings</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {filteredBookings.length} {filteredBookings.length === 1 ? 'booking' : 'bookings'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-800 rounded-lg p-1">
            <Button
              variant={view === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewChange('list')}
              className="h-8"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={view === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewChange('calendar')}
              className="h-8"
            >
              <Calendar className="h-4 w-4" />
            </Button>
          </div>
          {onCreate && (
            <Button onClick={onCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Booking
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <BookingFilters services={services} employees={employees} customers={customers} onFilter={handleFilter} />

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {view === 'list' ? (
          <div className="p-6">
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <BookingRow
                      key={booking.id}
                      booking={booking}
                      onView={onView}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onStatusChange={onStatusChange}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
                    Calendar View
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Calendar view with drag-and-drop rescheduling will be implemented here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

