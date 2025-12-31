// =============================================================================
// Data Types
// =============================================================================

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
}

export interface Salon {
  id: string
  name: string
  address: Address
  phone: string
  email: string
  website: string
  taxId: string | null
}

export interface OpeningHours {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
  open: string | null
  close: string | null
  closed: boolean
}

export interface PlanLimits {
  employees: number
  bookings: number
  customers: number
  storage: string
}

export interface PaymentPlan {
  id: string
  name: string
  description: string
  price: number
  billingCycle: 'monthly' | 'yearly'
  features: string[]
  limits: PlanLimits
}

export interface Subscription {
  id: string
  planId: string
  planName: string
  status: 'active' | 'cancelled' | 'past_due' | 'trialing'
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  trialEndsAt: string | null
}

export type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'failed'

export interface Invoice {
  id: string
  invoiceNumber: string
  date: string
  amount: number
  status: InvoiceStatus
  planName: string
  period: string
  downloadUrl: string
}

export interface BrandingColors {
  primary: string
  secondary: string
  neutral: string
}

export interface Branding {
  logoUrl: string | null
  logoPlaceholder: boolean
  colors: BrandingColors
}

export interface NotificationChannel {
  email: boolean
  sms: boolean
}

export interface NotificationPreferences {
  bookingReminders: NotificationChannel
  cancellations: NotificationChannel
  newBookings: NotificationChannel
  paymentReceipts: NotificationChannel
  reports: NotificationChannel
}

// =============================================================================
// Component Props
// =============================================================================

export interface BusinessProps {
  /** The salon business profile */
  salon: Salon
  /** Opening hours configuration for each day of the week */
  openingHours: OpeningHours[]
  /** Available payment plans for subscription */
  paymentPlans: PaymentPlan[]
  /** Current active subscription */
  subscription: Subscription
  /** Billing invoices history */
  invoices: Invoice[]
  /** Branding configuration including logo and colors */
  branding: Branding
  /** Notification preferences for email and SMS */
  notificationPreferences: NotificationPreferences
  /** Called when user updates business profile */
  onUpdateProfile?: (salon: Partial<Salon>) => void
  /** Called when user updates opening hours */
  onUpdateOpeningHours?: (hours: OpeningHours[]) => void
  /** Called when user uploads a new logo */
  onUploadLogo?: (file: File) => void
  /** Called when user removes logo */
  onRemoveLogo?: () => void
  /** Called when user updates branding colors */
  onUpdateBranding?: (colors: BrandingColors) => void
  /** Called when user upgrades or changes subscription plan */
  onUpgradePlan?: (planId: string) => void
  /** Called when user cancels subscription */
  onCancelSubscription?: () => void
  /** Called when user downloads an invoice */
  onDownloadInvoice?: (invoiceId: string) => void
  /** Called when user updates notification preferences */
  onUpdateNotifications?: (preferences: NotificationPreferences) => void
}

