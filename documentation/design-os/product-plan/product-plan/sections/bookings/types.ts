// =============================================================================
// Data Types
// =============================================================================

export interface Service {
  id: string
  name: string
  description: string
  duration: number
  price: number
  category: string
}

export interface Employee {
  id: string
  name: string
  email: string
  phone: string
  specialties: string[]
  avatarUrl: string | null
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  notes: string
}

export type BookingStatus = 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show'

export interface Booking {
  id: string
  customerId: string
  customerName: string
  serviceId: string
  serviceName: string
  employeeId: string
  employeeName: string
  date: string
  time: string
  duration: number
  status: BookingStatus
  notes: string
  createdAt: string
}

// =============================================================================
// Component Props
// =============================================================================

export interface BookingsProps {
  /** The list of bookings to display */
  bookings: Booking[]
  /** Available services for filtering and selection */
  services: Service[]
  /** Available employees for filtering and selection */
  employees: Employee[]
  /** Available customers for selection */
  customers: Customer[]
  /** Called when user wants to view a booking's details */
  onView?: (id: string) => void
  /** Called when user wants to create a new booking */
  onCreate?: () => void
  /** Called when user wants to edit a booking */
  onEdit?: (id: string) => void
  /** Called when user wants to delete a booking */
  onDelete?: (id: string) => void
  /** Called when user updates a booking's status */
  onStatusChange?: (id: string, status: BookingStatus) => void
  /** Called when user reschedules a booking via drag and drop */
  onReschedule?: (id: string, newDate: string, newTime: string) => void
  /** Called when user applies filters */
  onFilter?: (filters: {
    employeeId?: string
    serviceId?: string
    status?: BookingStatus
    dateFrom?: string
    dateTo?: string
    customerId?: string
  }) => void
  /** Called when user switches between list and calendar view */
  onViewChange?: (view: 'list' | 'calendar') => void
}

