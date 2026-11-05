import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/toast'
import { useCountdown } from '@/hooks/useCountdown'
import { isApiError } from '@/lib/apiClient'
import { errorMessage } from '@/lib/formErrors'
import { authApi } from '../api'
import { OtpInput } from './OtpInput'

interface ForgotOtpStepProps {
  email: string
  onVerified: (resetToken: string) => void
  onBack: () => void
}

const RESEND_SECONDS = 60

export const ForgotOtpStep = ({ email, onVerified, onBack }: ForgotOtpStepProps) => {
  const [code, setCode] = useState('')
  const [wrong, setWrong] = useState(false)
  const { remaining, restart } = useCountdown(RESEND_SECONDS)

  const verify = useMutation({
    mutationFn: (otp: string) => authApi.verifyResetOtp(email, otp),
    onSuccess: ({ resetToken }) => onVerified(resetToken),
    onError: (error) => {
      if (isApiError(error) && error.code === 'OTP_INVALID') {
        setWrong(true)
        setCode('')
        return
      }
      toast.error(errorMessage(error))
    },
  })

  const resend = useMutation({
    mutationFn: () => authApi.resendOtp(email, 'PASSWORD_RESET'),
    onSuccess: () => {
      toast.success('If an account exists, a new code is on its way.')
      restart(RESEND_SECONDS)
      setWrong(false)
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  const submit = (otp: string) => {
    setWrong(false)
    verify.mutate(otp)
  }

  return (
    <div className="space-y-6">
      <p className="text-muted">
        If an account exists for <strong className="text-indigo">{email}</strong>, we have emailed a 6-digit code.
      </p>
      <OtpInput
        value={code}
        onChange={(value) => {
          setCode(value)
          setWrong(false)
        }}
        onComplete={submit}
        invalid={wrong}
        disabled={verify.isPending}
        autoFocus
      />
      <p role="alert" className="min-h-6 text-center text-sm text-danger">
        {wrong ? 'That code is incorrect or has expired.' : ''}
      </p>
      <Button size="lg" className="w-full" loading={verify.isPending} disabled={code.length !== 6} onClick={() => submit(code)}>
        Verify code
      </Button>
      <div className="flex items-center justify-between text-sm text-muted">
        <button type="button" onClick={onBack} className="font-medium text-indigo hover:underline">
          Use a different email
        </button>
        {remaining > 0 ? (
          <span aria-live="polite">Resend in {remaining}s</span>
        ) : (
          <button
            type="button"
            onClick={() => resend.mutate()}
            disabled={resend.isPending}
            className="font-semibold text-saffron-dark hover:underline disabled:opacity-60"
          >
            Resend code
          </button>
        )}
      </div>
    </div>
  )
}
