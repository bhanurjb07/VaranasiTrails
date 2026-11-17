import { Navigate, useLocation } from 'react-router'

import { Brand } from '@/components/layout/Brand'
import { FullScreenSpinner } from '@/features/auth/ProtectedRoute'
import { LoginForm } from '@/features/auth/LoginForm'
import { useAuth } from '@/features/auth/useAuth'

// The same Ganges photograph the public site uses (Wikimedia Commons, CC BY-SA 4.0, Schwiki).
const PHOTO =
  'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/40/Boats_at_sunrise_Ganges_River_Varanasi_Uttar_Pradesh_Schwiki.jpg/1920px-Boats_at_sunrise_Ganges_River_Varanasi_Uttar_Pradesh_Schwiki.jpg'

export const LoginPage = () => {
  const { status } = useAuth()
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/'

  if (status === 'loading') return <FullScreenSpinner />
  if (status === 'authenticated') return <Navigate to={from} replace />

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <div className="relative isolate hidden flex-col justify-between overflow-hidden bg-navy-deep p-12 text-ivory lg:flex">
        <img src={PHOTO} alt="" className="absolute inset-0 -z-20 size-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-deep/90 via-navy-deep/40 to-navy-deep/30" />
        <Brand />
        <div className="max-w-md">
          <span className="block h-px w-10 bg-brand" aria-hidden="true" />
          <h2 className="mt-6 font-sans text-4xl leading-tight font-bold text-ivory">Site administration</h2>
          <p className="mt-4 text-ivory/75">Manage trips and photos, enquiries, reviews and users.</p>
          <p className="mt-10 border-t border-ivory/20 pt-5 text-sm text-ivory/65">
            Administrators only. Every change is recorded.
          </p>
        </div>
      </div>

      <div className="relative flex items-center justify-center bg-canvas px-6 py-12">
        <div className="animate-enter w-full max-w-sm">
          <div className="mb-10 lg:hidden">
            <span className="inline-flex bg-navy px-3 py-2.5">
              <Brand />
            </span>
          </div>
          <h1 className="font-sans text-3xl font-bold">Admin login</h1>
          <p className="mt-2 mb-10 text-sm text-muted">Sign in with your administrator account.</p>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
