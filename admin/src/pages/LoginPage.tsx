import { ShieldCheck } from 'lucide-react'
import { Navigate, useLocation } from 'react-router'

import { Brand } from '@/components/layout/Brand'
import { FullScreenSpinner } from '@/features/auth/ProtectedRoute'
import { LoginForm } from '@/features/auth/LoginForm'
import { useAuth } from '@/features/auth/useAuth'

export const LoginPage = () => {
  const { status } = useAuth()
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/'

  if (status === 'loading') return <FullScreenSpinner />
  if (status === 'authenticated') return <Navigate to={from} replace />

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-indigo p-12 text-white lg:flex">
        <div
          aria-hidden="true"
          className="absolute -right-24 -bottom-24 size-[28rem] rounded-full bg-saffron/15 blur-3xl"
        />
        <Brand />
        <div className="relative max-w-md">
          <h2 className="text-balance text-4xl leading-tight text-white">Run VaranasiTrails from one calm place.</h2>
          <p className="mt-4 text-white/70">
            Add trips and photos, answer enquiries, moderate reviews and keep an eye on what is happening on the site.
          </p>
        </div>
        <p className="relative flex items-center gap-2 text-sm text-white/50">
          <ShieldCheck className="size-4" aria-hidden="true" /> Administrators only. Every change is recorded.
        </p>
      </div>

      <div className="flex items-center justify-center bg-cream px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <span className="inline-flex rounded-control bg-indigo px-3 py-2">
              <Brand />
            </span>
          </div>
          <h1 className="text-3xl">Admin login</h1>
          <p className="mt-2 mb-8 text-sm text-muted">Sign in with your administrator account.</p>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
