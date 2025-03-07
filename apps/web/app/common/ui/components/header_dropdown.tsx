import * as React from 'react'
import { ChevronDown } from 'lucide-react'

import { cn } from '@workspace/ui/lib/utils'

interface HeaderDropdownProps {
  trigger: React.ReactNode
  content: React.ReactNode
  width?: string
}

export default function HeaderDropdown({
  trigger,
  content,
  width = 'w-[180px]',
}: HeaderDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 150)
  }

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={containerRef}
    >
      <button
        className={cn(
          'group flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors',
          'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
          isOpen && 'bg-accent/50'
        )}
      >
        {trigger}
        <ChevronDown
          className={cn('ml-1 h-3 w-3 transition duration-200', isOpen && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute left-0 top-full z-50 mt-2 rounded-md border bg-popover text-popover-foreground shadow-md outline-none',
            width,
            'animate-in fade-in-80 zoom-in-95'
          )}
        >
          {content}
        </div>
      )}
    </div>
  )
}
