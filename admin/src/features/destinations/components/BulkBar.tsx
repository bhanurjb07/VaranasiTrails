import { Archive, Eye, EyeOff, Star, StarOff, X } from 'lucide-react'

import { Button } from '@/components/ui/Button'

export type BulkAction = 'publish' | 'unpublish' | 'archive' | 'feature' | 'unfeature'

interface BulkBarProps {
  count: number
  onAction: (action: BulkAction) => void
  onClear: () => void
  busy: boolean
}

/** Appears above the table while rows are selected. */
export const BulkBar = ({ count, onAction, onClear, busy }: BulkBarProps) => (
  <div
    role="region"
    aria-label="Bulk actions"
    className="mb-4 flex flex-wrap items-center gap-2 rounded-card bg-indigo px-4 py-3 text-white shadow-card"
  >
    <span className="mr-2 text-sm font-semibold">{count} selected</span>
    <Button size="sm" variant="primary" disabled={busy} onClick={() => onAction('publish')}>
      <Eye className="size-4" aria-hidden="true" /> Publish
    </Button>
    <Button size="sm" variant="outline" disabled={busy} onClick={() => onAction('unpublish')}>
      <EyeOff className="size-4" aria-hidden="true" /> Unpublish
    </Button>
    <Button size="sm" variant="outline" disabled={busy} onClick={() => onAction('feature')}>
      <Star className="size-4" aria-hidden="true" /> Feature
    </Button>
    <Button size="sm" variant="outline" disabled={busy} onClick={() => onAction('unfeature')}>
      <StarOff className="size-4" aria-hidden="true" /> Unfeature
    </Button>
    <Button size="sm" variant="danger" disabled={busy} onClick={() => onAction('archive')}>
      <Archive className="size-4" aria-hidden="true" /> Archive
    </Button>
    <button type="button" onClick={onClear} aria-label="Clear selection" className="ml-auto rounded-control p-1.5 text-white/70 hover:bg-white/10 hover:text-white">
      <X className="size-5" aria-hidden="true" />
    </button>
  </div>
)
