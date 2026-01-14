import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface TagBadgeProps {
  tag: string
  onRemove?: () => void
  variant?: 'default' | 'removable'
}

export function TagBadge({ tag, onRemove, variant = 'default' }: TagBadgeProps) {
  if (variant === 'removable' && onRemove) {
    return (
      <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800 pr-1">
        <span className="mr-1">{tag}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-4 w-4 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-800"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800">
      {tag}
    </Badge>
  )
}

