import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router'

import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/cn'

interface StatCardProps {
  label: string
  value: number | string
  hint?: string
  icon: LucideIcon
  to?: string
  tone?: 'brand' | 'success' | 'info' | 'navy'
}

const tones = {
  brand: 'bg-canvas-alt text-brand-text',
  success: 'bg-success-soft text-success',
  info: 'bg-info-soft text-info',
  navy: 'bg-ink/8 text-ink',
} as const

export const StatCard = ({ label, value, hint, icon: Icon, to, tone = 'navy' }: StatCardProps) => {
  const body = (
    <Card className={cn('flex items-center gap-4 p-5', to && 'transition-colors duration-500 ease-out hover:border-ink/30')}>
      <span className={cn('flex size-12 shrink-0 items-center justify-center rounded-control', tones[tone])}>
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-muted">{label}</p>
        <p className="font-sans text-3xl leading-tight font-bold text-ink">{value}</p>
        {hint && <p className="truncate text-xs text-muted">{hint}</p>}
      </div>
    </Card>
  )

  return to ? (
    <Link to={to} className="block rounded-card">
      {body}
    </Link>
  ) : (
    body
  )
}
