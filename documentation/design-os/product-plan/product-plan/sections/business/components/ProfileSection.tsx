import { useState } from 'react'
import { Building2, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { Salon } from '../types'

interface ProfileSectionProps {
  salon: Salon
  onUpdate?: (salon: Partial<Salon>) => void
  isLoading?: boolean
}

export function ProfileSection({ salon, onUpdate, isLoading }: ProfileSectionProps) {
  const [formData, setFormData] = useState<Salon>(salon)
  const [hasChanges, setHasChanges] = useState(false)

  const handleChange = (field: keyof Salon, value: string) => {
    if (field === 'address') {
      // Handle nested address fields separately
      return
    }
    setFormData((prev) => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleAddressChange = (field: keyof Salon['address'], value: string) => {
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }))
    setHasChanges(true)
  }

  const handleSave = () => {
    onUpdate?.(formData)
    setHasChanges(false)
  }

  const handleCancel = () => {
    setFormData(salon)
    setHasChanges(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          Business Profile
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Manage your business information and contact details
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>Update your salon's profile details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Business Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter business name"
            />
          </div>

          <div className="space-y-2">
            <Label>Address</Label>
            <div className="space-y-2">
              <Input
                value={formData.address.street}
                onChange={(e) => handleAddressChange('street', e.target.value)}
                placeholder="Street address"
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={formData.address.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  placeholder="City"
                />
                <Input
                  value={formData.address.state}
                  onChange={(e) => handleAddressChange('state', e.target.value)}
                  placeholder="State"
                />
              </div>
              <Input
                value={formData.address.zipCode}
                onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                placeholder="ZIP Code"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="info@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID (Optional)</Label>
              <Input
                id="taxId"
                value={formData.taxId || ''}
                onChange={(e) => handleChange('taxId', e.target.value)}
                placeholder="12-3456789"
              />
            </div>
          </div>

          {hasChanges && (
            <div className="flex items-center gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
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

