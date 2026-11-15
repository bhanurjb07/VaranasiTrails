import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

const base =
  'inline-flex items-center justify-center gap-2 rounded-control font-semibold whitespace-nowrap select-none ' +
  'transition-[transform,box-shadow,background-color,border-color,color,filter] duration-200 ease-[var(--ease-out-soft)] ' +
  'disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-saffron text-white shadow-glow hover:brightness-[1.07]',
  secondary: 'bg-indigo text-cream hover:bg-indigo-soft',
  outline: 'border border-line bg-surface text-indigo hover:border-indigo/25 hover:bg-cream-deep',
  ghost: 'bg-transparent text-indigo hover:bg-indigo/6',
  danger: 'bg-danger text-white hover:brightness-110 dark:text-night',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-6 text-[0.95rem]',
  icon: 'size-9 p-0',
}

export const buttonStyles = (variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className?: string) =>
  cn(base, variants[variant], sizes[size], className)
