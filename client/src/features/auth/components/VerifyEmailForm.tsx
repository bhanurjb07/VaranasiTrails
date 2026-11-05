import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'

import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/toast'
import { useCountdown } from '@/hooks/useCountdown'
import { isApiError } from '@/lib/apiClient'
import { errorMessage } from '@/lib/formErrors'
import { authApi } from '../api'
import { useAuth } from '../useAuth'
import { OtpInput } from './OtpInput'

interface LocationState {
  from?: string
  fromSignup?: boolean
}

const RESEND_SECONDS = 60

export const VerifyEmailForm = ({ email }: { email: string }) => {
  const { startSession } = useAuth()
  const navigate = useNavigate()
  const state = useLocation().state as LocationState | null
  const [code, setCode] = useState('')
  const [wrong, setWrong] = useState(false)
  // A code was just sent when arriving from signup, so the cooldown is already running.
  const { remaining, restart } = useCountdown(state?.fromSignup ? RESEND_SECONDS : 0)

  const verify = useMutation({
    mutationFn: (otp: string) => authApi.verifyEmail(email, otp),
    onSuccess: (session) => {
      startSession(session)
      toast.success('Email verified. Welcome to VaranasiTrails!')
      navigate(state?.from ?? '/', { replace: true })
    },
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
    mutationFn: () => authApi.resendOtp(email, 'EMAIL_VERIFY'),
    onSuccess: () => {
      toast.success('If that email can receive a code, a new one is on its way.')
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
        {wrong ? 'That code is incorrect or has expired. Check it and try again.' : ''}
      </p>

      <Button
        size="lg"
        className="w-full"
        loading={verify.isPending}
        disabled={code.length !== 6}
        onClick={() => submit(code)}
      >
        Verify email
      </Button>

      <div className="text-center text-sm text-muted">
        Did not get a code?{' '}
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
