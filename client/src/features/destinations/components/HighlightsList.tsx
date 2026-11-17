import { Sparkles } from 'lucide-react'

export const HighlightsList = ({ highlights }: { highlights: readonly string[] }) => (
  <ul className="grid gap-4 sm:grid-cols-2">
    {highlights.map((highlight) => (
      <li key={highlight} className="flex items-start gap-3 rounded-control bg-paper p-4 ">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-control border border-line text-brand-text">
          <Sparkles className="size-4.5" aria-hidden="true" />
        </span>
        <span className="pt-1 text-ink">{highlight}</span>
      </li>
    ))}
  </ul>
)
