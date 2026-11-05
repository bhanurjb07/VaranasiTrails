import { useState } from 'react'
import { useNavigate } from 'react-router'

import { toast } from '@/components/ui/toast'
import { ForgotEmailStep } from './ForgotEmailStep'
import { ForgotOtpStep } from './ForgotOtpStep'
import { ForgotResetStep } from './ForgotResetStep'

type Step = { name: 'email' } | { name: 'otp'; email: string } | { name: 'reset'; email: string; resetToken: string }

/** Three steps: email, one-time code, new password. */
export const ForgotPasswordFlow = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>({ name: 'email' })

  if (step.name === 'email') {
    return <ForgotEmailStep onSent={(email) => setStep({ name: 'otp', email })} />
  }

  if (step.name === 'otp') {
    return (
      <ForgotOtpStep
        email={step.email}
        onVerified={(resetToken) => setStep({ name: 'reset', email: step.email, resetToken })}
        onBack={() => setStep({ name: 'email' })}
      />
    )
  }

  return (
    <ForgotResetStep
      email={step.email}
      resetToken={step.resetToken}
      onDone={() => {
        toast.success('Password updated. Please log in with your new password.')
        navigate('/login', { replace: true })
      }}
      onTokenExpired={() => {
        toast.error('That reset session expired. Please start again.')
        setStep({ name: 'email' })
      }}
    />
  )
}
