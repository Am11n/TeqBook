import { Building2, Clock, Palette, CreditCard, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'

export type SettingsSection = 'profile' | 'hours' | 'branding' | 'billing' | 'notifications'

interface SettingsNavProps {
  activeSection: SettingsSection
  onSectionChange: (section: SettingsSection) => void
}

const sections: Array<{ id: SettingsSection; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'profile', label: 'Profile', icon: Building2 },
  { id: 'hours', label: 'Hours', icon: Clock },
  { id: 'branding', label: 'Branding', icon: Palette },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
]

export function SettingsNav({ activeSection, onSectionChange }: SettingsNavProps) {
  return (
    <nav className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
      <ul className="flex lg:flex-col gap-1 overflow-x-auto">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <li key={section.id}>
              <button
                onClick={() => onSectionChange(section.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  activeSection === section.id
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{section.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

