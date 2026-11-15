import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'whatsapp'
export type ButtonSize = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap select-none ' +
  'transition-[transform,box-shadow,background-color,border-color,color,filter] duration-300 ease-[var(--ease-out-soft)] ' +
  'disabled:pointer-events-none disabled:opacity-55 active:scale-[0.97]'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-saffron text-white shadow-glow hover:-translate-y-0.5 hover:brightness-[1.06]',
  secondary: 'bg-indigo text-cream hover:-translate-y-0.5 hover:bg-indigo-soft',
  outline: 'border border-line bg-surface text-indigo hover:border-indigo/25 hover:bg-cream-deep',
  ghost: 'bg-transparent text-indigo hover:bg-indigo/6',
  whatsapp: 'bg-whatsapp text-night shadow-card hover:-translate-y-0.5 hover:bg-whatsapp-dark',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-[0.95rem]',
  lg: 'h-12 px-7 text-base',
}

export const buttonStyles = (
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className?: string,
) => cn(base, variants[variant], sizes[size], className)
