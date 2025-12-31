// =============================================================================
// Data Types
// =============================================================================

export interface CustomerNote {
  id: string
  content: string
  createdAt: string
  createdBy: string
}

export interface MarketingConsent {
  email: boolean
  sms: boolean
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  tags: string[]
  notes: CustomerNote[]
  marketingConsent: MarketingConsent
  createdAt: string
  lastBookingDate: string
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

export interface CustomersProps {
  /** The list of customers to display */
  customers: Customer[]
  /** Bookings associated with customers for history display */
  bookings: Booking[]
  /** Called when user wants to view a customer's profile */
  onView?: (id: string) => void
  /** Called when user wants to edit a customer */
  onEdit?: (id: string) => void
  /** Called when user wants to create a new customer */
  onCreate?: () => void
  /** Called when user wants to delete a customer */
  onDelete?: (id: string) => void
  /** Called when user adds a tag to a customer */
  onAddTag?: (customerId: string, tag: string) => void
  /** Called when user removes a tag from a customer */
  onRemoveTag?: (customerId: string, tag: string) => void
  /** Called when user adds a note to a customer */
  onAddNote?: (customerId: string, content: string) => void
  /** Called when user edits a note */
  onEditNote?: (customerId: string, noteId: string, content: string) => void
  /** Called when user deletes a note */
  onDeleteNote?: (customerId: string, noteId: string) => void
  /** Called when user updates marketing consent */
  onUpdateMarketingConsent?: (customerId: string, consent: MarketingConsent) => void
  /** Called when user applies filters */
  onFilter?: (filters: {
    search?: string
    tags?: string[]
  }) => void
}

