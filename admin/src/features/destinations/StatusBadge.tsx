import { Badge } from '@/components/ui/Badge'
import type { DestinationStatus } from '@/types/api'

const labels: Record<DestinationStatus, string> = { published: 'Published', draft: 'Draft', archived: 'Archived' }

export const StatusBadge = ({ status }: { status: DestinationStatus }) => (
  <Badge variant={status}>
    <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
    {labels[status]}
  </Badge>
)
