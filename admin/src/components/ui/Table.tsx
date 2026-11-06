import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

/** Styled table primitives. The wrapper scrolls sideways on small screens. */
export const Table = ({ className, ...props }: HTMLAttributes<HTMLTableElement>) => (
  <div className="relative overflow-x-auto rounded-card border border-line bg-surface shadow-card">
    <table className={cn('w-full border-collapse text-left text-sm', className)} {...props} />
  </div>
)

export const THead = (props: HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className="border-b border-line bg-cream/60 text-xs tracking-wide text-muted uppercase" {...props} />
)

export const TBody = (props: HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className="divide-y divide-line/70" {...props} />
)

export const Tr = ({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={cn('transition-colors hover:bg-cream/50', className)} {...props} />
)

export const Th = ({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) => (
  <th scope="col" className={cn('px-4 py-3 font-semibold', className)} {...props} />
)

export const Td = ({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn('px-4 py-3 align-middle', className)} {...props} />
)
