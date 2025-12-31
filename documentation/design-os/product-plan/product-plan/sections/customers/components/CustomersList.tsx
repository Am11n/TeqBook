import { useState, useMemo } from 'react'
import { Plus, Loader2, AlertCircle, Users } from 'lucide-react'
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
import { CustomerFilters } from './CustomerFilters'
import { CustomerRow } from './CustomerRow'
import { CustomerProfileDrawer } from './CustomerProfileDrawer'
import type { CustomersProps, Customer } from '../types'

export function CustomersList({
  customers,
  bookings,
  onView,
  onEdit,
  onCreate,
  onDelete,
  onAddTag,
  onRemoveTag,
  onAddNote,
  onEditNote,
  onDeleteNote,
  onUpdateMarketingConsent,
  onFilter,
}: CustomersProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [filters, setFilters] = useState<{
    search?: string
    tags?: string[]
    lastVisit?: 'week' | 'month' | 'quarter' | 'all'
    marketingOptIn?: 'email' | 'sms' | 'both' | 'none' | 'all'
  }>({})

  // Filter customers based on current filters
  const filteredCustomers = useMemo(() => {
    let filtered = [...customers]

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.email.toLowerCase().includes(searchLower) ||
          c.phone.includes(searchLower)
      )
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter((c) =>
        filters.tags!.some((tag) => c.tags.includes(tag))
      )
    }

    if (filters.lastVisit && filters.lastVisit !== 'all') {
      const now = new Date()
      let cutoffDate = new Date()
      if (filters.lastVisit === 'week') {
        cutoffDate.setDate(now.getDate() - 7)
      } else if (filters.lastVisit === 'month') {
        cutoffDate.setMonth(now.getMonth() - 1)
      } else if (filters.lastVisit === 'quarter') {
        cutoffDate.setMonth(now.getMonth() - 3)
      }
      filtered = filtered.filter((c) => {
        if (!c.lastBookingDate) return false
        const lastBooking = new Date(c.lastBookingDate)
        return lastBooking >= cutoffDate
      })
    }

    if (filters.marketingOptIn && filters.marketingOptIn !== 'all') {
      filtered = filtered.filter((c) => {
        if (filters.marketingOptIn === 'email') return c.marketingConsent.email
        if (filters.marketingOptIn === 'sms') return c.marketingConsent.sms
        if (filters.marketingOptIn === 'both')
          return c.marketingConsent.email && c.marketingConsent.sms
        if (filters.marketingOptIn === 'none')
          return !c.marketingConsent.email && !c.marketingConsent.sms
        return true
      })
    }

    return filtered
  }, [customers, filters])

  const handleFilter = (newFilters: Parameters<NonNullable<typeof onFilter>>[0] & {
    lastVisit?: 'week' | 'month' | 'quarter' | 'all'
    marketingOptIn?: 'email' | 'sms' | 'both' | 'none' | 'all'
  }) => {
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
    const customer = customers.find((c) => c.id === id)
    if (customer) {
      setSelectedCustomer(customer)
      setIsDrawerOpen(true)
      onView?.(id)
    }
  }

  // Loading state
  if (isLoading && filteredCustomers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
          <p className="text-sm text-slate-600 dark:text-slate-400">Loading customers...</p>
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
                Error Loading Customers
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
  if (filteredCustomers.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Customers</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Manage your customer directory and booking history
            </p>
          </div>
          {onCreate && (
            <Button onClick={onCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Customer
            </Button>
          )}
        </div>

        <CustomerFilters customers={customers} onFilter={handleFilter} />

        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
                  {customers.length === 0 ? 'No customers yet' : 'No matching customers'}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  {customers.length === 0
                    ? "Get started by adding your first customer."
                    : "Try adjusting your filters to see more results."}
                </p>
                {onCreate && customers.length === 0 && (
                  <Button
                    onClick={onCreate}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Customer
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
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Customers</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {filteredCustomers.length} {filteredCustomers.length === 1 ? 'customer' : 'customers'}
          </p>
        </div>
        {onCreate && (
          <Button onClick={onCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            New Customer
          </Button>
        )}
      </div>

      {/* Filters */}
      <CustomerFilters customers={customers} onFilter={handleFilter} />

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Last Visit</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Marketing</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <CustomerRow
                    key={customer.id}
                    customer={customer}
                    onView={handleView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Customer Profile Drawer */}
      <CustomerProfileDrawer
        customer={selectedCustomer}
        bookings={bookings}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onEdit={onEdit}
        onAddTag={onAddTag}
        onRemoveTag={onRemoveTag}
        onAddNote={onAddNote}
        onEditNote={onEditNote}
        onDeleteNote={onDeleteNote}
        onUpdateMarketingConsent={onUpdateMarketingConsent}
      />
    </div>
  )
}

