import { BadgeCheck, ShieldOff, UserCheck } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Drawer } from '@/components/ui/Drawer'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDate, formatDateTime, formatPrice } from '@/lib/format'
import type { AdminUser, AdminUserDetail } from '@/types/api'
import { useBlockUser, useUserDetail } from './useUsers'

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-4 border-b border-line/60 py-3 text-sm last:border-0">
    <dt className="text-muted">{label}</dt>
    <dd className="text-right font-medium break-all text-ink">{children}</dd>
  </div>
)

const Section = ({ title, count, children }: { title: string; count: number; children: React.ReactNode }) => (
  <section>
    <h3 className="mb-2 flex items-center gap-2 font-sans text-sm font-semibold text-ink">
      {title} <Badge>{count}</Badge>
    </h3>
    {count === 0 ? <p className="rounded-control bg-canvas px-4 py-3 text-sm text-muted">Nothing yet.</p> : <ul className="space-y-2">{children}</ul>}
  </section>
)

const Activity = ({ detail, loading, failed }: { detail?: AdminUserDetail; loading: boolean; failed: boolean }) => {
  if (loading) return <Skeleton className="h-40 rounded-card" />
  if (failed || !detail) return <p className="text-sm text-danger">Could not load this user's activity.</p>

  return (
    <div className="space-y-6">
      <Section title="Wishlist" count={detail.wishlist.length}>
        {detail.wishlist.map((item) => (
          <li key={item.id} className="flex items-center gap-3 rounded-control border border-line/70 p-2.5 text-sm">
            {item.coverImage ? (
              <img src={item.coverImage} alt="" className="size-12 shrink-0 rounded-control object-cover" />
            ) : (
              <span className="size-12 shrink-0 rounded-control bg-canvas-alt" aria-hidden="true" />
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium text-ink">{item.title}</span>
              <span className="block text-xs text-muted">
                {formatPrice(item.priceInr)} &middot; saved {formatDate(item.addedAt)}
              </span>
            </span>
            <Badge variant={item.status}>{item.status}</Badge>
          </li>
        ))}
      </Section>

      <Section title="Reviews" count={detail.reviews.length}>
        {detail.reviews.map((review) => (
          <li key={review.id} className="rounded-control border border-line/70 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-ink">{review.destination.title}</span>
              <Badge variant="warning">{review.rating} / 5</Badge>
              {review.isHidden && <Badge variant="danger">Hidden</Badge>}
            </div>
            <p className="mt-1 font-medium">{review.title}</p>
            <p className="text-muted">{review.comment}</p>
            <p className="mt-1 text-xs text-muted">{formatDate(review.createdAt)}</p>
          </li>
        ))}
      </Section>

      <Section title="Enquiries sent" count={detail.enquiries.length}>
        {detail.enquiries.map((enquiry) => (
          <li key={enquiry.id} className="rounded-control border border-line/70 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={enquiry.status === 'NEW' ? 'warning' : enquiry.status === 'CLOSED' ? 'neutral' : 'info'}>{enquiry.status}</Badge>
              <span className="text-xs text-muted">
                {enquiry.destinationTitle ?? 'General'} &middot; {formatDate(enquiry.createdAt)}
              </span>
            </div>
            <p className="mt-1 text-muted">{enquiry.message}</p>
          </li>
        ))}
      </Section>
    </div>
  )
}

export const UserDrawer = ({ user, onClose }: { user: AdminUser | null; onClose: () => void }) => {
  const block = useBlockUser()
  const detail = useUserDetail(user?.id)
  const [confirm, setConfirm] = useState(false)
  const isAdmin = user?.role === 'ADMIN'

  return (
    <>
      <Drawer
        open={user !== null}
        onClose={onClose}
        title={user?.name ?? 'User'}
        description={user?.email}
        footer={
          user &&
          !isAdmin &&
          (user.isBlocked ? (
            <Button className="w-full" loading={block.isPending} onClick={() => block.mutate({ id: user.id, block: false })}>
              <UserCheck className="size-4" aria-hidden="true" /> Unblock user
            </Button>
          ) : (
            <Button variant="danger" className="w-full" onClick={() => setConfirm(true)}>
              <ShieldOff className="size-4" aria-hidden="true" /> Block user
            </Button>
          ))
        }
      >
        {user && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {isAdmin && <Badge variant="info">Administrator</Badge>}
              {user.emailVerified ? (
                <Badge variant="success">
                  <BadgeCheck className="size-3.5" aria-hidden="true" /> Email verified
                </Badge>
              ) : (
                <Badge variant="warning">Email not verified</Badge>
              )}
              {user.isBlocked && <Badge variant="danger">Blocked</Badge>}
            </div>

            <dl>
              <Row label="Phone">{user.phone}</Row>
              <Row label="Joined">{formatDate(user.createdAt)}</Row>
              <Row label="Last login">{user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'Never'}</Row>
              <Row label="Reviews written">{user.reviewCount}</Row>
              <Row label="Trips in wishlist">{user.wishlistCount}</Row>
            </dl>

            {isAdmin && <p className="rounded-control bg-canvas px-4 py-3 text-sm text-muted">Administrator accounts cannot be blocked from here.</p>}

            <Activity detail={detail.data} loading={detail.isPending} failed={detail.isError} />
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={() =>
          user &&
          block.mutate(
            { id: user.id, block: true },
            {
              onSuccess: () => {
                setConfirm(false)
                onClose()
              },
            },
          )
        }
        loading={block.isPending}
        danger
        title="Block this user?"
        confirmLabel="Block user"
      >
        <strong>{user?.name}</strong> will be signed out everywhere and will not be able to log in until you unblock them.
      </ConfirmDialog>
    </>
  )
}
