import { BadgeCheck, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router'

import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ChangePasswordForm } from '@/features/auth/ChangePasswordForm'
import { useAuth } from '@/features/auth/useAuth'
import { formatDate } from '@/lib/format'

export const AccountPage = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  if (!user) return null

  return (
    <>
      <PageHeader title="Account" description="Your administrator account." />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card className="h-fit p-6">
          <div className="flex items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-full bg-indigo font-heading text-2xl text-white">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold text-indigo">{user.name}</p>
              <Badge variant="success" className="mt-1">
                <BadgeCheck className="size-3.5" aria-hidden="true" /> Administrator
              </Badge>
            </div>
          </div>
          <dl className="mt-6 space-y-3 text-sm">
            <div>
              <dt className="text-muted">Email</dt>
              <dd className="font-medium break-all text-indigo">{user.email}</dd>
            </div>
            <div>
              <dt className="text-muted">Phone</dt>
              <dd className="font-medium text-indigo">{user.phone}</dd>
            </div>
            <div>
              <dt className="text-muted">Member since</dt>
              <dd className="font-medium text-indigo">{formatDate(user.createdAt)}</dd>
            </div>
          </dl>
          <Button
            variant="outline"
            className="mt-6 w-full"
            onClick={async () => {
              await logout()
              navigate('/login')
            }}
          >
            <LogOut className="size-4" aria-hidden="true" /> Log out
          </Button>
        </Card>

        <Card className="p-6">
          <h2 className="mb-1 text-xl">Change password</h2>
          <p className="mb-5 text-sm text-muted">Changing your password signs you out of your other devices.</p>
          <ChangePasswordForm />
        </Card>
      </div>
    </>
  )
}
