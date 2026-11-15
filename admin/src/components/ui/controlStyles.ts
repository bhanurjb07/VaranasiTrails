import { cn } from '@/lib/cn'

export const controlStyles = (invalid?: boolean, className?: string) =>
  cn(
    'h-11 w-full rounded-control border bg-surface px-4 text-[0.95rem] text-ink placeholder:text-muted/70',
    'transition-[border-color,box-shadow] duration-200 focus:outline-none focus:ring-4',
    invalid
      ? 'border-danger focus:ring-danger/15'
      : 'border-line hover:border-muted/45 focus:border-saffron/70 focus:ring-saffron/15',
    className,
  )
