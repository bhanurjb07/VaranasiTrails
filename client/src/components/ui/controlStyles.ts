import { cn } from '@/lib/cn'

export const controlStyles = (invalid?: boolean, className?: string) =>
  cn(
    'h-11 w-full rounded-control border bg-white px-4 text-[0.95rem] text-ink placeholder:text-muted/70',
    'transition-colors focus:border-indigo focus:outline-none focus:ring-2 focus:ring-indigo/20',
    invalid ? 'border-danger' : 'border-line hover:border-indigo/40',
    className,
  )
