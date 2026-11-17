import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'whatsapp'
export type ButtonSize = 'sm' | 'md' | 'lg'

// Quiet buttons: small uppercase type, square corners, a slow colour shift on hover.
// No lift, scale or glow.
const base =
  'inline-flex items-center justify-center gap-2.5 rounded-lg font-sans text-base font-medium whitespace-nowrap select-none ' +
  'transition-colors duration-300 ease-out disabled:pointer-events-none disabled:opacity-50'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-ivory hover:bg-brand-deep',
  secondary: 'bg-ink text-canvas hover:bg-ink-soft',
  outline: 'border border-brand bg-transparent text-brand-text hover:bg-brand/5',
  ghost: 'bg-transparent text-ink hover:bg-ink/5',
  // The booking action: a brand button like every other primary action.
  whatsapp: 'bg-[#25d366] font-bold text-[#06291a] hover:bg-[#1ebe5a]',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6',
  lg: 'h-13 px-8',
}

export const buttonStyles = (
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className?: string,
) => cn(base, variants[variant], sizes[size], className)
