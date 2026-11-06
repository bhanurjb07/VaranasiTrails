import { BadgeCheck, ShieldOff, UserCheck } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Drawer } from '@/components/ui/Drawer'
import { formatDate, formatDateTime } from '@/lib/format'
import type { AdminUser } from '@/types/api'
import { useBlockUser } from './useUsers'

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-4 border-b border-line/60 py-3 text-sm last:border-0">
    <dt className="text-muted">{label}</dt>
    <dd className="text-right font-medium break-all text-indigo">{children}</dd>
  </div>
)

export const UserDrawer = ({ user, onClose }: { user: AdminUser | null; onClose: () => void }) => {
  const block = useBlockUser()
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

            {isAdmin && <p className="rounded-control bg-cream px-4 py-3 text-sm text-muted">Administrator accounts cannot be blocked from here.</p>}
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
