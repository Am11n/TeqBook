import { useState } from 'react'
import { X, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { BookingStatus, Service, Employee, Customer } from '../types'

interface BookingFiltersProps {
  services: Service[]
  employees: Employee[]
  customers: Customer[]
  onFilter: (filters: {
    employeeId?: string
    serviceId?: string
    status?: BookingStatus
    dateFrom?: string
    dateTo?: string
    customerId?: string
  }) => void
}

export function BookingFilters({ services, employees, customers, onFilter }: BookingFiltersProps) {
  const [filters, setFilters] = useState<{
    employeeId?: string
    serviceId?: string
    status?: BookingStatus
    dateFrom?: string
    dateTo?: string
    customerId?: string
  }>({})

  const activeFiltersCount = Object.values(filters).filter(Boolean).length

  const handleFilterChange = (key: string, value: string | undefined) => {
    const newFilters = { ...filters, [key]: value || undefined }
    setFilters(newFilters)
    onFilter(newFilters)
  }

  const clearFilters = () => {
    setFilters({})
    onFilter({})
  }

  return (
    <div className="flex flex-wrap items-center gap-2 p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
        <Filter className="h-4 w-4" />
        <span>Filters</span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            Employee
            {filters.employeeId && (
              <span className="ml-1.5 h-4 w-4 rounded-full bg-indigo-500 text-white text-[10px] flex items-center justify-center">
                1
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Filter by Employee</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleFilterChange('employeeId', undefined)}>
            All Employees
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {employees.map((employee) => (
            <DropdownMenuItem
              key={employee.id}
              onClick={() => handleFilterChange('employeeId', employee.id)}
            >
              {employee.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            Service
            {filters.serviceId && (
              <span className="ml-1.5 h-4 w-4 rounded-full bg-indigo-500 text-white text-[10px] flex items-center justify-center">
                1
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Filter by Service</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleFilterChange('serviceId', undefined)}>
            All Services
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {services.map((service) => (
            <DropdownMenuItem
              key={service.id}
              onClick={() => handleFilterChange('serviceId', service.id)}
            >
              {service.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            Status
            {filters.status && (
              <span className="ml-1.5 h-4 w-4 rounded-full bg-indigo-500 text-white text-[10px] flex items-center justify-center">
                1
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleFilterChange('status', undefined)}>
            All Statuses
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleFilterChange('status', 'pending')}>
            Pending
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFilterChange('status', 'confirmed')}>
            Confirmed
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFilterChange('status', 'in-progress')}>
            In Progress
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFilterChange('status', 'completed')}>
            Completed
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFilterChange('status', 'cancelled')}>
            Cancelled
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFilterChange('status', 'no-show')}>
            No Show
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex-1" />

      {activeFiltersCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-8 text-slate-600 dark:text-slate-400"
        >
          <X className="h-4 w-4 mr-1" />
          Clear ({activeFiltersCount})
        </Button>
      )}
    </div>
  )
}

