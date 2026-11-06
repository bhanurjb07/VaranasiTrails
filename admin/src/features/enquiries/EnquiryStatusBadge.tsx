import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import type { EnquiryStatus } from '@/types/api'

const config: Record<EnquiryStatus, { label: string; variant: BadgeVariant }> = {
  NEW: { label: 'New', variant: 'warning' },
  CONTACTED: { label: 'Contacted', variant: 'info' },
  CLOSED: { label: 'Closed', variant: 'draft' },
}

export const EnquiryStatusBadge = ({ status }: { status: EnquiryStatus }) => (
  <Badge variant={config[status].variant}>{config[status].label}</Badge>
)
