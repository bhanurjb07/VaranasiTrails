import { Sparkles } from 'lucide-react'

export const HighlightsList = ({ highlights }: { highlights: readonly string[] }) => (
  <ul className="grid gap-4 sm:grid-cols-2">
    {highlights.map((highlight) => (
      <li key={highlight} className="flex items-start gap-3 rounded-control bg-surface p-4 shadow-card">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-saffron-soft text-saffron-dark">
          <Sparkles className="size-4.5" aria-hidden="true" />
        </span>
        <span className="pt-1 text-ink">{highlight}</span>
      </li>
    ))}
  </ul>
)
