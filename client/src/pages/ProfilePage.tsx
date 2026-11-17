import { BadgeCheck, Heart, LogOut, Repeat, ShieldCheck, TriangleAlert, User } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router'

import { PageHeader } from '@/components/common/PageHeader'
import { SeoHead } from '@/components/common/SeoHead'
import { Container } from '@/components/layout/Container'
import { Badge } from '@/components/ui/Badge'
import { toast } from '@/components/ui/toast'
import { ChangePasswordForm } from '@/features/auth/components/ChangePasswordForm'
import { ProfileForm } from '@/features/auth/components/ProfileForm'
import { useAuth } from '@/features/auth/useAuth'
import { formatDate } from '@/lib/format'

type Panel = 'details' | 'password'

const sideLink =
  'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-base font-medium text-ink transition-colors duration-200 hover:bg-brand/5 hover:text-brand-text'

/** One line of a settings list: label, current value, and an Edit link on the right. */
const Row = ({ label, children, action }: { label: string; children: ReactNode; action?: ReactNode }) => (
  <div className="grid grid-cols-[1fr_auto] items-start gap-x-4 gap-y-1 border-b border-line py-4 last:border-b-0 sm:grid-cols-[11rem_1fr_auto]">
    <dt className="col-span-2 text-sm text-muted sm:col-span-1 sm:pt-0.5 sm:text-base">{label}</dt>
    <dd className="min-w-0 break-words font-medium text-ink">{children}</dd>
    <div className="text-right">{action}</div>
  </div>
)

const EditLink = ({
  open,
  label,
  controls,
  onClick,
}: {
  open: boolean
  label: string
  controls: string
  onClick: () => void
}) => (
  <button
    type="button"
    aria-expanded={open}
    aria-controls={controls}
    aria-label={`${open ? 'Cancel editing' : 'Edit'} ${label}`}
    onClick={onClick}
    className="rounded-lg px-3 py-1.5 font-medium text-brand-text transition-colors duration-200 hover:bg-brand/5"
  >
    {open ? 'Cancel' : 'Edit'}
  </button>
)

const Section = ({ id, title, text, children }: { id: string; title: string; text: string; children: ReactNode }) => (
  <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-32 rounded-lg border border-line bg-canvas p-5 sm:p-6">
    <h2 id={`${id}-title`} className="font-sans text-xl font-bold text-ink">
      {title}
    </h2>
    <p className="mt-1 text-base text-muted">{text}</p>
    <div className="mt-4">{children}</div>
  </section>
)

export const ProfilePage = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  // Nothing is editable until the person asks for it.
  const [open, setOpen] = useState<Panel | null>(null)
  if (!user) return null

  const toggle = (panel: Panel) => setOpen((current) => (current === panel ? null : panel))
  const close = () => setOpen(null)

  return (
    <>
      <SeoHead title="Your profile" noIndex />
      <PageHeader eyebrow="Account" title={`Hello, ${user.name.split(' ')[0]}`}>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-base text-ivory/90">
          {user.emailVerified ? (
            <Badge variant="success">
              <BadgeCheck className="size-4" aria-hidden="true" /> Email verified
            </Badge>
          ) : (
            <Badge variant="brand">
              <TriangleAlert className="size-4" aria-hidden="true" /> Email not verified
            </Badge>
          )}
          <span>Member since {formatDate(user.createdAt)}</span>
        </div>
      </PageHeader>

      <Container className="grid gap-6 py-6 sm:py-10 lg:grid-cols-[16rem_1fr] lg:items-start">
        <nav aria-label="Account" className="rounded-lg border border-line bg-canvas p-2 lg:sticky lg:top-24">
          <a href="#personal" className={sideLink}>
            <User className="size-5 text-brand" aria-hidden="true" /> Personal details
          </a>
          <a href="#security" className={sideLink}>
            <ShieldCheck className="size-5 text-brand" aria-hidden="true" /> Security
          </a>
          <Link to="/wishlist" className={sideLink}>
            <Heart className="size-5 text-brand" aria-hidden="true" /> Wishlist
          </Link>
          <div className="my-2 border-t border-line" />
          <button
            type="button"
            className={sideLink}
            onClick={async () => {
              await logout()
              navigate('/login')
            }}
          >
            <Repeat className="size-5 text-brand" aria-hidden="true" /> Switch account
          </button>
          <button
            type="button"
            className={sideLink}
            onClick={async () => {
              await logout()
              toast.success('You have been signed out')
              navigate('/')
            }}
          >
            <LogOut className="size-5 text-brand" aria-hidden="true" /> Sign out
          </button>
        </nav>

        <div className="min-w-0 space-y-6">
          <Section id="personal" title="Personal details" text="Update your name and mobile number. Your email is how you log in.">
            <dl>
              <Row
                label="Full name"
                action={<EditLink open={open === 'details'} label="name" controls="panel-details" onClick={() => toggle('details')} />}
              >
                {user.name}
              </Row>
              <Row label="Email address">
                <span className="break-all">{user.email}</span>
                <span className="mt-1 block text-sm font-normal text-muted">
                  {user.emailVerified ? 'Verified' : 'Not verified yet'}
                </span>
              </Row>
              <Row
                label="Mobile number"
                action={
                  <EditLink open={open === 'details'} label="mobile number" controls="panel-details" onClick={() => toggle('details')} />
                }
              >
                {user.phone}
              </Row>
            </dl>

            {open === 'details' && (
              <div id="panel-details" className="mt-4 rounded-lg bg-canvas-alt p-5">
                <h3 className="mb-4 font-sans text-lg font-bold text-ink">Edit personal details</h3>
                <ProfileForm onDone={close} />
              </div>
            )}
          </Section>

          <Section id="security" title="Security" text="Choose a strong password you don't use anywhere else.">
            <dl>
              <Row
                label="Password"
                action={<EditLink open={open === 'password'} label="password" controls="panel-password" onClick={() => toggle('password')} />}
              >
                ••••••••••
              </Row>
            </dl>

            {open === 'password' && (
              <div id="panel-password" className="mt-4 rounded-lg bg-canvas-alt p-5">
                <h3 className="mb-4 font-sans text-lg font-bold text-ink">Change password</h3>
                <ChangePasswordForm onDone={close} />
              </div>
            )}
          </Section>
        </div>
      </Container>
    </>
  )
}
