import { Calendar, Users, UserCircle, TrendingUp, Settings } from 'lucide-react'
import type { NavigationItem } from './AppShell'

interface MainNavProps {
  items: NavigationItem[]
  onNavigate?: (href: string) => void
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'Bookings': Calendar,
  'Team': Users,
  'Customers': UserCircle,
  'Business': TrendingUp,
  'Settings': Settings,
}

export function MainNav({ items, onNavigate }: MainNavProps) {
  const handleClick = (href: string, e: React.MouseEvent) => {
    e.preventDefault()
    if (onNavigate) {
      onNavigate(href)
    }
  }

  return (
    <ul className="space-y-1 px-3">
      {items.map((item) => {
        const Icon = iconMap[item.label] || Settings
        return (
          <li key={item.href}>
            <a
              href={item.href}
              onClick={(e) => handleClick(item.href, e)}
              className={`
                flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                ${
                  item.isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }
              `}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </a>
          </li>
        )
      })}
    </ul>
  )
}

