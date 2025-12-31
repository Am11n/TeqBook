import { useState } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'
import { SettingsNav, type SettingsSection } from './SettingsNav'
import { ProfileSection } from './ProfileSection'
import { HoursSection } from './HoursSection'
import { BrandingSection } from './BrandingSection'
import { BillingSection } from './BillingSection'
import { NotificationsSection } from './NotificationsSection'
import type { BusinessProps } from '../types'

export function BusinessSettings({
  salon,
  openingHours,
  paymentPlans,
  subscription,
  invoices,
  branding,
  notificationPreferences,
  onUpdateProfile,
  onUpdateOpeningHours,
  onUploadLogo,
  onRemoveLogo,
  onUpdateBranding,
  onUpgradePlan,
  onCancelSubscription,
  onDownloadInvoice,
  onUpdateNotifications,
}: BusinessProps) {
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpdateProfile = async (updatedSalon: Partial<typeof salon>) => {
    setIsLoading(true)
    setError(null)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      onUpdateProfile?.(updatedSalon)
    } catch (err) {
      setError('Failed to update profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateHours = async (hours: typeof openingHours) => {
    setIsLoading(true)
    setError(null)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      onUpdateOpeningHours?.(hours)
    } catch (err) {
      setError('Failed to update opening hours. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUploadLogo = async (file: File) => {
    setIsLoading(true)
    setError(null)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      onUploadLogo?.(file)
    } catch (err) {
      setError('Failed to upload logo. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateNotifications = async (prefs: typeof notificationPreferences) => {
    setIsLoading(true)
    setError(null)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      onUpdateNotifications?.(prefs)
    } catch (err) {
      setError('Failed to update notification preferences. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">Error</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
        <button
          onClick={() => setError(null)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row h-full bg-slate-50 dark:bg-slate-950">
      <SettingsNav activeSection={activeSection} onSectionChange={setActiveSection} />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
          {isLoading && (
            <div className="fixed inset-0 bg-black/20 dark:bg-black/40 z-50 flex items-center justify-center">
              <div className="bg-white dark:bg-slate-900 rounded-lg p-6 flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                <span className="text-slate-900 dark:text-slate-50">Saving changes...</span>
              </div>
            </div>
          )}

          {activeSection === 'profile' && (
            <ProfileSection salon={salon} onUpdate={handleUpdateProfile} isLoading={isLoading} />
          )}
          {activeSection === 'hours' && (
            <HoursSection
              openingHours={openingHours}
              onUpdate={handleUpdateHours}
              isLoading={isLoading}
            />
          )}
          {activeSection === 'branding' && (
            <BrandingSection
              branding={branding}
              onUploadLogo={handleUploadLogo}
              onRemoveLogo={onRemoveLogo}
              onUpdateBranding={onUpdateBranding}
              isLoading={isLoading}
            />
          )}
          {activeSection === 'billing' && (
            <BillingSection
              subscription={subscription}
              paymentPlans={paymentPlans}
              invoices={invoices}
              onUpgradePlan={onUpgradePlan}
              onCancelSubscription={onCancelSubscription}
              onDownloadInvoice={onDownloadInvoice}
              isLoading={isLoading}
            />
          )}
          {activeSection === 'notifications' && (
            <NotificationsSection
              notificationPreferences={notificationPreferences}
              onUpdate={handleUpdateNotifications}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  )
}

