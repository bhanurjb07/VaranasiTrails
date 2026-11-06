import type { TextareaHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'
import { controlStyles } from './controlStyles'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
}

export const Textarea = ({ invalid, className, ...props }: TextareaProps) => (
  <textarea
    aria-invalid={invalid || undefined}
    className={cn(controlStyles(invalid), 'h-auto min-h-28 py-3', className)}
    {...props}
  />
)
