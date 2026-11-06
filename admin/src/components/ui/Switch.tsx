import { cn } from '@/lib/cn'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  disabled?: boolean
  className?: string
}

/** Accessible on/off toggle. The label is announced but visually hidden. */
export const Switch = ({ checked, onChange, label, disabled, className }: SwitchProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={cn(
      'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50',
      checked ? 'bg-success' : 'bg-line',
      className,
    )}
  >
    <span
      className={cn(
        'inline-block size-5 rounded-full bg-white shadow transition-transform',
        checked ? 'translate-x-[1.35rem]' : 'translate-x-0.5',
      )}
    />
  </button>
)
