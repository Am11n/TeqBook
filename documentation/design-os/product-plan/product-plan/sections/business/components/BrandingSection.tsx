import { useState } from 'react'
import { Palette, Upload, X, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Branding, BrandingColors } from '../types'

interface BrandingSectionProps {
  branding: Branding
  onUploadLogo?: (file: File) => void
  onRemoveLogo?: () => void
  onUpdateBranding?: (colors: BrandingColors) => void
  isLoading?: boolean
}

const colorPalette: Record<string, { name: string; shades: string[] }> = {
  indigo: {
    name: 'Indigo',
    shades: [
      'rgb(238, 242, 255)',
      'rgb(224, 231, 255)',
      'rgb(199, 210, 254)',
      'rgb(165, 180, 252)',
      'rgb(129, 140, 248)',
      'rgb(99, 102, 241)',
      'rgb(79, 70, 229)',
      'rgb(67, 56, 202)',
      'rgb(55, 48, 163)',
      'rgb(49, 46, 129)',
    ],
  },
  slate: {
    name: 'Slate',
    shades: [
      'rgb(248, 250, 252)',
      'rgb(241, 245, 249)',
      'rgb(226, 232, 240)',
      'rgb(203, 213, 225)',
      'rgb(148, 163, 184)',
      'rgb(100, 116, 139)',
      'rgb(71, 85, 105)',
      'rgb(51, 65, 85)',
      'rgb(30, 41, 59)',
      'rgb(15, 23, 42)',
    ],
  },
}

export function BrandingSection({
  branding,
  onUploadLogo,
  onRemoveLogo,
  onUpdateBranding,
  isLoading,
}: BrandingSectionProps) {
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(branding.logoUrl && !branding.logoPlaceholder ? branding.logoUrl : null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = () => {
    if (logoFile) {
      onUploadLogo?.(logoFile)
      setLogoFile(null)
    }
  }

  const handleRemove = () => {
    setLogoPreview(null)
    setLogoFile(null)
    onRemoveLogo?.()
  }

  const primaryColor = colorPalette[branding.colors.primary]
  const secondaryColor = colorPalette[branding.colors.secondary]
  const neutralColor = colorPalette[branding.colors.neutral]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
          <Palette className="h-6 w-6" />
          Branding
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Customize your salon's visual identity with logo and colors
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Logo</CardTitle>
          <CardDescription>Upload your business logo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {logoPreview ? (
              <div className="relative">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="h-24 w-24 object-contain rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2"
                />
                <button
                  onClick={handleRemove}
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="h-24 w-24 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <Palette className="h-8 w-8 text-slate-400" />
              </div>
            )}
            <div className="flex-1">
              <input
                type="file"
                id="logo-upload"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="logo-upload">
                <Button variant="outline" type="button" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  {logoPreview ? 'Change Logo' : 'Upload Logo'}
                </Button>
              </label>
              {logoFile && (
                <Button onClick={handleUpload} disabled={isLoading} className="ml-2">
                  <Save className="h-4 w-4 mr-2" />
                  Save Logo
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Color Palette</CardTitle>
          <CardDescription>Your current brand colors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline">Primary</Badge>
              <span className="text-sm text-slate-600 dark:text-slate-400">{primaryColor.name}</span>
            </div>
            <div className="flex gap-1">
              {primaryColor.shades.map((shade, index) => (
                <div
                  key={index}
                  className="h-8 flex-1 rounded border border-slate-200 dark:border-slate-800"
                  style={{ backgroundColor: shade }}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline">Secondary</Badge>
              <span className="text-sm text-slate-600 dark:text-slate-400">{secondaryColor.name}</span>
            </div>
            <div className="flex gap-1">
              {secondaryColor.shades.map((shade, index) => (
                <div
                  key={index}
                  className="h-8 flex-1 rounded border border-slate-200 dark:border-slate-800"
                  style={{ backgroundColor: shade }}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline">Neutral</Badge>
              <span className="text-sm text-slate-600 dark:text-slate-400">{neutralColor.name}</span>
            </div>
            <div className="flex gap-1">
              {neutralColor.shades.map((shade, index) => (
                <div
                  key={index}
                  className="h-8 flex-1 rounded border border-slate-200 dark:border-slate-800"
                  style={{ backgroundColor: shade }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

