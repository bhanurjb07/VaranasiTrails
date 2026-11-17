import { CircleAlert, Heart, Inbox } from 'lucide-react'
import { Link } from 'react-router'

import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { EnquiryStatusBadge } from '@/features/enquiries/EnquiryStatusBadge'
import { timeAgo } from '@/lib/format'
import type { Dashboard } from '@/types/api'

const SectionCard = ({ title, link, children }: { title: string; link?: { to: string; label: string }; children: React.ReactNode }) => (
  <Card className="flex flex-col p-5">
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h2 className="text-xl">{title}</h2>
      {link && (
        <Link to={link.to} className="text-sm font-semibold text-brand-text hover:underline">
          {link.label}
        </Link>
      )}
    </div>
    {children}
  </Card>
)

const Empty = ({ text }: { text: string }) => <p className="py-6 text-center text-sm text-muted">{text}</p>

export const LatestEnquiries = ({ items }: { items: Dashboard['latestEnquiries'] }) => (
  <SectionCard title="Latest enquiries" link={{ to: '/enquiries', label: 'View all' }}>
    {items.length === 0 ? (
      <Empty text="No enquiries yet." />
    ) : (
      <ul className="divide-y divide-line/70">
        {items.map((item) => (
          <li key={item.id}>
            <Link to="/enquiries" className="flex items-center justify-between gap-3 py-3 hover:opacity-80">
              <span className="flex min-w-0 items-center gap-3">
                <Inbox className="size-5 shrink-0 text-muted" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block truncate font-medium text-ink">{item.name}</span>
                  <span className="block truncate text-xs text-muted">
                    {item.destinationTitle ?? 'General enquiry'} &middot; {timeAgo(item.createdAt)}
                  </span>
                </span>
              </span>
              <EnquiryStatusBadge status={item.status} />
            </Link>
          </li>
        ))}
      </ul>
    )}
  </SectionCard>
)

export const TopWishlisted = ({ items }: { items: Dashboard['topWishlisted'] }) => (
  <SectionCard title="Most wishlisted trips">
    {items.length === 0 ? (
      <Empty text="Nobody has saved a trip yet." />
    ) : (
      <ol className="space-y-3">
        {items.map((item, index) => (
          <li key={item.id} className="flex items-center gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-control border border-line text-xs font-bold text-ink">{index + 1}</span>
            <Link to={`/destinations/${item.id}`} className="min-w-0 flex-1 truncate font-medium text-ink hover:underline">
              {item.title}
            </Link>
            <span className="flex items-center gap-1 text-sm text-danger">
              <Heart className="size-4 fill-danger" aria-hidden="true" /> {item.wishlistCount}
            </span>
          </li>
        ))}
      </ol>
    )}
  </SectionCard>
)

export const NeedsAttention = ({ items }: { items: Dashboard['needsAttention'] }) => (
  <SectionCard title="Needs attention" link={{ to: '/destinations?status=draft', label: 'Open drafts' }}>
    {items.length === 0 ? (
      <Empty text="Every trip is complete. Nice work." />
    ) : (
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id}>
            <Link to={`/destinations/${item.id}`} className="block rounded-control border border-line/70 p-3 hover:border-navy/50 hover:bg-canvas/50">
              <span className="flex items-center justify-between gap-2">
                <span className="truncate font-medium text-ink">{item.title}</span>
                <Badge variant={item.status === 'published' ? 'published' : 'draft'}>{item.status === 'published' ? 'Live' : 'Draft'}</Badge>
              </span>
              <span className="mt-1.5 flex items-start gap-1.5 text-xs text-muted">
                <CircleAlert className="mt-0.5 size-3.5 shrink-0 text-brand-text" aria-hidden="true" />
                {item.issues.slice(0, 3).join(' · ')}
                {item.issues.length > 3 && ` · +${item.issues.length - 3} more`}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    )}
  </SectionCard>
)
