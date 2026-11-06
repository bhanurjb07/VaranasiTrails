import { ChevronDown } from 'lucide-react'
import type { SelectHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'
import { controlStyles } from './controlStyles'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean
}

export const Select = ({ invalid, className, children, ...props }: SelectProps) => (
  <div className="relative">
    <select
      aria-invalid={invalid || undefined}
      className={cn(controlStyles(invalid), 'appearance-none pr-10', className)}
      {...props}
    >
      {children}
    </select>
    <ChevronDown
      className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted"
      aria-hidden="true"
    />
  </div>
)
