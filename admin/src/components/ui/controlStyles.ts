import { cn } from '@/lib/cn'

export const controlStyles = (invalid?: boolean, className?: string) =>
  cn(
    'h-11 w-full rounded-lg border bg-white px-4 text-base text-ink placeholder:text-muted',
    'transition-colors duration-300 ease-out focus:outline-none',
    invalid ? 'border-danger focus:border-danger' : 'border-line hover:border-ink/30 focus:border-brand focus:ring-1 focus:ring-brand',
    className,
  )
