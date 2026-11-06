import type { ComponentProps } from 'react'

import { cn } from '@/lib/cn'

interface CheckboxProps extends Omit<ComponentProps<'input'>, 'type'> {
  label: string
}

/** Checkbox whose label is announced but not shown (used in table rows). */
export const Checkbox = ({ label, className, ...props }: CheckboxProps) => (
  <input type="checkbox" aria-label={label} className={cn('size-4 cursor-pointer rounded accent-saffron', className)} {...props} />
)
