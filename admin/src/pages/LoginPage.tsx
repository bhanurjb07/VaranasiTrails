import { ShieldCheck } from 'lucide-react'
import { Navigate, useLocation } from 'react-router'

import { Brand } from '@/components/layout/Brand'
import { SkylineArt } from '@/components/layout/SkylineArt'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
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
      <div className="bg-dusk relative isolate hidden flex-col justify-between overflow-hidden p-12 pb-48 text-white lg:flex">
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-16 -z-10 size-80 rounded-full bg-saffron-bright/25 blur-3xl animate-[float-glow_9s_ease-in-out_infinite]"
        />
        <Brand />
        <div className="relative max-w-md">
          <h2 className="text-balance text-4xl leading-tight text-white">
            Run <span className="text-glow">VaranasiTrails</span> from one place
          </h2>
          <p className="mt-4 text-white/70">Manage trips and photos, enquiries, reviews and users.</p>
        </div>
        <p className="relative flex items-center gap-2 text-sm text-white/55">
          <ShieldCheck className="size-4" aria-hidden="true" /> Administrators only. Every change is recorded.
        </p>
        <SkylineArt className="absolute inset-x-0 bottom-0 -z-10 h-44 opacity-90" />
      </div>

      <div className="relative flex items-center justify-center bg-cream px-6 py-12">
        <ThemeToggle className="absolute top-4 right-4" />
        <div className="animate-enter w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <span className="bg-dusk inline-flex rounded-full px-3 py-2">
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
