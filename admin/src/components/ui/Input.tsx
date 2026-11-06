import type { InputHTMLAttributes } from 'react'

import { controlStyles } from './controlStyles'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

export const Input = ({ invalid, className, ...props }: InputProps) => (
  <input aria-invalid={invalid || undefined} className={controlStyles(invalid, className)} {...props} />
)
