import { Moon, Sun } from 'lucide-react'

import { cn } from '@/lib/cn'
import { useTheme } from '@/lib/theme'

interface ThemeToggleProps {
  /** Light icon colours for use over a dark background (the home hero). */
  onDark?: boolean
  className?: string
}

/** Small sun / moon button that switches between light and dark mode. */
export const ThemeToggle = ({ onDark = false, className }: ThemeToggleProps) => {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'
  const label = dark ? 'Switch to light mode' : 'Switch to dark mode'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(
        'relative inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full transition-colors duration-200',
        onDark ? 'text-white/85 hover:bg-white/12 hover:text-white' : 'text-muted hover:bg-indigo/6 hover:text-indigo',
        className,
      )}
    >
      <Sun
        aria-hidden="true"
        className={cn(
          'absolute size-[1.15rem] transition-all duration-500 ease-[var(--ease-out-soft)]',
          dark ? 'scale-100 rotate-0 opacity-100' : 'scale-50 -rotate-90 opacity-0',
        )}
      />
      <Moon
        aria-hidden="true"
        className={cn(
          'absolute size-[1.05rem] transition-all duration-500 ease-[var(--ease-out-soft)]',
          dark ? 'scale-50 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100',
        )}
      />
    </button>
  )
}
