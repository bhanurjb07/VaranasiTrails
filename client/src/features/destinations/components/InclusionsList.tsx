import { Check, X } from 'lucide-react'

interface InclusionsListProps {
  inclusions: readonly string[]
  exclusions: readonly string[]
}

const Column = ({ title, items, included }: { title: string; items: readonly string[]; included: boolean }) => (
  <div className="rounded-card border border-line/70 bg-surface p-6">
    <h3 className="mb-4 text-xl">{title}</h3>
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          {included ? (
            <Check className="mt-0.5 size-5 shrink-0 text-success" aria-label="Included" />
          ) : (
            <X className="mt-0.5 size-5 shrink-0 text-maroon" aria-label="Not included" />
          )}
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
)

export const InclusionsList = ({ inclusions, exclusions }: InclusionsListProps) => (
  <div className="grid gap-6 md:grid-cols-2">
    <Column title="What is included" items={inclusions} included />
    <Column title="What is not included" items={exclusions} included={false} />
  </div>
)
