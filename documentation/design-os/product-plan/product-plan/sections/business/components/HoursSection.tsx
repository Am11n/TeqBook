import { useState } from 'react'
import { Clock, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import type { OpeningHours } from '../types'

interface HoursSectionProps {
  openingHours: OpeningHours[]
  onUpdate?: (hours: OpeningHours[]) => void
  isLoading?: boolean
}

const dayLabels: Record<OpeningHours['day'], string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
}

export function HoursSection({ openingHours, onUpdate, isLoading }: HoursSectionProps) {
  const [hours, setHours] = useState<OpeningHours[]>(openingHours)
  const [hasChanges, setHasChanges] = useState(false)

  const handleDayChange = (day: OpeningHours['day'], field: 'open' | 'close' | 'closed', value: string | boolean) => {
    setHours((prev) =>
      prev.map((h) =>
        h.day === day
          ? { ...h, [field]: value, ...(field === 'closed' && value === true ? { open: null, close: null } : {}) }
          : h
      )
    )
    setHasChanges(true)
  }

  const handleSave = () => {
    onUpdate?.(hours)
    setHasChanges(false)
  }

  const handleCancel = () => {
    setHours(openingHours)
    setHasChanges(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
          <Clock className="h-6 w-6" />
          Opening Hours
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Configure your business hours for each day of the week
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
          <CardDescription>Set opening and closing times for each day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {hours.map((dayHours) => (
              <div
                key={dayHours.day}
                className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-800"
              >
                <div className="w-24 text-sm font-medium text-slate-700 dark:text-slate-300">
                  {dayLabels[dayHours.day]}
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <Switch
                    checked={!dayHours.closed}
                    onCheckedChange={(checked) => handleDayChange(dayHours.day, 'closed', !checked)}
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {dayHours.closed ? 'Closed' : 'Open'}
                  </span>
                </div>
                {!dayHours.closed && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={dayHours.open || ''}
                      onChange={(e) => handleDayChange(dayHours.day, 'open', e.target.value)}
                      className="w-32"
                    />
                    <span className="text-slate-500 dark:text-slate-400">to</span>
                    <Input
                      type="time"
                      value={dayHours.close || ''}
                      onChange={(e) => handleDayChange(dayHours.day, 'close', e.target.value)}
                      className="w-32"
                    />
                  </div>
                )}
              </div>
            ))}
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

