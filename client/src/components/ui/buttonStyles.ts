import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'whatsapp' | 'onDark'
export type ButtonSize = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-all duration-200 ' +
  'disabled:pointer-events-none disabled:opacity-55 active:scale-[0.98]'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-saffron text-indigo shadow-card hover:bg-[#f08229] hover:shadow-lift',
  secondary: 'bg-indigo text-white hover:bg-indigo-soft',
  outline: 'border border-indigo/30 bg-transparent text-indigo hover:border-indigo hover:bg-indigo/5',
  ghost: 'bg-transparent text-indigo hover:bg-indigo/10',
  whatsapp: 'bg-whatsapp text-indigo shadow-card hover:bg-whatsapp-dark hover:text-white',
  onDark: 'border border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-[0.95rem]',
  lg: 'h-13 px-8 text-base',
}

export const buttonStyles = (
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className?: string,
) => cn(base, variants[variant], sizes[size], className)
