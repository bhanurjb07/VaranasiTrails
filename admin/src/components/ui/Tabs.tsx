import { cn } from '@/lib/cn'

export interface TabOption<T extends string> {
  value: T
  label: string
  count?: number
}

interface TabsProps<T extends string> {
  options: readonly TabOption<T>[]
  value: T
  onChange: (value: T) => void
  label: string
  className?: string
}

/** Pill tabs with optional counts. Left/right arrows move between them. */
export const Tabs = <T extends string>({ options, value, onChange, label, className }: TabsProps<T>) => (
  <div
    role="tablist"
    aria-label={label}
    className={cn('scrollbar-none inline-flex max-w-full gap-1 overflow-x-auto rounded-control bg-cream-deep p-1', className)}
    onKeyDown={(event) => {
      const index = options.findIndex((option) => option.value === value)
      const next = event.key === 'ArrowRight' ? index + 1 : event.key === 'ArrowLeft' ? index - 1 : null
      if (next === null) return
      const target = options[(next + options.length) % options.length]
      if (target) onChange(target.value)
    }}
  >
    {options.map((option) => {
      const selected = option.value === value
      return (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={selected}
          tabIndex={selected ? 0 : -1}
          onClick={() => onChange(option.value)}
          className={cn(
            'inline-flex items-center gap-2 rounded-[0.45rem] px-3.5 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors',
            selected ? 'bg-surface text-indigo shadow-card' : 'text-muted hover:text-indigo',
          )}
        >
          {option.label}
          {option.count !== undefined && (
            <span className={cn('rounded-full px-1.5 text-xs', selected ? 'bg-saffron-soft text-saffron-dark' : 'bg-line/60')}>
              {option.count}
            </span>
          )}
        </button>
      )
    })}
  </div>
)
