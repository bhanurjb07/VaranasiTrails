import { BadgeCheck, TriangleAlert } from 'lucide-react'
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
import { formatDate } from '@/lib/format'

export const ProfilePage = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  if (!user) return null

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

      <Container className="grid gap-8 py-10 lg:grid-cols-2">
        <Card className="p-6 sm:p-8">
          <h2 className="mb-6 text-2xl">Personal details</h2>
          <ProfileForm />
        </Card>
        <div className="space-y-8">
          <Card className="p-6 sm:p-8">
            <h2 className="mb-6 text-2xl">Change password</h2>
            <ChangePasswordForm />
          </Card>
          <Card className="p-6 sm:p-8">
            <h2 className="mb-2 text-2xl">Sign out</h2>
            <p className="mb-5 text-muted">Log out of VaranasiTrails on this device.</p>
            <Button
              variant="outline"
              onClick={async () => {
                await logout()
                toast.success('You have been logged out')
                navigate('/')
              }}
            >
              Log out
            </Button>
          </Card>
        </div>
      </Container>
    </>
  )
}
