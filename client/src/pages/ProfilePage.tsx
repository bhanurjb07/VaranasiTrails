import { BadgeCheck, ChevronDown, KeyRound, LogOut, Pencil, Repeat, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'

import { PageHeader } from '@/components/common/PageHeader'
import { SeoHead } from '@/components/common/SeoHead'
import { Container } from '@/components/layout/Container'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { toast } from '@/components/ui/toast'
import { ChangePasswordForm } from '@/features/auth/components/ChangePasswordForm'
import { ProfileForm } from '@/features/auth/components/ProfileForm'
import { useAuth } from '@/features/auth/useAuth'
import { cn } from '@/lib/cn'
import { formatDate } from '@/lib/format'

type Panel = 'details' | 'password'

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-4 border-b border-line/70 py-3 text-sm last:border-0">
    <dt className="text-muted">{label}</dt>
    <dd className="text-right font-medium break-all text-indigo">{children}</dd>
  </div>
)

export const ProfilePage = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  // Nothing is editable until the person asks for it.
  const [open, setOpen] = useState<Panel | null>(null)
  if (!user) return null

  const toggle = (panel: Panel) => setOpen((current) => (current === panel ? null : panel))

  return (
    <>
      <SeoHead title="Your profile" noIndex />
      <PageHeader eyebrow="Account" title={`Hello, ${user.name.split(' ')[0]}`}>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted">
          {user.emailVerified ? (
            <Badge variant="success">
              <BadgeCheck className="size-3.5" aria-hidden="true" /> Email verified
            </Badge>
          ) : (
            <Badge variant="saffron">
              <TriangleAlert className="size-3.5" aria-hidden="true" /> Email not verified
            </Badge>
          )}
          <span>Member since {formatDate(user.createdAt)}</span>
          <Link to="/wishlist" className="font-semibold text-saffron-dark hover:underline">
            View wishlist
          </Link>
        </div>
      </PageHeader>

      <Container narrow className="space-y-5 py-6 sm:py-10">
        <Card className="p-5 sm:p-8">
          <h2 className="text-2xl">Your details</h2>
          <dl className="mt-3">
            <Row label="Name">{user.name}</Row>
            <Row label="Email">{user.email}</Row>
            <Row label="Mobile number">{user.phone}</Row>
          </dl>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              type="button"
              variant={open === 'details' ? 'secondary' : 'outline'}
              aria-expanded={open === 'details'}
              aria-controls="panel-details"
              onClick={() => toggle('details')}
            >
              <Pencil className="size-4" aria-hidden="true" />
              Change details
              <ChevronDown className={cn('size-4 transition-transform', open === 'details' && 'rotate-180')} aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant={open === 'password' ? 'secondary' : 'outline'}
              aria-expanded={open === 'password'}
              aria-controls="panel-password"
              onClick={() => toggle('password')}
            >
              <KeyRound className="size-4" aria-hidden="true" />
              Change password
              <ChevronDown className={cn('size-4 transition-transform', open === 'password' && 'rotate-180')} aria-hidden="true" />
            </Button>
          </div>
        </Card>

        {open === 'details' && (
          <Card id="panel-details" className="p-5 sm:p-8">
            <h2 className="mb-6 text-2xl">Change details</h2>
            <ProfileForm />
          </Card>
        )}

        {open === 'password' && (
          <Card id="panel-password" className="p-5 sm:p-8">
            <h2 className="mb-6 text-2xl">Change password</h2>
            <ChangePasswordForm />
          </Card>
        )}

        <Card className="p-5 sm:p-8">
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={async () => {
                await logout()
                navigate('/login')
              }}
            >
              <Repeat className="size-4" aria-hidden="true" />
              Switch account
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                await logout()
                toast.success('You have been signed out')
                navigate('/')
              }}
            >
              <LogOut className="size-4" aria-hidden="true" />
              Sign out
            </Button>
          </div>
        </Card>
      </Container>
    </>
  )
}
