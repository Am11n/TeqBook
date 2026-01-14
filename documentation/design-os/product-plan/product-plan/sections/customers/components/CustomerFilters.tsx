import { useState } from 'react'
import { X, Filter, Search, Calendar, Mail } from 'lucide-react'
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
import type { Customer } from '../types'

interface CustomerFiltersProps {
  customers: Customer[]
  onFilter: (filters: {
    search?: string
    tags?: string[]
    lastVisit?: 'week' | 'month' | 'quarter' | 'all'
    marketingOptIn?: 'email' | 'sms' | 'both' | 'none' | 'all'
  }) => void
}

export function CustomerFilters({ customers, onFilter }: CustomerFiltersProps) {
  const [filters, setFilters] = useState<{
    search?: string
    tags?: string[]
    lastVisit?: 'week' | 'month' | 'quarter' | 'all'
    marketingOptIn?: 'email' | 'sms' | 'both' | 'none' | 'all'
  }>({})
  const [searchValue, setSearchValue] = useState('')

  // Extract unique tags from all customers
  const allTags = Array.from(new Set(customers.flatMap((c) => c.tags))).sort()

  const activeFiltersCount = Object.values(filters).filter((v) => {
    if (Array.isArray(v)) return v.length > 0
    return v && v !== 'all'
  }).length

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value === 'all' ? undefined : value }
    setFilters(newFilters)
    onFilter(newFilters)
  }

  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    const newFilters = { ...filters, search: value || undefined }
    setFilters(newFilters)
    onFilter(newFilters)
  }

  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags || []
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag]
    const newFilters = { ...filters, tags: newTags.length > 0 ? newTags : undefined }
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
          placeholder="Search by name, email, or phone..."
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Calendar className="h-4 w-4 mr-1" />
            Last Visit
            {filters.lastVisit && filters.lastVisit !== 'all' && (
              <span className="ml-1.5 h-4 w-4 rounded-full bg-indigo-500 text-white text-[10px] flex items-center justify-center">
                1
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Filter by Last Visit</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleFilterChange('lastVisit', 'all')}>
            All Time
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleFilterChange('lastVisit', 'week')}>
            Last Week
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFilterChange('lastVisit', 'month')}>
            Last Month
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFilterChange('lastVisit', 'quarter')}>
            Last 3 Months
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Mail className="h-4 w-4 mr-1" />
            Marketing
            {filters.marketingOptIn && filters.marketingOptIn !== 'all' && (
              <span className="ml-1.5 h-4 w-4 rounded-full bg-indigo-500 text-white text-[10px] flex items-center justify-center">
                1
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Filter by Marketing Opt-in</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleFilterChange('marketingOptIn', 'all')}>
            All Customers
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleFilterChange('marketingOptIn', 'email')}>
            Email Opt-in
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFilterChange('marketingOptIn', 'sms')}>
            SMS Opt-in
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFilterChange('marketingOptIn', 'both')}>
            Both Email & SMS
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFilterChange('marketingOptIn', 'none')}>
            No Opt-in
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {allTags.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              Tags
              {filters.tags && filters.tags.length > 0 && (
                <span className="ml-1.5 h-4 w-4 rounded-full bg-indigo-500 text-white text-[10px] flex items-center justify-center">
                  {filters.tags.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuLabel>Filter by Tags</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {allTags.map((tag) => (
              <DropdownMenuItem
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className="flex items-center justify-between"
              >
                <span>{tag}</span>
                {filters.tags?.includes(tag) && (
                  <span className="text-indigo-600 dark:text-indigo-400">✓</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

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

