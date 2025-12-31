import { useState } from 'react'
import { Bell, Save, X, Mail, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import type { NotificationPreferences, NotificationChannel } from '../types'

interface NotificationsSectionProps {
  notificationPreferences: NotificationPreferences
  onUpdate?: (preferences: NotificationPreferences) => void
  isLoading?: boolean
}

const notificationTypes: Array<{
  key: keyof NotificationPreferences
  label: string
  description: string
}> = [
  {
    key: 'bookingReminders',
    label: 'Booking Reminders',
    description: 'Get notified before appointments',
  },
  {
    key: 'cancellations',
    label: 'Cancellations',
    description: 'Alert when bookings are cancelled',
  },
  {
    key: 'newBookings',
    label: 'New Bookings',
    description: 'Notify when new appointments are created',
  },
  {
    key: 'paymentReceipts',
    label: 'Payment Receipts',
    description: 'Receive payment confirmations',
  },
  {
    key: 'reports',
    label: 'Reports',
    description: 'Get weekly and monthly reports',
  },
]

export function NotificationsSection({
  notificationPreferences,
  onUpdate,
  isLoading,
}: NotificationsSectionProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>(notificationPreferences)
  const [hasChanges, setHasChanges] = useState(false)

  const handleToggle = (type: keyof NotificationPreferences, channel: 'email' | 'sms', checked: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [channel]: checked,
      },
    }))
    setHasChanges(true)
  }

  const handleSave = () => {
    onUpdate?.(preferences)
    setHasChanges(false)
  }

  const handleCancel = () => {
    setPreferences(notificationPreferences)
    setHasChanges(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
          <Bell className="h-6 w-6" />
          Notifications
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Configure how and when you receive notifications
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Choose your preferred notification channels for each event type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {notificationTypes.map((type, index) => {
              const pref = preferences[type.key]
              return (
                <div key={type.key}>
                  <div className="space-y-4">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-50">{type.label}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">{type.description}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                          <Label htmlFor={`${type.key}-email`} className="cursor-pointer">
                            Email
                          </Label>
                        </div>
                        <Switch
                          id={`${type.key}-email`}
                          checked={pref.email}
                          onCheckedChange={(checked) => handleToggle(type.key, 'email', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                          <Label htmlFor={`${type.key}-sms`} className="cursor-pointer">
                            SMS
                          </Label>
                        </div>
                        <Switch
                          id={`${type.key}-sms`}
                          checked={pref.sms}
                          onCheckedChange={(checked) => handleToggle(type.key, 'sms', checked)}
                        />
                      </div>
                    </div>
                  </div>
                  {index < notificationTypes.length - 1 && <Separator className="mt-6" />}
                </div>
              )
            })}
          </div>

          {hasChanges && (
            <div className="flex items-center gap-2 pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
              <Button onClick={handleSave} disabled={isLoading} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button onClick={handleCancel} variant="outline" disabled={isLoading}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

