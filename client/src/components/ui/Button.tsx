import type { ButtonHTMLAttributes } from 'react'

import { Spinner } from './Spinner'
import { buttonStyles, type ButtonSize, type ButtonVariant } from './buttonStyles'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

export const Button = ({
  variant,
  size,
  loading = false,
  disabled,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) => (
  <button
    type={type}
    disabled={disabled || loading}
    aria-busy={loading || undefined}
    className={buttonStyles(variant, size, className)}
    {...props}
  >
    {loading && <Spinner className="size-4" />}
    {children}
  </button>
)
