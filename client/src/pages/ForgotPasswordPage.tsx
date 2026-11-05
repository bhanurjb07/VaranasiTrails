import { Link } from 'react-router'

import { SeoHead } from '@/components/common/SeoHead'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { ForgotPasswordFlow } from '@/features/auth/components/ForgotPasswordFlow'

export const ForgotPasswordPage = () => (
  <>
    <SeoHead title="Reset your password" noIndex />
    <AuthCard
      title="Reset your password"
      subtitle="Enter your email, confirm the code we send, then choose a new password."
      footer={
        <Link to="/login" className="font-semibold text-saffron-dark hover:underline">
          Back to log in
        </Link>
      }
    >
      <ForgotPasswordFlow />
    </AuthCard>
  </>
)
