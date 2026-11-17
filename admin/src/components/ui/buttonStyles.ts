import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

// Same language as the public site: rounded corners, a quick colour shift, no lift.
const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap select-none ' +
  'transition-[transform,box-shadow,background-color,border-color,color] duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-ivory hover:bg-brand-deep hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98]',
  secondary: 'bg-ink text-canvas hover:bg-ink-soft hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98]',
  outline: 'border border-brand bg-white text-brand-text hover:bg-brand/5 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98]',
  ghost: 'bg-transparent text-ink hover:bg-ink/5 active:scale-[0.98]',
  danger: 'bg-danger text-ivory hover:opacity-90 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98]',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-base',
  lg: 'h-11 px-6 text-base',
  icon: 'size-9 p-0',
}

export const buttonStyles = (variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className?: string) =>
  cn(base, variants[variant], sizes[size], className)
