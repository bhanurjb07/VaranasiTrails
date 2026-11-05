import { Link, Navigate } from 'react-router'

import { SeoHead } from '@/components/common/SeoHead'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { SignupForm } from '@/features/auth/components/SignupForm'
import { useAuth } from '@/features/auth/useAuth'

export const SignupPage = () => {
  const { status } = useAuth()
  if (status === 'authenticated') return <Navigate to="/" replace />

  return (
    <>
      <SeoHead title="Create an account" noIndex />
      <AuthCard
        title="Create your account"
        subtitle="Save trips to a wishlist and share reviews. We will email you a code to verify your address."
        footer={
          <>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-saffron-dark hover:underline">
              Log in
            </Link>
          </>
        }
      >
        <SignupForm />
      </AuthCard>
    </>
  )
}
