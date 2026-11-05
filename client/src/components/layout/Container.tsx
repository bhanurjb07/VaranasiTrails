import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  narrow?: boolean
}

/** Consistent page width and gutters. */
export const Container = ({ narrow = false, className, ...props }: ContainerProps) => (
  <div
    className={cn('mx-auto w-full px-5 sm:px-8', narrow ? 'max-w-3xl' : 'max-w-7xl', className)}
    {...props}
  />
)
