import { useState } from 'react'
import { X, Filter, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { EmployeeStatus, Role } from '../types'

interface TeamFiltersProps {
  roles: Role[]
  onFilter: (filters: {
    roleId?: string
    status?: EmployeeStatus
    search?: string
  }) => void
}

export function TeamFilters({ roles, onFilter }: TeamFiltersProps) {
  const [filters, setFilters] = useState<{
    roleId?: string
    status?: EmployeeStatus
    search?: string
  }>({})
  const [searchValue, setSearchValue] = useState('')

  const activeFiltersCount = Object.values(filters).filter(Boolean).length

  const handleFilterChange = (key: string, value: string | undefined) => {
    const newFilters = { ...filters, [key]: value || undefined }
    setFilters(newFilters)
    onFilter(newFilters)
  }

  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    const newFilters = { ...filters, search: value || undefined }
    setFilters(newFilters)
    onFilter(newFilters)
  }

  const clearFilters = () => {
    setFilters({})
    setSearchValue('')
    onFilter({})
  }

  return (
    <div className="flex flex-wrap items-center gap-2 p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
        <Filter className="h-4 w-4" />
        <span>Filters</span>
      </div>

      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search by name or email..."
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            Role
            {filters.roleId && (
              <span className="ml-1.5 h-4 w-4 rounded-full bg-indigo-500 text-white text-[10px] flex items-center justify-center">
                1
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleFilterChange('roleId', undefined)}>
            All Roles
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {roles.map((role) => (
            <DropdownMenuItem
              key={role.id}
              onClick={() => handleFilterChange('roleId', role.id)}
            >
              {role.name}
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
          <DropdownMenuItem onClick={() => handleFilterChange('status', 'active')}>
            Active
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFilterChange('status', 'invited')}>
            Invited
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFilterChange('status', 'disabled')}>
            Disabled
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

