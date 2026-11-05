import { Navigate, useSearchParams } from 'react-router'

import { SeoHead } from '@/components/common/SeoHead'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { VerifyEmailForm } from '@/features/auth/components/VerifyEmailForm'

export const VerifyEmailPage = () => {
  const [params] = useSearchParams()
  const email = params.get('email')?.trim().toLowerCase()

  // Without an address there is nothing to verify: send people to sign up.
  if (!email) return <Navigate to="/signup" replace />

  return (
    <>
      <SeoHead title="Verify your email" noIndex />
      <AuthCard
        title="Check your email"
        subtitle={
          <>
            We sent a 6-digit code to <strong className="text-indigo">{email}</strong>. It expires in 10 minutes.
          </>
        }
      >
        <VerifyEmailForm email={email} />
      </AuthCard>
    </>
  )
}
