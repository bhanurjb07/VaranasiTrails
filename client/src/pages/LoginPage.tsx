import { Link, Navigate, useLocation } from 'react-router'

import { SeoHead } from '@/components/common/SeoHead'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { useAuth } from '@/features/auth/useAuth'

export const LoginPage = () => {
  const { status } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  if (status === 'authenticated') return <Navigate to={from} replace />

  return (
    <>
      <SeoHead title="Log in" noIndex />
      <AuthCard
        title="Welcome back"
        subtitle="Log in to see your wishlist and manage your profile."
        footer={
          <>
            New here?{' '}
            <Link to="/signup" className="font-semibold text-saffron-dark hover:underline">
              Create an account
            </Link>
          </>
        }
      >
        <LoginForm />
      </AuthCard>
    </>
  )
}
