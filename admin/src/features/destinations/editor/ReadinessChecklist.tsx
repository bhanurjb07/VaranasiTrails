import { Check, Circle } from 'lucide-react'

import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/cn'
import { isReady, type ReadinessItem } from './readiness'

/** Mirrors the server's publish rules. Each line jumps to the section that fixes it. */
export const ReadinessChecklist = ({ items }: { items: readonly ReadinessItem[] }) => {
  const done = items.filter((item) => item.ok).length
  const ready = isReady(items)

  return (
    <Card className="p-5">
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <h2 className="text-lg">Ready to publish?</h2>
        <span className={cn('text-sm font-semibold tabular-nums', ready ? 'text-success' : 'text-muted')}>
          {done}/{items.length}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label="Publish readiness"
        aria-valuemin={0}
        aria-valuemax={items.length}
        aria-valuenow={done}
        className="mb-4 h-1.5 overflow-hidden rounded-full bg-cream-deep"
      >
        <div className={cn('h-full rounded-full transition-[width]', ready ? 'bg-success' : 'bg-saffron')} style={{ width: `${(done / items.length) * 100}%` }} />
      </div>

      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.section}`}
              className={cn('flex items-center gap-2.5 rounded-control px-1.5 py-1 text-sm hover:bg-cream', item.ok ? 'text-muted' : 'font-medium text-indigo')}
            >
              {item.ok ? (
                <Check className="size-4 shrink-0 text-success" aria-hidden="true" />
              ) : (
                <Circle className="size-4 shrink-0 text-saffron-dark" aria-hidden="true" />
              )}
              <span className={cn(item.ok && 'line-through decoration-line')}>{item.label}</span>
              <span className="sr-only">{item.ok ? '(done)' : '(missing)'}</span>
            </a>
          </li>
        ))}
      </ul>

      {ready && <p className="mt-4 rounded-control bg-success-soft px-3 py-2 text-sm text-success">Everything the site needs is here.</p>}
    </Card>
  )
}
